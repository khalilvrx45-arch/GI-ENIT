'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Database } from '@/lib/supabase/database.types'
import {
  Zap,
  CalendarDays,
  Factory,
  GraduationCap,
  Cog,
  Megaphone,
  CalendarRange,
  Users,
  Trophy,
} from 'lucide-react'

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  poles: { name: string } | null
}

export default function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  
  const links = [
    { href: '/membre', label: 'Dashboard', icon: Zap },
    { href: '/membre/evenements', label: 'Événements', icon: CalendarDays },
    { href: '/membre/visites', label: 'Visites Industrielles', icon: Factory },
    { href: '/membre/formations', label: 'Formations', icon: GraduationCap },
    { href: '/membre/projets', label: 'Projets', icon: Cog },
    { href: '/membre/annonces', label: 'Annonces', icon: Megaphone },
    { href: '/membre/calendrier', label: 'Calendrier', icon: CalendarRange },
    { href: '/membre/annuaire', label: 'Annuaire', icon: Users },
    { href: '/membre/classement', label: 'Classement', icon: Trophy },
  ]

  return (
    <aside className="hidden fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-accent/20 bg-[#050d20]/90 backdrop-blur-xl shadow-2xl lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-accent/15 bg-gradient-to-r from-card/80 to-transparent px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-gold p-0.5 shadow-gold-glow">
          <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#070E1E]">
            <Cog className="h-5 w-5 animate-spin-slow text-accent" aria-hidden="true" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-lg tracking-wider text-gold-gradient leading-none">
            CGI ENIT
          </span>
          <span className="text-[10px] font-mono text-steel uppercase tracking-widest mt-1">
            Génie Industriel
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/membre' && pathname.startsWith(link.href))
          const Icon = link.icon
          return (
            <Link 
              key={link.href}
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={`group relative flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'border-l-4 border-accent bg-gradient-to-r from-accent/20 to-accent/5 text-accent shadow-gold-glow' 
                  : 'text-muted hover:translate-x-1 hover:bg-card/70 hover:text-text'
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}
                strokeWidth={isActive ? 2.25 : 1.75}
                aria-hidden="true"
              />
              <span className="font-body">{link.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              )}
            </Link>
          )
        })}
        
        {(profile.role === 'pole_lead' || profile.role === 'admin') && (
          <div className="mt-6 border-t border-accent/15 px-2 pt-6">
            <div className="flex items-center justify-between mb-3 px-2">
              <span className="text-[10px] uppercase tracking-widest text-accent font-mono">
                Espace Responsable
              </span>
              <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded font-mono border border-accent/20">
                {profile.role === 'admin' ? 'Admin' : 'Pôle Lead'}
              </span>
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-accent/15 bg-card/40 p-4">
        <Link href="/membre/profil" className="flex items-center gap-3 p-2 rounded-lg hover:bg-card transition-colors group">
          <div className="w-9 h-9 rounded-full bg-gradient-gold p-0.5 shrink-0 shadow-gold-glow">
            <div className="w-full h-full bg-[#070E1E] rounded-full flex items-center justify-center">
              <span className="font-display font-bold text-xs text-accent">
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-text truncate group-hover:text-accent transition-colors">
              {profile.first_name} {profile.last_name}
            </p>
            <p className="text-[10px] font-mono text-muted truncate">
              {profile.poles?.name || 'Membre ENIT'}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  )
}