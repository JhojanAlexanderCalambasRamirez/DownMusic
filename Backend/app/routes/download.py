import logging
import os
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask

from app.services.download_service import download_track, AudioFormat

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/")
def download(
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
        background=BackgroundTask(os.remove, filepath),
    )
