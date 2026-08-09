'use client'
import { motion } from 'framer-motion'

type CapacityBarProps = {
  registered: number
  capacity: number
}

export default function CapacityBar({ registered, capacity }: CapacityBarProps) {
  const isFull = registered >= capacity
  const fillPercent = Math.min((registered / capacity) * 100, 100)

  // Génère les graduations (max 10 pour éviter la surcharge visuelle)
  const ticks = Array.from({ length: Math.min(capacity, 10) })

  return (
    <div className="w-full select-none">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-muted font-mono uppercase tracking-wider">
          {isFull ? 'Complet' : 'Capacité'}
        </span>
        <span className="text-xs text-text font-mono">
          {registered}<span className="text-muted">/{capacity}</span>
        </span>
      </div>

      {/* Ligne de cotation */}
      <div className="relative h-4 flex items-center">
        {/* Amorce gauche */}
        <div className="absolute left-0 h-full w-px bg-muted/50" />
        {/* Amorce droite */}
        <div className="absolute right-0 h-full w-px bg-muted/50" />
        
        {/* Ligne principale */}
        <div className="absolute inset-x-0 h-px bg-muted/30 top-1/2" />
        
        {/* Remplissage */}
        <motion.div 
          className="absolute left-0 top-1/2 h-px bg-gradient-to-r from-accent-dark via-accent to-accent-light"
          initial={{ width: 0 }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
        
        {/* Graduations */}
        <div className="absolute inset-x-0 flex justify-between top-1/2 -translate-y-1/2">
          {ticks.map((_, i) => {
            const tickPosition = (i / (ticks.length - 1)) * 100
            const isFilled = tickPosition <= fillPercent
            return (
              <div 
                key={i} 
                className={`w-px h-2 ${isFilled ? 'bg-accent' : 'bg-muted/40'}`}
                style={{ height: '8px', marginTop: '-4px' }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}