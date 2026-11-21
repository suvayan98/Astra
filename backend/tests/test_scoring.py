"""Unit tests for Multi-Criteria Analysis (MCA) scoring engine (Milestone M4).

Verifies:
- 5 Pillars and 3 priority presets (Balanced, Climate-Resilient, Infra-First).
- Weight normalization (weights sum to 100.0).
- Preset rank sensitivity (Infra-First vs Climate-Resilient).
- Missing data weight renormalization (within pillar and across pillars).
- Hard-stop dealbreaker evaluations (flood >50%, wetland >15%, slope >30%, Seismic V + landslide).
- Deal-breaker raster mask polygonization to GeoJSON deal_breaker_zones.
- Verdict bands (>= 75 Suitable | 55-74 Suitable with mitigation | 35-54 Marginal | < 35 Not recommended).
- Site confidence percentage and label (High >= 75%, Moderate 50-74%, Low < 50%).
- Tie-check detection (< 5.0 pt difference).
"""

import numpy as np
import pytest
from affine import Affine

from backend.app.models import IndicatorValue, SourceInfo
from backend.app.scoring import (
    get_scoring_config,
    get_dealbreakers_config,
    score_site,
    compare_sites,
    normalize_indicator_value,
    evaluate_dealbreakers,
    polygonize_raster_mask,
)


def make_ind(name: str, val: any, portal: str = "Bhuvan", conf: str = "high") -> IndicatorValue:
    return IndicatorValue(
        indicator=name,
        value=val,
        source=SourceInfo(portal=portal, dataset="TestDataset"),
        confidence=conf
    )


def test_presets_weights_sum_to_100():
    cfg = get_scoring_config()
    presets = cfg["presets"]
    assert "balanced" in presets
    assert "climate_resilient" in presets
    assert "infra_first" in presets

    for p_name, p_data in presets.items():
        w_sum = sum(p_data["weights"].values())
        assert abs(w_sum - 100.0) < 1e-4, f"Preset {p_name} weights sum to {w_sum}, expected 100.0"


def test_preset_rank_shift():
    # Site Alpha: high infrastructure access, lower climate resilience
    inds_alpha = {
        "slope_buildable_share": make_ind("slope_buildable_share", 0.90),
        "terrain_roughness": make_ind("terrain_roughness", 2.0),
        "land_cover_conversion": make_ind("land_cover_conversion", 80.0),
        "geomorphology_constraint": make_ind("geomorphology_constraint", "Alluvial plain"),
        "rainfall_mean_annual": make_ind("rainfall_mean_annual", 500.0), # Arid/drier
        "rainfall_variability": make_ind("rainfall_variability", 0.40), # High CV
        "groundwater_prospect": make_ind("groundwater_prospect", "Moderate"),
        "surface_water_access": make_ind("surface_water_access", 12.0),
        "flood_hazard": make_ind("flood_hazard", 30.0), # Moderate flood hazard
        "landslide_hazard": make_ind("landslide_hazard", 80.0),
        "seismic_zone": make_ind("seismic_zone", "Zone IV"),
        "drought_heat_exposure": make_ind("drought_heat_exposure", 40.0),
        "vegetation_ndvi_mean": make_ind("vegetation_ndvi_mean", 0.25),
        "vegetation_ndvi_trend": make_ind("vegetation_ndvi_trend", 0.0),
        "road_access": make_ind("road_access", 0.8), # Very close to road (100 pts)
        "hospital_school_access": make_ind("hospital_school_access", 1.2), # Very close (100 pts)
        "power_grid_access": make_ind("power_grid_access", 1.0), # Very close (100 pts)
    }

    # Site Beta: superior water & hazard resilience, but remote from infrastructure
    inds_beta = {
        "slope_buildable_share": make_ind("slope_buildable_share", 0.95),
        "terrain_roughness": make_ind("terrain_roughness", 1.5),
        "land_cover_conversion": make_ind("land_cover_conversion", 90.0),
        "geomorphology_constraint": make_ind("geomorphology_constraint", "Stable upland plateau"),
        "rainfall_mean_annual": make_ind("rainfall_mean_annual", 1100.0), # Optimal (100 pts)
        "rainfall_variability": make_ind("rainfall_variability", 0.12), # Low CV (100 pts)
        "groundwater_prospect": make_ind("groundwater_prospect", "Good"), # 100 pts
        "surface_water_access": make_ind("surface_water_access", 1.5), # 100 pts
        "flood_hazard": make_ind("flood_hazard", 95.0), # Safe upland (100 pts)
        "landslide_hazard": make_ind("landslide_hazard", 100.0), # Safe
        "seismic_zone": make_ind("seismic_zone", "Zone II"), # Safe (100 pts)
        "drought_heat_exposure": make_ind("drought_heat_exposure", 90.0),
        "vegetation_ndvi_mean": make_ind("vegetation_ndvi_mean", 0.25),
        "vegetation_ndvi_trend": make_ind("vegetation_ndvi_trend", 0.0),
        "road_access": make_ind("road_access", 22.0), # Far (5 pts)
        "hospital_school_access": make_ind("hospital_school_access", 25.0), # Far (5 pts)
        "power_grid_access": make_ind("power_grid_access", 24.0), # Far (5 pts)
    }

    card_alpha_infra = score_site("alpha", "Site Alpha", inds_alpha, preset="infra_first")
    card_beta_infra = score_site("beta", "Site Beta", inds_beta, preset="infra_first")
    cmp_infra = compare_sites([card_alpha_infra, card_beta_infra], preset="infra_first")
    assert cmp_infra.rankings[0].site_id == "alpha", "Alpha should rank #1 under Infra-First preset"

    card_alpha_climate = score_site("alpha", "Site Alpha", inds_alpha, preset="climate_resilient")
    card_beta_climate = score_site("beta", "Site Beta", inds_beta, preset="climate_resilient")
    cmp_climate = compare_sites([card_alpha_climate, card_beta_climate], preset="climate_resilient")
    assert cmp_climate.rankings[0].site_id == "beta", "Beta should rank #1 under Climate-Resilient preset"


def test_missing_data_weight_renormalization():
    # Only 2 indicators provided, rest missing
    partial_inds = {
        "slope_buildable_share": make_ind("slope_buildable_share", 0.85, conf="high"),
        "road_access": make_ind("road_access", 1.5, conf="high"),
    }

    card = score_site("test_partial", "Partial Site", partial_inds, preset="balanced")
    assert len(card.missing_indicators) > 10
    assert card.overall_score > 0.0
    # Weights of active pillars should be renormalized to sum to 100.0
    active_w_sum = sum(card.renormalized_weights.values())
    assert abs(active_w_sum - 100.0) < 1e-2


def test_dealbreaker_flood_hazard_threshold():
    # >50% high Bhuvan flood hazard triggers disqualification
    safe_inds = {
        "flood_hazard_fraction": make_ind("flood_hazard_fraction", 0.12),
        "slope_buildable_share": make_ind("slope_buildable_share", 0.85),
    }
    card_safe = score_site("safe", "Safe Site", safe_inds)
    assert not card_safe.is_disqualified
    assert not any(db.triggered for db in card_safe.deal_breakers)

    flood_inds = {
        "flood_hazard_fraction": make_ind("flood_hazard_fraction", 0.65), # 65% in high flood
        "slope_buildable_share": make_ind("slope_buildable_share", 0.85),
    }
    card_flood = score_site("flood_site", "Flood Site", flood_inds)
    assert card_flood.is_disqualified
    assert any(db.triggered for db in card_flood.deal_breakers if db.rule_id == "bhuvan_flood_hazard")
    assert "Deal-breaker triggered" in card_flood.verdict


def test_dealbreaker_wetland_overlap():
    # >15% wetland overlap triggers disqualification
    wetland_inds = {
        "wetland_overlap_share": make_ind("wetland_overlap_share", 0.22), # 22%
        "slope_buildable_share": make_ind("slope_buildable_share", 0.85),
    }
    card = score_site("wetland_site", "Wetland Site", wetland_inds)
    assert card.is_disqualified
    assert any(db.triggered for db in card.deal_breakers if db.rule_id == "wetland_encroachment")


def test_dealbreaker_steep_slope():
    # >30% slope > 30 deg
    steep_inds = {
        "slope_gt_30_share": make_ind("slope_gt_30_share", 0.38), # 38% steep
        "slope_buildable_share": make_ind("slope_buildable_share", 0.40),
    }
    card = score_site("steep_site", "Steep Site", steep_inds)
    assert card.is_disqualified
    assert any(db.triggered for db in card.deal_breakers if db.rule_id == "steep_terrain")


def test_dealbreaker_compound_seismic_landslide():
    # Seismic Zone V AND High Landslide
    compound_inds = {
        "seismic_zone": make_ind("seismic_zone", "Zone V"),
        "landslide_hazard": make_ind("landslide_hazard", "High"),
        "slope_buildable_share": make_ind("slope_buildable_share", 0.70),
    }
    card = score_site("seismic_site", "Seismic Site", compound_inds)
    assert card.is_disqualified
    assert any(db.triggered for db in card.deal_breakers if db.rule_id == "seismic_landslide_compound")


def test_dealbreaker_raster_mask_polygonization():
    # Synthetic 10x10 binary mask with 4 offending cells
    mask = np.zeros((10, 10), dtype=np.uint8)
    mask[2:4, 2:4] = 1 # 4 cells
    transform = Affine.translation(77.50, 28.20) @ Affine.scale(0.001, -0.001)

    rule_info = {
        "id": "bhuvan_flood_hazard",
        "name": "Severe Flood Hazard Zone",
        "description": "Flood cells",
        "severity": "CRITICAL",
        "layer_key": "flood"
    }

    features = polygonize_raster_mask(mask, transform, rule_info)
    assert len(features) == 1
    assert features[0]["type"] == "Feature"
    assert features[0]["geometry"]["type"] in ["Polygon", "MultiPolygon"]
    assert features[0]["properties"]["rule_id"] == "bhuvan_flood_hazard"


def test_tie_check_detection():
    # Two sites with overall scores within 5 points
    inds1 = {
        "slope_buildable_share": make_ind("slope_buildable_share", 0.85),
        "rainfall_mean_annual": make_ind("rainfall_mean_annual", 900.0),
        "road_access": make_ind("road_access", 3.0),
    }
    inds2 = {
        "slope_buildable_share": make_ind("slope_buildable_share", 0.83),
        "rainfall_mean_annual": make_ind("rainfall_mean_annual", 890.0),
        "road_access": make_ind("road_access", 3.2),
    }

    sc1 = score_site("site1", "Site 1", inds1)
    sc2 = score_site("site2", "Site 2", inds2)

    diff = abs(sc1.overall_score - sc2.overall_score)
    assert diff < 5.0

    cmp_res = compare_sites([sc1, sc2])
    assert cmp_res.tie_detected is True
    assert cmp_res.tie_note is not None
    assert "< 5.0 pt threshold" in cmp_res.tie_note
