"""
Hazards Analysis Module
Evaluates multi-hazard risk across Indian geospatial datasets:
1. Bhuvan Flood Inundation Hazard Zonation (direct satellite observation)
2. CartoDEM Height Above Nearest Drainage (HAND) flood proxy fallback (fraction HAND < 2m, method='proxy', confidence='low')
3. IS 1893:2016 Seismic Zone lookup
4. GSI NLSM Landslide Susceptibility & Distance
Evaluates dealbreakers:
- >50% high Bhuvan flood hazard
- Seismic Zone V + High Landslide hazard
Generates polygonized GeoJSON deal-breaker zones.
"""

from typing import Dict, Any, Tuple, Optional, List
import numpy as np

from backend.app.adapters import make_indicator
from backend.app.adapters.bhoonidhi import get_hand_filepath
from backend.app.adapters.bhuvan import fetch_bhuvan_flood_indicators, get_flood_filepath
from backend.app.adapters.seismic import fetch_seismic_indicators, fetch_landslide_indicators
from backend.app.analysis.zonal import extract_zonal_array, polygonize_mask_to_geojson


def analyze_hazards(
    region_id: str,
    polygon_geojson: Dict[str, Any],
    region_config: Optional[Dict[str, Any]] = None
) -> Tuple[Dict[str, Any], Optional[Dict[str, Any]]]:
    """
    Performs comprehensive hazard analysis for a site.
    Returns:
        (indicators_dict, dealbreaker_geojson_or_None)
    """
    indicators: Dict[str, Any] = {}
    dealbreaker_features: List[Dict[str, Any]] = []

    # 1. Flood Inundation Assessment (Direct vs HAND Proxy)
    flood_method = "bhuvan_direct"
    if region_config:
        flood_method = region_config.get("flood_method", "bhuvan_direct")

    bhuvan_indicators = fetch_bhuvan_flood_indicators(region_id, polygon_geojson)
    
    # Check if Bhuvan direct flood data is valid and non-trivial
    has_bhuvan_flood = (
        flood_method != "hand_proxy" and
        bool(bhuvan_indicators) and
        bhuvan_indicators.get("flood_hazard_fraction", {}).get("value") is not None
    )

    if has_bhuvan_flood:
        indicators.update(bhuvan_indicators)
        high_flood_pct = bhuvan_indicators.get("high_flood_hazard_pct", {}).get("value", 0.0)
        
        # Check flood dealbreaker: >50% high Bhuvan flood hazard
        if high_flood_pct > 50.0:
            flood_path = get_flood_filepath(region_id)
            if flood_path:
                arr, vmask, transform, _ = extract_zonal_array(flood_path, polygon_geojson, nodata=255)
                high_flood_mask = vmask & (arr == 3)
                if np.any(high_flood_mask):
                    fc = polygonize_mask_to_geojson(
                        high_flood_mask,
                        transform,
                        properties={
                            "dealbreaker_type": "high_flood_hazard",
                            "label": f"Bhuvan High Flood Hazard ({high_flood_pct}% of site)",
                            "color": "#ef4444"
                        }
                    )
                    dealbreaker_features.extend(fc.get("features", []))
    else:
        # Fallback to CartoDEM HAND Flood Proxy (fraction HAND < 2m, method='proxy', confidence='low')
        hand_path = get_hand_filepath(region_id)
        if hand_path:
            hand_arr, vmask, transform, dt_ms = extract_zonal_array(hand_path, polygon_geojson, nodata=-9999.0)
            valid_cells = np.sum(vmask)
            if valid_cells > 0:
                low_hand_mask = vmask & (hand_arr < 2.0)
                low_hand_count = int(np.sum(low_hand_mask))
                hand_risk_pct = round(float(low_hand_count / valid_cells * 100.0), 2)
                
                indicators["hand_flood_risk_fraction"] = make_indicator(
                    indicator="hand_flood_risk_fraction",
                    value=hand_risk_pct,
                    unit="%",
                    portal="Bhoonidhi",
                    dataset="CartoDEM HAND Proxy",
                    resolution="30m",
                    vintage="2021",
                    method="proxy",
                    confidence="low",
                    details={
                        "threshold_m": 2.0,
                        "description": "Fraction of area with Height Above Nearest Drainage < 2.0m",
                        "fallback_reason": "Bhuvan direct flood observations unavailable or sparse in this region"
                    }
                )
                
                # Provide synthetic flood_hazard_fraction normalized for scoring
                indicators["flood_hazard_fraction"] = make_indicator(
                    indicator="flood_hazard_fraction",
                    value=hand_risk_pct,
                    unit="%",
                    portal="Bhoonidhi",
                    dataset="CartoDEM HAND Proxy",
                    resolution="30m",
                    vintage="2021",
                    method="proxy",
                    confidence="low"
                )
                
                indicators["high_flood_hazard_pct"] = make_indicator(
                    indicator="high_flood_hazard_pct",
                    value=hand_risk_pct if hand_risk_pct > 50.0 else 0.0,
                    unit="%",
                    portal="Bhoonidhi",
                    dataset="CartoDEM HAND Proxy",
                    resolution="30m",
                    vintage="2021",
                    method="proxy",
                    confidence="low"
                )

                if hand_risk_pct > 50.0:
                    fc = polygonize_mask_to_geojson(
                        low_hand_mask,
                        transform,
                        properties={
                            "dealbreaker_type": "hand_flood_proxy",
                            "label": f"CartoDEM HAND Low Elevation Proxy ({hand_risk_pct}% < 2m)",
                            "color": "#f97316"
                        }
                    )
                    dealbreaker_features.extend(fc.get("features", []))

    # 2. Seismic Zone Analysis
    seismic_inds = fetch_seismic_indicators(polygon_geojson)
    indicators.update(seismic_inds)
    seismic_zone_val = str(seismic_inds.get("seismic_zone", {}).get("value", ""))

    # 3. Landslide Distance & Susceptibility
    landslide_inds = fetch_landslide_indicators(polygon_geojson)
    indicators.update(landslide_inds)
    landslide_hazard_val = str(landslide_inds.get("landslide_hazard_level", {}).get("value", ""))

    # Check dealbreaker: Seismic Zone V + High Landslide
    if "Zone V" in seismic_zone_val and landslide_hazard_val == "High":
        dealbreaker_features.append({
            "type": "Feature",
            "geometry": polygon_geojson.get("geometry", polygon_geojson),
            "properties": {
                "dealbreaker_type": "seismic_landslide_compound",
                "label": "Compound Hazard: Seismic Zone V and High Landslide Susceptibility",
                "color": "#dc2626"
            }
        })

    dealbreaker_fc = None
    if dealbreaker_features:
        dealbreaker_fc = {
            "type": "FeatureCollection",
            "features": dealbreaker_features
        }

    return indicators, dealbreaker_fc
