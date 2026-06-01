from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from app.auth.oauth import get_spotify_oauth

router = APIRouter()


@router.get("/login")
def login():
    oauth = get_spotify_oauth()
    return RedirectResponse(oauth.get_authorize_url())


@router.get("/callback")
def callback(code: str):
    oauth = get_spotify_oauth()
    try:
        token_info = oauth.get_access_token(code)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid authorization code")

    access_token = token_info["access_token"]
    refresh_token = token_info.get("refresh_token", "")
    frontend_url = (
        f"http://localhost:5173/callback"
        f"?access_token={access_token}"
        f"&refresh_token={refresh_token}"
    )
    return RedirectResponse(frontend_url)


@router.get("/refresh")
def refresh(refresh_token: str):
    oauth = get_spotify_oauth()
    try:
        token_info = oauth.refresh_access_token(refresh_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Refresh token invalid or expired")
    return {"access_token": token_info["access_token"]}
