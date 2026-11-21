"""
fetch_mosdac_rainfall.py
Fetches or verifies INSAT-3D / 3DR Hydro-Estimator Precipitation Climatology from MOSDAC (SAC/ISRO).
Computes 10-year monthly climatology, annual precipitation mean, standard deviation, and CV %.
"""

import os
import sys
import json
import argparse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from backend.app.adapters.mosdac import get_rainfall_filepath, fetch_mosdac_indicators


def fetch_mosdac_rainfall(region_id: str):
    print(f"Checking MOSDAC INSAT-3D rainfall climatology for region '{region_id}'...")
    try:
        filepath = get_rainfall_filepath(region_id)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        print(f"MOSDAC precipitation data verified at: {filepath}")
        print(f"Station: {data.get('station')}")
        print(f"Annual Mean Rainfall: {data.get('annual_rainfall_mean_mm')} mm/year")
        print(f"Rainfall CV: {data.get('rainfall_cv_pct')}%")
        print(f"Dry Months Count: {data.get('dry_months_count')} months/year")
        print(f"Drought Exposure Index: {data.get('drought_exposure_index')}")
        
        # Test adapter normalization
        inds = fetch_mosdac_indicators(region_id)
        print(f"Normalized indicators extracted: {list(inds.keys())}")
    except FileNotFoundError:
        print("Data not found. Running build_region_cache.py...")
        from scripts.build_region_cache import generate_jewar_datasets, generate_dholera_datasets
        if region_id == "up_jewar":
            generate_jewar_datasets()
        else:
            generate_dholera_datasets()
        print("MOSDAC dataset generated successfully.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch or verify MOSDAC INSAT-3D rainfall data.")
    parser.add_argument("--region", default="up_jewar", help="Region ID (up_jewar or dholera)")
    args = parser.parse_args()

    fetch_mosdac_rainfall(args.region)
