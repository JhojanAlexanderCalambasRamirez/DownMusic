import logging
import os
from threading import Thread
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from starlette.background import BackgroundTask

from app.auth.oauth import get_spotify_client
from app.services.download_service import download_track, download_tracks_zip, AudioFormat
from app.services.spotify_service import get_playlist_tracks
from app.services.job_service import create_job, get_job, remove_job

logger = logging.getLogger(__name__)
router = APIRouter()


def _cleanup(path: str):
    try:
        os.remove(path)
        os.rmdir(os.path.dirname(path))
    except Exception:
        pass


# ── Single track (synchronous, fast) ────────────────────────────────────────

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


# ── Async job system ─────────────────────────────────────────────────────────

class BatchJobRequest(BaseModel):
    queries: list[str]
    format: AudioFormat = "mp3"


def _run_batch_job(job_id: str, queries: list[str], fmt: AudioFormat):
    job = get_job(job_id)
    if not job:
        return

    def on_progress(completed: int, failed: list[str]):
        job.completed = completed
        job.failed = failed[:]

    try:
        zip_path, zip_name, failed = download_tracks_zip(queries, fmt, on_progress)
        job.zip_path = zip_path
        job.zip_name = zip_name
        job.failed = failed
        job.completed = len(queries) - len(failed)
        job.status = "done"
    except Exception as e:
        logger.error("Job %s failed: %s", job_id, e)
        job.status = "error"
        job.error = str(e)


@router.post("/jobs")
def start_batch_job(body: BatchJobRequest, access_token: str = ""):
    if not body.queries:
        raise HTTPException(status_code=400, detail="No queries provided")

    job = create_job(total=len(body.queries))
    Thread(
        target=_run_batch_job,
        args=(job.id, body.queries, body.format),
        daemon=True,
    ).start()
    return {"job_id": job.id}


@router.post("/jobs/playlist/{playlist_id}")
def start_playlist_job(
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

    job = create_job(total=len(queries))
    Thread(
        target=_run_batch_job,
        args=(job.id, queries, fmt),
        daemon=True,
    ).start()
    return {"job_id": job.id, "total": len(queries)}


@router.get("/jobs/{job_id}/status")
def job_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job no encontrado")
    return {
        "status": job.status,
        "total": job.total,
        "completed": job.completed,
        "failed_count": len(job.failed),
        "failed": job.failed,
        "error": job.error,
    }


@router.get("/jobs/{job_id}/file")
def job_file(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job no encontrado")
    if job.status != "done":
        raise HTTPException(status_code=425, detail="Job aun no terminado")
    if not job.zip_path:
        raise HTTPException(status_code=500, detail="Archivo no disponible")

    return FileResponse(
        path=job.zip_path,
        filename=job.zip_name or "downmusic.zip",
        media_type="application/zip",
        background=BackgroundTask(_finish_job, job_id),
    )


def _finish_job(job_id: str):
    job = get_job(job_id)
    if job and job.zip_path:
        _cleanup(job.zip_path)
    remove_job(job_id)
