from fastapi import APIRouter
from app.models.schemas import AdvisorChatRequest, AdvisorChatResponse
from app.services.advisor_service import advisor_service

router = APIRouter(prefix="/ai", tags=["TerraAdvisor AI"])

@router.post("/assistant", response_model=AdvisorChatResponse)
def chat_with_advisor(payload: AdvisorChatRequest):
    """
    Module J: TerraAdvisor AI — Context-aware planning assistant using calculated metrics and retrieved datasets.
    """
    result = advisor_service.answer_query(
        question=payload.question,
        site_context={"site_id": payload.site_id},
        plan_context={"plan_id": payload.plan_id}
    )
    return result
