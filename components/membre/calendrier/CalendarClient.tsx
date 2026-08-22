'use client'
import { useState } from 'react'
import { Database } from '@/lib/supabase/database.types'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

type Activity = Database['public']['Tables']['activities']['Row']

export default function CalendarClient({ initialActivities }: { initialActivities: Activity[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7 // Lundi = 0

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

  const activitiesThisMonth = initialActivities.filter(a => {
    const d = new Date(a.date_start)
    return d.getFullYear() === year && d.getMonth() === month
  })

  const getActivitiesForDay = (day: number) => {
    return activitiesThisMonth.filter(a => new Date(a.date_start).getDate() === day)
  }

  const typeColors: Record<Activity['type'], string> = {
    event: 'bg-steel',
    visit: 'bg-accent',
    formation: 'bg-success'
  }

  const selectedDayActivities = selectedDate ? getActivitiesForDay(selectedDate.getDate()) : []

  const changeMonth = (dir: number) => {
    setCurrentDate(new Date(year, month + dir, 1))
    setSelectedDate(null)
  }

  return (
    <div className="panel-surface rounded-md p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold">
          {monthNames[month]} <span className="text-muted font-mono">{year}</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)} className="flex h-8 w-8 items-center justify-center rounded-sm bg-bg text-muted transition-colors hover:bg-muted/20 hover:text-text">‹</button>
          <button onClick={() => changeMonth(1)} className="flex h-8 w-8 items-center justify-center rounded-sm bg-bg text-muted transition-colors hover:bg-muted/20 hover:text-text">›</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
          <div key={i} className="text-center text-xs font-mono text-muted uppercase py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dayActivities = getActivitiesForDay(day)
          const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()
          
          return (
            <button
              key={day}
              onClick={() => setSelectedDate(new Date(year, month, day))}
              className={`relative aspect-square rounded-sm border transition-colors flex flex-col items-center justify-center ${
                isSelected ? 'border-accent bg-accent/10' : 'border-transparent hover:border-muted/30 hover:bg-bg/50'
              } ${isToday && !isSelected ? 'border-steel' : ''}`}
            >
              <span className={`text-sm font-mono ${isToday ? 'text-steel font-bold' : 'text-text'}`}>{day}</span>
              {dayActivities.length > 0 && (
                <div className="flex gap-0.5 absolute bottom-1.5">
                  {dayActivities.slice(0, 3).map(act => (
                    <div key={act.id} className={`w-1.5 h-1.5 rounded-full ${typeColors[act.type]}`} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Détails du jour sélectionné */}
      <AnimatePresence>
        {selectedDate && selectedDayActivities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden border-t border-muted/10 pt-6"
          >
            <h3 className="font-display font-semibold mb-3">
              {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <div className="space-y-2">
              {selectedDayActivities.map(act => {
                const basePath = act.type === 'event' ? 'evenements' : act.type === 'visit' ? 'visites' : 'formations'
                return (
                  <Link 
                    key={act.id} 
                    href={`/membre/${basePath}/${act.id}`}
                    className="group flex items-center gap-3 rounded-sm bg-bg/70 p-3 transition-all hover:-translate-y-0.5 hover:bg-muted/10"
                  >
                    <div className={`w-1 h-8 ${typeColors[act.type]}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text group-hover:text-accent transition-colors">{act.title}</p>
                      <p className="text-xs text-muted font-mono">
                        {new Date(act.date_start).getHours()}h{new Date(act.date_start).getMinutes().toString().padStart(2, '0')}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}