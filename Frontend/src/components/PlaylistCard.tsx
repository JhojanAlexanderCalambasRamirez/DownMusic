import type { Playlist } from '../types'
import PlaylistDownloadMenu from './PlaylistDownloadMenu'

interface Props {
  playlist: Playlist
  onClick: () => void
}

export default function PlaylistCard({ playlist, onClick }: Props) {
  return (
    <div className="flex w-full items-center gap-4 rounded-lg bg-gray-900 p-4 hover:bg-gray-800">
      <button onClick={onClick} className="flex flex-1 items-center gap-4 text-left">
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
      <PlaylistDownloadMenu
        playlistId={playlist.id}
        playlistName={playlist.name}
        totalTracks={playlist.total_tracks}
      />
    </div>
  )
}
