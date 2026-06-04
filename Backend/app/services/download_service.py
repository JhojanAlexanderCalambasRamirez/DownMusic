import os
import tempfile
import zipfile
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Literal

import yt_dlp

AudioFormat = Literal["mp3", "mp4"]
MAX_PARALLEL = 4


def download_track(query: str, fmt: AudioFormat) -> tuple[str, str]:
    """
    Downloads top YouTube result for `query`.
    Returns (absolute_filepath, filename).
    Caller is responsible for deleting the file.
    """
    tmpdir = tempfile.mkdtemp()

    common_opts = {
        "outtmpl": os.path.join(tmpdir, "%(title)s.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
        "default_search": "ytsearch1",
    }

    if fmt == "mp3":
        ydl_opts = {
            **common_opts,
            "format": "bestaudio/best",
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }],
        }
    else:
        ydl_opts = {
            **common_opts,
            "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "merge_output_format": "mp4",
        }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([query])

    files = list(Path(tmpdir).iterdir())
    if not files:
        raise FileNotFoundError("yt-dlp did not produce a file")

    return str(files[0]), files[0].name


def download_tracks_zip(
    queries: list[str],
    fmt: AudioFormat,
    on_progress: Callable[[int, list[str]], None] | None = None,
) -> tuple[str, str, list[str]]:
    """
    Downloads multiple tracks in parallel and zips them.
    Calls on_progress(completed_count, failed_list) after each track.
    Returns (zip_filepath, zip_filename, failed_queries).
    """
    zip_tmpdir = tempfile.mkdtemp()
    zip_path = os.path.join(zip_tmpdir, "downmusic.zip")

    results: list[tuple[str, str]] = []
    failed: list[str] = []
    completed = 0

    def _download_one(query: str) -> tuple[str, str] | None:
        try:
            return download_track(query, fmt)
        except Exception:
            return None

    with ThreadPoolExecutor(max_workers=MAX_PARALLEL) as executor:
        future_to_query = {executor.submit(_download_one, q): q for q in queries}
        for future in as_completed(future_to_query):
            query = future_to_query[future]
            result = future.result()
            completed += 1
            if result:
                results.append(result)
            else:
                failed.append(query)
            if on_progress:
                on_progress(completed, failed[:])

    seen: dict[str, int] = {}
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for filepath, filename in results:
            name, ext = os.path.splitext(filename)
            if filename in seen:
                seen[filename] += 1
                filename = f"{name} ({seen[filename]}){ext}"
            else:
                seen[filename] = 0

            zf.write(filepath, filename)
            try:
                os.remove(filepath)
                os.rmdir(os.path.dirname(filepath))
            except Exception:
                pass

        if failed:
            zf.writestr("_canciones_fallidas.txt", "\n".join(failed))

    return zip_path, "downmusic.zip", failed
