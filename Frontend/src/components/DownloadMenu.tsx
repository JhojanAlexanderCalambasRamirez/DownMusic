import { useState, useRef, useEffect } from 'react'
import { downloadTrackSingle } from '../services/api'
import { useTokenContext } from '../context/TokenContext'
import { useDownload } from '../hooks/useDownload'
import DownloadResultModal from './DownloadResultModal'
import DownloadOverlay from './DownloadOverlay'

interface Props {
  query: string
}

export default function DownloadMenu({ query }: Props) {
  const token = useTokenContext()
  const [open, setOpen] = useState(false)
  const { loading, result, run, clear } = useDownload()
  const menuRef = useRef<HTMLDivElement>(null)

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
    run(
      () => downloadTrackSingle(token, query, format),
      `${query}.${format}`,
      1
    )
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={loading}
          className="rounded bg-blue-700 px-2 py-1 text-xs text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? `...` : 'Descargar'}
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

      {loading && <DownloadOverlay completed={0} total={0} message={`Descargando "${query}"...`} />}
      {result && result.failed.length > 0 && (
        <DownloadResultModal result={result} onClose={clear} />
      )}
    </>
  )
}
