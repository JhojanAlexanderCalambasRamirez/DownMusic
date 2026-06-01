import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useToken } from './hooks/useToken'
import Login from './pages/Login'
import Playlists from './pages/Playlists'
import Songs from './pages/Songs'

export default function App() {
  const { token, logout } = useToken()

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}
