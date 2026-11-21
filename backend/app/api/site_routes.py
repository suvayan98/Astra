import json
import os
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.services.site_service import site_service
from app.models.schemas import SiteBoundaryInput, SiteSuitabilityResult

router = APIRouter(prefix="/site", tags=["TerraSite AI"])

@router.get("/samples")
def get_sample_sites():
    """
    Returns curated preset Indian candidate sites (Amaravati, Dholera, Bengaluru North, Bundelkhand, Pune-Nashik).
    """
    sample_path = os.path.join(os.path.dirname(__file__), "..", "data", "sample_sites.json")
    try:
        with open(sample_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze", response_model=SiteSuitabilityResult)
async def analyze_site(payload: SiteBoundaryInput):
    """
    Comprehensive multi-criteria site suitability analysis across 12 analytical layers.
    """
    try:
        coords = payload.polygon.coordinates[0]
        res = await site_service.analyze_site(
            polygon_coords=coords,
            name=payload.name or "Selected Site Boundary",
            state=payload.state or "Andhra Pradesh",
            district=payload.district or "Guntur",
            area_acres=payload.area_acres or 500.0,
            proposed_population=payload.proposed_population or 20000
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Site analysis failed: {str(e)}")

@router.post("/compare")
async def compare_sites(payload: List[SiteBoundaryInput]):
    """
    Compares multiple candidate sites side-by-side.
    """
    results = []
    for site in payload:
        coords = site.polygon.coordinates[0]
        res = await site_service.analyze_site(
            polygon_coords=coords,
            name=site.name,
            state=site.state,
            district=site.district,
            area_acres=site.area_acres or 500.0,
            proposed_population=site.proposed_population or 20000
        )
        results.append(res)
    return {"comparisons": results, "ranking": sorted(results, key=lambda x: x["overall_suitability_score"], reverse=True)}

@router.get("/{site_id}/report")
async def get_site_report(site_id: str):
    """
    Generates a full structured appraisal report for the specified site.
    """
    # Sample fallback coordinates for report generation
    default_coords = [[80.505, 16.533], [80.525, 16.533], [80.528, 16.549], [80.508, 16.551], [80.505, 16.533]]
    analysis = await site_service.analyze_site(
        polygon_coords=default_coords,
        name=site_id.replace("_", " ").title(),
        state="Andhra Pradesh",
        district="Guntur",
        area_acres=500.0,
        proposed_population=20000
    )
    return {
        "report_title": f"TerraAI Comprehensive Geospatial Feasibility Appraisal: {analysis['name']}",
        "timestamp": "2026-11-21T15:30:00Z",
        "authoritative_sources": [
            "ISRO Bhuvan (LULC 50k)",
            "ISRO Bhoonidhi (Cartosat-3 / Resourcesat-2A)",
            "ISRO MOSDAC (INSAT-3D Precipitation)",
            "ISRO VEDAS (NDVI Phenology)",
            "Central Ground Water Board (CGWB IN-GRES)",
            "NASA SRTM Digital Elevation",
            "NASA POWER Solar Radiation"
        ],
        "executive_summary": analysis["density_assessment"],
        "overall_score": analysis["overall_suitability_score"],
        "suitability_class": analysis["suitability_class"],
        "detailed_factors": analysis["factors"],
        "exclusion_zones": analysis["exclusion_zones"],
        "module_intelligence": analysis.get("module_summaries", {})
    }
