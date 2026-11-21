"""Candidate site spatial evaluation endpoint for TerraCity AI.

POST /api/analyze
Validates candidate site polygon, performs dynamic zonal analysis (< 150 ms)
across terrain, hazards, water, vegetation, and infrastructure layers, evaluates
deal-breakers, and generates an MCA scorecard.
"""

import math
import uuid
from typing import Any, Dict, List, Optional, Tuple
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import pyproj
import numpy as np
import shapely
from shapely.geometry import shape, Polygon, MultiPolygon

from backend.app.cache import analysis_store, regional_cache
from backend.app.models import SiteScorecard, IndicatorValue, SourceInfo
from backend.app.scoring import score_site, load_yaml_config, CONFIG_DIR
from backend.app.analysis.engine import run_site_analysis

router = APIRouter()
REGIONS_CONFIG_PATH = CONFIG_DIR / "demo_regions.yaml"


class AnalyzeRequest(BaseModel):
    """Input payload for evaluating a candidate township site."""
    site: Dict[str, Any] = Field(description="GeoJSON Polygon geometry")
    site_name: str = Field(default="Candidate Site", description="Candidate site name")
    site_id: Optional[str] = Field(default=None, description="Optional site identifier")
    region_id: str = Field(default="up_jewar", description="Target demo region ID")
    population: int = Field(default=150000, description="Target urban population")
    weight_preset: str = Field(default="balanced", description="Weight preset: balanced, climate_resilient, infra_first")
    pillar_weights: Optional[Dict[str, float]] = Field(default=None, description="Optional custom pillar weights")
    scenario: str = Field(default="baseline", description="Planning scenario")
    assumptions: Optional[Dict[str, Any]] = Field(default=None, description="Optional calculation assumptions overrides")


def validate_and_compute_geometry(site_geojson: Dict[str, Any]) -> Tuple[Any, float]:
    """Validate geometry against:
    - GeoJSON Polygon / MultiPolygon structure
    - Self-intersection and topological validity
    - India territorial bounding box
    - Area constraints (> 0 and <= 2000 km²)
    Returns (shapely_geom, area_km2).
    """
    geom_data = site_geojson.get("geometry", site_geojson)
    geom_type = geom_data.get("type", "")

    if geom_type not in ("Polygon", "MultiPolygon"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid geometry type '{geom_type}'. Must be Polygon or MultiPolygon."
        )

    try:
        poly_geom = shape(geom_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Malformed GeoJSON polygon geometry: {str(e)}"
        )

    if not poly_geom.is_valid:
        # Try fixing minor self-intersections or raise error
        try:
            poly_geom = poly_geom.buffer(0)
            if not poly_geom.is_valid:
                raise ValueError("Self-intersecting geometry")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid self-intersecting polygon geometry. Please provide a valid simple polygon."
            )

    if poly_geom.is_empty:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Polygon geometry is empty."
        )

    # India Bounding Box check: approx [68.0, 6.0, 98.0, 38.0]
    min_lon, min_lat, max_lon, max_lat = poly_geom.bounds
    if min_lon < 65.0 or max_lon > 100.0 or min_lat < 5.0 or max_lat > 39.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Candidate polygon is outside India territorial bounds (68°E–98°E, 6°N–38°N)."
        )

    # Compute geodesic area in km2 using equal-area projection
    centroid_lat = poly_geom.centroid.y
    centroid_lon = poly_geom.centroid.x
    proj_utm = pyproj.Proj(proj="utm", zone=int((centroid_lon + 180) / 6) + 1, datum="WGS84")
    wgs84 = pyproj.Proj(proj="latlong", datum="WGS84")
    transformer = pyproj.Transformer.from_proj(wgs84, proj_utm, always_xy=True)

    projected_geom = shapely.transform(poly_geom, lambda c: np.column_stack(transformer.transform(c[:, 0], c[:, 1])))
    area_m2 = projected_geom.area
    area_km2 = area_m2 / 1_000_000.0

    if area_km2 <= 0.001:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Candidate polygon area is too small (< 0.001 km²)."
        )

    if area_km2 > 2000.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Candidate polygon area ({area_km2:.1f} km²) exceeds maximum allowable threshold of 2,000 km²."
        )

    return poly_geom, area_km2


def unify_indicator_keys(raw_indicators: Dict[str, Any]) -> Dict[str, IndicatorValue]:
    """Map indicators and their aliases to match config/scoring.yaml indicator identifiers."""
    parsed: Dict[str, IndicatorValue] = {}

    for k, v in raw_indicators.items():
        if isinstance(v, IndicatorValue):
            parsed[k] = v
        elif isinstance(v, dict):
            parsed[k] = IndicatorValue(**v)
        else:
            parsed[k] = IndicatorValue(indicator=k, value=v)

    # Aliases mapping to ensure indicators match config/scoring.yaml canonical names
    aliases = {
        # Terrain & Land
        "slope_buildable_share": ["buildable_slope_share", "buildable_share", "buildable_share_pct"],
        "terrain_roughness": ["terrain_roughness_tri", "tri_roughness", "roughness", "roughness_tri"],
        "land_cover_conversion": ["wasteland_share_pct", "wasteland_share", "lulc_wasteland_share", "land_cover_conversion"],
        "geomorphology_constraint": ["geomorphology", "geomorphology_constraint"],
        # Water Security
        "rainfall_mean_annual": ["rainfall_annual_mean", "annual_rainfall_mm", "mean_annual_rainfall", "rainfall_mean_annual"],
        "rainfall_variability": ["rainfall_variability_cv", "rainfall_cv", "rainfall_cv_pct", "rainfall_variability"],
        "groundwater_prospect": ["groundwater_prospects", "groundwater_prospect", "groundwater_yield"],
        "surface_water_access": ["dist_to_surface_water_km", "dist_water_km", "surface_water_distance_km", "surface_water_access"],
        # Hazard Risk
        "flood_hazard": ["flood_hazard_score", "flood_hazard_fraction", "flood_score", "high_flood_hazard_pct", "flood_hazard"],
        "hand_flood_risk": ["hand_flood_risk_pct", "hand_fraction", "hand_flood_fraction"],
        "landslide_hazard": ["dist_to_landslide_km", "landslide_risk", "landslide_susceptibility", "landslide_hazard"],
        "seismic_zone": ["seismic_hazard_zone", "seismic_zone"],
        "drought_heat_exposure": ["drought_exposure_index", "dry_months_count", "dry_months", "drought_heat_exposure"],
        # Environmental Impact
        "vegetation_ndvi_mean": ["ndvi_mean", "mean_ndvi", "vegetation_ndvi_mean"],
        "vegetation_ndvi_trend": ["vegetation_ndvi_trend", "ndvi_trend"],
        "air_quality": ["air_quality"],
        # Infrastructure Access
        "road_access": ["dist_to_major_road_km", "dist_road_km", "road_distance_km", "road_access"],
        "hospital_school_access": ["dist_to_social_infra_km", "dist_social_infra_km", "social_distance_km", "hospital_school_access"],
        "power_grid_access": ["dist_to_power_substation_km", "dist_power_km", "power_distance_km", "power_grid_access"],
    }

    for canonical, alt_list in aliases.items():
        if canonical not in parsed or parsed[canonical].value is None:
            for alt in alt_list:
                if alt in parsed and parsed[alt].value is not None:
                    # Clone indicator under canonical name
                    alt_item = parsed[alt]
                    parsed[canonical] = IndicatorValue(
                        indicator=canonical,
                        value=alt_item.value,
                        unit=alt_item.unit,
                        score=alt_item.score,
                        source=alt_item.source,
                        confidence=alt_item.confidence,
                        confidence_score=alt_item.confidence_score
                    )
                    break

    return parsed


def execute_site_analysis(
    req: AnalyzeRequest,
    poly_geom: Any,
    area_km2: float
) -> SiteScorecard:
    """Run full spatial zonal analysis across 5 pillars, deal-breakers, and MCA scorecard."""
    site_geojson = {"type": "Feature", "geometry": req.site}
    site_id = req.site_id or f"site_{uuid.uuid4().hex[:6]}"

    # Load region configuration
    regions_data = load_yaml_config(REGIONS_CONFIG_PATH).get("regions", {})
    region_cfg = regions_data.get(req.region_id, {})

    # Run multi-portal geospatial analysis pipeline
    analysis_output = run_site_analysis(req.region_id, site_geojson, region_cfg)
    all_raw_indicators = analysis_output.get("indicators", {})
    deal_breaker_zones = analysis_output.get("deal_breaker_zones")

    # Unify indicator keys with config/scoring.yaml
    unified_indicators = unify_indicator_keys(all_raw_indicators)

    # Calculate MCA Scorecard
    scorecard = score_site(
        site_id=site_id,
        site_name=req.site_name,
        indicators=unified_indicators,
        preset=req.weight_preset,
        region_id=req.region_id,
        area_km2=area_km2,
        geometry=req.site,
        raster_masks=deal_breaker_zones
    )

    # Persist in SQLite store
    analysis_store.save_analysis(scorecard)

    return scorecard


@router.post("/analyze", response_model=SiteScorecard, tags=["Analysis"])
async def post_analyze(request: AnalyzeRequest):
    """Analyze a candidate site polygon and return complete MCA scorecard with spatial deal-breakers."""
    poly_geom, area_km2 = validate_and_compute_geometry(request.site)
    scorecard = execute_site_analysis(request, poly_geom, area_km2)
    return scorecard
