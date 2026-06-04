import logging
from fastapi import APIRouter, HTTPException, Query
from app.auth.oauth import get_spotify_client
from app.services.spotify_service import get_playlist_tracks

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/{playlist_id}")
def list_songs(
    playlist_id: str,
    access_token: str,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    sp = get_spotify_client(access_token)
    try:
        return get_playlist_tracks(sp, playlist_id, offset=offset, limit=limit)
    except Exception as e:
        logger.error("Songs error: %s", e)
        status = 401 if "401" in str(e) else 500
        raise HTTPException(status_code=status, detail=str(e))
