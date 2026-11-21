"""
Infrastructure Analysis Module
Computes distance buffers to highways, secondary roads, electrical substations, hospitals, and schools
using OpenStreetMap vector layers.
"""

from typing import Dict, Any
from backend.app.adapters.osm import fetch_osm_indicators


def analyze_infrastructure(
    region_id: str,
    polygon_geojson: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Performs infrastructure access analysis for a candidate polygon.
    """
    return fetch_osm_indicators(region_id, polygon_geojson)
