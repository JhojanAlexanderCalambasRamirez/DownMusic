import { useState } from 'react'

export function useToken() {
  const [token, setToken] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search)
    const access = params.get('access_token')
    const refresh = params.get('refresh_token')
    if (access) {
      localStorage.setItem('spotify_token', access)
      if (refresh) localStorage.setItem('spotify_refresh_token', refresh)
      window.history.replaceState({}, '', '/')
      return access
    }
    return localStorage.getItem('spotify_token')
  })

  const logout = () => {
    localStorage.removeItem('spotify_token')
    localStorage.removeItem('spotify_refresh_token')
    setToken(null)
  }

  return { token, logout }
}
