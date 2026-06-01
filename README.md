# DownMusic

DownMusic es una aplicación web de código abierto para explorar tus playlists de Spotify y gestionar canciones de forma rápida, sin necesidad de navegar manualmente por la app.

Nace de una necesidad simple: en reuniones o eventos, cuando alguien pregunta por una canción y quieres indicarle el nombre al instante para que la busque en YouTube u otra plataforma.

---

## Funcionalidades

- Inicio de sesión con cuenta de Spotify y renovacion automatica del token
- Visualizacion del perfil del usuario (nombre y foto)
- Listado de todas las playlists, incluyendo canciones que te gustan
- Busqueda de canciones dentro de cada playlist por nombre o artista
- Copia rapida de "Artista - Cancion" al portapapeles
- Apertura de canciones en la app de Spotify o en el navegador web
- Busqueda directa en YouTube con un clic
- Descarga de canciones individuales en MP3 o MP4
- Seleccion multiple de canciones y descarga en lote como ZIP
- Descarga de una playlist completa en MP3 o MP4 como ZIP
- Informacion de la aplicacion accesible desde un modal en la cabecera

---

## Stack tecnologico

| Capa          | Tecnologia                                        |
|---------------|---------------------------------------------------|
| Frontend      | React, TypeScript, Vite, Tailwind CSS             |
| Backend       | FastAPI, Python                                   |
| Auth          | Spotify OAuth 2.0 con refresh token automatico   |
| Descarga      | yt-dlp + ffmpeg                                   |
| Base de datos | SQLite (migracion a PostgreSQL disponible)        |

---

## Requisitos del sistema

- Python 3.11 o superior
- Node.js 18 o superior
- ffmpeg instalado en el sistema (`brew install ffmpeg` en macOS)
- Aplicacion registrada en [Spotify Developer Dashboard](https://developer.spotify.com) con URI de redireccion: `http://127.0.0.1:8000/auth/callback`

---

## Instalacion local

### Backend

```bash
cd Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Completa SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET en el archivo .env

uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Abre `http://localhost:5173` en tu navegador e inicia sesion con Spotify.

---

## Roadmap

### v1.0 — MVP (completado)

- [x] Inicio de sesion con Spotify
- [x] Renovacion automatica del token
- [x] Listado de playlists y canciones que te gustan
- [x] Busqueda dentro de cada playlist
- [x] Copiar Artista - Cancion al portapapeles
- [x] Abrir cancion en la app de Spotify o en el navegador
- [x] Busqueda directa en YouTube

### v1.1 — Descargas (completado)

- [x] Descarga individual de canciones en MP3 o MP4
- [x] Seleccion multiple y descarga en lote como ZIP
- [x] Descarga de playlist completa como ZIP
- [x] Perfil del usuario con foto y nombre
- [x] Modal informativo sobre la aplicacion
- [x] Footer con informacion de contacto

### v1.2

- [ ] Buscador global entre todas las playlists
- [ ] Contador de canciones visible desde la lista de playlists
- [ ] Mejoras de rendimiento en descargas

### v2.0

- [ ] Historial de canciones copiadas
- [ ] Favoritos
- [ ] Compartir playlists
- [ ] Exportacion de listas
- [ ] Soporte para Apple Music, YouTube Music y Deezer
- [ ] Instalacion como PWA
- [ ] Cache offline
- [ ] Modo claro / oscuro

---

## Autor

Desarrollado por J4CR — [LinkedIn](https://www.linkedin.com/in/j4cr/) — [GitHub](https://github.com/JhojanAlexanderCalambasRamirez)

---

## Licencia

MIT — libre de usar, modificar y distribuir.
