export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-800 py-6 text-center">
      <p className="mb-3 text-xs text-gray-400">Desarrollado por J4CR — alexandercalambas23@gmail.com</p>
      <div className="flex items-center justify-center gap-6">
        <a
          href="https://www.linkedin.com/in/j4cr/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-white"
        >
          LinkedIn
        </a>
        <a
          href="https://github.com/JhojanAlexanderCalambasRamirez"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-white"
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}
