import os
import tempfile
from pathlib import Path
from typing import Literal

import yt_dlp

AudioFormat = Literal["mp3", "mp4"]


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

    path = str(files[0])
    return path, files[0].name
