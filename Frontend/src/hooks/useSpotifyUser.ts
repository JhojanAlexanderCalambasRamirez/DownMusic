import { useState, useEffect } from 'react'
import { getMe } from '../services/api'

interface SpotifyUser {
  display_name: string | null
  profile_image: string | null
}

export function useSpotifyUser(token: string | null) {
  const [user, setUser] = useState<SpotifyUser | null>(null)

  useEffect(() => {
    if (!token) return
    getMe(token)
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
  }, [token])

  return user
}
