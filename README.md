# DownMusic

DownMusic es una aplicación web de código abierto para explorar tus playlists de Spotify y compartir canciones rápidamente, sin necesidad de navegar manualmente por la app.

Nace de una necesidad simple: en reuniones o eventos, cuando alguien pregunta por una canción y quieres indicarle el nombre al instante para que la busque en YouTube u otra plataforma.

---

## Funcionalidades

- Inicio de sesión con cuenta de Spotify
- Visualización de todas tus playlists, incluyendo las canciones que te gustan
- Búsqueda de canciones dentro de cada playlist
- Copia rápida de Artista - Canción al portapapeles
- Apertura de canciones en la app de Spotify o en el navegador
- Búsqueda directa en YouTube con un clic

---

## Stack tecnológico

| Capa      | Tecnología                                   |
|-----------|----------------------------------------------|
| Frontend  | React, TypeScript, Vite, Tailwind CSS        |
| Backend   | FastAPI, Python                              |
| Auth      | Spotify OAuth 2.0                            |
| Base de datos | SQLite (migración a PostgreSQL disponible) |

---

## Instalación local

### Requisitos previos

- Python 3.11 o superior
- Node.js 18 o superior
- Aplicación registrada en [Spotify Developer Dashboard](https://developer.spotify.com) con la siguiente URI de redirección: `http://127.0.0.1:8000/auth/callback`

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

Abre `http://localhost:5173` en tu navegador e inicia sesión con Spotify.

---

## Roadmap

### v1.0 — MVP (actual)

- Inicio de sesión con Spotify
- Listado de playlists y canciones que te gustan
- Busqueda dentro de cada playlist
- Copiar Artista - Cancion al portapapeles
- Abrir cancion en la app de Spotify o en el navegador
- Busqueda directa en YouTube

### v1.1

- Buscador global entre todas las playlists
- Mejoras de rendimiento

### v1.2

- Contador de canciones visible desde la lista de playlists

### v2.0

- Historial de canciones copiadas
- Favoritos
- Compartir playlists
- Exportación de listas
- Soporte para Apple Music, YouTube Music y Deezer
- Instalación como PWA
- Caché offline
- Modo claro / oscuro

---

## Licencia

MIT — libre de usar, modificar y distribuir.
