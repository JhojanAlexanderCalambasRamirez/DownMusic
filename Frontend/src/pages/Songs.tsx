import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTracks } from '../services/api'
import SongCard from '../components/SongCard'
import SearchBar from '../components/SearchBar'
import SelectionBar from '../components/SelectionBar'
import Footer from '../components/Footer'
import { useSelection } from '../hooks/useSelection'
import type { Track } from '../types'

interface Props {
  token: string
}

export default function Songs({ token }: Props) {
  const { playlistId } = useParams<{ playlistId: string }>()
  const navigate = useNavigate()
  const [tracks, setTracks] = useState<Track[]>([])
  const [total, setTotal] = useState<number>(0)
  const [query, setQuery] = useState('')
  const { selected, toggle, clear, selectAll } = useSelection()

  useEffect(() => {
    if (playlistId) {
      getTracks(token, playlistId).then((res) => {
        setTracks(res.data.tracks)
        setTotal(res.data.total)
      })
    }
  }, [token, playlistId])

  const filtered = tracks.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.artists.some((a) => a.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-950 p-6 pb-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">
            ← Volver
          </button>
          {total > 0 && (
            <span className="text-sm text-gray-400">{total} canciones</span>
          )}
        </div>
        <SearchBar value={query} onChange={setQuery} />
        <div className="mt-4 space-y-2">
          {filtered.map((t, i) => (
            <SongCard
              key={`${t.id}_${i}`}
              track={t}
              selected={selected.has(t.id)}
              onToggle={() => toggle(t.id)}
            />
          ))}
        </div>
        <Footer />
      </div>
      <SelectionBar
        selectedIds={selected}
        tracks={tracks}
        onClear={clear}
        onSelectAll={() => selectAll(tracks.map((t) => t.id))}
      />
    </div>
  )
}
