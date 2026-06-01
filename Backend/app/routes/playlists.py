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
        raise HTTPException(status_code=500, detail=str(e))
