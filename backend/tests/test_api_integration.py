"""Integration tests for TerraCity AI FastAPI Server.

Tests:
- GET /api/health
- GET /api/regions and /api/regions/{id}
- GET /api/layers
- GET /api/sources
- GET /api/proxy/bhuvan/test and /api/proxy/vedas/wms
- POST /api/analyze (valid polygon, out-of-bounds error, area > 2000 km² error)
- POST /api/compare
- POST /api/scenarios/run
- POST /api/report
- POST /api/export/geojson
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "up_jewar" in data["loaded_regions"]
    assert "bhoonidhi" in data["portals"]
    assert "bhuvan" in data["portals"]
    assert "mosdac" in data["portals"]
    assert "vedas" in data["portals"]


def test_regions():
    response = client.get("/api/regions")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 2
    reg_ids = [r["id"] for r in data["regions"]]
    assert "up_jewar" in reg_ids
    assert "dholera" in reg_ids

    # Specific region lookup
    resp_jewar = client.get("/api/regions/up_jewar")
    assert resp_jewar.status_code == 200
    jewar_data = resp_jewar.json()
    assert len(jewar_data["candidate_sites"]) >= 3


def test_layers():
    response = client.get("/api/layers")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 5
    layer_ids = [l["id"] for l in data["layers"]]
    assert "cartodem_elevation" in layer_ids
    assert "bhuvan_lulc" in layer_ids
    assert "bhuvan_flood_hazard" in layer_ids
    assert "vedas_sentinel2_ndvi" in layer_ids


def test_sources_provenance_matrix():
    response = client.get("/api/sources")
    assert response.status_code == 200
    data = response.json()
    assert data["portal_count"] == 4
    portals = [s["portal"] for s in data["sources"]]
    assert "Bhoonidhi" in portals
    assert "Bhuvan" in portals
    assert "MOSDAC" in portals
    assert "VEDAS" in portals


def test_proxies_offline_fallback():
    # Bhuvan proxy
    resp_bhuvan = client.get("/api/proxy/bhuvan/wms?SERVICE=WMS&REQUEST=GetCapabilities")
    assert resp_bhuvan.status_code == 200
    assert resp_bhuvan.headers.get("content-type") == "image/png"

    # VEDAS proxy
    resp_vedas = client.get("/api/proxy/vedas/wms?SERVICE=WMS&REQUEST=GetMap")
    assert resp_vedas.status_code == 200
    assert resp_vedas.headers.get("content-type") == "image/png"


def test_analyze_site_valid():
    # Jewar site A polygon
    req_payload = {
        "site": {
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
        },
        "site_name": "Jewar Greenfield Sector A",
        "site_id": "site_a",
        "region_id": "up_jewar",
        "population": 150000,
        "weight_preset": "balanced"
    }

    response = client.post("/api/analyze", json=req_payload)
    assert response.status_code == 200
    data = response.json()

    assert data["site_id"] == "site_a"
    assert data["region_id"] == "up_jewar"
    assert data["area_km2"] > 0
    assert 0 <= data["overall_score"] <= 100
    assert "pillars" in data
    assert "terrain_and_land" in data["pillars"]
    assert "water_security" in data["pillars"]
    assert "hazard_risk" in data["pillars"]
    assert "environmental_impact" in data["pillars"]
    assert "infrastructure_access" in data["pillars"]
    assert data["site_confidence_pct"] >= 50.0


def test_analyze_polygon_validation_errors():
    # Outside India bounds
    out_of_bounds_payload = {
        "site": {
            "type": "Polygon",
            "coordinates": [
                [
                    [10.0, 50.0],
                    [11.0, 50.0],
                    [11.0, 51.0],
                    [10.0, 51.0],
                    [10.0, 50.0]
                ]
            ]
        },
        "site_name": "Invalid Site",
        "region_id": "up_jewar"
    }
    resp_bounds = client.post("/api/analyze", json=out_of_bounds_payload)
    assert resp_bounds.status_code == 400
    assert "outside India" in resp_bounds.json()["message"]

    # Giant polygon exceeding 2000 km2
    giant_payload = {
        "site": {
            "type": "Polygon",
            "coordinates": [
                [
                    [75.0, 25.0],
                    [80.0, 25.0],
                    [80.0, 30.0],
                    [75.0, 30.0],
                    [75.0, 25.0]
                ]
            ]
        },
        "site_name": "Giant Site",
        "region_id": "up_jewar"
    }
    resp_giant = client.post("/api/analyze", json=giant_payload)
    assert resp_giant.status_code == 400
    assert "exceeds maximum allowable threshold" in resp_giant.json()["message"]


def test_compare_sites():
    site_a = {
        "site": {
            "type": "Polygon",
            "coordinates": [
                [[77.525, 28.210], [77.565, 28.210], [77.565, 28.245], [77.525, 28.245], [77.525, 28.210]]
            ]
        },
        "site_name": "Jewar Site A",
        "site_id": "site_a",
        "region_id": "up_jewar"
    }
    site_b = {
        "site": {
            "type": "Polygon",
            "coordinates": [
                [[77.580, 28.140], [77.620, 28.140], [77.620, 28.175], [77.580, 28.175], [77.580, 28.140]]
            ]
        },
        "site_name": "Jewar Site B",
        "site_id": "site_b",
        "region_id": "up_jewar"
    }

    req_payload = {
        "sites": [site_a, site_b],
        "weight_preset": "balanced",
        "region_id": "up_jewar"
    }

    response = client.post("/api/compare", json=req_payload)
    assert response.status_code == 200
    data = response.json()

    assert len(data["rankings"]) == 2
    assert data["rankings"][0]["rank"] == 1
    assert data["rankings"][1]["rank"] == 2
    assert "narrative" in data
    assert len(data["narrative"]) > 20


def test_scenarios_run():
    req_payload = {
        "site_ids": ["site_a"],
        "region_id": "up_jewar",
        "start_year": 2026,
        "horizon_year": 2050,
        "target_population": 500000,
        "climate_scenario": "baseline",
        "lpcd": 135.0
    }

    response = client.post("/api/scenarios/run", json=req_payload)
    assert response.status_code == 200
    data = response.json()

    assert "site_a" in data["results"]
    res = data["results"]["site_a"]
    assert res["horizon_year"] == 2050
    # Sanity check: 500,000 * 135 lpcd = 67.5 MLD
    assert abs(res["final_demand_mld"] - 67.5) < 0.2
    assert len(res["time_series"]) == 25 # 2026 to 2050 inclusive


def test_report_and_export_geojson():
    # Run analysis first
    site_a = {
        "site": {
            "type": "Polygon",
            "coordinates": [
                [[77.525, 28.210], [77.565, 28.210], [77.565, 28.245], [77.525, 28.245], [77.525, 28.210]]
            ]
        },
        "site_name": "Jewar Site A",
        "site_id": "site_a",
        "region_id": "up_jewar"
    }
    sc_resp = client.post("/api/analyze", json=site_a)
    assert sc_resp.status_code == 200
    scorecard = sc_resp.json()

    # Test report endpoint
    rep_resp = client.post("/api/report", json={"sites": [scorecard], "region_id": "up_jewar"})
    assert rep_resp.status_code == 200
    rep_data = rep_resp.json()
    assert "html" in rep_data
    assert "<!DOCTYPE html>" in rep_data["html"]
    assert "@media print" in rep_data["html"]

    # Test export GeoJSON endpoint
    export_resp = client.post("/api/export/geojson", json={"sites": [scorecard]})
    assert export_resp.status_code == 200
    assert "attachment" in export_resp.headers.get("content-disposition", "")
    geojson = export_resp.json()
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) >= 1
    feat = geojson["features"][0]
    assert feat["properties"]["site_id"] == "site_a"
    assert feat["properties"]["overall_score"] == scorecard["overall_score"]
