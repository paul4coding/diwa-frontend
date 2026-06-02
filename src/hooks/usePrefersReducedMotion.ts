import { useState, useEffect } from 'react'

/**
 * Hook recommandé par ui-ux-pro-max (Severity: HIGH)
 * "Respect user's motion preferences — @media (prefers-reduced-motion: reduce)"
 *
 * Usage :
 *   const reduced = usePrefersReducedMotion()
 *   initial={{ y: reduced ? 0 : 60, opacity: 0 }}
 *   transition={{ duration: reduced ? 0.01 : 0.8 }}
 */
export const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}
