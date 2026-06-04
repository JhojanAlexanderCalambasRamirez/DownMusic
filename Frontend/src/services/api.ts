import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL ?? '/api'
const api = axios.create({ baseURL: BASE })

const withToken = (token: string) => ({ params: { access_token: token } })

// Auto-refresh interceptor
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status
    if (status !== 401) return Promise.reject(error)

    const refreshToken = localStorage.getItem('spotify_refresh_token')
    if (!refreshToken) {
      localStorage.removeItem('spotify_token')
      window.location.href = '/'
      return Promise.reject(error)
    }

    try {
      const res = await axios.get('/api/auth/refresh', {
        params: { refresh_token: refreshToken },
      })
      const newToken = res.data.access_token
      localStorage.setItem('spotify_token', newToken)

      // Retry original request with new token
      error.config.params = { ...error.config.params, access_token: newToken }
      return api.request(error.config)
    } catch {
      localStorage.removeItem('spotify_token')
      localStorage.removeItem('spotify_refresh_token')
      window.location.href = '/'
      return Promise.reject(error)
    }
  }
)

export const getPlaylists = (token: string) =>
  api.get('/playlists/', withToken(token))

export const getTracks = (token: string, playlistId: string, offset = 0, limit = 50) =>
  api.get(`/songs/${playlistId}`, {
    params: { access_token: token, offset, limit },
  })

export const getMe = (token: string) =>
  api.get('/auth/me', withToken(token))

export const downloadTrack = (token: string, query: string, format: 'mp3' | 'mp4') =>
  api.get('/download/', {
    params: { access_token: token, query, format },
    responseType: 'blob',
    timeout: 120000,
  })

export const downloadTrackSingle = (token: string, query: string, format: 'mp3' | 'mp4') =>
  api.get('/download/', {
    params: { access_token: token, query, format },
    responseType: 'blob',
    timeout: 120000,
  })

// Job-based async downloads
export const startBatchJob = (token: string, queries: string[], format: 'mp3' | 'mp4') =>
  api.post('/download/jobs', { queries, format }, { params: { access_token: token } })

export const startPlaylistJob = (token: string, playlistId: string, format: 'mp3' | 'mp4') =>
  api.post(`/download/jobs/playlist/${playlistId}`, null, {
    params: { access_token: token, format },
  })

export const pollJobStatus = (jobId: string) =>
  api.get(`/download/jobs/${jobId}/status`)

export const downloadJobFile = (jobId: string) =>
  api.get(`/download/jobs/${jobId}/file`, { responseType: 'blob', timeout: 120000 })
