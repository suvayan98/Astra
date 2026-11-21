"""Multi-Criteria Analysis (MCA) scoring engine for TerraCity AI.

Implements:
- 5-Pillar multi-criteria evaluation with 3 presets: Balanced, Climate-Resilient, Infra-First.
- Piecewise-linear and categorical indicator normalization (0-100 scale) with auto-scaling for fractions vs percentages.
- Dynamic missing-data weight renormalization across indicators and pillars.
- Hard-stop dealbreaker evaluations (flood >50%, wetland >15%, slope >30%, Seismic V + landslide).
- Deal-breaker raster mask polygonization to GeoJSON `deal_breaker_zones`.
- Section 6.4 Verdict Bands: >= 75 Suitable | 55-74 Suitable with mitigation | 35-54 Marginal | < 35 Not recommended.
- Section 6.4 Confidence: High >= 75% | Moderate 50-74% | Low < 50%.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import yaml
import numpy as np
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
import rasterio.features

from backend.app.models import (
    SourceInfo,
    IndicatorValue,
    PillarScore,
    DealBreakerResult,
    SiteScorecard,
    SiteComparisonRank,
    CompareResponse,
)


CONFIG_DIR = Path(__file__).resolve().parent.parent.parent / "config"
SCORING_CONFIG_PATH = CONFIG_DIR / "scoring.yaml"
DEALBREAKERS_CONFIG_PATH = CONFIG_DIR / "dealbreakers.yaml"
ASSUMPTIONS_CONFIG_PATH = CONFIG_DIR / "assumptions.yaml"

INDICATOR_ALIASES: Dict[str, List[str]] = {
    "slope_buildable_share": ["buildable_slope_share", "buildable_share", "slope_buildable"],
    "terrain_roughness": ["terrain_roughness_tri", "roughness", "tri_std", "terrain_ruggedness"],
    "land_cover_conversion": ["wasteland_suitability_boost", "dominant_lulc", "wasteland_share_pct", "lulc_score", "land_cover_score", "lulc_conversion"],
    "geomorphology_constraint": ["geomorphology", "geomorph_score"],
    "rainfall_mean_annual": ["annual_rainfall_mean_mm", "rainfall_annual_mean", "annual_rainfall_mean", "annual_rainfall"],
    "rainfall_variability": ["rainfall_cv_pct", "rainfall_cv", "cv_rainfall", "precipitation_cv"],
    "groundwater_prospect": ["groundwater_prospects", "gw_prospect", "gw_prospects"],
    "surface_water_access": ["dist_to_surface_water_km", "surface_water_distance_km", "dist_surface_water_km", "water_distance_km"],
    "flood_hazard": ["flood_hazard_fraction", "hand_flood_risk_fraction", "flood_hazard_score", "flood_score", "flood_inundation_score"],
    "landslide_hazard": ["dist_to_landslide_km", "landslide_hazard_level", "landslide_risk", "landslide_score", "landslide_density"],
    "seismic_zone": ["seismic_hazard_factor_z", "seismic_hazard", "seismic_category"],
    "drought_heat_exposure": ["dry_months_count", "drought_exposure", "drought_heat"],
    "vegetation_ndvi_mean": ["mean_ndvi", "ndvi_mean", "sentinel2_ndvi"],
    "vegetation_ndvi_trend": ["ndvi_trend", "trend_ndvi"],
    "air_quality": ["aqi", "air_quality_index"],
    "road_access": ["dist_to_major_road_km", "dist_road_km", "dist_major_road_km", "road_distance_km"],
    "hospital_school_access": ["dist_to_healthcare_km", "dist_to_education_km", "dist_social_infra_km", "dist_social_km", "social_infra_distance_km"],
    "power_grid_access": ["dist_to_substation_km", "dist_power_km", "dist_power_grid_km", "power_distance_km"]
}


def load_yaml_config(path: Union[str, Path]) -> Dict[str, Any]:
    """Safely load a YAML configuration file."""
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


_SCORING_CONFIG: Optional[Dict[str, Any]] = None
_DEALBREAKERS_CONFIG: Optional[Dict[str, Any]] = None
_ASSUMPTIONS_CONFIG: Optional[Dict[str, Any]] = None


def get_scoring_config() -> Dict[str, Any]:
    global _SCORING_CONFIG
    if _SCORING_CONFIG is None:
        _SCORING_CONFIG = load_yaml_config(SCORING_CONFIG_PATH)
    return _SCORING_CONFIG


def get_dealbreakers_config() -> Dict[str, Any]:
    global _DEALBREAKERS_CONFIG
    if _DEALBREAKERS_CONFIG is None:
        _DEALBREAKERS_CONFIG = load_yaml_config(DEALBREAKERS_CONFIG_PATH)
    return _DEALBREAKERS_CONFIG


def get_assumptions_config() -> Dict[str, Any]:
    global _ASSUMPTIONS_CONFIG
    if _ASSUMPTIONS_CONFIG is None:
        _ASSUMPTIONS_CONFIG = load_yaml_config(ASSUMPTIONS_CONFIG_PATH)
    return _ASSUMPTIONS_CONFIG


def interpolate_piecewise(x: float, points: List[List[float]]) -> float:
    """Evaluate piecewise-linear curve with coordinate clamps."""
    if not points:
        return 50.0

    sorted_pts = sorted(points, key=lambda pt: pt[0])
    if x <= sorted_pts[0][0]:
        return float(sorted_pts[0][1])
    if x >= sorted_pts[-1][0]:
        return float(sorted_pts[-1][1])

    for i in range(len(sorted_pts) - 1):
        x0, y0 = sorted_pts[i]
        x1, y1 = sorted_pts[i + 1]
        if x0 <= x <= x1:
            if x1 == x0:
                return float(y0)
            slope = (y1 - y0) / (x1 - x0)
            y = y0 + slope * (x - x0)
            return float(max(0.0, min(100.0, y)))

    return float(sorted_pts[-1][1])


def normalize_indicator_value(
    raw_val: Any,
    rule_spec: Dict[str, Any]
) -> Optional[float]:
    """Normalize a raw indicator value to a 0.0-100.0 suitability score."""
    if raw_val is None:
        return None

    scoring_type = rule_spec.get("scoring_type", "piecewise")

    if scoring_type == "categorical":
        categories = rule_spec.get("categories", {})
        str_val = str(raw_val).strip()
        if str_val in categories:
            return float(categories[str_val])
        lower_map = {k.lower(): v for k, v in categories.items()}
        if str_val.lower() in lower_map:
            return float(lower_map[str_val.lower()])
        return 50.0

    try:
        numeric_val = float(raw_val)
    except (ValueError, TypeError):
        return None

    points = rule_spec.get("points", [])
    if points:
        unit = str(rule_spec.get("unit", "")).lower()
        name_lower = str(rule_spec.get("name", "")).lower()
        is_ratio_unit = (
            unit in ["%", "fraction", "ratio", "pct"] or
            any(term in name_lower for term in ["share", "fraction", "percent", "pct"])
        )

        if is_ratio_unit:
            max_pt_x = max(pt[0] for pt in points)
            min_pt_x = min(pt[0] for pt in points)
            # Auto-scale fraction vs percentage only for ratio/percentage indicators:
            if max_pt_x <= 1.0 and numeric_val > 1.0 and min_pt_x >= 0.0:
                numeric_val = numeric_val / 100.0
            elif max_pt_x > 1.0 and 0.0 <= numeric_val <= 1.0 and max_pt_x >= 10.0:
                numeric_val = numeric_val * 100.0

        return interpolate_piecewise(numeric_val, points)

    return float(max(0.0, min(100.0, numeric_val)))


def polygonize_raster_mask(
    mask_array: np.ndarray,
    transform: Any,
    rule_info: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Convert binary offending raster cells (mask == 1) to GeoJSON features."""
    features = []
    if mask_array is None or not np.any(mask_array > 0):
        return features

    binary_mask = (mask_array > 0).astype(np.uint8)
    shapes_gen = rasterio.features.shapes(binary_mask, mask=binary_mask, transform=transform)

    polygons = []
    for geom_dict, val in shapes_gen:
        if val == 1:
            try:
                poly = shape(geom_dict)
                if poly.is_valid and not poly.is_empty:
                    polygons.append(poly)
            except Exception:
                pass

    if polygons:
        merged = unary_union(polygons)
        features.append({
            "type": "Feature",
            "geometry": mapping(merged),
            "properties": {
                "rule_id": rule_info.get("id"),
                "rule_name": rule_info.get("name"),
                "description": rule_info.get("description"),
                "severity": rule_info.get("severity", "CRITICAL"),
                "layer_key": rule_info.get("layer_key")
            }
        })
    return features


def evaluate_dealbreakers(
    indicators: Dict[str, IndicatorValue],
    raster_masks: Optional[Dict[str, Any]] = None,
    site_geometry: Optional[Dict[str, Any]] = None
) -> Tuple[bool, List[str], List[DealBreakerResult], Dict[str, Any]]:
    """Evaluate hard-stop disqualification rules and extract spatial deal-breaker zones."""
    cfg = get_dealbreakers_config()
    rules = cfg.get("dealbreakers", [])

    is_disqualified = False
    reasons: List[str] = []
    results: List[DealBreakerResult] = []
    deal_breaker_features: List[Dict[str, Any]] = []

    ind_map = {k.lower(): v for k, v in indicators.items()}

    def get_val(key_name: str, aliases: Optional[List[str]] = None) -> Any:
        keys_to_check = [key_name] + (aliases or []) + INDICATOR_ALIASES.get(key_name, [])
        for k in keys_to_check:
            k_lower = k.lower()
            if k_lower in ind_map and ind_map[k_lower].value is not None:
                return ind_map[k_lower].value
        return None

    for rule in rules:
        rule_id = rule.get("id", "unknown")
        rule_name = rule.get("name", rule_id)
        rule_desc = rule.get("description", "")
        rule_type = rule.get("type", "threshold")
        layer_key = rule.get("layer_key")
        triggered = False
        message = "Condition satisfied (safe)"

        if rule_type == "threshold":
            ind_key = rule.get("indicator", "")
            aliases = rule.get("alternative_indicators", [])
            val = get_val(ind_key, aliases)
            threshold = float(rule.get("threshold", 0.0))
            op = rule.get("operator", ">")

            if val is not None:
                try:
                    num_val = float(val)
                    if threshold <= 1.0 and num_val > 1.0:
                        num_val = num_val / 100.0
                    elif threshold > 1.0 and num_val <= 1.0:
                        num_val = num_val * 100.0

                    if op == ">" and num_val > threshold:
                        triggered = True
                        message = f"{rule_name}: {num_val:.1%} exceeds threshold {threshold:.1%}" if threshold <= 1.0 else f"{rule_name}: {num_val:.1f} exceeds threshold {threshold:.1f}"
                    elif op == ">=" and num_val >= threshold:
                        triggered = True
                        message = f"{rule_name}: {num_val:.1%} meets/exceeds threshold"
                    elif op == "<" and num_val < threshold:
                        triggered = True
                        message = f"{rule_name}: {num_val:.1f} falls below threshold"
                except (ValueError, TypeError):
                    pass

        elif rule_type == "compound":
            conditions = rule.get("conditions", [])
            cond_results = []
            for cond in conditions:
                c_ind = cond.get("indicator", "")
                c_op = cond.get("operator", "==")
                c_target = cond.get("target")
                c_val = get_val(c_ind)

                matched = False
                if c_val is not None:
                    c_val_str = str(c_val).strip()
                    if c_op == "==":
                        matched = (c_val_str.lower() == str(c_target).strip().lower())
                    elif c_op == "in" and isinstance(c_target, list):
                        target_strs = [str(t).lower() for t in c_target]
                        matched = c_val_str.lower() in target_strs
                        try:
                            num_c = float(c_val)
                            for t in c_target:
                                if isinstance(t, (int, float)) and abs(num_c - float(t)) < 0.01:
                                    matched = True
                        except (ValueError, TypeError):
                            pass
                cond_results.append(matched)

            if cond_results and all(cond_results):
                triggered = True
                message = f"{rule_name}: Compound hazard confirmed ({', '.join(c.get('indicator') for c in conditions)})"

        if triggered:
            is_disqualified = True
            reasons.append(rule_name)

        if raster_masks and layer_key and layer_key in raster_masks:
            mask_data = raster_masks[layer_key]
            arr = mask_data.get("array")
            transform = mask_data.get("transform")
            if arr is not None and transform is not None:
                zones = polygonize_raster_mask(arr, transform, rule)
                deal_breaker_features.extend(zones)
        elif triggered and site_geometry and not deal_breaker_features:
            deal_breaker_features.append({
                "type": "Feature",
                "geometry": site_geometry,
                "properties": {
                    "rule_id": rule_id,
                    "rule_name": rule_name,
                    "description": rule_desc,
                    "severity": rule.get("severity", "CRITICAL"),
                    "layer_key": layer_key
                }
            })

        results.append(
            DealBreakerResult(
                rule_id=rule_id,
                rule_name=rule_name,
                description=rule_desc,
                triggered=triggered,
                message=message,
                severity=rule.get("severity", "CRITICAL"),
                layer_key=layer_key,
            )
        )

    zones_fc = {
        "type": "FeatureCollection",
        "features": deal_breaker_features,
    }

    return is_disqualified, reasons, results, zones_fc


def score_site(
    site_id: str,
    site_name: str,
    indicators: Dict[str, Union[IndicatorValue, Dict[str, Any]]],
    preset: str = "balanced",
    region_id: str = "up_jewar",
    area_km2: float = 0.0,
    geometry: Optional[Dict[str, Any]] = None,
    raster_masks: Optional[Dict[str, Any]] = None,
) -> SiteScorecard:
    """Compute complete MCA scorecard for a candidate urban development site."""
    cfg = get_scoring_config()
    presets_cfg = cfg.get("presets", {})

    preset_clean = preset.lower().replace("-", "_")
    if preset_clean not in presets_cfg:
        preset_clean = "balanced"

    preset_info = presets_cfg[preset_clean]
    base_pillar_weights = preset_info.get("weights", {})
    pillars_cfg = cfg.get("pillars", {})

    parsed_indicators: Dict[str, IndicatorValue] = {}
    for k, v in indicators.items():
        if isinstance(v, IndicatorValue):
            parsed_indicators[k] = v
        elif isinstance(v, dict):
            parsed_indicators[k] = IndicatorValue(**v)
        else:
            parsed_indicators[k] = IndicatorValue(indicator=k, value=v)

    # Alias resolution
    for canon_k, alias_list in INDICATOR_ALIASES.items():
        if canon_k not in parsed_indicators or parsed_indicators[canon_k].value is None:
            for alt in alias_list:
                if alt in parsed_indicators and parsed_indicators[alt].value is not None:
                    parsed_indicators[canon_k] = parsed_indicators[alt]
                    break

    missing_indicators: List[str] = []
    assessed_weights_high_med = 0.0
    total_assessed_weight = 0.0

    for p_id, p_info in pillars_cfg.items():
        p_inds = p_info.get("indicators", {})
        p_weight = float(base_pillar_weights.get(p_id, 0.0))

        for ind_id, ind_rule in p_inds.items():
            ind_w_in_p = float(ind_rule.get("weight", 0.0))
            effective_global_w = (p_weight / 100.0) * ind_w_in_p

            if ind_id in parsed_indicators:
                ind_val_obj = parsed_indicators[ind_id]
                score = normalize_indicator_value(ind_val_obj.value, ind_rule)
                ind_val_obj.score = score
                if score is None:
                    missing_indicators.append(ind_id)
                else:
                    total_assessed_weight += effective_global_w
                    conf_tier = str(ind_val_obj.confidence).lower()
                    if conf_tier in ["high", "medium"]:
                        assessed_weights_high_med += effective_global_w
            else:
                default_source = SourceInfo(
                    portal=ind_rule.get("portal", "TerraCity Engine"),
                    dataset=ind_rule.get("dataset", "Standard Catalog"),
                    method="Not extracted"
                )
                parsed_indicators[ind_id] = IndicatorValue(
                    indicator=ind_id,
                    value=None,
                    unit=ind_rule.get("unit", ""),
                    score=None,
                    source=default_source,
                    confidence="missing",
                    confidence_score=0.0
                )
                missing_indicators.append(ind_id)

    pillar_scores: Dict[str, PillarScore] = {}
    valid_pillar_weights: Dict[str, float] = {}

    for p_id, p_info in pillars_cfg.items():
        p_name = p_info.get("name", p_id)
        p_inds_cfg = p_info.get("indicators", {})
        assigned_p_weight = float(base_pillar_weights.get(p_id, 0.0))

        available_weights_sum = 0.0
        weighted_sum = 0.0
        pillar_ind_dict: Dict[str, IndicatorValue] = {}

        for ind_id, ind_rule in p_inds_cfg.items():
            ind_obj = parsed_indicators[ind_id]
            pillar_ind_dict[ind_id] = ind_obj
            ind_base_w = float(ind_rule.get("weight", 0.0))

            if ind_obj.score is not None:
                available_weights_sum += ind_base_w
                weighted_sum += ind_obj.score * ind_base_w

        if available_weights_sum > 0:
            pillar_raw_score = float(weighted_sum / available_weights_sum)
            valid_pillar_weights[p_id] = assigned_p_weight
        else:
            pillar_raw_score = 0.0

        pillar_scores[p_id] = PillarScore(
            id=p_id,
            name=p_name,
            weight=assigned_p_weight,
            raw_score=round(pillar_raw_score, 2),
            weighted_score=0.0,
            indicators=pillar_ind_dict
        )

    sum_valid_p_weights = sum(valid_pillar_weights.values())
    renormalized_p_weights: Dict[str, float] = {}

    if sum_valid_p_weights > 0:
        for p_id, base_w in base_pillar_weights.items():
            if p_id in valid_pillar_weights:
                norm_w = (base_w / sum_valid_p_weights) * 100.0
                renormalized_p_weights[p_id] = round(norm_w, 2)
                pillar_scores[p_id].weight = round(norm_w, 2)
            else:
                renormalized_p_weights[p_id] = 0.0
                pillar_scores[p_id].weight = 0.0
    else:
        renormalized_p_weights = {k: 0.0 for k in base_pillar_weights}

    overall_score = 0.0
    for p_id, p_score in pillar_scores.items():
        w = renormalized_p_weights.get(p_id, 0.0)
        p_score.weighted_score = round(p_score.raw_score * (w / 100.0), 2)
        overall_score += p_score.weighted_score

    overall_score = round(max(0.0, min(100.0, overall_score)), 2)

    if total_assessed_weight > 0:
        confidence_pct = round((assessed_weights_high_med / total_assessed_weight) * 100.0, 1)
    else:
        confidence_pct = 0.0

    if confidence_pct >= 75.0:
        confidence_label = "High"
    elif confidence_pct >= 50.0:
        confidence_label = "Moderate"
    else:
        confidence_label = "Low"

    is_disqualified, reasons, deal_breakers, deal_breaker_zones = evaluate_dealbreakers(
        indicators=parsed_indicators,
        raster_masks=raster_masks,
        site_geometry=geometry
    )

    if is_disqualified:
        verdict = f"Not recommended (Deal-breaker triggered: {', '.join(reasons)})"
    elif overall_score >= 75.0:
        verdict = "Suitable"
    elif overall_score >= 55.0:
        verdict = "Suitable with mitigation"
    elif overall_score >= 35.0:
        verdict = "Marginal"
    else:
        verdict = "Not recommended"

    area_ha = round(area_km2 * 100.0, 2)

    return SiteScorecard(
        site_id=site_id,
        site_name=site_name,
        region_id=region_id,
        area_km2=round(area_km2, 2),
        area_ha=area_ha,
        overall_score=overall_score,
        verdict=verdict,
        preset_used=preset_clean,
        is_disqualified=is_disqualified,
        disqualification_reasons=reasons,
        deal_breakers=deal_breakers,
        deal_breaker_zones=deal_breaker_zones,
        pillars=pillar_scores,
        indicators=parsed_indicators,
        site_confidence_pct=confidence_pct,
        site_confidence_label=confidence_label,
        missing_indicators=missing_indicators,
        renormalized_weights=renormalized_p_weights,
        geometry=geometry
    )


def compare_sites(
    scorecards: List[SiteScorecard],
    preset: str = "balanced"
) -> CompareResponse:
    """Compare and rank multiple candidate site scorecards with tie-check note."""
    if not scorecards:
        return CompareResponse(
            region_id="unknown",
            preset_used=preset,
            rankings=[],
            tie_detected=False,
            narrative="No sites provided for comparison.",
            pillar_comparison_matrix={},
            sites={}
        )

    region_id = scorecards[0].region_id

    qualified = [s for s in scorecards if not s.is_disqualified]
    disqualified = [s for s in scorecards if s.is_disqualified]

    qualified.sort(key=lambda s: s.overall_score, reverse=True)
    disqualified.sort(key=lambda s: s.overall_score, reverse=True)

    sorted_sites = qualified + disqualified

    rankings: List[SiteComparisonRank] = []
    matrix: Dict[str, Dict[str, float]] = {}

    for idx, s in enumerate(sorted_sites, start=1):
        p_scores = {p_id: p_obj.raw_score for p_id, p_obj in s.pillars.items()}
        for p_id, val in p_scores.items():
            if p_id not in matrix:
                matrix[p_id] = {}
            matrix[p_id][s.site_id] = val

        sorted_pillars = sorted(s.pillars.items(), key=lambda item: item[1].weighted_score, reverse=True)
        top_drivers = [item[1].name for item in sorted_pillars[:3]]

        strengths = [item[1].name for item in sorted_pillars if item[1].raw_score >= 70.0]
        risks = [item[1].name for item in sorted_pillars if item[1].raw_score < 50.0]
        if s.is_disqualified:
            risks.extend(s.disqualification_reasons)

        rankings.append(
            SiteComparisonRank(
                rank=idx,
                site_id=s.site_id,
                site_name=s.site_name,
                overall_score=s.overall_score,
                verdict=s.verdict,
                is_disqualified=s.is_disqualified,
                pillar_scores=p_scores,
                top_drivers=top_drivers,
                key_advantages=strengths or ["Moderate overall performance"],
                key_risks=risks or ["No high risk factors detected"]
            )
        )

    tie_detected = False
    tie_note = None
    if len(qualified) >= 2:
        top1 = qualified[0]
        top2 = qualified[1]
        diff = abs(top1.overall_score - top2.overall_score)
        if diff < 5.0:
            tie_detected = True
            tie_note = (
                f"Candidate Site '{top1.site_name}' ({top1.overall_score:.1f} pts) and "
                f"Candidate Site '{top2.site_name}' ({top2.overall_score:.1f} pts) are separated by only {diff:.1f} points "
                f"(< 5.0 pt threshold). The ranking is sensitive to planner priority weights and local ground validation "
                f"is strongly advised before final site acquisition."
            )

    from backend.app.narrative import (
        generate_comparison_narrative,
        generate_guarded_narrative,
        get_llm_callable
    )
    import os
    in_pytest = bool(os.getenv("PYTEST_CURRENT_TEST"))
    llm_func = get_llm_callable() if not in_pytest else None
    if llm_func:
        narrative_text, used_llm, _ = generate_guarded_narrative(
            rankings=rankings,
            scorecards=scorecards,
            preset=preset,
            tie_note=tie_note,
            llm_callable=llm_func
        )
    else:
        narrative_text = generate_comparison_narrative(rankings, scorecards, preset, tie_note)

    sites_dict = {s.site_id: s for s in scorecards}

    return CompareResponse(
        region_id=region_id,
        preset_used=preset,
        rankings=rankings,
        tie_detected=tie_detected,
        tie_note=tie_note,
        narrative=narrative_text,
        pillar_comparison_matrix=matrix,
        sites=sites_dict
    )
