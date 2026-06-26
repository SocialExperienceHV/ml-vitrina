'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

const PIN = '1234' // cambia este PIN antes del evento

export default function AdminPage() {
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [pinError, setPinError] = useState(false)
  const [step, setStep] = useState<'idle' | 'confirm' | 'loading' | 'done' | 'error'>('idle')
  const [counts, setCounts] = useState<{ ingresos: number; bonos: number } | null>(null)

  async function handleLogin() {
    if (pin === PIN) {
      setAuthed(true)
      setPinError(false)
      // cargar conteos actuales
      const [{ count: ci }, { count: cb }] = await Promise.all([
        supabase.from('ingresos').select('*', { count: 'exact', head: true }),
        supabase.from('bonos').select('*', { count: 'exact', head: true }),
      ])
      setCounts({ ingresos: ci ?? 0, bonos: cb ?? 0 })
    } else {
      setPinError(true)
    }
  }

  async function handleReset() {
    setStep('loading')
    const [r1, r2] = await Promise.all([
      supabase.from('ingresos').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('bonos').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    ])
    if (r1.error || r2.error) {
      setStep('error')
    } else {
      setStep('done')
      setCounts({ ingresos: 0, bonos: 0 })
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Header */}
      <div className="bg-[#FFE600] px-5 pt-10 pb-5">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Link href="/" className="text-[#1A1A2E]/50 text-sm">‹ Inicio</Link>
          <Image src="/logo-ml.png" alt="Mercado Libre" width={110} height={30} className="object-contain" />
        </div>
        <div className="max-w-md mx-auto mt-3">
          <h1 className="text-[#1A1A2E] text-xl font-black">Panel de administración</h1>
          <p className="text-[#1A1A2E]/50 text-xs mt-1">Solo para uso interno</p>
        </div>
      </div>

      <div className="px-5 py-8 max-w-md mx-auto w-full space-y-4">

        {!authed ? (
          /* Login con PIN */
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-2xl mb-4 text-center">🔒</div>
            <h2 className="font-black text-[#1A1A2E] text-center mb-5">Ingresa el PIN de administrador</h2>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={e => { setPin(e.target.value); setPinError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="PIN"
              maxLength={8}
              className={`w-full border-2 rounded-xl px-4 py-4 text-2xl text-center font-black tracking-widest focus:outline-none transition-colors ${pinError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#3483FA]'}`}
            />
            {pinError && <p className="text-red-500 text-sm text-center mt-2">PIN incorrecto</p>}
            <button
              onClick={handleLogin}
              className="mt-4 w-full bg-[#1A1A2E] text-white font-bold py-4 rounded-xl active:scale-95 transition-all"
            >
              Entrar
            </button>
          </div>
        ) : (
          /* Panel admin */
          <>
            {/* Conteos actuales */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-[#1A1A2E] mb-4">Datos actuales en la plataforma</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FFE600] rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-[#1A1A2E]">{counts?.ingresos ?? '–'}</div>
                  <div className="text-xs text-[#1A1A2E]/60 mt-1 font-semibold">Ingresos</div>
                </div>
                <div className="bg-[#3483FA] rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-white">{counts?.bonos ?? '–'}</div>
                  <div className="text-xs text-white/70 mt-1 font-semibold">Bonos</div>
                </div>
              </div>
            </div>

            {/* Reset */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100">
              <h2 className="font-bold text-[#1A1A2E] mb-1">Resetear plataforma</h2>
              <p className="text-gray-500 text-sm mb-4">Elimina <strong>todos</strong> los registros de ingresos y bonos. Esta acción no se puede deshacer.</p>

              {step === 'idle' && (
                <button
                  onClick={() => setStep('confirm')}
                  className="w-full border-2 border-red-400 text-red-500 font-bold py-4 rounded-xl active:scale-95 transition-all hover:bg-red-50"
                >
                  🗑️ Resetear todos los datos
                </button>
              )}

              {step === 'confirm' && (
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <p className="text-red-600 font-bold text-sm">⚠️ ¿Estás seguro?</p>
                    <p className="text-red-500 text-xs mt-1">Se eliminarán {counts?.ingresos} ingresos y {counts?.bonos} bonos permanentemente.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setStep('idle')} className="border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl active:scale-95 transition-all">
                      Cancelar
                    </button>
                    <button onClick={handleReset} className="bg-red-500 text-white font-bold py-3 rounded-xl active:scale-95 transition-all">
                      Sí, resetear
                    </button>
                  </div>
                </div>
              )}

              {step === 'loading' && (
                <div className="text-center py-6 text-gray-500 font-semibold animate-pulse">
                  Eliminando datos…
                </div>
              )}

              {step === 'done' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="text-green-700 font-bold">Plataforma reseteada correctamente</p>
                  <p className="text-green-600 text-xs mt-1">Todos los datos fueron eliminados. La app está lista para usarse.</p>
                  <button onClick={() => setStep('idle')} className="mt-3 text-[#3483FA] text-sm font-semibold underline">Volver</button>
                </div>
              )}

              {step === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-600 font-bold">Error al eliminar los datos</p>
                  <p className="text-red-500 text-xs mt-1">Intenta de nuevo o revisa los permisos en Supabase.</p>
                  <button onClick={() => setStep('idle')} className="mt-3 text-[#3483FA] text-sm font-semibold underline">Reintentar</button>
                </div>
              )}
            </div>

            {/* Footer info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-[#1A1A2E] mb-3">Links rápidos</h2>
              <div className="space-y-2">
                {[
                  { href: '/ingreso', label: 'Módulo de ingreso', icon: '🚪' },
                  { href: '/actividad1', label: 'Actividad 1 – Grito de Gol', icon: '⚽' },
                  { href: '/actividad2', label: 'Actividad 2 – Gol James', icon: '🌟' },
                  { href: '/bonos', label: 'Feed de bonos', icon: '🎟️' },
                  { href: '/dashboard', label: 'Dashboard general', icon: '📊' },
                ].map(l => (
                  <Link key={l.href} href={l.href} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 hover:text-[#3483FA] text-gray-600 text-sm">
                    <span>{l.icon}</span><span>{l.label}</span><span className="ml-auto text-gray-300">›</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

      </div>

      <div className="flex flex-col items-center gap-2 pb-8 pt-2">
        <p className="text-gray-400 text-xs">Plataforma realizada por</p>
        <img src="/logo-se.png" alt="Social Experience" className="h-7 object-contain opacity-50" />
      </div>
    </div>
  )
}
