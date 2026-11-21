"""Standalone printable HTML report generation endpoint for TerraCity AI.

POST /api/report
Returns a self-contained, printable HTML report with @media print CSS,
clean typography, inline SVG charts, and complete 4-portal provenance.
"""

from typing import Any, Dict, List, Optional, Union
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, Field

from backend.app.cache import analysis_store
from backend.app.models import CompareResponse, ReportResponse, ScenarioRunResponse, SiteScorecard
from backend.app.report import generate_html_report
from backend.app.scoring import compare_sites

router = APIRouter()


class ReportRequest(BaseModel):
    """Request payload to generate printable HTML report."""
    analysis_ids: Optional[List[str]] = Field(default=None, description="Optional SQLite analysis UUIDs")
    sites: Optional[List[Union[SiteScorecard, Dict[str, Any]]]] = Field(default=None, description="Direct site scorecards")
    region_id: str = Field(default="up_jewar", description="Study area region ID")
    preset: str = Field(default="balanced", description="Weight preset used")
    format: str = Field(default="json", description="'json' for ReportResponse envelope, or 'html' for raw text/html")


@router.post("/report", tags=["Reporting"])
async def post_generate_report(request: ReportRequest):
    """Generate self-contained printable HTML report."""
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
            detail="No site scorecards available to generate report. Run an analysis first."
        )

    # Build comparison if multiple sites
    comp_obj: Optional[CompareResponse] = None
    if len(scorecards) >= 2:
        try:
            comp_obj = compare_sites(scorecards, preset=request.preset)
        except Exception:
            pass

    # Generate HTML
    html_content = generate_html_report(
        scorecards=scorecards,
        comparison=comp_obj,
        region_id=request.region_id,
        preset=request.preset
    )

    if request.format == "html":
        return Response(content=html_content, media_type="text/html")

    from datetime import datetime, timezone
    return ReportResponse(
        html=html_content,
        generated_at=datetime.now(timezone.utc).isoformat(),
        site_count=len(scorecards)
    )
