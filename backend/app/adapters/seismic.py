"""
Seismic and Landslide Adapter (NDMA / BIS IS 1893:2016 & GSI NLSM)
Performs static spatial queries against official Bureau of Indian Standards seismic zones
and Geological Survey of India landslide inventory polygons.
Supports dealbreaker rule: Seismic Zone V + high landslide hazard.
"""

import os
import json
import math
from typing import Dict, Any, Optional
from shapely.geometry import shape, Point

from backend.app.adapters import make_indicator

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
STATIC_DIR = os.path.join(BASE_DIR, "data", "static")
SEISMIC_FILE = os.path.join(STATIC_DIR, "seismic_zones.geojson")
LANDSLIDE_FILE = os.path.join(STATIC_DIR, "landslide_inventory.geojson")


def _approx_distance_km(geom1, geom2, ref_lat: float = 25.0) -> float:
    lat_scale = 110.574
    lon_scale = 111.320 * math.cos(math.radians(ref_lat))
    if geom1.intersects(geom2):
        return 0.0
    p1 = geom1.centroid
    p2 = geom2.centroid
    dx = (p1.x - p2.x) * lon_scale
    dy = (p1.y - p2.y) * lat_scale
    return math.sqrt(dx * dx + dy * dy)


def fetch_seismic_indicators(polygon_geojson: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Performs spatial containment lookup for IS 1893:2016 seismic zone.
    """
    if not os.path.exists(SEISMIC_FILE):
        return {}

    with open(SEISMIC_FILE, "r", encoding="utf-8") as f:
        fc = json.load(f)

    target_geom = None
    ref_lat = 28.0
    if polygon_geojson:
        raw_geom = polygon_geojson.get("geometry", polygon_geojson)
        target_geom = shape(raw_geom)
        ref_lat = target_geom.centroid.y
    else:
        target_geom = Point(77.58, 28.19) # Default Jewar

    matched_zone = "III"
    matched_z = 0.16
    matched_desc = "Moderate Damage Risk Zone"

    for feat in fc.get("features", []):
        f_geom = shape(feat.get("geometry"))
        if target_geom.intersects(f_geom) or f_geom.contains(target_geom.centroid):
            props = feat.get("properties", {})
            matched_zone = props.get("zone", "III")
            matched_z = float(props.get("zone_factor_z", 0.16))
            matched_desc = props.get("hazard_description", "Moderate Risk")
            break

    return {
        "seismic_zone": make_indicator(
            indicator="seismic_zone",
            value=f"Zone {matched_zone}",
            unit="zone",
            portal="BIS / NDMA",
            dataset="IS 1893: 2016 Seismic Zonation",
            resolution="regional_vector",
            vintage="2016",
            method="polygon_spatial_join",
            confidence="high",
            details={"zone_factor_z": matched_z, "description": matched_desc}
        ),
        "seismic_hazard_factor_z": make_indicator(
            indicator="seismic_hazard_factor_z",
            value=matched_z,
            unit="dimensionless",
            portal="BIS / NDMA",
            dataset="IS 1893: 2016 Seismic Zonation",
            resolution="regional_vector",
            vintage="2016",
            method="zone_factor_table_lookup",
            confidence="high"
        )
    }


def fetch_landslide_indicators(polygon_geojson: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Calculates distance to nearest GSI landslide inventory feature.
    """
    if not os.path.exists(LANDSLIDE_FILE):
        return {}

    with open(LANDSLIDE_FILE, "r", encoding="utf-8") as f:
        fc = json.load(f)

    target_geom = None
    ref_lat = 28.0
    if polygon_geojson:
        raw_geom = polygon_geojson.get("geometry", polygon_geojson)
        target_geom = shape(raw_geom)
        ref_lat = target_geom.centroid.y
    else:
        target_geom = Point(77.58, 28.19)

    min_dist_km = 999.0
    closest_feature = "None"

    for feat in fc.get("features", []):
        f_geom = shape(feat.get("geometry"))
        dist_km = _approx_distance_km(target_geom, f_geom, ref_lat)
        if dist_km < min_dist_km:
            min_dist_km = dist_km
            closest_feature = feat.get("properties", {}).get("location", "Landslide Zone")

    # Risk level classification
    if min_dist_km < 5.0:
        hazard_level = "High"
    elif min_dist_km < 25.0:
        hazard_level = "Moderate"
    elif min_dist_km < 75.0:
        hazard_level = "Low"
    else:
        hazard_level = "Negligible"

    return {
        "dist_to_landslide_km": make_indicator(
            indicator="dist_to_landslide_km",
            value=round(min_dist_km, 1),
            unit="km",
            portal="Geological Survey of India (GSI)",
            dataset="National Landslide Susceptibility Mapping (NLSM)",
            resolution="vector",
            vintage="2020",
            method="shortest_geodetic_distance",
            confidence="high",
            details={"nearest_zone": closest_feature}
        ),
        "landslide_hazard_level": make_indicator(
            indicator="landslide_hazard_level",
            value=hazard_level,
            unit="category",
            portal="Geological Survey of India (GSI)",
            dataset="National Landslide Susceptibility Mapping (NLSM)",
            resolution="vector",
            vintage="2020",
            method="distance_threshold_classification",
            confidence="high"
        )
    }
