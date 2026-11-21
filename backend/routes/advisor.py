from fastapi import APIRouter
from backend.models.schemas import AssistantRequest, AssistantResponse
from backend.services.advisor_ai import AdvisorAIService
from backend.data.sample_sites import SAMPLE_SITES

router = APIRouter(prefix="/api/ai", tags=["AI Planning Assistant"])

@router.post("/assistant", response_model=AssistantResponse)
async def ask_assistant(req: AssistantRequest) -> AssistantResponse:
    site_data = SAMPLE_SITES.get(req.site_id) if req.site_id else None
    return await AdvisorAIService.answer_query(req, site_data=site_data)
