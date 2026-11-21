"""Regions endpoint for TerraCity AI.

GET /api/regions
Returns demo regions with bounding boxes, center, zoom, EPSG, coverage flags,
and 3 pre-configured candidate site polygons per region.
"""

from fastapi import APIRouter, HTTPException
from backend.app.scoring import load_yaml_config, CONFIG_DIR

router = APIRouter()
REGIONS_CONFIG_PATH = CONFIG_DIR / "demo_regions.yaml"


@router.get("/regions", tags=["Regions"])
async def get_regions():
    """Retrieve all configured demo regions and their preset candidate sites."""
    if not REGIONS_CONFIG_PATH.exists():
        raise HTTPException(status_code=500, detail="demo_regions.yaml not found in config directory")

    data = load_yaml_config(REGIONS_CONFIG_PATH)
    regions_map = data.get("regions", {})

    # Transform into clean list with metadata
    regions_list = []
    for reg_id, reg_info in regions_map.items():
        regions_list.append({
            "id": reg_id,
            "name": reg_info.get("name", reg_id),
            "state": reg_info.get("state", ""),
            "is_primary": reg_info.get("is_primary", False),
            "description": reg_info.get("description", ""),
            "bbox": reg_info.get("bbox", []),
            "center": reg_info.get("center", []),
            "default_zoom": reg_info.get("default_zoom", 11),
            "utm_epsg": reg_info.get("utm_epsg", 32643),
            "portals": reg_info.get("portals", {}),
            "flood_method": reg_info.get("flood_method", "bhuvan_direct"),
            "candidate_sites": reg_info.get("candidate_sites", [])
        })

    return {
        "count": len(regions_list),
        "regions": regions_list
    }


@router.get("/regions/{region_id}", tags=["Regions"])
async def get_region_by_id(region_id: str):
    """Retrieve details and candidate sites for a specific region."""
    data = load_yaml_config(REGIONS_CONFIG_PATH)
    regions_map = data.get("regions", {})
    if region_id not in regions_map:
        raise HTTPException(status_code=404, detail=f"Region '{region_id}' not found")
    return regions_map[region_id]
