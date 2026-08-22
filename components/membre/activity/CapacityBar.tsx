'use client'
import { Users } from 'lucide-react'

type CapacityBarProps = {
  registered?: number
  capacity: number
}

export default function CapacityBar({ capacity }: CapacityBarProps) {
  return (
    <div className="w-full select-none flex items-center justify-between pt-1">
      <span className="text-xs text-muted font-mono uppercase tracking-wider flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5 text-accent" />
        Capacité
      </span>
      <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
        {capacity} place{capacity > 1 ? 's' : ''}
      </span>
    </div>
  )
}