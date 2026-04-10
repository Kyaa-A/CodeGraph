import logging

from supabase import create_client, Client

from app.core.config import settings

logger = logging.getLogger(__name__)

_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
if not settings.SUPABASE_SERVICE_ROLE_KEY:
    logger.warning("SUPABASE_SERVICE_ROLE_KEY not set — falling back to anon key. "
                    "Set it in .env for proper RLS bypass.")

supabase: Client = create_client(settings.SUPABASE_URL, _key)
