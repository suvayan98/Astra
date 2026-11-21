"""Comparative multi-site evaluation endpoint for TerraCity AI.

POST /api/compare
Takes 2-3 candidate sites (either raw polygon requests or existing scorecards),
evaluates each, ranks them by overall suitability, detects tie conditions (< 5.0 pts),
and generates comparative drivers and executive narrative.
"""

from typing import Any, Dict, List, Optional, Union
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.app.cache import analysis_store
from backend.app.models import CompareResponse, SiteScorecard
from backend.app.scoring import compare_sites
from backend.app.api.analyze import AnalyzeRequest, validate_and_compute_geometry, execute_site_analysis

router = APIRouter()


class CompareRequest(BaseModel):
    """Payload to compare up to 3 candidate township sites."""
    sites: List[Union[AnalyzeRequest, Dict[str, Any]]] = Field(
        description="List of candidate site requests or existing scorecards (up to 3)"
    )
    weight_preset: str = Field(default="balanced", description="Weight preset: balanced, climate_resilient, infra_first")
    region_id: Optional[str] = Field(default=None, description="Optional region ID filter")


@router.post("/compare", response_model=CompareResponse, tags=["Comparison"])
async def post_compare(request: CompareRequest):
    """Compare and rank up to 3 candidate sites side-by-side."""
    if not request.sites:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one candidate site must be provided for comparison."
        )

    if len(request.sites) > 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Compare endpoint accepts a maximum of 3 candidate sites (received {len(request.sites)})."
        )

    scorecards: List[SiteScorecard] = []

    for item in request.sites:
        # Check if already a full SiteScorecard
        if isinstance(item, SiteScorecard):
            scorecards.append(item)
        elif isinstance(item, dict) and "overall_score" in item and "pillars" in item:
            try:
                sc = SiteScorecard(**item)
                scorecards.append(sc)
            except Exception:
                pass
        else:
            # Parse as AnalyzeRequest
            try:
                req_obj = AnalyzeRequest(**item) if isinstance(item, dict) else item
                req_obj.weight_preset = request.weight_preset
                if request.region_id:
                    req_obj.region_id = request.region_id

                poly_geom, area_km2 = validate_and_compute_geometry(req_obj.site)
                sc = execute_site_analysis(req_obj, poly_geom, area_km2)
                scorecards.append(sc)
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Failed to evaluate candidate site: {str(e)}"
                )

    if not scorecards:
        raise HTTPException(status_code=400, detail="No valid site scorecards produced.")

    # Execute comparison
    comp_result = compare_sites(scorecards, preset=request.weight_preset)

    # Persist in SQLite
    analysis_store.save_comparison(comp_result)

    return comp_result
