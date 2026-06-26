'use client'
import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
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
    if (err) {
      setError('Error al registrar. Intenta de nuevo.')
      return
    }
    setSuccess(true)
    setGenero('')
    setRangoEdad('')
    setTimeout(() => setSuccess(false), 2500)
  }

  return (
    <div className="min-h-screen bg-ml-gray pb-24">
      <PageHeader
        title="Registrar Ingreso"
        subtitle="Selecciona género y edad del asistente"
        accent="yellow"
      />

      <div className="px-4 py-6 max-w-md mx-auto space-y-6">

        {/* Género */}
        <div className="card">
          <h2 className="font-bold text-ml-dark mb-4 text-base">Género</h2>
          <div className="grid grid-cols-2 gap-3">
            {GENEROS.map((g) => (
              <button
                key={g}
                onClick={() => setGenero(g)}
                className={`select-option text-lg py-6 ${genero === g ? 'selected' : ''}`}
              >
                <div className="text-2xl mb-1">{g === 'Hombre' ? '👨' : '👩'}</div>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Rango de edad */}
        <div className="card">
          <h2 className="font-bold text-ml-dark mb-4 text-base">Rango de edad</h2>
          <div className="flex flex-col gap-2">
            {RANGOS_EDAD.map((r) => (
              <button
                key={r}
                onClick={() => setRangoEdad(r)}
                className={`select-option text-left px-4 py-4 ${rangoEdad === r ? 'selected' : ''}`}
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
          <div className="bg-green-50 border border-green-300 text-green-700 rounded-xl p-4 text-center font-semibold animate-pulse">
            ✅ Ingreso registrado correctamente
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full btn-ml-yellow text-lg py-5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registrando…' : 'Registrar ingreso'}
        </button>
      </div>

      <NavBar />
    </div>
  )
}
