"""
Adapters package for TerraCity AI.
Normalizes data access across Indian geospatial portals:
- Bhoonidhi (CartoDEM 30m)
- Bhuvan (LULC, Flood, Geomorphology, Surface Water)
- MOSDAC (INSAT-3D/3DR Rainfall Climatology)
- VEDAS (Sentinel-2 NDVI)
- OpenStreetMap (Infrastructure Networks)
- Seismic & Landslide (IS 1893 & GSI NLSM)
"""

from typing import Any, Dict, Optional


def make_indicator(
    indicator: str,
    value: Any,
    unit: str,
    portal: str,
    dataset: str,
    resolution: str,
    vintage: str,
    method: str,
    confidence: str = "high",
    details: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Standard normalized IndicatorValue schema across all adapters and analysis modules.
    """
    item: Dict[str, Any] = {
        "indicator": indicator,
        "value": value,
        "unit": unit,
        "source": {
            "portal": portal,
            "dataset": dataset,
            "resolution": resolution,
            "vintage": vintage,
            "method": method
        },
        "confidence": confidence
    }
    if details:
        item["details"] = details
    return item
