'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, Wrench, Trophy } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const links = [
    { href: '/membre', label: 'Accueil', icon: LayoutDashboard },
    { href: '/membre/evenements', label: 'Événements', icon: CalendarDays },
    { href: '/membre/projets', label: 'Projets', icon: Wrench },
    { href: '/membre/classement', label: 'Rang', icon: Trophy },
  ]

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-accent/20 bg-bg/90 px-2 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/membre' && pathname.startsWith(link.href))
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex h-12 w-16 flex-col items-center justify-center gap-0.5 rounded-md transition-all duration-200 ${
              isActive
                ? 'bg-accent/10 text-accent'
                : 'text-muted hover:bg-card/80 hover:text-text'
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
            <span className="text-[10px] font-mono">{link.label}</span>
            {isActive ? <span className="mt-0.5 h-0.5 w-4 rounded-full bg-accent" /> : null}
          </Link>
        )
      })}
    </nav>
  )
}
