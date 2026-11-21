from fastapi import APIRouter
from typing import Dict, Any
from backend.models.schemas import SoilAnalysisResult
from backend.services.soil_analysis import SoilService
from backend.data.sample_sites import SAMPLE_SITES

router = APIRouter(prefix="/api/soil", tags=["Soil Intelligence"])

@router.post("/analyze", response_model=SoilAnalysisResult)
async def analyze_soil(payload: Dict[str, Any]) -> SoilAnalysisResult:
    site_id = payload.get("site_id")
    site = SAMPLE_SITES.get(site_id) if site_id else None
    soil_data = site.get("soil") if site else payload.get("soil_data")
    return SoilService.analyze_soil(soil_data)
