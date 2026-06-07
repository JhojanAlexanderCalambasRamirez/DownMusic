import type { Track } from '../types'

export function buildSearchQuery(track: Track) {
  return `${track.artists[0]} - ${track.name}`
}
