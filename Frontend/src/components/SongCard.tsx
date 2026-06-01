import { useState, useRef, useEffect } from 'react'
import type { Track } from '../types'
import DownloadMenu from './DownloadMenu'

interface Props {
  track: Track
}

function buildYouTubeUrl(track: Track) {
  const q = encodeURIComponent(`${track.artists[0]} ${track.name}`)
  return `https://www.youtube.com/results?search_query=${q}`
}

export default function SongCard({ track }: Props) {
  const artistLine = track.artists.join(', ')
  const fullLabel = `${artistLine} - ${track.name}`
  const [showSpotifyMenu, setShowSpotifyMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const copy = (text: string) => navigator.clipboard.writeText(text)

  useEffect(() => {
    if (!showSpotifyMenu) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSpotifyMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showSpotifyMenu])

  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-900 px-4 py-3">
      <div className="min-w-0 flex-1 pr-4">
        <p className="truncate font-medium text-white">{track.name}</p>
        <p className="truncate text-sm text-gray-400">{artistLine}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => copy(fullLabel)}
          title="Copiar artista - canción"
          className="rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600"
        >
          Copiar
        </button>
        <a
          href={buildYouTubeUrl(track)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-red-700 px-2 py-1 text-xs text-white hover:bg-red-600"
        >
          YT
        </a>
        <DownloadMenu query={fullLabel} />
        {track.spotify_url && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowSpotifyMenu((v) => !v)}
              className="rounded bg-green-700 px-2 py-1 text-xs text-white hover:bg-green-600"
            >
              Spotify
            </button>
            {showSpotifyMenu && (
              <div className="absolute right-0 top-8 z-10 w-44 rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
                <p className="border-b border-gray-700 px-3 py-2 text-xs text-gray-400">
                  ¿Dónde abrir?
                </p>
                <a
                  href={`spotify:track:${track.id}`}
                  onClick={() => setShowSpotifyMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-gray-700"
                >
                  <span></span> App Spotify
                </a>
                <a
                  href={track.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowSpotifyMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-gray-700"
                >
                  <span></span> Web Spotify
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
