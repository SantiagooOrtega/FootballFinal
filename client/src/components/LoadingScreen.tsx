export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Logo animado */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-primary-500/30 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-primary-500/50 animate-ping [animation-delay:0.2s]" />
          <div className="relative w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center border border-primary-500/40">
            <span className="text-2xl">⚽</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm animate-pulse">Cargando FootballAI...</p>
      </div>
    </div>
  )
}
