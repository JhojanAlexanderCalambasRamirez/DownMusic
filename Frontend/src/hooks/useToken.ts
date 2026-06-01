import { useState } from 'react'

export function useToken() {
  const [token, setToken] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('access_token')
    if (t) {
      localStorage.setItem('spotify_token', t)
      window.history.replaceState({}, '', '/')
      return t
    }
    return localStorage.getItem('spotify_token')
  })

  const logout = () => {
    localStorage.removeItem('spotify_token')
    setToken(null)
  }

  return { token, logout }
}
