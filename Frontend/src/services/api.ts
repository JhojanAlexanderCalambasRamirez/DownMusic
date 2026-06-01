import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

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

export const getTracks = (token: string, playlistId: string) =>
  api.get(`/songs/${playlistId}`, withToken(token))

export const getMe = (token: string) =>
  api.get('/auth/me', withToken(token))

export const downloadTrack = (token: string, query: string, format: 'mp3' | 'mp4') =>
  api.get('/download/', {
    params: { access_token: token, query, format },
    responseType: 'blob',
    timeout: 120000,
  })

export const downloadBatch = (token: string, queries: string[], format: 'mp3' | 'mp4') =>
  api.post('/download/batch', { queries, format }, {
    params: { access_token: token },
    responseType: 'blob',
    timeout: 600000,
  })

export const downloadPlaylist = (token: string, playlistId: string, format: 'mp3' | 'mp4') =>
  api.get(`/download/playlist/${playlistId}`, {
    params: { access_token: token, format },
    responseType: 'blob',
    timeout: 600000,
  })
