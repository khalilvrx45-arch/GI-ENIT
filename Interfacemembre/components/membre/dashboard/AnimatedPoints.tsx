'use client'

import { motion } from 'framer-motion'

export default function AnimatedPoints({ points }: { points: number }) {
  return (
    <motion.p
      className="font-mono text-4xl font-bold text-accent"
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {points}
    </motion.p>
  )
}
