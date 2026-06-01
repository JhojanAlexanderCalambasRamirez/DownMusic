export interface Playlist {
  id: string
  name: string
  total_tracks: number
  image_url: string | null
}

export interface Track {
  id: string
  name: string
  artists: string[]
  spotify_url: string | null
}
