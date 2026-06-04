import type { DownloadResult } from '../hooks/useDownload'

interface Props {
  result: DownloadResult
  onClose: () => void
}

export default function DownloadResultModal({ result, onClose }: Props) {
  const allOk = result.failed.length === 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              {allOk ? 'Descarga completada' : 'Descarga completada con errores'}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {result.succeeded} de {result.total} canciones descargadas
            </p>
          </div>
          <button onClick={onClose} className="ml-4 text-gray-400 hover:text-white text-xl">
            ✕
          </button>
        </div>

        {result.failed.length > 0 && (
          <div className="rounded-lg border border-red-900 bg-red-950/40 p-4">
            <p className="mb-2 text-sm font-medium text-red-400">
              No se pudieron descargar ({result.failed.length}):
            </p>
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {result.failed.map((f, i) => (
                <li key={i} className="text-xs text-red-300">
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gray-500">
              Estas canciones tambien estan listadas en el archivo _canciones_fallidas.txt dentro del ZIP.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-gray-700 py-2 text-sm text-white hover:bg-gray-600"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
