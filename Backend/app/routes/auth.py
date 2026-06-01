from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from app.auth.oauth import get_spotify_oauth

router = APIRouter()


@router.get("/login")
def login():
    oauth = get_spotify_oauth()
    auth_url = oauth.get_authorize_url()
    return RedirectResponse(auth_url)


@router.get("/callback")
def callback(code: str):
    oauth = get_spotify_oauth()
    try:
        token_info = oauth.get_access_token(code)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid authorization code")
    # Redirect frontend with token in query param (swap for httpOnly cookie in prod)
    frontend_url = f"http://localhost:5173/callback?access_token={token_info['access_token']}"
    return RedirectResponse(frontend_url)


@router.get("/me")
def me(access_token: str):
    from app.auth.oauth import get_spotify_client
    sp = get_spotify_client(access_token)
    try:
        user = sp.current_user()
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"spotify_id": user["id"], "display_name": user.get("display_name")}
