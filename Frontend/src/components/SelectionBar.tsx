import { useRef } from 'react'
import { useTokenContext } from '../context/TokenContext'
import { useDownloadJob } from '../hooks/useDownloadJob'
import { buildSearchQuery } from '../utils/search'
import DownloadOverlay from './DownloadOverlay'
import DownloadResultModal from './DownloadResultModal'
import type { Track } from '../types'

interface Props {
  selectedIds: Set<string>
  tracks: Track[]
  total: number
  playlistId: string
  allPlaylistSelected: boolean
  onClear: () => void
  onSelectLoaded: () => void
  onSelectAll: () => void
}

export default function SelectionBar({
  selectedIds,
  tracks,
  total,
  playlistId,
  allPlaylistSelected,
  onClear,
  onSelectLoaded,
  onSelectAll,
}: Props) {
  const token = useTokenContext()
  const { progress, runBatch, runPlaylist, reset } = useDownloadJob()
  const isActive = progress.status === 'processing'
  const lastFormat = useRef<'mp3' | 'mp4'>('mp3')

  const selectedTracks = tracks.filter((t) => selectedIds.has(t.id))
  const queries = selectedTracks.map(buildSearchQuery)

  const handleDownload = (format: 'mp3' | 'mp4') => {
    lastFormat.current = format
    if (allPlaylistSelected) {
      runPlaylist(token, playlistId, format, 'playlist.zip')
    } else {
      runBatch(token, queries, format, 'seleccion.zip')
    }
  }

  const handleRetry = () => {
    if (progress.failed.length === 0) return
    runBatch(token, progress.failed, lastFormat.current, 'reintento.zip')
  }

  const countLabel = allPlaylistSelected
    ? `Toda la playlist (${total} canciones)`
    : `${selectedIds.size} ${selectedIds.size === 1 ? 'cancion' : 'canciones'} seleccionadas`

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-700 bg-gray-900 px-4 py-3">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-white">{countLabel}</span>
            <button
              onClick={onSelectLoaded}
              className="text-xs text-gray-400 hover:text-white"
            >
              Solo cargadas ({tracks.length})
            </button>
            <button
              onClick={onSelectAll}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Toda la playlist ({total})
            </button>
            <button onClick={onClear} className="text-xs text-gray-400 hover:text-white">
              Limpiar
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleDownload('mp3')}
              disabled={isActive}
              className="rounded bg-blue-700 px-3 py-1.5 text-xs text-white hover:bg-blue-600 disabled:opacity-50"
            >
              Descargar MP3
            </button>
            <button
              onClick={() => handleDownload('mp4')}
              disabled={isActive}
              className="rounded bg-blue-700 px-3 py-1.5 text-xs text-white hover:bg-blue-600 disabled:opacity-50"
            >
              Descargar MP4
            </button>
          </div>
        </div>
      </div>

      {progress.status === 'processing' && (
        <DownloadOverlay
          completed={progress.completed}
          total={progress.total}
          message={
            progress.total === 0
              ? allPlaylistSelected
                ? 'Preparando descarga de toda la playlist...'
                : 'Preparando descarga...'
              : undefined
          }
        />
      )}

      {(progress.status === 'done' || progress.status === 'error') && (
        <DownloadResultModal
          result={{
            failed: progress.status === 'error'
              ? [progress.error ?? 'Error desconocido']
              : progress.failed,
            total: progress.total,
            succeeded: progress.completed,
          }}
          onClose={reset}
          onRetry={progress.status === 'done' && progress.failed.length > 0 ? handleRetry : undefined}
        />
      )}
    </>
  )
}
