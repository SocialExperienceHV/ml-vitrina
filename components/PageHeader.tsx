import Link from 'next/link'
import Image from 'next/image'

interface Props {
  title: string
  subtitle?: string
  accent?: 'yellow' | 'blue' | 'dark'
}

export default function PageHeader({ title, subtitle, accent = 'yellow' }: Props) {
  const bg = accent === 'yellow' ? 'bg-ml-yellow' : accent === 'blue' ? 'bg-ml-blue' : 'bg-ml-dark'
  const text = accent === 'yellow' ? 'text-ml-dark' : 'text-white'
  const sub = accent === 'yellow' ? 'text-ml-dark/60' : 'text-white/60'

  return (
    <div className={`${bg} px-4 pt-10 pb-5`}>
      <div className="flex items-center justify-between mb-3">
        <Link href="/" className={`${sub} text-sm`}>‹ Inicio</Link>
        {accent === 'yellow' ? (
          <Image src="/logo-ml.png" alt="Mercado Libre" width={120} height={32} className="object-contain" />
        ) : (
          <Image src="/logo-ml.png" alt="Mercado Libre" width={120} height={32} className="object-contain brightness-0 invert" />
        )}
      </div>
      <h1 className={`${text} text-2xl font-black`}>{title}</h1>
      {subtitle && <p className={`${sub} text-sm mt-1`}>{subtitle}</p>}
    </div>
  )
}
