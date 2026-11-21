"""
fetch_osm_region.py
Fetches or verifies OpenStreetMap infrastructure networks for a region.
Collects highways, electrical substations, healthcare, and educational facilities.
"""

import os
import sys
import json
import argparse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from backend.app.adapters.osm import get_osm_filepath, fetch_osm_indicators


def fetch_osm_region(region_id: str):
    print(f"Checking OSM infrastructure for region '{region_id}'...")
    try:
        filepath = get_osm_filepath(region_id)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        feats = data.get("features", [])
        print(f"OSM infrastructure GeoJSON verified at: {filepath} ({len(feats)} features)")
        for f in feats:
            props = f.get("properties", {})
            print(f" - {props.get('type')}: {props.get('name')}")

        inds = fetch_osm_indicators(region_id)
        print(f"Normalized indicators extracted: {list(inds.keys())}")
    except FileNotFoundError:
        print("Data not found. Running build_region_cache.py...")
        from scripts.build_region_cache import generate_jewar_datasets, generate_dholera_datasets
        if region_id == "up_jewar":
            generate_jewar_datasets()
        else:
            generate_dholera_datasets()
        print("OSM dataset generated successfully.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch or verify OSM infrastructure data.")
    parser.add_argument("--region", default="up_jewar", help="Region ID (up_jewar or dholera)")
    args = parser.parse_args()

    fetch_osm_region(args.region)
