"""
test_adapters.py
Unit tests verifying all 6 adapters:
- Bhoonidhi (CartoDEM 30m)
- Bhuvan (LULC 50k & Flood Hazard)
- MOSDAC (INSAT-3D Rainfall)
- VEDAS (Sentinel-2 NDVI)
- OpenStreetMap (Transport & Power Infrastructure)
- Seismic & Landslide (IS 1893 & GSI NLSM)
"""

import pytest
from backend.app.adapters.bhoonidhi import fetch_dem_indicators
from backend.app.adapters.mosdac import fetch_mosdac_indicators
from backend.app.adapters.vedas import fetch_vedas_indicators
from backend.app.adapters.bhuvan import fetch_bhuvan_lulc_indicators, fetch_bhuvan_flood_indicators
from backend.app.adapters.osm import fetch_osm_indicators
from backend.app.adapters.seismic import fetch_seismic_indicators, fetch_landslide_indicators


def validate_indicator_schema(ind: dict):
    assert "indicator" in ind
    assert "value" in ind
    assert "unit" in ind
    assert "source" in ind
    assert "confidence" in ind
    src = ind["source"]
    assert "portal" in src
    assert "dataset" in src
    assert "resolution" in src
    assert "vintage" in src
    assert "method" in src


def test_bhoonidhi_adapter():
    inds = fetch_dem_indicators("up_jewar")
    assert "elevation_mean_m" in inds
    assert "elevation_relief_m" in inds
    for k, v in inds.items():
        validate_indicator_schema(v)
    assert inds["elevation_mean_m"]["value"] > 100.0  # Jewar is ~190-205m


def test_mosdac_adapter():
    inds = fetch_mosdac_indicators("up_jewar")
    assert "annual_rainfall_mean_mm" in inds
    assert "rainfall_cv_pct" in inds
    assert "dry_months_count" in inds
    for k, v in inds.items():
        validate_indicator_schema(v)
    assert inds["annual_rainfall_mean_mm"]["value"] > 500.0


def test_vedas_adapter():
    inds = fetch_vedas_indicators("up_jewar")
    assert "mean_ndvi" in inds
    assert "ndvi_trend" in inds
    assert "ecological_sensitivity_score" in inds
    for k, v in inds.items():
        validate_indicator_schema(v)
    assert -0.5 <= inds["mean_ndvi"]["value"] <= 1.0


def test_bhuvan_adapter():
    lulc_inds = fetch_bhuvan_lulc_indicators("up_jewar")
    assert "dominant_lulc" in lulc_inds
    assert "wasteland_share_pct" in lulc_inds
    for k, v in lulc_inds.items():
        validate_indicator_schema(v)

    flood_inds = fetch_bhuvan_flood_indicators("up_jewar")
    assert "flood_hazard_fraction" in flood_inds
    for k, v in flood_inds.items():
        validate_indicator_schema(v)


def test_osm_adapter():
    inds = fetch_osm_indicators("up_jewar")
    assert "dist_to_major_road_km" in inds
    assert "dist_to_substation_km" in inds
    assert "dist_to_healthcare_km" in inds
    assert "dist_to_education_km" in inds
    for k, v in inds.items():
        validate_indicator_schema(v)
    assert inds["dist_to_major_road_km"]["value"] >= 0.0


def test_seismic_and_landslide_adapter():
    seismic = fetch_seismic_indicators()
    assert "seismic_zone" in seismic
    assert "seismic_hazard_factor_z" in seismic
    for k, v in seismic.items():
        validate_indicator_schema(v)

    landslide = fetch_landslide_indicators()
    assert "dist_to_landslide_km" in landslide
    assert "landslide_hazard_level" in landslide
    for k, v in landslide.items():
        validate_indicator_schema(v)
