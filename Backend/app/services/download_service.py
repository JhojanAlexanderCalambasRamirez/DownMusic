import os
import tempfile
import time
import zipfile
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Literal

import yt_dlp

AudioFormat = Literal["mp3", "mp4"]
MAX_PARALLEL = 4

# Reconnection handling: yt-dlp's own `retries`/`socket_timeout` absorb short
# network blips during a download; this outer loop additionally re-runs the
# whole attempt when the connection drops entirely (e.g. wifi cut), so a track
# isn't given up on just because the network came back a few seconds later.
NETWORK_ERROR_HINTS = (
    "timed out", "timeout", "connection", "network",
    "temporary failure in name resolution", "name or service not known",
    "reset by peer", "unreachable", "no route to host", "ssl",
)
MAX_NETWORK_RETRIES = 5
RETRY_BASE_DELAY = 3  # seconds, doubles each attempt (capped)


def _is_network_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    return any(hint in msg for hint in NETWORK_ERROR_HINTS)


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
        # Absorb short network blips mid-download before we even get to the outer retry loop
        "retries": 10,
        "fragment_retries": 10,
        "socket_timeout": 30,
        # yt-dlp needs a JS runtime to solve YouTube's signature/n challenges,
        # otherwise only broken/image-only formats are returned (requires yt-dlp-ejs + Node.js >= 20)
        "js_runtimes": {"node": {}},
    }

    # YouTube's "Sign in to confirm you're not a bot" requires authenticated cookies.
    # Local dev: reuse cookies from an installed browser (YTDLP_COOKIES_FROM_BROWSER=chrome).
    # Production: ship a cookies.txt file and point YTDLP_COOKIES_FILE at it.
    cookies_browser = os.environ.get("YTDLP_COOKIES_FROM_BROWSER")
    cookies_file = os.environ.get("YTDLP_COOKIES_FILE")
    if cookies_browser:
        common_opts["cookiesfrombrowser"] = (cookies_browser,)
    elif cookies_file and os.path.isfile(cookies_file):
        common_opts["cookiefile"] = cookies_file

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

    for attempt in range(1, MAX_NETWORK_RETRIES + 1):
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([query])
            break
        except Exception as e:
            if attempt == MAX_NETWORK_RETRIES or not _is_network_error(e):
                raise
            time.sleep(min(RETRY_BASE_DELAY * 2 ** (attempt - 1), 60))

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
