import { useState } from 'react'
import InfoModal from './InfoModal'

interface User {
  display_name: string | null
  profile_image: string | null
}

interface Props {
  user: User | null
  onLogout?: () => void
}

export default function AppHeader({ user, onLogout }: Props) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user?.profile_image ? (
            <img
              src={user.profile_image}
              alt="Perfil"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-sm text-white">
              {user?.display_name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400">Conectado como</p>
            <p className="font-semibold text-white">
              {user?.display_name ?? 'Usuario'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(true)}
          className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:border-gray-500 hover:text-white"
        >
          De que trata
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:border-gray-500 hover:text-white"
          >
            Cerrar sesion
          </button>
        )}
      </header>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </>
  )
}
