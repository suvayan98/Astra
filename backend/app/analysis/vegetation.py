"""
Vegetation & Ecological Analysis Module
Cross-validates VEDAS Sentinel-2 NDVI with Bhuvan LULC classes.
Implements:
- Wasteland boost vs forest/cropland clearing penalty
- Ecological sensitivity evaluation
- Dealbreaker check: >15% wetland overlap (polygonized to dealbreaker GeoJSON)
"""

from typing import Dict, Any, Tuple, Optional, List
import numpy as np

from backend.app.adapters import make_indicator
from backend.app.adapters.vedas import fetch_vedas_indicators
from backend.app.adapters.bhuvan import fetch_bhuvan_lulc_indicators, get_lulc_filepath
from backend.app.analysis.zonal import extract_zonal_array, polygonize_mask_to_geojson


def analyze_vegetation(
    region_id: str,
    polygon_geojson: Dict[str, Any]
) -> Tuple[Dict[str, Any], Optional[Dict[str, Any]]]:
    """
    Performs ecological and vegetation cross-validation analysis.
    Returns:
        (indicators_dict, dealbreaker_geojson_or_None)
    """
    indicators: Dict[str, Any] = {}
    
    # 1. Fetch VEDAS NDVI indicators
    vedas_inds = fetch_vedas_indicators(region_id, polygon_geojson)
    indicators.update(vedas_inds)
    
    # 2. Fetch Bhuvan LULC indicators
    lulc_inds = fetch_bhuvan_lulc_indicators(region_id, polygon_geojson)
    indicators.update(lulc_inds)

    # 3. Cross-Validation: Wasteland boost vs Clearing penalty
    mean_ndvi = float(vedas_inds.get("mean_ndvi", {}).get("value", 0.35))
    wasteland_share = float(lulc_inds.get("wasteland_share_pct", {}).get("value", 0.0))
    wetland_share = float(lulc_inds.get("wetland_fraction_pct", {}).get("value", 0.0))
    forest_penalty = float(lulc_inds.get("forest_clearing_penalty", {}).get("value", 0.0))

    # Cross-validation logic:
    # If wasteland is high (>25%) and NDVI is low (<0.30), development suitability receives a boost
    is_wasteland_boost = (wasteland_share >= 25.0) and (mean_ndvi <= 0.32)
    wasteland_boost_score = 15.0 if is_wasteland_boost else (8.0 if wasteland_share > 10.0 else 0.0)

    # If NDVI is high (>0.60) and forest/cropland is dominant, high clearing penalty is imposed
    is_clearing_penalized = (mean_ndvi >= 0.55) or (forest_penalty > 30.0)

    indicators["wasteland_suitability_boost"] = make_indicator(
        indicator="wasteland_suitability_boost",
        value=wasteland_boost_score,
        unit="pts",
        portal="VEDAS x Bhuvan",
        dataset="NDVI x LULC Cross-Validation",
        resolution="10m-30m",
        vintage="2022-2024",
        method="ecological_conversion_optimization",
        confidence="high",
        details={
            "wasteland_share_pct": wasteland_share,
            "mean_ndvi": mean_ndvi,
            "is_boosted": is_wasteland_boost
        }
    )

    indicators["ecological_clearing_risk"] = make_indicator(
        indicator="ecological_clearing_risk",
        value="High" if is_clearing_penalized else "Low to Moderate",
        unit="category",
        portal="VEDAS x Bhuvan",
        dataset="NDVI x LULC Cross-Validation",
        resolution="10m-30m",
        vintage="2022-2024",
        method="biomass_clearing_impact_assessment",
        confidence="high"
    )

    # 4. Check Dealbreaker: >15% wetland overlap
    is_wetland_dealbreaker = wetland_share > 15.0
    dealbreaker_fc = None

    if is_wetland_dealbreaker:
        lulc_path = get_lulc_filepath(region_id)
        arr, vmask, transform, _ = extract_zonal_array(lulc_path, polygon_geojson, nodata=0)
        wetland_mask = vmask & (arr == 6)
        
        if np.any(wetland_mask):
            dealbreaker_fc = polygonize_mask_to_geojson(
                wetland_mask,
                transform,
                properties={
                    "dealbreaker_type": "wetland_overlap",
                    "label": f"Protected Wetland Overlap ({wetland_share}% > 15% limit)",
                    "color": "#0284c7"
                }
            )

    return indicators, dealbreaker_fc
