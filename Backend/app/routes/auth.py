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

    import os
    access_token = token_info["access_token"]
    refresh_token = token_info.get("refresh_token", "")
    base = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return RedirectResponse(
        f"{base}/callback?access_token={access_token}&refresh_token={refresh_token}"
    )


@router.get("/me")
def me(access_token: str):
    from app.auth.oauth import get_spotify_client
    sp = get_spotify_client(access_token)
    try:
        user = sp.current_user()
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    images = user.get("images") or []
    return {
        "spotify_id": user["id"],
        "display_name": user.get("display_name"),
        "profile_image": images[0]["url"] if images else None,
    }


@router.get("/refresh")
def refresh(refresh_token: str):
    oauth = get_spotify_oauth()
    try:
        token_info = oauth.refresh_access_token(refresh_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Refresh token invalid or expired")
    return {"access_token": token_info["access_token"]}
