try:
    from backend.app.models.screening_models import *
    from backend.app.models.schemas import *
except (ImportError, ModuleNotFoundError):
    from app.models.screening_models import *
    from app.models.schemas import *
