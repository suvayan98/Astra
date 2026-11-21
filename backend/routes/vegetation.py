from fastapi import APIRouter
from typing import Dict, Any
from backend.models.schemas import VegetationIntelligenceResult
from backend.services.vegetation_analysis import VegetationService
from backend.data.sample_sites import SAMPLE_SITES

router = APIRouter(prefix="/api/vegetation", tags=["Vegetation & Green City Planner"])

@router.post("/analyze", response_model=VegetationIntelligenceResult)
async def analyze_vegetation(payload: Dict[str, Any]) -> VegetationIntelligenceResult:
    site_id = payload.get("site_id")
    site = SAMPLE_SITES.get(site_id) if site_id else None

    acres = payload.get("area_acres", 500.0)
    veg_data = site.get("vegetation") if site else payload.get("vegetation_data")

    return VegetationService.analyze_vegetation(veg_data, acres)
