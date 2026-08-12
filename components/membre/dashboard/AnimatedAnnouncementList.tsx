'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

type Announcement = {
  id: string
  title: string
  excerpt: string | null
  created_at: string
}

export default function AnimatedAnnouncementList({ announcements }: { announcements: Announcement[] }) {
  return (
    <ul className="space-y-3">
      {announcements.map((a) => (
        <motion.li
          key={a.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="panel-surface panel-interactive rounded-md p-4"
        >
          <Link href="/membre/annonces" className="block">
            <h3 className="font-medium text-text hover:text-accent transition-colors">{a.title}</h3>
            <p className="text-sm text-muted mt-1 line-clamp-2">{a.excerpt}</p>
          </Link>
        </motion.li>
      ))}
    </ul>
  )
}
