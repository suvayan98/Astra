"""
fetch_vedas_ndvi.py
Fetches or verifies Sentinel-2 10m Normalized Difference Vegetation Index (NDVI) from VEDAS (SAC/ISRO).
Supports VEDAS WMS proxy retrieval and offline GeoTIFF fixture mode.
"""

import os
import sys
import argparse
import rasterio

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from backend.app.adapters.vedas import get_ndvi_filepath, fetch_vedas_indicators


def fetch_vedas_ndvi(region_id: str):
    print(f"Checking VEDAS Sentinel-2 NDVI 10m grid for region '{region_id}'...")
    try:
        filepath = get_ndvi_filepath(region_id)
        with rasterio.open(filepath) as src:
            print(f"VEDAS NDVI grid verified at: {filepath}")
            print(f"Dimensions: {src.width}x{src.height}, CRS: {src.crs}, Bands: {src.count}")
            
            # Read sample values
            sample = src.read(1)
            valid = sample[sample != -9999.0]
            print(f"NDVI Mean: {valid.mean():.3f}, Min: {valid.min():.3f}, Max: {valid.max():.3f}")

        # Test adapter normalization
        inds = fetch_vedas_indicators(region_id)
        print(f"Normalized indicators extracted: {list(inds.keys())}")
    except FileNotFoundError:
        print("Data not found. Running build_region_cache.py...")
        from scripts.build_region_cache import generate_jewar_datasets, generate_dholera_datasets
        if region_id == "up_jewar":
            generate_jewar_datasets()
        else:
            generate_dholera_datasets()
        print("VEDAS NDVI dataset generated successfully.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch or verify VEDAS Sentinel-2 NDVI data.")
    parser.add_argument("--region", default="up_jewar", help="Region ID (up_jewar or dholera)")
    args = parser.parse_args()

    fetch_vedas_ndvi(args.region)
