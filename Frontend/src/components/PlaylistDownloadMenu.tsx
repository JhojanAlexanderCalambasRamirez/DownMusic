import { useState, useRef, useEffect } from 'react'
import { useTokenContext } from '../context/TokenContext'
import { useDownloadJob } from '../hooks/useDownloadJob'
import DownloadOverlay from './DownloadOverlay'
import DownloadResultModal from './DownloadResultModal'

interface Props {
  playlistId: string
  playlistName: string
  totalTracks?: number
}

export default function PlaylistDownloadMenu({ playlistId, playlistName, totalTracks = 0 }: Props) {
  const token = useTokenContext()
  const [open, setOpen] = useState(false)
  const { progress, runBatch, runPlaylist, reset } = useDownloadJob()
  const menuRef = useRef<HTMLDivElement>(null)
  const lastFormat = useRef<'mp3' | 'mp4'>('mp3')

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleDownload = (format: 'mp3' | 'mp4') => {
    setOpen(false)
    lastFormat.current = format
    runPlaylist(token, playlistId, format, `${playlistName}.zip`)
  }

  const handleRetry = () => {
    if (progress.failed.length === 0) return
    runBatch(token, progress.failed, lastFormat.current, `${playlistName} (reintento).zip`)
  }

  const isActive = progress.status === 'processing'

  return (
    <>
      <div
        className="relative"
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={isActive}
          title="Descargar playlist"
          className="rounded bg-blue-800 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isActive ? 'Descargando...' : 'Descargar'}
        </button>
        {open && (
          <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
            <p className="border-b border-gray-700 px-3 py-2 text-xs text-gray-400">Formato</p>
            <button
              onClick={() => handleDownload('mp3')}
              className="flex w-full px-3 py-2 text-sm text-white hover:bg-gray-700"
            >
              MP3 — Solo audio
            </button>
            <button
              onClick={() => handleDownload('mp4')}
              className="flex w-full px-3 py-2 text-sm text-white hover:bg-gray-700"
            >
              MP4 — Video
            </button>
          </div>
        )}
      </div>

      {progress.status === 'processing' && (
        <DownloadOverlay
          completed={progress.completed}
          total={progress.total || totalTracks}
          message={progress.total === 0 ? `Preparando descarga de "${playlistName}"...` : undefined}
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
