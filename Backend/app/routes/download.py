import logging
import os
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from starlette.background import BackgroundTask

from app.auth.oauth import get_spotify_client
from app.services.download_service import download_track, download_tracks_zip, AudioFormat
from app.services.spotify_service import get_playlist_tracks

logger = logging.getLogger(__name__)
router = APIRouter()


def _cleanup(path: str):
    try:
        os.remove(path)
        os.rmdir(os.path.dirname(path))
    except Exception:
        pass


@router.get("/")
def download_single(
    query: str,
    fmt: AudioFormat = Query("mp3", alias="format"),
    access_token: str = "",
):
    try:
        filepath, filename = download_track(query, fmt)
    except Exception as e:
        logger.error("Download error: %s", e)
        raise HTTPException(status_code=500, detail="No se pudo descargar la cancion")

    media_type = "audio/mpeg" if fmt == "mp3" else "video/mp4"
    return FileResponse(
        path=filepath,
        filename=filename,
        media_type=media_type,
        background=BackgroundTask(_cleanup, filepath),
    )


class BatchRequest(BaseModel):
    queries: list[str]
    format: AudioFormat = "mp3"


@router.post("/batch")
def download_batch(body: BatchRequest, access_token: str = ""):
    if not body.queries:
        raise HTTPException(status_code=400, detail="No queries provided")
    if len(body.queries) > 100:
        raise HTTPException(status_code=400, detail="Maximo 100 canciones por descarga")

    try:
        zip_path, zip_name = download_tracks_zip(body.queries, body.format)
    except Exception as e:
        logger.error("Batch download error: %s", e)
        raise HTTPException(status_code=500, detail="Error al descargar canciones")

    return FileResponse(
        path=zip_path,
        filename=zip_name,
        media_type="application/zip",
        background=BackgroundTask(_cleanup, zip_path),
    )


@router.get("/playlist/{playlist_id}")
def download_playlist(
    playlist_id: str,
    fmt: AudioFormat = Query("mp3", alias="format"),
    access_token: str = "",
):
    sp = get_spotify_client(access_token)
    try:
        data = get_playlist_tracks(sp, playlist_id)
    except Exception as e:
        status = 401 if "401" in str(e) else 500
        raise HTTPException(status_code=status, detail=str(e))

    queries = [
        f"{t['artists'][0]} {t['name']}" for t in data["tracks"] if t.get("artists")
    ]
    if not queries:
        raise HTTPException(status_code=404, detail="Playlist sin canciones")

    try:
        zip_path, zip_name = download_tracks_zip(queries, fmt)
    except Exception as e:
        logger.error("Playlist download error: %s", e)
        raise HTTPException(status_code=500, detail="Error al descargar playlist")

    return FileResponse(
        path=zip_path,
        filename=zip_name,
        media_type="application/zip",
        background=BackgroundTask(_cleanup, zip_path),
    )
