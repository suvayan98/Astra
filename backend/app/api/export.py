"""GeoJSON FeatureCollection export endpoint for TerraCity AI.

POST /api/export/geojson
Exports evaluated candidate site polygons and spatial deal-breaker zones
as standard GeoJSON with comprehensive MCA attributes and 4-portal provenance.
"""

from typing import Any, Dict, List, Optional, Union
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, Field

from backend.app.cache import analysis_store
from backend.app.models import SiteScorecard
from backend.app.report import export_scorecards_to_geojson

router = APIRouter()


class ExportGeoJSONRequest(BaseModel):
    """Request payload to export GeoJSON FeatureCollection."""
    analysis_ids: Optional[List[str]] = Field(default=None, description="Optional SQLite analysis UUIDs")
    sites: Optional[List[Union[SiteScorecard, Dict[str, Any]]]] = Field(default=None, description="Direct site scorecards")
    include_deal_breaker_zones: bool = Field(default=True, description="Whether to include hazardous sub-masks")


@router.post("/export/geojson", tags=["Export"])
async def post_export_geojson(request: ExportGeoJSONRequest):
    """Export evaluated sites and deal-breaker zones as a downloadable GeoJSON FeatureCollection."""
    scorecards: List[SiteScorecard] = []

    # 1. Load by analysis_ids from SQLite
    if request.analysis_ids:
        for a_id in request.analysis_ids:
            data = analysis_store.get_analysis(a_id)
            if data:
                try:
                    scorecards.append(SiteScorecard(**data))
                except Exception:
                    pass

    # 2. Add directly provided site scorecards
    if request.sites:
        for s in request.sites:
            if isinstance(s, SiteScorecard):
                scorecards.append(s)
            elif isinstance(s, dict):
                try:
                    scorecards.append(SiteScorecard(**s))
                except Exception:
                    pass

    # Fallback to recent analyses in SQLite if none provided
    if not scorecards:
        recent = analysis_store.list_analyses(limit=3)
        for r in recent:
            data = analysis_store.get_analysis(r["id"])
            if data:
                try:
                    scorecards.append(SiteScorecard(**data))
                except Exception:
                    pass

    if not scorecards:
        raise HTTPException(
            status_code=400,
            detail="No site scorecards available to export. Run an analysis first."
        )

    geojson_data = export_scorecards_to_geojson(
        scorecards=scorecards,
        include_deal_breaker_zones=request.include_deal_breaker_zones
    )

    import json
    return Response(
        content=json.dumps(geojson_data, indent=2),
        media_type="application/geo+json",
        headers={
            "Content-Disposition": 'attachment; filename="terracity_analysis.geojson"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
