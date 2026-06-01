interface Props {
  onClose: () => void
}

const FEATURES = [
  {
    title: 'Explorar playlists',
    desc: 'Visualiza todas tus playlists de Spotify, incluyendo tus canciones favoritas.',
  },
  {
    title: 'Busqueda rapida',
    desc: 'Filtra canciones dentro de cualquier playlist por nombre o artista en tiempo real.',
  },
  {
    title: 'Copiar al instante',
    desc: 'Copia "Artista - Cancion" al portapapeles con un clic para compartir en cualquier momento.',
  },
  {
    title: 'Buscar en YouTube',
    desc: 'Abre la busqueda de la cancion en YouTube directamente desde la app.',
  },
  {
    title: 'Abrir en Spotify',
    desc: 'Elige abrir la cancion en la app de Spotify o en el navegador web.',
  },
  {
    title: 'Descargar canciones',
    desc: 'Descarga canciones en MP3 o MP4 de forma individual, seleccionando varias a la vez o descargando la playlist completa.',
  },
]

export default function InfoModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">DownMusic</h2>
            <p className="mt-1 text-sm text-gray-400">
              Explora tus playlists de Spotify y gestiona canciones de forma rapida, ideal para fiestas y reuniones.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 shrink-0 text-gray-400 hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-lg bg-gray-800 px-4 py-3">
              <p className="mb-0.5 text-sm font-medium text-white">{f.title}</p>
              <p className="text-xs text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
