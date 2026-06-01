import { useState } from 'react'
import { downloadBatch } from '../services/api'
import { useTokenContext } from '../context/TokenContext'
import type { Track } from '../types'

interface Props {
  selectedIds: Set<string>
  tracks: Track[]
  onClear: () => void
  onSelectAll: () => void
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function SelectionBar({ selectedIds, tracks, onClear, onSelectAll }: Props) {
  const token = useTokenContext()
  const [loading, setLoading] = useState<'mp3' | 'mp4' | null>(null)

  if (selectedIds.size === 0) return null

  const selectedTracks = tracks.filter((t) => selectedIds.has(t.id))
  const queries = selectedTracks.map((t) => `${t.artists[0]} ${t.name}`)

  const handleDownload = async (format: 'mp3' | 'mp4') => {
    setLoading(format)
    try {
      const res = await downloadBatch(token, queries, format)
      triggerBlobDownload(res.data, `seleccion.zip`)
    } catch {
      alert('Error al descargar. Intenta de nuevo.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-700 bg-gray-900 px-6 py-3">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white">
            {selectedIds.size} {selectedIds.size === 1 ? 'cancion' : 'canciones'} seleccionadas
          </span>
          <button
            onClick={onSelectAll}
            className="text-xs text-gray-400 hover:text-white"
          >
            Seleccionar todas
          </button>
          <button onClick={onClear} className="text-xs text-gray-400 hover:text-white">
            Limpiar
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleDownload('mp3')}
            disabled={loading !== null}
            className="rounded bg-blue-700 px-3 py-1.5 text-xs text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading === 'mp3' ? 'Descargando...' : 'Descargar MP3'}
          </button>
          <button
            onClick={() => handleDownload('mp4')}
            disabled={loading !== null}
            className="rounded bg-blue-700 px-3 py-1.5 text-xs text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading === 'mp4' ? 'Descargando...' : 'Descargar MP4'}
          </button>
        </div>
      </div>
    </div>
  )
}
