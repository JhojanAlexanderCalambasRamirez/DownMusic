import { useState, useRef } from 'react'
import { startBatchJob, startPlaylistJob, pollJobStatus, downloadJobFile } from '../services/api'

export interface JobProgress {
  status: 'idle' | 'processing' | 'done' | 'error'
  completed: number
  total: number
  failedCount: number
  failed: string[]
  error: string | null
}

const IDLE: JobProgress = {
  status: 'idle',
  completed: 0,
  total: 0,
  failedCount: 0,
  failed: [],
  error: null,
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

export function useDownloadJob() {
  const [progress, setProgress] = useState<JobProgress>(IDLE)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const poll = (jobId: string, filename: string) => {
    intervalRef.current = setInterval(async () => {
      try {
        const res = await pollJobStatus(jobId)
        const d = res.data
        setProgress((prev) => ({
          ...prev,
          completed: d.completed,
          total: d.total,
          failedCount: d.failed_count,
          failed: d.failed,
        }))

        if (d.status === 'done') {
          stopPolling()
          setProgress((prev) => ({ ...prev, status: 'done' }))
          const fileRes = await downloadJobFile(jobId)
          triggerBlobDownload(fileRes.data, filename)
        } else if (d.status === 'error') {
          stopPolling()
          setProgress((prev) => ({ ...prev, status: 'error', error: d.error }))
        }
      } catch {
        stopPolling()
        setProgress((prev) => ({ ...prev, status: 'error', error: 'Error de red al verificar estado.' }))
      }
    }, 2000)
  }

  const runBatch = async (token: string, queries: string[], format: 'mp3' | 'mp4', filename: string) => {
    setProgress({ ...IDLE, status: 'processing', total: queries.length })
    try {
      const res = await startBatchJob(token, queries, format)
      poll(res.data.job_id, filename)
    } catch {
      setProgress({ ...IDLE, status: 'error', error: 'No se pudo iniciar la descarga.' })
    }
  }

  const runPlaylist = async (token: string, playlistId: string, format: 'mp3' | 'mp4', filename: string) => {
    setProgress({ ...IDLE, status: 'processing' })
    try {
      const res = await startPlaylistJob(token, playlistId, format)
      setProgress((prev) => ({ ...prev, total: res.data.total }))
      poll(res.data.job_id, filename)
    } catch {
      setProgress({ ...IDLE, status: 'error', error: 'No se pudo iniciar la descarga de la playlist.' })
    }
  }

  const reset = () => {
    stopPolling()
    setProgress(IDLE)
  }

  return { progress, runBatch, runPlaylist, reset }
}
