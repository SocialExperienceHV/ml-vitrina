'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import NavBar from '@/components/NavBar'
import { supabase, RANGOS_EDAD, getNow } from '@/lib/supabase'

const GENEROS = ['Hombre', 'Mujer']

export default function IngresoPage() {
  const [genero, setGenero] = useState<string>('')
  const [rangoEdad, setRangoEdad] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!genero || !rangoEdad) {
      setError('Selecciona género y rango de edad.')
      return
    }
    setLoading(true)
    setError('')
    const { fecha, dia, hora } = getNow()
    const { error: err } = await supabase.from('ingresos').insert({
      fecha, dia, hora, genero, rango_edad: rangoEdad,
    })
    setLoading(false)
    if (err) { setError('Error al registrar. Intenta de nuevo.'); return }
    setSuccess(true)
    setGenero('')
    setRangoEdad('')
    setTimeout(() => setSuccess(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col pb-16">

      {/* Header compacto */}
      <div className="bg-[#FFE600] px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-[#1A1A2E]/50 text-sm font-medium">‹ Inicio</Link>
        <Image src="/logo-ml.png" alt="Mercado Libre" width={100} height={26} className="object-contain" />
      </div>

      <div className="px-4 pt-3 pb-2 max-w-md mx-auto w-full">
        <h1 className="text-lg font-black text-[#1A1A2E]">Registrar Ingreso</h1>
      </div>

      <div className="px-4 max-w-md mx-auto w-full flex flex-col gap-3 flex-1">

        {/* Género */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-bold text-[#1A1A2E] mb-3 text-sm">Género</h2>
          <div className="grid grid-cols-2 gap-3">
            {GENEROS.map((g) => (
              <button
                key={g}
                onClick={() => setGenero(g)}
                className={`rounded-xl border-2 py-4 text-center font-bold transition-all active:scale-95 ${
                  genero === g ? 'border-[#3483FA] bg-blue-50 text-[#3483FA]' : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <div className="text-2xl mb-1">{g === 'Hombre' ? '👨' : '👩'}</div>
                <div className="text-sm">{g}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Rango de edad */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-bold text-[#1A1A2E] mb-3 text-sm">Rango de edad</h2>
          <div className="grid grid-cols-2 gap-2">
            {RANGOS_EDAD.map((r) => (
              <button
                key={r}
                onClick={() => setRangoEdad(r)}
                className={`rounded-xl border-2 px-3 py-3 text-center text-sm font-semibold transition-all active:scale-95 ${
                  rangoEdad === r ? 'border-[#3483FA] bg-blue-50 text-[#3483FA]' : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-300 text-green-700 rounded-xl p-3 text-center font-semibold text-sm animate-pulse">
            ✅ Ingreso registrado correctamente
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#FFE600] text-[#1A1A2E] font-black py-4 rounded-2xl text-base active:scale-95 transition-all disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Registrando…' : 'Registrar ingreso'}
        </button>
      </div>

      <NavBar />
    </div>
  )
}
