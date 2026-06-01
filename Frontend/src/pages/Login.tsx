export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold text-white">DownMusic</h1>
        <p className="mb-8 text-gray-400">Busca canciones de Spotify rápido</p>
        <a
          href="/api/auth/login"
          className="rounded-full bg-green-500 px-8 py-3 font-semibold text-black hover:bg-green-400"
        >
          Iniciar sesión con Spotify
        </a>
      </div>
    </div>
  )
}
