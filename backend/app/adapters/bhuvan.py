"""
Bhuvan Adapter (NRSC Geoportal, ISRO)
Accesses Bhuvan LULC 1:50,000, Flood Hazard Zonation, and Geomorphology layers.
Provides both direct observation values and flags dealbreakers (high flood, wetland overlap).
Supports offline GeoTIFF fixtures and WMS proxy requests.
"""

import os
from typing import Dict, Any, Optional
import rasterio
from rasterio.mask import mask
import numpy as np

from backend.app.adapters import make_indicator

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
CACHE_DIR = os.path.join(BASE_DIR, "data", "cache", "regions")
FIXTURES_DIR = os.path.join(BASE_DIR, "data", "fixtures")

# LULC Class Mapping
LULC_CLASSES = {
    1: "Built-up",
    2: "Cropland",
    3: "Forest / Plantation",
    4: "Wasteland / Scrubland",
    5: "Water bodies",
    6: "Wetland / Marsh"
}


def get_lulc_filepath(region_id: str) -> str:
    cache_path = os.path.join(CACHE_DIR, region_id, "lulc.tif")
    if os.path.exists(cache_path):
        return cache_path
    fixture_path = os.path.join(FIXTURES_DIR, region_id, "lulc.tif")
    if os.path.exists(fixture_path):
        return fixture_path
    raise FileNotFoundError(f"LULC GeoTIFF not found for region {region_id}")


def get_flood_filepath(region_id: str) -> Optional[str]:
    cache_path = os.path.join(CACHE_DIR, region_id, "flood.tif")
    if os.path.exists(cache_path):
        return cache_path
    fixture_path = os.path.join(FIXTURES_DIR, region_id, "flood.tif")
    if os.path.exists(fixture_path):
        return fixture_path
    return None


def fetch_bhuvan_lulc_indicators(region_id: str, polygon_geojson: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Extracts LULC class shares and wasteland/wetland breakdown from Bhuvan LULC 50k.
    """
    lulc_path = get_lulc_filepath(region_id)
    
    with rasterio.open(lulc_path) as src:
        if polygon_geojson:
            geom = [polygon_geojson.get("geometry", polygon_geojson)]
            out_image, _ = mask(src, geom, crop=True, nodata=0)
            data = out_image[0]
            valid_mask = (data > 0) & (data <= 6)
            cells = data[valid_mask]
        else:
            data = src.read(1)
            valid_mask = (data > 0) & (data <= 6)
            cells = data[valid_mask]

    total_cells = len(cells)
    if total_cells == 0:
        return {}

    counts = {cls_id: int(np.sum(cells == cls_id)) for cls_id in LULC_CLASSES}
    shares = {cls_id: round(float(counts[cls_id] / total_cells * 100.0), 2) for cls_id in LULC_CLASSES}
    
    # Identify dominant class
    dominant_id = max(counts, key=counts.get)
    dominant_name = LULC_CLASSES.get(dominant_id, "Unknown")
    
    wasteland_share = shares.get(4, 0.0)
    wetland_share = shares.get(6, 0.0)
    forest_share = shares.get(3, 0.0)
    cropland_share = shares.get(2, 0.0)
    water_share = shares.get(5, 0.0)

    # Clearing penalty score (high if dense forest or intensive cropland requires clearance)
    clearing_penalty = round(forest_share * 1.0 + cropland_share * 0.35, 1)

    return {
        "dominant_lulc": make_indicator(
            indicator="dominant_lulc",
            value=dominant_name,
            unit="category",
            portal="Bhuvan",
            dataset="LULC 50k (2021-22)",
            resolution="30m",
            vintage="2021-2022",
            method="supervised_multispectral_classification",
            confidence="high",
            details={"class_id": dominant_id, "shares_pct": {LULC_CLASSES[k]: v for k, v in shares.items()}}
        ),
        "wasteland_share_pct": make_indicator(
            indicator="wasteland_share_pct",
            value=wasteland_share,
            unit="%",
            portal="Bhuvan",
            dataset="LULC 50k (2021-22)",
            resolution="30m",
            vintage="2021-2022",
            method="fractional_pixel_share",
            confidence="high"
        ),
        "wetland_fraction_pct": make_indicator(
            indicator="wetland_fraction_pct",
            value=wetland_share,
            unit="%",
            portal="Bhuvan",
            dataset="LULC 50k (2021-22)",
            resolution="30m",
            vintage="2021-2022",
            method="fractional_pixel_share",
            confidence="high",
            details={"is_dealbreaker": wetland_share > 15.0}
        ),
        "forest_clearing_penalty": make_indicator(
            indicator="forest_clearing_penalty",
            value=clearing_penalty,
            unit="penalty_pts",
            portal="Bhuvan",
            dataset="LULC 50k (2021-22)",
            resolution="30m",
            vintage="2021-2022",
            method="forest_cropland_clearing_model",
            confidence="high"
        )
    }


def fetch_bhuvan_flood_indicators(region_id: str, polygon_geojson: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Extracts Bhuvan Flood Inundation Hazard statistics.
    Returns empty or low confidence if flood layer is absent (triggering HAND proxy fallback).
    """
    flood_path = get_flood_filepath(region_id)
    if not flood_path or not os.path.exists(flood_path):
        return {}

    with rasterio.open(flood_path) as src:
        if polygon_geojson:
            geom = [polygon_geojson.get("geometry", polygon_geojson)]
            out_image, _ = mask(src, geom, crop=True, nodata=255)
            data = out_image[0]
            valid_mask = (data != 255) & (data <= 3)
            cells = data[valid_mask]
        else:
            data = src.read(1)
            valid_mask = (data != src.nodata) & (data <= 3)
            cells = data[valid_mask]

    total_cells = len(cells)
    if total_cells == 0:
        return {}

    # Check if there is actual recorded coverage
    # Classes: 0: None, 1: Low, 2: Moderate, 3: High
    c0 = int(np.sum(cells == 0))
    c1 = int(np.sum(cells == 1))
    c2 = int(np.sum(cells == 2))
    c3 = int(np.sum(cells == 3))
    
    flood_fraction = round(float((c1 + c2 + c3) / total_cells * 100.0), 2)
    high_hazard_pct = round(float(c3 / total_cells * 100.0), 2)
    moderate_hazard_pct = round(float(c2 / total_cells * 100.0), 2)

    return {
        "flood_hazard_fraction": make_indicator(
            indicator="flood_hazard_fraction",
            value=flood_fraction,
            unit="%",
            portal="Bhuvan",
            dataset="Flood Inundation Hazard Zonation",
            resolution="30m",
            vintage="2018-2023",
            method="multi_year_microwave_optical_inundation_frequency",
            confidence="high" if total_cells > 0 else "low",
            details={
                "low_pct": round(float(c1 / total_cells * 100.0), 2),
                "moderate_pct": moderate_hazard_pct,
                "high_pct": high_hazard_pct
            }
        ),
        "high_flood_hazard_pct": make_indicator(
            indicator="high_flood_hazard_pct",
            value=high_hazard_pct,
            unit="%",
            portal="Bhuvan",
            dataset="Flood Inundation Hazard Zonation",
            resolution="30m",
            vintage="2018-2023",
            method="recurrent_high_hazard_mask",
            confidence="high",
            details={"is_dealbreaker": high_hazard_pct > 50.0}
        )
    }
