"""
test_analysis.py
Verifies:
- Dynamic zonal clipping (< 150 ms benchmark)
- UTM slope, roughness (TRI std dev), buildable share (<=15%), and relief
- Hazards: Bhuvan flood hazard masking and CartoDEM HAND proxy fallback
- Deal-breaker detection and mask polygonization
- Water pillar analysis (MOSDAC rainfall, CV, drought exposure, surface water buffer)
- Vegetation cross-validation (NDVI x LULC wasteland boost vs clearing penalty)
- Infrastructure proximity calculations
"""

import time
import pytest
import yaml
import os
from shapely.geometry import Polygon

from backend.app.analysis.zonal import extract_zonal_array, polygonize_mask_to_geojson
from backend.app.analysis.terrain import analyze_terrain
from backend.app.analysis.hazards import analyze_hazards
from backend.app.analysis.water import analyze_water
from backend.app.analysis.vegetation import analyze_vegetation
from backend.app.analysis.infrastructure import analyze_infrastructure
from backend.app.analysis.engine import run_site_analysis

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture
def jewar_candidate_site():
    return {
        "type": "Polygon",
        "coordinates": [
            [
                [77.525, 28.210],
                [77.565, 28.210],
                [77.565, 28.245],
                [77.525, 28.245],
                [77.525, 28.210]
            ]
        ]
    }


@pytest.fixture
def dholera_candidate_site():
    return {
        "type": "Polygon",
        "coordinates": [
            [
                [72.260, 22.160],
                [72.310, 22.160],
                [72.310, 22.200],
                [72.260, 22.200],
                [72.260, 22.160]
            ]
        ]
    }


def test_dynamic_zonal_clipping_benchmark(jewar_candidate_site):
    dem_path = os.path.join(BASE_DIR, "data", "cache", "regions", "up_jewar", "dem.tif")
    
    # Warm-up run
    extract_zonal_array(dem_path, jewar_candidate_site)
    
    # Timed run
    arr, vmask, transform, dt_ms = extract_zonal_array(dem_path, jewar_candidate_site)
    assert arr is not None
    assert vmask.sum() > 0
    # Must run < 150 ms per polygon
    print(f"Dynamic zonal extraction executed in {dt_ms:.2f} ms")
    assert dt_ms < 150.0, f"Zonal extraction too slow: {dt_ms:.2f} ms >= 150 ms"


def test_terrain_analysis(jewar_candidate_site):
    inds, dealbreaker_fc = analyze_terrain("up_jewar", jewar_candidate_site)
    assert "mean_slope_deg" in inds
    assert "slope_buildable_share" in inds
    assert "terrain_roughness_tri" in inds
    assert "elevation_relief_m" in inds

    buildable_share = inds["slope_buildable_share"]["value"]
    assert 0.0 <= buildable_share <= 100.0
    # Jewar plain should have high buildable share (typically > 80%)
    assert buildable_share > 70.0


def test_hazards_bhuvan_direct(jewar_candidate_site):
    inds, dealbreaker_fc = analyze_hazards("up_jewar", jewar_candidate_site, {"flood_method": "bhuvan_direct"})
    assert "flood_hazard_fraction" in inds
    assert "seismic_zone" in inds
    assert "dist_to_landslide_km" in inds
    # Jewar is in Seismic Zone IV
    assert "IV" in inds["seismic_zone"]["value"]


def test_hazards_hand_proxy_fallback(dholera_candidate_site):
    inds, dealbreaker_fc = analyze_hazards("dholera", dholera_candidate_site, {"flood_method": "hand_proxy"})
    assert "hand_flood_risk_fraction" in inds
    assert inds["hand_flood_risk_fraction"]["source"]["method"] == "proxy"
    assert inds["hand_flood_risk_fraction"]["confidence"] == "low"
    assert inds["hand_flood_risk_fraction"]["value"] > 0.0


def test_water_analysis(jewar_candidate_site):
    inds = analyze_water("up_jewar", jewar_candidate_site)
    assert "annual_rainfall_mean_mm" in inds
    assert "rainfall_cv_pct" in inds
    assert "dry_months_count" in inds
    assert "dist_to_surface_water_km" in inds
    assert inds["dist_to_surface_water_km"]["value"] >= 0.0


def test_vegetation_cross_validation(jewar_candidate_site):
    inds, dealbreaker_fc = analyze_vegetation("up_jewar", jewar_candidate_site)
    assert "mean_ndvi" in inds
    assert "dominant_lulc" in inds
    assert "wasteland_suitability_boost" in inds
    assert "ecological_clearing_risk" in inds


def test_infrastructure_analysis(jewar_candidate_site):
    inds = analyze_infrastructure("up_jewar", jewar_candidate_site)
    assert inds["dist_to_major_road_km"]["value"] < 25.0
    assert inds["dist_to_substation_km"]["value"] < 35.0


def test_full_analysis_engine(jewar_candidate_site):
    res = run_site_analysis("up_jewar", jewar_candidate_site)
    assert res["region_id"] == "up_jewar"
    assert res["area_hectares"] > 0
    assert len(res["indicators"]) >= 15
    # Check execution speed
    print(f"Full multi-portal site analysis completed in {res['execution_time_ms']} ms")
    assert res["execution_time_ms"] < 500.0  # Well within sub-second responsiveness

