"""
fetch_bhuvan_layers.py
Fetches or verifies Bhuvan LULC 1:50,000 and Flood Inundation Hazard layers from NRSC/ISRO.
"""

import os
import sys
import argparse
import rasterio

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from backend.app.adapters.bhuvan import get_lulc_filepath, get_flood_filepath, fetch_bhuvan_lulc_indicators, fetch_bhuvan_flood_indicators


def fetch_bhuvan_layers(region_id: str):
    print(f"Checking Bhuvan layers for region '{region_id}'...")
    
    # 1. LULC 50k
    try:
        lulc_path = get_lulc_filepath(region_id)
        with rasterio.open(lulc_path) as src:
            print(f"Bhuvan LULC 50k verified at: {lulc_path}")
            print(f"Dimensions: {src.width}x{src.height}, CRS: {src.crs}")
        lulc_inds = fetch_bhuvan_lulc_indicators(region_id)
        print(f"Dominant LULC: {lulc_inds.get('dominant_lulc', {}).get('value')}")
    except FileNotFoundError:
        print(f"LULC not found for region {region_id}")

    # 2. Flood Inundation Hazard
    flood_path = get_flood_filepath(region_id)
    if flood_path and os.path.exists(flood_path):
        with rasterio.open(flood_path) as src:
            print(f"Bhuvan Flood Inundation Hazard verified at: {flood_path}")
            print(f"Dimensions: {src.width}x{src.height}, CRS: {src.crs}")
        flood_inds = fetch_bhuvan_flood_indicators(region_id)
        print(f"Flood Hazard Fraction: {flood_inds.get('flood_hazard_fraction', {}).get('value')}%")
    else:
        print(f"Bhuvan Flood layer absent or fallback triggered for region {region_id}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch or verify Bhuvan LULC and Flood layers.")
    parser.add_argument("--region", default="up_jewar", help="Region ID (up_jewar or dholera)")
    args = parser.parse_args()

    fetch_bhuvan_layers(args.region)
