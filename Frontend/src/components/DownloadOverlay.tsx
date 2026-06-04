interface Props {
  completed: number
  total: number
  message?: string
}

export default function DownloadOverlay({ completed, total, message }: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const label = message ?? `Descargando ${completed} de ${total} canciones...`

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-80 rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <p className="mb-1 text-sm font-medium text-white">{label}</p>
        {total > 0 && (
          <p className="mb-3 text-xs text-gray-400">{pct}% completado</p>
        )}
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
          {total > 0 ? (
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          ) : (
            <div
              className="h-full rounded-full bg-blue-500"
              style={{ animation: 'loading 1.5s ease-in-out infinite' }}
            />
          )}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          No cierres esta ventana. Las playlists grandes pueden tardar varios minutos.
        </p>
      </div>
    </div>
  )
}
