'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Inicio', icon: '🏠' },
  { href: '/ingreso', label: 'Ingreso', icon: '🚪' },
  { href: '/actividad1', label: 'Act. 1', icon: '⚽' },
  { href: '/actividad2', label: 'Act. 2', icon: '🌟' },
]

export default function NavBar() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2 max-w-lg mx-auto">
        {links.map((l) => (
          <Link key={l.href} href={l.href}
            className={`flex flex-col items-center gap-0.5 px-1 py-1 rounded-xl transition-colors ${
              path === l.href ? 'text-ml-blue' : 'text-gray-400 hover:text-gray-600'
            }`}>
            <span className="text-lg">{l.icon}</span>
            <span className="text-[9px] font-semibold">{l.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
