"""
test_offline_mode.py
Verifies that TerraCity AI functions 100% offline:
- Zero dependency on external network calls.
- All 6 adapters (Bhoonidhi, Bhuvan, MOSDAC, VEDAS, OSM, Seismic) load purely from local fixtures and cache.
- Full end-to-end site analysis, comparison, water balance stress-testing, and report generation execute cleanly offline.
"""

import os
import socket
import pytest
from unittest.mock import patch

from backend.app.adapters.bhoonidhi import fetch_dem_indicators
from backend.app.adapters.bhuvan import fetch_bhuvan_lulc_indicators, fetch_bhuvan_flood_indicators
from backend.app.adapters.mosdac import fetch_mosdac_indicators
from backend.app.adapters.vedas import fetch_vedas_indicators
from backend.app.adapters.osm import fetch_osm_indicators
from backend.app.adapters.seismic import fetch_seismic_indicators, fetch_landslide_indicators
from backend.app.analysis.engine import run_site_analysis
from backend.app.scoring import score_site, compare_sites
from backend.app.scenarios import compute_physical_water_balance
from backend.app.report import generate_html_report, export_scorecards_to_geojson


def guard_against_network_calls(*args, **kwargs):
    raise RuntimeError("External network call attempted in offline mode!")


@pytest.fixture(autouse=True)
def force_offline_mode(monkeypatch):
    """Set OFFLINE_MODE=true and block raw socket connections to verify zero internet reliance."""
    monkeypatch.setenv("OFFLINE_MODE", "true")


def test_all_adapters_load_offline():
    region_id = "up_jewar"

    # Block socket connections to strictly verify no network I/O
    with patch("socket.socket.connect", side_effect=guard_against_network_calls):
        # 1. Bhoonidhi
        bhoonidhi_inds = fetch_dem_indicators(region_id)
        assert bhoonidhi_inds["elevation_mean_m"]["value"] is not None
        assert bhoonidhi_inds["elevation_mean_m"]["source"]["portal"] == "Bhoonidhi"

        # 2. Bhuvan LULC & Flood
        lulc_inds = fetch_bhuvan_lulc_indicators(region_id)
        flood_inds = fetch_bhuvan_flood_indicators(region_id)
        assert lulc_inds["dominant_lulc"]["value"] is not None
        assert flood_inds["flood_hazard_fraction"]["value"] is not None

        # 3. MOSDAC
        mosdac_inds = fetch_mosdac_indicators(region_id)
        assert mosdac_inds["annual_rainfall_mean_mm"]["value"] is not None

        # 4. VEDAS
        vedas_inds = fetch_vedas_indicators(region_id)
        assert vedas_inds["mean_ndvi"]["value"] is not None

        # 5. OSM Infrastructure
        osm_inds = fetch_osm_indicators(region_id)
        assert osm_inds["dist_to_major_road_km"]["value"] is not None

        # 6. Static Seismic & Landslide
        sz = fetch_seismic_indicators()
        assert "seismic_zone" in sz
        assert "IV" in sz["seismic_zone"]["value"]
        ls = fetch_landslide_indicators()
        assert "landslide_hazard_level" in ls
        assert ls["landslide_hazard_level"]["value"] in ["Low", "Negligible", "Moderate"]


def test_full_pipeline_offline_execution():
    candidate_site = {
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

    with patch("socket.socket.connect", side_effect=guard_against_network_calls):
        # 1. Dynamic analysis engine
        analysis_res = run_site_analysis("up_jewar", candidate_site)
        indicators = analysis_res["indicators"]
        assert len(indicators) >= 10
        assert "mean_slope_deg" in indicators
        assert "annual_rainfall_mean_mm" in indicators
        assert analysis_res["execution_time_ms"] < 1000.0

        # 2. MCA Scoring
        card = score_site(
            site_id="offline_site",
            site_name="Offline Test Site",
            indicators=indicators,
            preset="balanced",
            area_km2=20.0,
            geometry=candidate_site,
            raster_masks=None
        )
        assert card.overall_score > 0.0
        assert card.site_confidence_pct >= 50.0

        # 3. Multi-site Comparison
        cmp_res = compare_sites([card], preset="balanced")
        assert len(cmp_res.rankings) == 1

        # 4. Water balance stress test
        wb = compute_physical_water_balance(
            site_id="offline_site",
            site_name="Offline Test Site",
            site_area_km2=20.0,
            preset="baseline"
        )
        assert len(wb.time_series) == 25
        assert wb.final_demand_mld > 0.0

        # 5. Report generation and GeoJSON export
        html = generate_html_report([card], comparison=cmp_res, region_id="up_jewar")
        assert "<!DOCTYPE html>" in html
        assert "TERRACITY AI" in html

        geojson = export_scorecards_to_geojson([card])
        assert geojson["type"] == "FeatureCollection"
