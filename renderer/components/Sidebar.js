import Link from 'next/link'
import { useRouter } from 'next/router'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '▦' },
  { href: '/catalog', label: 'Products', icon: '◈' },
  { href: '/pricing', label: 'Pricing', icon: '$' },
  { href: '/proposals', label: 'Proposals', icon: '⊞' },
  { href: '/contact', label: 'Book Demo', icon: '◎' },
]

export default function Sidebar() {
  const router = useRouter()

  return (
    <aside className="w-60 bg-dark-800 border-r border-slate-700/50 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
          <span className="font-bold text-slate-100 text-lg tracking-tight">NexaFlow</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon }) => {
          const active = router.pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                active
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-dark-700'
              }`}
            >
              <span className="text-base w-5 text-center">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-dark-600 rounded-full flex items-center justify-center text-slate-300 text-sm font-semibold">S</div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">Sales Rep</p>
            <p className="text-xs text-slate-500 truncate">NexaFlow Inc.</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
