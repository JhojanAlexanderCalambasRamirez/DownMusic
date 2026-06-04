from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, playlists, songs, download
from app.database.db import init_db

app = FastAPI(title="DownMusic API", version="1.0.0")

_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173")
origins = [o.strip() for o in _origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(playlists.router, prefix="/playlists", tags=["playlists"])
app.include_router(songs.router, prefix="/songs", tags=["songs"])
app.include_router(download.router, prefix="/download", tags=["download"])
