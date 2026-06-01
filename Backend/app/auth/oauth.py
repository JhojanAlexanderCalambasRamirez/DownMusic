import os
import spotipy
from spotipy.oauth2 import SpotifyOAuth

SPOTIFY_SCOPES = " ".join([
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-library-read",
])


def get_spotify_oauth() -> SpotifyOAuth:
    return SpotifyOAuth(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
        redirect_uri=os.getenv("SPOTIFY_REDIRECT_URI"),
        scope=SPOTIFY_SCOPES,
    )


def get_spotify_client(access_token: str) -> spotipy.Spotify:
    return spotipy.Spotify(auth=access_token)
