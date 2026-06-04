from typing import Any
import spotipy

LIKED_SONGS_ID = "__liked_songs__"
PAGE_SIZE = 50


def get_user_playlists(sp: spotipy.Spotify) -> list[dict[str, Any]]:
    try:
        saved = sp.current_user_saved_tracks(limit=1)
        liked_total = saved.get("total", 0)
    except Exception:
        liked_total = 0

    playlists = [{
        "id": LIKED_SONGS_ID,
        "name": "Me gusta",
        "total_tracks": liked_total,
        "image_url": None,
    }]

    results = sp.current_user_playlists(limit=50)
    while results:
        for item in results["items"]:
            if item:
                playlists.append({
                    "id": item["id"],
                    "name": item["name"],
                    "total_tracks": 0,
                    "image_url": item["images"][0]["url"] if item.get("images") else None,
                })
        results = sp.next(results) if results.get("next") else None
    return playlists


def get_playlist_tracks(
    sp: spotipy.Spotify,
    playlist_id: str,
    offset: int = 0,
    limit: int = PAGE_SIZE,
) -> dict[str, Any]:
    if playlist_id == LIKED_SONGS_ID:
        return _get_liked_songs(sp, offset, limit)
    return _get_playlist_page(sp, playlist_id, offset, limit)


def _get_playlist_page(
    sp: spotipy.Spotify,
    playlist_id: str,
    offset: int,
    limit: int,
) -> dict[str, Any]:
    results = sp.playlist_items(playlist_id, limit=limit, offset=offset)
    total = results.get("total", 0)
    tracks = []
    for entry in results.get("items", []):
        if entry.get("is_local"):
            continue
        track = entry.get("item") or entry.get("track")
        if not track or track.get("type") == "episode":
            continue
        tracks.append({
            "id": track["id"],
            "name": track["name"],
            "artists": [a["name"] for a in track["artists"]],
            "spotify_url": track["external_urls"].get("spotify"),
        })
    return {"tracks": tracks, "total": total, "offset": offset, "limit": limit}


def _get_liked_songs(
    sp: spotipy.Spotify,
    offset: int,
    limit: int,
) -> dict[str, Any]:
    results = sp.current_user_saved_tracks(limit=limit, offset=offset)
    total = results.get("total", 0)
    tracks = []
    for entry in results.get("items", []):
        track = entry.get("track")
        if not track or track.get("is_local"):
            continue
        tracks.append({
            "id": track["id"],
            "name": track["name"],
            "artists": [a["name"] for a in track["artists"]],
            "spotify_url": track["external_urls"].get("spotify"),
        })
    return {"tracks": tracks, "total": total, "offset": offset, "limit": limit}


def get_all_playlist_tracks(sp: spotipy.Spotify, playlist_id: str) -> dict[str, Any]:
    """Fetches ALL tracks — used only for batch downloads."""
    if playlist_id == LIKED_SONGS_ID:
        return _get_all_liked_songs(sp)
    return _get_all_playlist_tracks(sp, playlist_id)


def _get_all_playlist_tracks(sp: spotipy.Spotify, playlist_id: str) -> dict[str, Any]:
    results = sp.playlist_items(playlist_id, limit=100)
    total = results.get("total", 0)
    tracks = []
    while results:
        for entry in results.get("items", []):
            if entry.get("is_local"):
                continue
            track = entry.get("item") or entry.get("track")
            if not track or track.get("type") == "episode":
                continue
            tracks.append({
                "id": track["id"],
                "name": track["name"],
                "artists": [a["name"] for a in track["artists"]],
                "spotify_url": track["external_urls"].get("spotify"),
            })
        results = sp.next(results) if results.get("next") else None
    return {"tracks": tracks, "total": total}


def _get_all_liked_songs(sp: spotipy.Spotify) -> dict[str, Any]:
    results = sp.current_user_saved_tracks(limit=50)
    total = results.get("total", 0)
    tracks = []
    while results:
        for entry in results.get("items", []):
            track = entry.get("track")
            if not track or track.get("is_local"):
                continue
            tracks.append({
                "id": track["id"],
                "name": track["name"],
                "artists": [a["name"] for a in track["artists"]],
                "spotify_url": track["external_urls"].get("spotify"),
            })
        results = sp.next(results) if results.get("next") else None
    return {"tracks": tracks, "total": total}
