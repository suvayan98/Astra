"""Physical water balance stress testing endpoint (2026-2050) for TerraCity AI.

POST /api/scenarios/run
Executes calibrated physical water balance simulation avoiding Day-1 deficit:
- Population growth trajectory (150k -> 380k-500k)
- Demand (500k * 135 lpcd = 67.5 MLD)
- Local harvest from satellite rainfall, catchment multiplier (3.0), and aquifer yield
- External supply expansion
- Stress index and deficit detection
- Uncertainty bands and qualitative flood stress band
"""

from typing import Dict, Optional
from fastapi import APIRouter, HTTPException
from backend.app.cache import analysis_store
from backend.app.models import ScenarioRunRequest, ScenarioRunResponse, SiteScorecard
from backend.app.scenarios import run_scenarios

router = APIRouter()


@router.post("/scenarios/run", response_model=ScenarioRunResponse, tags=["Scenarios"])
async def post_run_scenarios(request: ScenarioRunRequest):
    """Run 2026-2050 physical water balance simulation for candidate sites."""
    # Look up any scorecards from SQLite store if site_ids are provided
    scorecards_dict: Dict[str, SiteScorecard] = {}

    if request.site_ids:
        for s_id in request.site_ids:
            # Check SQLite
            found = False
            for record in analysis_store.list_analyses(limit=50):
                if record.get("site_id") == s_id or record.get("id") == s_id:
                    full_sc = analysis_store.get_analysis(record["id"])
                    if full_sc:
                        try:
                            scorecards_dict[s_id] = SiteScorecard(**full_sc)
                            found = True
                            break
                        except Exception:
                            pass
            if not found:
                pass

    # Execute simulation
    response = run_scenarios(request, scorecards=scorecards_dict or None)

    # Persist in SQLite store
    analysis_store.save_scenario(request, response)

    return response
