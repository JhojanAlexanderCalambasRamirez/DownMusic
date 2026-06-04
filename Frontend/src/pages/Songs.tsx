import { useEffect, useState, useCallback } from 'react'
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

const PAGE = 50

export default function Songs({ token }: Props) {
  const { playlistId } = useParams<{ playlistId: string }>()
  const navigate = useNavigate()
  const [tracks, setTracks] = useState<Track[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [allPlaylistSelected, setAllPlaylistSelected] = useState(false)
  const { selected, toggle, clear, selectAll } = useSelection()

  const loadPage = useCallback(async (off: number) => {
    if (!playlistId) return
    setLoading(true)
    try {
      const res = await getTracks(token, playlistId, off, PAGE)
      setTotal(res.data.total)
      setTracks((prev) => off === 0 ? res.data.tracks : [...prev, ...res.data.tracks])
      setOffset(off + res.data.tracks.length)
    } finally {
      setLoading(false)
    }
  }, [token, playlistId])

  useEffect(() => {
    setTracks([])
    setOffset(0)
    setAllPlaylistSelected(false)
    clear()
    loadPage(0)
  }, [token, playlistId])

  const handleToggle = (id: string) => {
    setAllPlaylistSelected(false)
    toggle(id)
  }

  const handleSelectLoaded = () => {
    setAllPlaylistSelected(false)
    selectAll(tracks.map((t) => t.id))
  }

  const handleSelectAll = () => {
    setAllPlaylistSelected(true)
    selectAll(tracks.map((t) => t.id))
  }

  const handleClear = () => {
    setAllPlaylistSelected(false)
    clear()
  }

  const filtered = tracks.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.artists.some((a) => a.toLowerCase().includes(query.toLowerCase()))
  )

  const hasMore = offset < total
  const showSelection = selected.size > 0 || allPlaylistSelected

  return (
    <div className="min-h-screen bg-gray-950 p-6 pb-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">
            ← Volver
          </button>
          {total > 0 && (
            <span className="text-sm text-gray-400">
              {tracks.length} de {total} canciones
            </span>
          )}
        </div>
        <SearchBar value={query} onChange={setQuery} />
        <main>
          <div className="mt-4 space-y-2">
            {filtered.map((t, i) => (
              <SongCard
                key={`${t.id}_${i}`}
                track={t}
                selected={allPlaylistSelected || selected.has(t.id)}
                onToggle={() => handleToggle(t.id)}
              />
            ))}
          </div>
          {hasMore && !query && (
            <button
              onClick={() => loadPage(offset)}
              disabled={loading}
              className="mt-4 w-full rounded-lg border border-gray-700 py-3 text-sm text-gray-400 hover:border-gray-500 hover:text-white disabled:opacity-50"
            >
              {loading ? 'Cargando...' : `Cargar mas (${total - offset} restantes)`}
            </button>
          )}
        </main>
        <Footer />
      </div>

      {showSelection && (
        <SelectionBar
          selectedIds={selected}
          tracks={tracks}
          total={total}
          playlistId={playlistId ?? ''}
          allPlaylistSelected={allPlaylistSelected}
          onClear={handleClear}
          onSelectLoaded={handleSelectLoaded}
          onSelectAll={handleSelectAll}
        />
      )}
    </div>
  )
}
