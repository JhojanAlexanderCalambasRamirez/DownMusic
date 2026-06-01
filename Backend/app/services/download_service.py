import os
import tempfile
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Literal

import yt_dlp

AudioFormat = Literal["mp3", "mp4"]
MAX_PARALLEL = 4


def download_track(query: str, fmt: AudioFormat) -> tuple[str, str]:
    """
    Downloads the top YouTube result for `query`.
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


def download_tracks_zip(queries: list[str], fmt: AudioFormat) -> tuple[str, str]:
    """
    Downloads multiple tracks in parallel and zips them.
    Returns (zip_filepath, zip_filename).
    Caller is responsible for deleting the file.
    """
    zip_tmpdir = tempfile.mkdtemp()
    zip_path = os.path.join(zip_tmpdir, "downmusic.zip")

    def _download_one(query: str):
        try:
            return download_track(query, fmt)
        except Exception:
            return None

    results = []
    with ThreadPoolExecutor(max_workers=MAX_PARALLEL) as executor:
        futures = {executor.submit(_download_one, q): q for q in queries}
        for future in as_completed(futures):
            result = future.result()
            if result:
                results.append(result)

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for filepath, filename in results:
            zf.write(filepath, filename)
            try:
                os.remove(filepath)
                os.rmdir(os.path.dirname(filepath))
            except Exception:
                pass

    return zip_path, "downmusic.zip"
