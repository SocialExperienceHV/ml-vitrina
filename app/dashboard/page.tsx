'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, Ingreso, Bono, RANGOS_EDAD, getHourLabel } from '@/lib/supabase'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
} from 'recharts'

/* ── helpers ── */
function byHour(items: { hora: string }[]) {
  const counts: Record<string, number> = {}
  for (let h = 8; h <= 22; h++) counts[String(h).padStart(2, '0')] = 0
  items.forEach((i) => { const h = i.hora.split(':')[0]; counts[h] = (counts[h] ?? 0) + 1 })
  return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0])).map(([h, v]) => ({ hora: `${parseInt(h)}h`, valor: v }))
}

function peakHour(items: { hora: string }[]) {
  if (!items.length) return '–'
  const counts: Record<string, number> = {}
  items.forEach((i) => { const h = i.hora.split(':')[0]; counts[h] = (counts[h] || 0) + 1 })
  const peak = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  return peak ? getHourLabel(peak[0] + ':00') : '–'
}

function byDay(items: { fecha: string }[]) {
  const counts: Record<string, number> = {}
  items.forEach((i) => { counts[i.fecha] = (counts[i.fecha] || 0) + 1 })
  return Object.entries(counts).sort().map(([d, v]) => ({ dia: d, valor: v }))
}

function fmt(n: number) { return `$${n.toLocaleString('es-CO')}` }
function pct(a: number, b: number) { return b === 0 ? 0 : Math.round((a / b) * 100) }

/* ── sub-components ── */
function KPICard({ label, value, sub, accent = 'white' }: { label: string; value: string | number; sub?: string; accent?: 'white' | 'yellow' | 'blue' | 'dark' }) {
  const bg = accent === 'yellow' ? 'bg-[#FFE600]' : accent === 'blue' ? 'bg-[#3483FA]' : accent === 'dark' ? 'bg-[#1A1A2E]' : 'bg-white'
  const txt = accent === 'yellow' ? 'text-[#1A1A2E]' : accent === 'white' ? 'text-[#1A1A2E]' : 'text-white'
  const sub_txt = accent === 'yellow' ? 'text-[#1A1A2E]/60' : accent === 'white' ? 'text-gray-400' : 'text-white/60'
  return (
    <div className={`${bg} rounded-2xl p-4 shadow-sm border border-gray-100`}>
      <div className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${sub_txt}`}>{label}</div>
      <div className={`text-2xl font-black ${txt}`}>{value}</div>
      {sub && <div className={`text-xs mt-0.5 ${sub_txt}`}>{sub}</div>}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-6 px-1">{children}</h2>
}

function ProgressRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const p = pct(value, total)
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-gray-600 text-sm w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${p}%`, backgroundColor: color }} />
      </div>
      <span className="text-[#1A1A2E] font-bold text-sm w-8 text-right">{value}</span>
      <span className="text-gray-400 text-xs w-8 text-right">{p}%</span>
    </div>
  )
}

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #eee', borderRadius: 10, color: '#1A1A2E', fontSize: 12 },
}

/* ── main ── */
export default function DashboardPage() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [bonos, setBonos] = useState<Bono[]>([])
  const [filterDia, setFilterDia] = useState('')
  const [filterActividad, setFilterActividad] = useState('')
  const [filterValor, setFilterValor] = useState('')
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [exporting, setExporting] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  async function handleExportPDF() {
    if (!contentRef.current) return
    setExporting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default
      const canvas = await html2canvas(contentRef.current, { backgroundColor: '#F5F5F5', scale: 2, useCORS: true, logging: false })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const imgH = (canvas.height * pageW) / canvas.width
      let y = 0
      while (y < imgH) {
        if (y > 0) pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, -y, pageW, imgH)
        y += pageH
      }
      pdf.save(`dashboard-ml-vitrina-${new Date().toLocaleDateString('es-CO').replace(/\//g, '-')}.pdf`)
    } finally { setExporting(false) }
  }

  const fetchData = useCallback(async () => {
    const [{ data: ing }, { data: bon }] = await Promise.all([
      supabase.from('ingresos').select('*').order('created_at', { ascending: true }),
      supabase.from('bonos').select('*').order('created_at', { ascending: true }),
    ])
    if (ing) setIngresos(ing as Ingreso[])
    if (bon) setBonos(bon as Bono[])
    setLastUpdate(new Date())
  }, [])

  useEffect(() => {
    fetchData()
    const chI = supabase.channel('ing').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ingresos' }, fetchData).subscribe()
    const chB = supabase.channel('bon').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bonos' }, fetchData).subscribe()
    return () => { chI.unsubscribe(); chB.unsubscribe() }
  }, [fetchData])

  const dias = Array.from(new Set([...ingresos.map(i => i.fecha), ...bonos.map(b => b.fecha)])).sort()

  const fi = ingresos.filter(i => !filterDia || i.fecha === filterDia)
  const fb = bonos.filter(b => {
    if (filterDia && b.fecha !== filterDia) return false
    if (filterActividad && b.actividad !== filterActividad) return false
    if (filterValor && b.valor_bono !== Number(filterValor)) return false
    return true
  })

  const totalAsis = fi.length
  const totalBonos = fb.length
  const valorTotal = fb.reduce((s, b) => s + b.valor_bono, 0)
  const act1 = fb.filter(b => b.actividad.includes('Grito'))
  const act2 = fb.filter(b => b.actividad.includes('James'))
  const bonos20 = fb.filter(b => b.valor_bono === 20000).length
  const bonos50 = fb.filter(b => b.valor_bono === 50000).length
  const hombres = fi.filter(i => i.genero === 'Hombre').length
  const mujeres = fi.filter(i => i.genero === 'Mujer').length
  const valorAct1 = act1.reduce((s, b) => s + b.valor_bono, 0)
  const valorAct2 = act2.reduce((s, b) => s + b.valor_bono, 0)
  const secs = Math.round((Date.now() - lastUpdate.getTime()) / 1000)
  const timeAgo = secs < 60 ? `hace ${secs}s` : `hace ${Math.round(secs / 60)}m`

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">

      {/* Header amarillo ML */}
      <div className="bg-[#FFE600] px-5 pt-10 pb-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[#1A1A2E]/50 text-sm font-medium">‹ Inicio</Link>
            <Image src="/logo-ml.png" alt="Mercado Libre" width={110} height={30} className="object-contain" />
          </div>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-1.5 bg-[#1A1A2E] text-white text-xs font-bold px-3 py-2 rounded-lg active:scale-95 transition-all disabled:opacity-60"
          >
            {exporting ? '⏳ Exportando…' : '⬇️ Exportar PDF'}
          </button>
        </div>
        <div className="max-w-2xl mx-auto mt-3">
          <h1 className="text-[#1A1A2E] text-xl font-black">Dashboard General</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-[#1A1A2E]/40 animate-pulse" />
            <span className="text-[#1A1A2E]/50 text-xs">En vivo · {timeAgo}</span>
            <button onClick={fetchData} className="text-[#1A1A2E]/40 text-xs ml-1">↺</button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-gray-200 px-5 py-3">
        <div className="max-w-2xl mx-auto flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-400 font-semibold mr-1">Filtrar:</span>
          <select value={filterDia} onChange={e => setFilterDia(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700">
            <option value="">Todos los días</option>
            {dias.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filterActividad} onChange={e => setFilterActividad(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700">
            <option value="">Todas las actividades</option>
            <option value="Actividad 1 – Grito de Gol">Grito de Gol</option>
            <option value="Actividad 2 – Gol James">Gol James</option>
          </select>
          <select value={filterValor} onChange={e => setFilterValor(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700">
            <option value="">Todos los bonos</option>
            <option value="20000">$20.000</option>
            <option value="50000">$50.000</option>
          </select>
          {(filterDia || filterActividad || filterValor) && (
            <button onClick={() => { setFilterDia(''); setFilterActividad(''); setFilterValor('') }}
              className="text-[#3483FA] text-xs font-semibold">✕ Limpiar</button>
          )}
        </div>
      </div>

      <div ref={contentRef} className="px-5 max-w-2xl mx-auto">

        {/* Hero */}
        <div className="mt-5 bg-[#1A1A2E] rounded-2xl p-6 shadow-sm">
          <div className="text-white/50 text-xs uppercase tracking-widest mb-1">Valor total entregado en bonos</div>
          <div className="text-[#FFE600] text-4xl font-black">{fmt(valorTotal)}</div>
          <div className="flex gap-5 mt-3">
            <div>
              <div className="text-white/40 text-xs">Bonos</div>
              <div className="text-white font-bold text-lg">{totalBonos}</div>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <div className="text-white/40 text-xs">Asistentes</div>
              <div className="text-white font-bold text-lg">{totalAsis}</div>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <div className="text-white/40 text-xs">Hora pico ingreso</div>
              <div className="text-white font-bold text-lg">{peakHour(fi)}</div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <SectionLabel>Resumen</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <KPICard label="Total asistentes" value={totalAsis} accent="yellow" />
          <KPICard label="Total bonos" value={totalBonos} accent="blue" />
          <KPICard label="Bonos $20.000" value={bonos20} sub={`${pct(bonos20, totalBonos)}% del total`} />
          <KPICard label="Bonos $50.000" value={bonos50} sub={`${pct(bonos50, totalBonos)}% del total`} />
          <KPICard label="Hora pico ingreso" value={peakHour(fi)} />
          <KPICard label="Hora pico bonos" value={peakHour(fb)} />
        </div>

        {/* Actividades */}
        <SectionLabel>Actividades</SectionLabel>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-[#1A1A2E] text-sm">⚽ Grito de Gol</span>
              <span className="text-[#3483FA] font-bold text-sm">{fmt(valorAct1)}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-3">
              <div className="h-3 rounded-full bg-[#FFE600] transition-all duration-500" style={{ width: `${pct(act1.length, totalBonos)}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-400 text-xs">{act1.length} bonos</span>
              <span className="text-gray-400 text-xs">{pct(act1.length, totalBonos)}%</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-[#1A1A2E] text-sm">🌟 Gol James</span>
              <span className="text-[#3483FA] font-bold text-sm">{fmt(valorAct2)}</span>
            </div>
            <div className="bg-gray-100 rounded-full h-3">
              <div className="h-3 rounded-full bg-[#3483FA] transition-all duration-500" style={{ width: `${pct(act2.length, totalBonos)}%` }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-400 text-xs">{act2.length} bonos</span>
              <span className="text-gray-400 text-xs">{pct(act2.length, totalBonos)}%</span>
            </div>
          </div>
        </div>

        {/* Ingreso por hora */}
        <SectionLabel>Ingreso por hora</SectionLabel>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={byHour(fi)} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="gY" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFE600" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FFE600" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hora" tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="valor" stroke="#F0A500" strokeWidth={2.5} fill="url(#gY)" name="Ingresos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bonos por hora */}
        <SectionLabel>Entrega de bonos por hora</SectionLabel>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={byHour(fb)} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3483FA" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3483FA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hora" tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="valor" stroke="#3483FA" strokeWidth={2.5} fill="url(#gB)" name="Bonos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Género */}
        <SectionLabel>Distribución por género</SectionLabel>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-2">
          <ProgressRow label="Hombre" value={hombres} total={totalAsis} color="#3483FA" />
          <ProgressRow label="Mujer" value={mujeres} total={totalAsis} color="#FFE600" />
        </div>

        {/* Edad */}
        <SectionLabel>Distribución por rango de edad</SectionLabel>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-2">
          {RANGOS_EDAD.map((r, idx) => {
            const colors = ['#FFE600', '#F0A500', '#3483FA', '#2968C8', '#1A1A2E']
            return <ProgressRow key={r} label={r.replace(' años', '').replace(' o más', '+')} value={fi.filter(i => i.rango_edad === r).length} total={totalAsis} color={colors[idx]} />
          })}
        </div>

        {/* Ingresos por día */}
        {byDay(fi).length > 0 && (
          <>
            <SectionLabel>Ingresos por día</SectionLabel>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              {byDay(fi).length === 1 ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">{byDay(fi)[0].dia}</span>
                  <span className="text-[#1A1A2E] font-black text-2xl">{byDay(fi)[0].valor}</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={byDay(fi)} barSize={40} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <XAxis dataKey="dia" tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="valor" fill="#FFE600" radius={[4, 4, 0, 0]} name="Ingresos" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="flex flex-col items-center gap-2 pt-8 pb-4">
          <p className="text-gray-400 text-xs">Plataforma realizada por</p>
          <img src="/logo-se.png" alt="Social Experience" className="h-8 object-contain opacity-60" />
        </div>

      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2 max-w-lg mx-auto">
          {[
            { href: '/', label: 'Inicio', icon: '🏠' },
            { href: '/ingreso', label: 'Ingreso', icon: '🚪' },
            { href: '/actividad1', label: 'Act. 1', icon: '⚽' },
            { href: '/actividad2', label: 'Act. 2', icon: '🌟' },
            { href: '/bonos', label: 'Bonos', icon: '🎟️' },
            { href: '/dashboard', label: 'Dashboard', icon: '📊' },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className={`flex flex-col items-center gap-0.5 px-1 ${l.href === '/dashboard' ? 'text-[#3483FA]' : 'text-gray-400'}`}>
              <span className="text-lg">{l.icon}</span>
              <span className="text-[9px] font-semibold">{l.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
