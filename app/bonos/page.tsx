'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { supabase, Bono } from '@/lib/supabase'

export default function BonosPage() {
  const [bonos, setBonos] = useState<Bono[]>([])
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from('bonos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (data) setBonos(data as Bono[])
    setLastUpdate(new Date())
  }, [])

  useEffect(() => {
    fetchData()
    const ch = supabase
      .channel('bonos-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bonos' }, (payload) => {
        setBonos((prev) => [payload.new as Bono, ...prev])
        setLastUpdate(new Date())
      })
      .subscribe()
    return () => { ch.unsubscribe() }
  }, [fetchData])

  const secs = Math.round((Date.now() - lastUpdate.getTime()) / 1000)
  const timeAgo = secs < 60 ? `hace ${secs}s` : `hace ${Math.round(secs / 60)}m`

  const total20 = bonos.filter(b => b.valor_bono === 20000).length
  const total50 = bonos.filter(b => b.valor_bono === 50000).length
  const valorTotal = bonos.reduce((s, b) => s + b.valor_bono, 0)

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-24">

      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <Link href="/" className="text-gray-400 text-sm">‹ Inicio</Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-ml-yellow animate-pulse" />
          <span className="text-gray-400 text-xs">{timeAgo}</span>
          <button onClick={fetchData} className="text-gray-400 text-xs ml-1">↺</button>
        </div>
      </div>

      <div className="px-5 max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-white mb-1">Bonos entregados</h1>
        <p className="text-gray-400 text-sm mb-5">{bonos.length} registros en tiempo real</p>

        {/* Mini KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-gray-400 text-xs mb-1">Total bonos</div>
            <div className="text-white text-xl font-black">{bonos.length}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-gray-400 text-xs mb-1">$20.000</div>
            <div className="text-ml-yellow text-xl font-black">{total20}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
            <div className="text-gray-400 text-xs mb-1">$50.000</div>
            <div className="text-ml-blue text-xl font-black">{total50}</div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex justify-between items-center">
          <span className="text-gray-400 text-sm">Valor total entregado</span>
          <span className="text-white font-black text-lg">${valorTotal.toLocaleString('es-CO')}</span>
        </div>

        {/* Feed de bonos */}
        <div className="space-y-3">
          {bonos.length === 0 && (
            <div className="text-center text-gray-500 py-16">
              <div className="text-4xl mb-3">🎟️</div>
              <p>Aún no hay bonos registrados</p>
            </div>
          )}
          {bonos.map((b, i) => (
            <div
              key={b.id}
              className={`bg-white/5 border rounded-2xl p-4 flex items-center gap-4 transition-all ${i === 0 ? 'border-ml-yellow/40 bg-ml-yellow/5' : 'border-white/10'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${b.valor_bono === 50000 ? 'bg-ml-blue text-white' : 'bg-ml-yellow text-ml-dark'}`}>
                ${(b.valor_bono / 1000).toFixed(0)}k
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold text-sm truncate">
                  {b.actividad.replace('Actividad 1 – ', '').replace('Actividad 2 – ', '')}
                </div>
                {b.codigo_bono && (
                  <div className="text-gray-300 text-xs font-mono mt-0.5">#{b.codigo_bono}</div>
                )}
                <div className="text-gray-500 text-xs mt-0.5">{b.fecha} · {b.hora}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={`font-black text-base ${b.valor_bono === 50000 ? 'text-ml-blue' : 'text-ml-yellow'}`}>
                  ${b.valor_bono.toLocaleString('es-CO')}
                </div>
                <div className="text-gray-500 text-xs">{b.dia}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f0f1a] border-t border-white/10 z-50">
        <div className="flex justify-around items-center py-3 max-w-lg mx-auto">
          {[
            { href: '/', label: 'Inicio', icon: '🏠' },
            { href: '/ingreso', label: 'Ingreso', icon: '🚪' },
            { href: '/actividad1', label: 'Act. 1', icon: '⚽' },
            { href: '/actividad2', label: 'Act. 2', icon: '🌟' },
            { href: '/bonos', label: 'Bonos', icon: '🎟️' },
            { href: '/dashboard', label: 'Dashboard', icon: '📊' },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className={`flex flex-col items-center gap-0.5 px-1 ${l.href === '/bonos' ? 'text-ml-yellow' : 'text-gray-500'}`}>
              <span className="text-lg">{l.icon}</span>
              <span className="text-[9px] font-semibold">{l.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
