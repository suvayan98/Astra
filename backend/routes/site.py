from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from backend.models.schemas import SiteBoundaryInput, SiteSuitabilityResult
from backend.services.site_suitability import SiteSuitabilityService
from backend.data.sample_sites import SAMPLE_SITES

router = APIRouter(prefix="/api/site", tags=["Site Selection & Suitability"])

@router.get("/presets")
async def get_preset_sites() -> List[Dict[str, Any]]:
    return list(SAMPLE_SITES.values())

@router.post("/analyze", response_model=SiteSuitabilityResult)
async def analyze_site(site_input: SiteBoundaryInput) -> SiteSuitabilityResult:
    # Match if it is one of our sample sites or custom
    matched = None
    for sid, s in SAMPLE_SITES.items():
        if site_input.name.lower() in s["name"].lower() or (site_input.district and site_input.district.lower() in s["district"].lower()):
            matched = s
            break

    area_acres = site_input.area_acres or 500.0
    pop = site_input.target_population or 20000

    return SiteSuitabilityService.evaluate_suitability(
        site_id=matched["id"] if matched else "custom_site_01",
        site_name=site_input.name,
        state=site_input.state or (matched["state"] if matched else "Gujarat"),
        district=site_input.district or (matched["district"] if matched else "Ahmedabad"),
        area_acres=area_acres,
        target_pop=pop,
        raw_site=matched
    )

@router.post("/compare")
async def compare_sites(site_ids: List[str]) -> List[SiteSuitabilityResult]:
    results = []
    for sid in site_ids:
        s = SAMPLE_SITES.get(sid)
        if s:
            res = SiteSuitabilityService.evaluate_suitability(
                site_id=s["id"],
                site_name=s["name"],
                state=s["state"],
                district=s["district"],
                area_acres=s["area_acres"],
                target_pop=s["target_population"],
                raw_site=s
            )
            results.append(res)
    return results

@router.get("/{site_id}/report")
async def get_site_report(site_id: str) -> Dict[str, Any]:
    s = SAMPLE_SITES.get(site_id)
    if not s:
        raise HTTPException(status_code=404, detail="Site not found")
    suitability = SiteSuitabilityService.evaluate_suitability(
        site_id=s["id"],
        site_name=s["name"],
        state=s["state"],
        district=s["district"],
        area_acres=s["area_acres"],
        target_pop=s["target_population"],
        raw_site=s
    )
    return {
        "site_metadata": s,
        "suitability": suitability
    }
