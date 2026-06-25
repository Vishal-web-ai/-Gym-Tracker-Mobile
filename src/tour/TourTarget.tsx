import { useRef, useEffect, ReactNode } from 'react'
import { View, StyleProp, ViewStyle, InteractionManager } from 'react-native'
import { useTour } from './TourContext'

interface TourTargetProps {
  id: string
  children: ReactNode
  style?: StyleProp<ViewStyle>
  className?: string
  spotlightRadius?: number
  spotlightPadding?: number
}

function rectKey(x: number, y: number, width: number, height: number) {
  return `${Math.round(x)},${Math.round(y)},${Math.round(width)},${Math.round(height)}`
}

export default function TourTarget({ id, children, style, className, spotlightRadius = 16, spotlightPadding = 0 }: TourTargetProps) {
  const ref = useRef<View>(null)
  const { registerTarget, unregisterTarget, currentStep } = useTour()
  const isActive = currentStep?.targetId === id
  const lastKeyRef = useRef('')

  const tryRegister = (x: number, y: number, width: number, height: number) => {
    const key = rectKey(x, y, width, height)
    if (key !== lastKeyRef.current) {
      lastKeyRef.current = key
      registerTarget(id, { x, y, width, height, borderRadius: spotlightRadius, padding: spotlightPadding })
    }
  }

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        ;(ref.current as any)?.measureInWindow?.((x: number, y: number, width: number, height: number) => {
          if (width > 0 && height > 0) {
            tryRegister(x, y, width, height)
          }
        })
      })
    })
  }, [id])

  useEffect(() => {
    if (!isActive) return

    let cancelled = false
    let prevY = -1
    let prevX = -1
    let stableCount = 0
    const settleTimers: ReturnType<typeof setTimeout>[] = []

    const measure = (onStable?: () => void) => {
      if (cancelled) return

      requestAnimationFrame(() => {
        if (cancelled) return
        InteractionManager.runAfterInteractions(() => {
          if (cancelled) return
          requestAnimationFrame(() => {
            if (cancelled) return
            ;(ref.current as any)?.measureInWindow?.((x: number, y: number, width: number, height: number) => {
              if (cancelled) return
              if (width > 0 && height > 0) {
                tryRegister(x, y, width, height)

                const moved = (prevX >= 0 && (Math.abs(x - prevX) > 3 || Math.abs(y - prevY) > 3))
                if (moved) {
                  stableCount = 0
                } else {
                  stableCount++
                }
                prevX = x
                prevY = y

                if (stableCount < 3) {
                  const delay = stableCount === 0 ? 50 : stableCount === 1 ? 80 : 120
                  setTimeout(() => measure(onStable), delay)
                } else {
                  onStable?.()
                }
              } else {
                setTimeout(() => measure(onStable), 300)
              }
            })
          })
        })
      })
    }

    measure(() => {
      if (cancelled) return
      for (const delay of [1000, 1500, 2000]) {
        const st = setTimeout(() => {
          if (cancelled) return
          measure()
        }, delay)
        settleTimers.push(st)
      }
    })

    return () => {
      cancelled = true
      settleTimers.forEach(clearTimeout)
    }
  }, [isActive, id, spotlightRadius, spotlightPadding])

  useEffect(() => {
    return () => unregisterTarget(id)
  }, [id])

  return (
    <View
      ref={ref}
      style={[
        style,
        isActive && {
          zIndex: 9999,
          borderWidth: 2,
          borderColor: '#f97316',
          borderRadius: spotlightRadius,
        },
      ]}
      className={className}
    >
      {children}
    </View>
  )
}
