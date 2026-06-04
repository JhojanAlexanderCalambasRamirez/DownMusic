import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPlaylists } from '../services/api'
import PlaylistCard from '../components/PlaylistCard'
import AppHeader from '../components/AppHeader'
import Footer from '../components/Footer'
import { useSpotifyUser } from '../hooks/useSpotifyUser'
import type { Playlist } from '../types'

interface Props {
  token: string
  onLogout: () => void
}

export default function Playlists({ token, onLogout }: Props) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const navigate = useNavigate()
  const user = useSpotifyUser(token)

  useEffect(() => {
    getPlaylists(token).then((res) => setPlaylists(res.data))
  }, [token])

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mx-auto max-w-2xl">
        <AppHeader user={user} onLogout={onLogout} />
        <main>
          <h2 className="mb-4 text-lg font-semibold text-white">Mis Playlists</h2>
          <div className="space-y-2">
            {playlists.map((p) => (
              <PlaylistCard
                key={p.id}
                playlist={p}
                onClick={() => navigate(`/playlist/${p.id}`)}
              />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
