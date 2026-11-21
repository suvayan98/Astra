"""
test_four_portal_bonus.py
Four-Portal Bonus Acceptance Test:
Verifies that all four Indian national portals:
1. Bhoonidhi (NRSC Open Data Archive - CartoDEM 30m)
2. Bhuvan (NRSC Geoportal - LULC 50k & Flood Inundation)
3. MOSDAC (SAC/ISRO - INSAT-3D Precipitation Climatology)
4. VEDAS (SAC/ISRO - Sentinel-2 NDVI 10m)
have at least one real, non-missing indicator in the primary demo region (UP Jewar).
Also verifies that the secondary region (Dholera) correctly triggers the HAND proxy fallback.
"""

import pytest
from backend.app.adapters.bhoonidhi import fetch_dem_indicators
from backend.app.adapters.bhuvan import fetch_bhuvan_lulc_indicators, fetch_bhuvan_flood_indicators
from backend.app.adapters.mosdac import fetch_mosdac_indicators
from backend.app.adapters.vedas import fetch_vedas_indicators
from backend.app.analysis.hazards import analyze_hazards


def test_four_portal_bonus_acceptance():
    region_id = "up_jewar"
    
    # 1. Bhoonidhi
    bhoonidhi_inds = fetch_dem_indicators(region_id)
    assert len(bhoonidhi_inds) > 0
    assert bhoonidhi_inds["elevation_mean_m"]["value"] is not None
    assert bhoonidhi_inds["elevation_mean_m"]["source"]["portal"] == "Bhoonidhi"

    # 2. Bhuvan
    bhuvan_lulc = fetch_bhuvan_lulc_indicators(region_id)
    bhuvan_flood = fetch_bhuvan_flood_indicators(region_id)
    assert len(bhuvan_lulc) > 0
    assert bhuvan_lulc["dominant_lulc"]["value"] is not None
    assert bhuvan_lulc["dominant_lulc"]["source"]["portal"] == "Bhuvan"
    assert bhuvan_flood["flood_hazard_fraction"]["value"] is not None
    assert bhuvan_flood["flood_hazard_fraction"]["source"]["portal"] == "Bhuvan"

    # 3. MOSDAC
    mosdac_inds = fetch_mosdac_indicators(region_id)
    assert len(mosdac_inds) > 0
    assert mosdac_inds["annual_rainfall_mean_mm"]["value"] is not None
    assert mosdac_inds["annual_rainfall_mean_mm"]["source"]["portal"] == "MOSDAC"

    # 4. VEDAS
    vedas_inds = fetch_vedas_indicators(region_id)
    assert len(vedas_inds) > 0
    assert vedas_inds["mean_ndvi"]["value"] is not None
    assert vedas_inds["mean_ndvi"]["source"]["portal"] == "VEDAS"


def test_hand_proxy_fallback_secondary_region():
    region_id = "dholera"
    site_b = {
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
    inds, dealbreaker_fc = analyze_hazards(region_id, site_b, {"flood_method": "hand_proxy"})
    assert "hand_flood_risk_fraction" in inds
    assert inds["hand_flood_risk_fraction"]["source"]["method"] == "proxy"
    assert inds["hand_flood_risk_fraction"]["confidence"] == "low"
    # Dholera coastal margin site B should have positive low HAND (<2m) fraction
    assert inds["hand_flood_risk_fraction"]["value"] > 0.0
