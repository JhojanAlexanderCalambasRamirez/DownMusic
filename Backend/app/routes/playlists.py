import logging
from fastapi import APIRouter, HTTPException
from app.auth.oauth import get_spotify_client
from app.services.spotify_service import get_user_playlists

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/")
def list_playlists(access_token: str):
    sp = get_spotify_client(access_token)
    try:
        return get_user_playlists(sp)
    except Exception as e:
        logger.error("Spotify playlists error: %s", e)
        status = 401 if "401" in str(e) else 500
        raise HTTPException(status_code=status, detail=str(e))
