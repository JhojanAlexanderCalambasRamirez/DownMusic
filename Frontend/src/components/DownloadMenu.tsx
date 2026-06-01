import { useState, useRef, useEffect } from 'react'
import { downloadTrack } from '../services/api'
import { useTokenContext } from '../context/TokenContext'

interface Props {
  query: string
}

export default function DownloadMenu({ query }: Props) {
  const token = useTokenContext()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<'mp3' | 'mp4' | null>(null)
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

  const handleDownload = async (format: 'mp3' | 'mp4') => {
    setOpen(false)
    setLoading(format)
    try {
      const res = await downloadTrack(token, query, format)
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${query}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert('No se pudo descargar la cancion. Intenta de nuevo.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading !== null}
        className="rounded bg-blue-700 px-2 py-1 text-xs text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? `${loading.toUpperCase()}...` : 'Descargar'}
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-gray-700 bg-gray-800 shadow-lg">
          <p className="border-b border-gray-700 px-3 py-2 text-xs text-gray-400">
            Formato
          </p>
          <button
            onClick={() => handleDownload('mp3')}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white hover:bg-gray-700"
          >
            MP3 — Solo audio
          </button>
          <button
            onClick={() => handleDownload('mp4')}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white hover:bg-gray-700"
          >
            MP4 — Video
          </button>
        </div>
      )}
    </div>
  )
}
