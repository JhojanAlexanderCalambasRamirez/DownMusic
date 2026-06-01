import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

const withToken = (token: string) => ({ params: { access_token: token } })

export const getPlaylists = (token: string) =>
  api.get('/playlists/', withToken(token))

export const getTracks = (token: string, playlistId: string) =>
  api.get(`/songs/${playlistId}`, withToken(token))

export const getMe = (token: string) =>
  api.get('/auth/me', withToken(token))
