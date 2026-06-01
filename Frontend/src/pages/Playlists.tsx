import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlaylists } from '../services/api'
import PlaylistCard from '../components/PlaylistCard'
import type { Playlist } from '../types'

interface Props {
  token: string
  onLogout: () => void
}

export default function Playlists({ token, onLogout }: Props) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    getPlaylists(token).then((res) => setPlaylists(res.data))
  }, [token])

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Mis Playlists</h1>
          <button onClick={onLogout} className="text-sm text-gray-400 hover:text-white">
            Cerrar sesión
          </button>
        </div>
        <div className="space-y-2">
          {playlists.map((p) => (
            <PlaylistCard
              key={p.id}
              playlist={p}
              onClick={() => navigate(`/playlist/${p.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
