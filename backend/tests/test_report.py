"""Unit tests for printable HTML report and GeoJSON exporter (Milestone M5).

Verifies:
- Standalone self-contained HTML report with @media print CSS for printing/PDF.
- Inline SVG data visualization (pillar scores & 2026-2050 water stress).
- Four-portal provenance reference matrix.
- GeoJSON FeatureCollection export with embedded scorecards and deal-breaker zones.
"""

import json
import pytest

from backend.app.models import IndicatorValue, SourceInfo, ScenarioRunRequest
from backend.app.report import generate_html_report, export_scorecards_to_geojson
from backend.app.scoring import score_site, compare_sites
from backend.app.scenarios import run_scenarios


def make_ind(name: str, val: any, portal: str = "Bhuvan") -> IndicatorValue:
    return IndicatorValue(
        indicator=name,
        value=val,
        source=SourceInfo(portal=portal, dataset="TestDataset"),
        confidence="high"
    )


@pytest.fixture
def sample_scorecards():
    poly_geom = {
        "type": "Polygon",
        "coordinates": [
            [
                [77.52, 28.21],
                [77.56, 28.21],
                [77.56, 28.25],
                [77.52, 28.25],
                [77.52, 28.21]
            ]
        ]
    }

    inds_a = {
        "slope_buildable_share": make_ind("slope_buildable_share", 0.90, "Bhoonidhi"),
        "rainfall_mean_annual": make_ind("rainfall_mean_annual", 950.0, "MOSDAC"),
        "vegetation_ndvi_mean": make_ind("vegetation_ndvi_mean", 0.25, "VEDAS"),
        "flood_hazard": make_ind("flood_hazard", 85.0, "Bhuvan"),
        "road_access": make_ind("road_access", 1.5, "External"),
    }
    sc_a = score_site("site_a", "Site A (Upland)", inds_a, area_km2=25.0, geometry=poly_geom)

    inds_b = {
        "slope_buildable_share": make_ind("slope_buildable_share", 0.85, "Bhoonidhi"),
        "flood_hazard_fraction": make_ind("flood_hazard_fraction", 0.65, "Bhuvan"), # Disqualified
        "road_access": make_ind("road_access", 2.0, "External"),
    }
    sc_b = score_site("site_b", "Site B (Floodplain)", inds_b, area_km2=30.0, geometry=poly_geom)

    return [sc_a, sc_b]


def test_html_report_generation(sample_scorecards):
    cmp_res = compare_sites(sample_scorecards)
    scen_res = run_scenarios(
        ScenarioRunRequest(site_ids=["site_a", "site_b"], climate_scenario="baseline"),
        scorecards={s.site_id: s for s in sample_scorecards}
    )

    html_content = generate_html_report(
        scorecards=sample_scorecards,
        comparison=cmp_res,
        scenarios=scen_res,
        region_id="up_jewar",
        preset="balanced"
    )

    assert "<!DOCTYPE html>" in html_content
    # Print stylesheet checks
    assert "@media print" in html_content
    assert "@page" in html_content
    assert "page-break-inside: avoid;" in html_content or "page-break-before: always;" in html_content

    # Brand & content checks
    assert "TERRACITY AI" in html_content
    assert "Site A (Upland)" in html_content
    assert "Site B (Floodplain)" in html_content
    assert "CRITICAL HARD-STOP DISQUALIFICATION" in html_content
    assert "2026-2050 Physical Water Balance" in html_content

    # Offline SVG visualization checks
    assert "<svg" in html_content
    assert "</svg>" in html_content

    # Provenance matrix checks
    assert "ISRO Bhoonidhi" in html_content
    assert "ISRO MOSDAC" in html_content
    assert "ISRO VEDAS" in html_content
    assert "ISRO Bhuvan" in html_content


def test_geojson_export(sample_scorecards):
    fc = export_scorecards_to_geojson(sample_scorecards, include_deal_breaker_zones=True)

    assert fc["type"] == "FeatureCollection"
    assert "features" in fc
    assert len(fc["features"]) >= 2

    # Check site feature properties
    site_features = [f for f in fc["features"] if f["properties"].get("feature_type") == "candidate_site"]
    assert len(site_features) == 2

    feat_a = next(f for f in site_features if f["properties"]["site_id"] == "site_a")
    props_a = feat_a["properties"]
    assert props_a["site_name"] == "Site A (Upland)"
    assert props_a["overall_score"] > 0.0
    assert props_a["is_disqualified"] is False
    assert "pillar_scores" in props_a
    assert "indicators" in props_a

    feat_b = next(f for f in site_features if f["properties"]["site_id"] == "site_b")
    props_b = feat_b["properties"]
    assert props_b["is_disqualified"] is True
    assert len(props_b["disqualification_reasons"]) > 0

    # Test serialization to JSON
    json_str = json.dumps(fc)
    assert len(json_str) > 100
