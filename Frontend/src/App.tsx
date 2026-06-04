import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useToken } from './hooks/useToken'
import { TokenContext } from './context/TokenContext'

const Login = lazy(() => import('./pages/Login'))
const Playlists = lazy(() => import('./pages/Playlists'))
const Songs = lazy(() => import('./pages/Songs'))

export default function App() {
  const { token, logout } = useToken()

  return (
    <TokenContext.Provider value={token ?? ''}>
      <BrowserRouter>
        <Suspense>
          <Routes>
            <Route
              path="/"
              element={token ? <Playlists token={token} onLogout={logout} /> : <Login />}
            />
            <Route
              path="/playlist/:playlistId"
              element={token ? <Songs token={token} /> : <Navigate to="/" />}
            />
            <Route path="/callback" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TokenContext.Provider>
  )
}
