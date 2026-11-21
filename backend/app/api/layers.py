"""Layers endpoint for TerraCity AI.

GET /api/layers
Returns available spatial map overlays (id, title, portal, type, proxy_url, legend)
sourced from the 4 Indian space portals and OSM.
"""

from fastapi import APIRouter
from backend.app.scoring import load_yaml_config, CONFIG_DIR

router = APIRouter()
DATASETS_CONFIG_PATH = CONFIG_DIR / "datasets.yaml"


@router.get("/layers", tags=["Layers"])
async def get_layers():
    """Return catalog of toggleable map layers for Leaflet canvas."""
    datasets_cfg = load_yaml_config(DATASETS_CONFIG_PATH).get("datasets", {})

    layers = [
        {
            "id": "cartodem_elevation",
            "title": "Bhoonidhi CartoDEM (30m Elevation & Relief)",
            "portal": "Bhoonidhi",
            "agency": "NRSC / ISRO",
            "type": "raster",
            "resolution": "30m",
            "vintage": "2019-2022",
            "proxy_url": None,
            "legend": {
                "unit": "meters",
                "min": 150,
                "max": 350,
                "color_ramp": ["#2b83ba", "#abdda4", "#ffffbf", "#fdae61", "#d7191c"]
            }
        },
        {
            "id": "bhuvan_lulc",
            "title": "Bhuvan Land Use / Land Cover (1:50k)",
            "portal": "Bhuvan",
            "agency": "NRSC / ISRO",
            "type": "raster",
            "resolution": "30m",
            "vintage": "2021-2022",
            "proxy_url": "/api/proxy/bhuvan/lulc",
            "legend": {
                "classes": [
                    {"value": 1, "label": "Built-up", "color": "#e31a1c"},
                    {"value": 2, "label": "Cropland", "color": "#b2df8a"},
                    {"value": 3, "label": "Forest / Plantation", "color": "#33a02c"},
                    {"value": 4, "label": "Wasteland / Barren", "color": "#fdbf6f"},
                    {"value": 5, "label": "Water Bodies", "color": "#1f78b4"},
                    {"value": 6, "label": "Wetland / Marsh", "color": "#a6cee3"}
                ]
            }
        },
        {
            "id": "bhuvan_flood_hazard",
            "title": "Bhuvan Flood Inundation Hazard Zonation",
            "portal": "Bhuvan",
            "agency": "NRSC / ISRO",
            "type": "raster",
            "resolution": "30m",
            "vintage": "2018-2023",
            "proxy_url": "/api/proxy/bhuvan/flood",
            "legend": {
                "classes": [
                    {"value": 0, "label": "No Flood Recorded", "color": "transparent"},
                    {"value": 1, "label": "Low Flood Hazard", "color": "#fed976"},
                    {"value": 2, "label": "Moderate Flood Hazard", "color": "#fd8d3c"},
                    {"value": 3, "label": "High Flood Hazard (Deal-breaker)", "color": "#bd0026"}
                ]
            }
        },
        {
            "id": "cartodem_hand_flood",
            "title": "CartoDEM HAND Flood Inundation Proxy (< 2m)",
            "portal": "Bhoonidhi",
            "agency": "NRSC / ISRO",
            "type": "raster",
            "resolution": "30m",
            "vintage": "Derived",
            "proxy_url": None,
            "legend": {
                "unit": "HAND height (meters)",
                "classes": [
                    {"label": "HAND < 2m (High Risk Floodplain)", "color": "#e41a1c"},
                    {"label": "HAND 2m - 5m (Moderate Buffer)", "color": "#377eb8"},
                    {"label": "HAND > 5m (Safe Upland)", "color": "#4daf4a"}
                ]
            }
        },
        {
            "id": "vedas_sentinel2_ndvi",
            "title": "VEDAS Sentinel-2 NDVI (Vegetation Health)",
            "portal": "VEDAS",
            "agency": "SAC / ISRO",
            "type": "raster",
            "resolution": "10m",
            "vintage": "2023-2024",
            "proxy_url": "/api/proxy/vedas/wms",
            "legend": {
                "unit": "NDVI index",
                "min": -0.1,
                "max": 0.8,
                "color_ramp": ["#d73027", "#fc8d59", "#fee08b", "#d9ef8b", "#91cf60", "#1a9850"]
            }
        },
        {
            "id": "osm_infrastructure",
            "title": "OpenStreetMap Regional Infrastructure (Roads, Power, Social)",
            "portal": "OpenStreetMap",
            "agency": "OSM Contributors",
            "type": "vector",
            "resolution": "Vector",
            "vintage": "Current",
            "proxy_url": None,
            "legend": {
                "classes": [
                    {"label": "Major Highways / Corridors", "color": "#ff7f00"},
                    {"label": "Power Substations & Grid", "color": "#984ea3"},
                    {"label": "Hospitals & Higher Education", "color": "#e41a1c"}
                ]
            }
        },
        {
            "id": "seismic_zones",
            "title": "BIS IS 1893 Seismic Hazard Zones",
            "portal": "Static / BIS",
            "agency": "Bureau of Indian Standards",
            "type": "vector",
            "resolution": "National",
            "vintage": "2016",
            "proxy_url": None,
            "legend": {
                "classes": [
                    {"label": "Zone II (Low)", "color": "#ffffb2"},
                    {"label": "Zone III (Moderate)", "color": "#fecc5c"},
                    {"label": "Zone IV (Severe)", "color": "#fd8d3c"},
                    {"label": "Zone V (Very Severe - Deal-breaker)", "color": "#e31a1c"}
                ]
            }
        }
    ]

    return {
        "count": len(layers),
        "layers": layers
    }
