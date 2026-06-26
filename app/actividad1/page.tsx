'use client'
import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import NavBar from '@/components/NavBar'
import { supabase, getNow } from '@/lib/supabase'

const ACTIVIDAD = 'Actividad 1 – Grito de Gol'
const BONOS = [20000, 50000]

export default function Actividad1Page() {
  const [valorBono, setValorBono] = useState<number | null>(null)
  const [codigoBono, setCodigoBono] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!valorBono) {
      setError('Selecciona el valor del bono.')
      return
    }
    setLoading(true)
    setError('')
    const { fecha, dia, hora } = getNow()
    const { error: err } = await supabase.from('bonos').insert({
      fecha, dia, hora, actividad: ACTIVIDAD, valor_bono: valorBono,
      codigo_bono: codigoBono.trim() || null,
    })
    setLoading(false)
    if (err) {
      setError('Error al registrar. Intenta de nuevo.')
      return
    }
    setSuccess(true)
    setValorBono(null)
    setCodigoBono('')
    setTimeout(() => setSuccess(false), 2500)
  }

  return (
    <div className="min-h-screen bg-ml-gray pb-24">
      <PageHeader
        title="Grito de Gol"
        subtitle="Actividad 1 – Selecciona el valor del bono"
        accent="dark"
      />

      <div className="px-4 py-6 max-w-md mx-auto space-y-6">

        {/* Valor del bono */}
        <div className="card">
          <h2 className="font-bold text-ml-dark mb-4 text-base">Valor del bono</h2>
          <div className="grid grid-cols-2 gap-4">
            {BONOS.map((b) => (
              <button
                key={b}
                onClick={() => setValorBono(b)}
                className={`rounded-2xl border-2 p-6 text-center font-bold transition-all duration-150 active:scale-95 ${
                  valorBono === b
                    ? 'border-ml-yellow bg-yellow-50 text-ml-dark'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-yellow-300'
                }`}
              >
                <div className="text-3xl mb-2">🎟️</div>
                <div className="text-xl font-black">${b.toLocaleString('es-CO')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Código del bono */}
        <div className="card">
          <h2 className="font-bold text-ml-dark mb-3 text-base">Código del bono</h2>
          <input
            type="text"
            value={codigoBono}
            onChange={(e) => setCodigoBono(e.target.value)}
            placeholder="Ingresa el código del bono"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg font-semibold text-ml-dark placeholder-gray-300 focus:outline-none focus:border-ml-yellow transition-colors"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-300 text-green-700 rounded-xl p-4 text-center font-semibold animate-pulse">
            ✅ Bono registrado correctamente
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full btn-ml-yellow text-lg py-5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registrando…' : 'Registrar bono'}
        </button>
      </div>

      <NavBar />
    </div>
  )
}
