import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-ml-dark flex flex-col">
      {/* Header */}
      <div className="bg-ml-yellow px-6 py-6 flex flex-col items-center">
        <Image src="/logo-ml.png" alt="Mercado Libre" width={220} height={60} className="object-contain" priority />
        <div className="text-sm font-semibold text-ml-dark/60 mt-2 uppercase tracking-widest">vitrina</div>
      </div>

      {/* Title */}
      <div className="px-6 pt-8 pb-4 text-center">
        <h1 className="text-2xl font-bold text-white">App Mercado Libre</h1>
        <p className="text-white/60 mt-1 text-sm">Selecciona un módulo para comenzar</p>
      </div>

      {/* Buttons */}
      <div className="flex-1 px-6 pb-10 flex flex-col gap-4 max-w-md mx-auto w-full">
        <Link href="/ingreso" className="block">
          <div className="bg-ml-yellow text-ml-dark font-bold rounded-2xl p-6 flex items-center gap-4 shadow-lg active:scale-95 transition-transform">
            <div className="text-3xl">🚪</div>
            <div>
              <div className="text-lg font-black">Registrar Ingreso</div>
              <div className="text-sm font-medium text-ml-dark/60">Registro de asistentes</div>
            </div>
            <div className="ml-auto text-2xl">›</div>
          </div>
        </Link>

        <Link href="/actividad1" className="block">
          <div className="bg-white text-ml-dark font-bold rounded-2xl p-6 flex items-center gap-4 shadow-lg active:scale-95 transition-transform">
            <div className="text-3xl">⚽</div>
            <div>
              <div className="text-lg font-black">Grito de Gol</div>
              <div className="text-sm font-medium text-gray-500">Actividad 1 – Entrega de bonos</div>
            </div>
            <div className="ml-auto text-2xl text-gray-400">›</div>
          </div>
        </Link>

        <Link href="/actividad2" className="block">
          <div className="bg-white text-ml-dark font-bold rounded-2xl p-6 flex items-center gap-4 shadow-lg active:scale-95 transition-transform">
            <div className="text-3xl">🌟</div>
            <div>
              <div className="text-lg font-black">Gol James</div>
              <div className="text-sm font-medium text-gray-500">Actividad 2 – Entrega de bonos</div>
            </div>
            <div className="ml-auto text-2xl text-gray-400">›</div>
          </div>
        </Link>

        <Link href="/bonos" className="block mt-2">
          <div className="bg-white/10 text-white font-bold rounded-2xl p-6 flex items-center gap-4 shadow-lg active:scale-95 transition-transform border border-white/20">
            <div className="text-3xl">🎟️</div>
            <div>
              <div className="text-lg font-black">Bonos</div>
              <div className="text-sm font-medium text-white/60">Feed en tiempo real</div>
            </div>
            <div className="ml-auto text-2xl text-white/40">›</div>
          </div>
        </Link>

        <Link href="/dashboard" className="block">
          <div className="bg-ml-blue text-white font-bold rounded-2xl p-6 flex items-center gap-4 shadow-lg active:scale-95 transition-transform">
            <div className="text-3xl">📊</div>
            <div>
              <div className="text-lg font-black">Dashboard General</div>
              <div className="text-sm font-medium text-white/70">Ver estadísticas consolidadas</div>
            </div>
            <div className="ml-auto text-2xl">›</div>
          </div>
        </Link>
      </div>

      <div className="text-center pb-8 pt-2 flex flex-col items-center gap-2">
        <p className="text-white/30 text-xs">Plataforma realizada por</p>
        <Image src="/logo-se.png" alt="Social Experience" width={140} height={40} className="object-contain opacity-70" />
      </div>
    </main>
  )
}
