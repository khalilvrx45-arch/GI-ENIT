import { Database } from '@/lib/supabase/database.types'

type Activity = Database['public']['Tables']['activities']['Row']

export function formatActivityDate(dateString: string): string {
  const date = new Date(dateString)
  const days = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.']
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  
  const dayName = days[date.getDay()]
  const dayNum = date.getDate()
  const monthName = months[date.getMonth()]
  const hours = date.getHours().toString().padStart(2, '0')
  const mins = date.getMinutes().toString().padStart(2, '0')

  return `${dayName}. ${dayNum} ${monthName} · ${hours}h${mins}`
}

export function getActivityTypeLabel(type: Activity['type']): string {
  switch (type) {
    case 'event': return 'Événement'
    case 'visit': return 'Visite'
    case 'formation': return 'Formation'
    default: return 'Activité'
  }
}