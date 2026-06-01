from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, playlists, songs
from app.database.db import init_db

app = FastAPI(title="DownMusic API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    init_db()


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(playlists.router, prefix="/playlists", tags=["playlists"])
app.include_router(songs.router, prefix="/songs", tags=["songs"])
