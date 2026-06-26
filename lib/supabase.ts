import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Ingreso = {
  id: string
  fecha: string
  dia: string
  hora: string
  genero: 'Hombre' | 'Mujer'
  rango_edad: string
  created_at: string
}

export type Bono = {
  id: string
  fecha: string
  dia: string
  hora: string
  actividad: 'Actividad 1 – Grito de Gol' | 'Actividad 2 – Gol James'
  valor_bono: 20000 | 50000
  codigo_bono: string | null
  created_at: string
}

export const RANGOS_EDAD = [
  '18 – 24 años',
  '25 – 34 años',
  '35 – 44 años',
  '45 – 54 años',
  '55 años o más',
]

export function getNow() {
  const now = new Date()
  const fecha = now.toLocaleDateString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
  const dia = now.toLocaleDateString('es-CO', { weekday: 'long' })
  const hora = now.toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
  return { fecha, dia, hora }
}

export function getHourLabel(hora: string) {
  const h = parseInt(hora.split(':')[0])
  const suffix = h >= 12 ? 'p.m.' : 'a.m.'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:00 ${suffix}`
}
