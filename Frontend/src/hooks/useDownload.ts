import { useState } from 'react'
import type { AxiosResponse, AxiosError } from 'axios'

export interface DownloadResult {
  failed: string[]
  total: number
  succeeded: number
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

function parseFailedHeader(res: AxiosResponse): string[] {
  try {
    const raw = res.headers['x-failed-tracks']
    if (!raw) return []
    return JSON.parse(decodeURIComponent(raw))
  } catch {
    return []
  }
}

function errorMessage(err: unknown): string {
  const e = err as AxiosError
  if (e.code === 'ECONNABORTED') return 'Tiempo agotado. Playlist muy grande — usa el boton Descargar de la playlist en vez de seleccion.'
  if (e.response?.status === 400) return 'Demasiadas canciones seleccionadas (max 500). Usa el boton Descargar de la playlist para descargarla completa.'
  if (e.response?.status === 401) return 'Token expirado. Recarga la pagina e inicia sesion de nuevo.'
  if (e.response?.status === 500) return 'Error en el servidor al descargar.'
  return 'Error de red. Verifica que el backend este corriendo.'
}

export function useDownload() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DownloadResult | null>(null)

  const run = async (
    apiFn: () => Promise<AxiosResponse>,
    filename: string,
    total: number
  ) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await apiFn()
      triggerBlobDownload(res.data, filename)
      const failed = parseFailedHeader(res)
      setResult({ failed, total, succeeded: total - failed.length })
    } catch (err) {
      setResult({ failed: [errorMessage(err)], total, succeeded: 0 })
    } finally {
      setLoading(false)
    }
  }

  const clear = () => setResult(null)

  return { loading, result, run, clear }
}
