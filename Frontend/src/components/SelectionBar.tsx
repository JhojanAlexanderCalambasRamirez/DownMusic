import { useTokenContext } from '../context/TokenContext'
import { useDownloadJob } from '../hooks/useDownloadJob'
import DownloadOverlay from './DownloadOverlay'
import DownloadResultModal from './DownloadResultModal'
import type { Track } from '../types'

interface Props {
  selectedIds: Set<string>
  tracks: Track[]
  onClear: () => void
  onSelectAll: () => void
}

export default function SelectionBar({ selectedIds, tracks, onClear, onSelectAll }: Props) {
  const token = useTokenContext()
  const { progress, runBatch, reset } = useDownloadJob()

  if (selectedIds.size === 0 && progress.status === 'idle') return null

  const selectedTracks = tracks.filter((t) => selectedIds.has(t.id))
  const queries = selectedTracks.map((t) => `${t.artists[0]} ${t.name}`)
  const isActive = progress.status === 'processing' || progress.status === 'done' || progress.status === 'error'

  const handleDownload = (format: 'mp3' | 'mp4') =>
    runBatch(token, queries, format, 'seleccion.zip')

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-700 bg-gray-900 px-6 py-3">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-white">
                {selectedIds.size} {selectedIds.size === 1 ? 'cancion' : 'canciones'} seleccionadas
              </span>
              {selectedIds.size > 200 && (
                <span className="text-xs text-yellow-400">
                  (puede tardar varios minutos)
                </span>
              )}
              <button onClick={onSelectAll} className="text-xs text-gray-400 hover:text-white">
                Seleccionar todas
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
      )}

      {progress.status === 'processing' && (
        <DownloadOverlay completed={progress.completed} total={progress.total} />
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
        />
      )}
    </>
  )
}
