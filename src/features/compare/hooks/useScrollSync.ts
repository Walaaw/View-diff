import { useCallback, useRef } from 'react'

/**
 * Synchronize scrolling between two panels. Returns a ref callback for each
 * panel plus a shared `onScroll` handler. When one panel scrolls, the other
 * mirrors its scrollTop/scrollLeft, guarded against feedback loops.
 */
export function useScrollSync<T extends HTMLElement>() {
  const leftRef = useRef<T | null>(null)
  const rightRef = useRef<T | null>(null)
  const isSyncing = useRef(false)

  const handleScroll = useCallback((source: 'left' | 'right') => {
    if (isSyncing.current) {
      isSyncing.current = false
      return
    }
    const from = source === 'left' ? leftRef.current : rightRef.current
    const to = source === 'left' ? rightRef.current : leftRef.current
    if (!from || !to) return
    if (to.scrollTop === from.scrollTop && to.scrollLeft === from.scrollLeft) {
      return
    }
    isSyncing.current = true
    to.scrollTop = from.scrollTop
    to.scrollLeft = from.scrollLeft
  }, [])

  return {
    leftRef,
    rightRef,
    onLeftScroll: () => handleScroll('left'),
    onRightScroll: () => handleScroll('right'),
  }
}
