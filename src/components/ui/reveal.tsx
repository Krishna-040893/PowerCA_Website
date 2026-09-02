'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface RevealProps {
  children: ReactNode
  /** Seconds to wait before this block starts, for staggering a row. */
  delay?: number
  className?: string
}

/**
 * Fades a block in and lifts it into place the first time it scrolls into view -
 * the same treatment the affiliate page uses, shared so every public page reads
 * the same way. Respects the viewer's reduced-motion setting.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: '-40px 0px -80px 0px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
