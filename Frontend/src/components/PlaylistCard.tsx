import type { Playlist } from '../types'

interface Props {
  playlist: Playlist
  onClick: () => void
}

export default function PlaylistCard({ playlist, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-lg bg-gray-900 p-4 text-left hover:bg-gray-800"
    >
      {playlist.image_url ? (
        <img src={playlist.image_url} alt="" className="h-12 w-12 rounded object-cover" />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-700 text-xl">
          🎵
        </div>
      )}
      <div>
        <p className="font-medium text-white">{playlist.name}</p>
        <p className="text-sm text-gray-400">
          {playlist.total_tracks > 0 ? `${playlist.total_tracks} canciones` : 'Ver canciones'}
        </p>
      </div>
    </button>
  )
}
