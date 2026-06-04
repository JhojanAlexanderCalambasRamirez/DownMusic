import Footer from '../components/Footer'

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-6">
      <main className="w-full max-w-sm text-center">
        <h1 className="mb-2 text-4xl font-bold text-white">DownMusic</h1>
        <p className="mb-8 text-gray-400">Explora tus playlists de Spotify y gestiona canciones al instante</p>
        <a
          href={`${import.meta.env.VITE_API_URL ?? '/api'}/auth/login`}
          className="inline-block rounded-full bg-green-500 px-8 py-3 font-semibold text-black hover:bg-green-400"
        >
          Iniciar sesion con Spotify
        </a>
      </main>
      <div className="absolute bottom-0 w-full">
        <Footer />
      </div>
    </div>
  )
}
