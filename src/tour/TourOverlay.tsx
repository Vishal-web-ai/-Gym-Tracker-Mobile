import { useEffect, useRef, useMemo, useState, useLayoutEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import Svg, { Rect as SvgRect, Defs, Mask } from 'react-native-svg'

import { LinearGradient } from 'expo-linear-gradient'
import { Check, ChevronRight } from 'lucide-react-native'
import { useTour } from './TourContext'
import { TOUR_STEPS } from './tourSteps'
import { useResponsive } from '../utils/responsive'

const ARROW_SIZE = 10
const CONNECTOR_GAP = 12

function getScreenStepInfo(steps: typeof TOUR_STEPS, currentIndex: number) {
  const screen = steps[currentIndex]?.screen
  if (!screen) return { step: currentIndex + 1, total: steps.length }
  let start = currentIndex
  let end = currentIndex
  while (start > 0 && steps[start - 1]?.screen === screen) start--
  while (end < steps.length - 1 && steps[end + 1]?.screen === screen) end++
  return { step: currentIndex - start + 1, total: end - start + 1 }
}

function TooltipArrow({ direction }: { direction: 'up' | 'down' }) {
  return (
    <View
      style={{
        alignSelf: 'center',
        width: 0,
        height: 0,
        borderLeftWidth: ARROW_SIZE,
        borderRightWidth: ARROW_SIZE,
        borderTopWidth: direction === 'down' ? ARROW_SIZE : 0,
        borderBottomWidth: direction === 'up' ? ARROW_SIZE : 0,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: direction === 'down' ? 'rgba(15,15,15,0.96)' : 'transparent',
        borderBottomColor: direction === 'up' ? 'rgba(15,15,15,0.96)' : 'transparent',
      }}
    />
  )
}

function SpotlightCutout({
  target,
  W,
  H,
}: {
  target: { x: number; y: number; width: number; height: number; borderRadius?: number; padding?: number } | null
  W: number
  H: number
}) {
  const rect = target
    ? { x: target.x - (target.padding ?? 0), y: target.y - (target.padding ?? 0), w: target.width + (target.padding ?? 0) * 2, h: target.height + (target.padding ?? 0) * 2, r: target.borderRadius ?? 16 }
    : { x: W / 2, y: H / 2, w: 0, h: 0, r: 16 }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={W} height={H}>
        <Defs>
          <Mask id="tourSpotlight">
            <SvgRect width={W} height={H} fill="white" />
            <SvgRect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={rect.r} ry={rect.r} fill="black" />
          </Mask>
        </Defs>
        <SvgRect width={W} height={H} fill="rgba(0,0,0,0.80)" mask="url(#tourSpotlight)" />
      </Svg>
    </View>
  )
}

function TourCompleteModal({
  onStart,
  onExplore,
  animOpacity,
  animScale,
}: {
  onStart: () => void
  onExplore: () => void
  animOpacity: Animated.Value
  animScale: Animated.Value
}) {
  const r = useResponsive()

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: 'rgba(0,0,0,0.85)',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: animOpacity,
          paddingHorizontal: r.scale(24),
        },
      ]}
      pointerEvents="auto"
    >
      <Animated.View
        className="w-full items-center"
        style={{
          padding: r.scale(28),
          backgroundColor: 'rgba(18,18,18,0.92)',
          borderColor: 'rgba(249,115,22,0.25)',
          borderWidth: 1,
          borderRadius: r.scale(24),
          maxWidth: r.scale(400),
          transform: [{ scale: animScale }],
          shadowColor: '#f97316',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 32,
          elevation: 20,
        }}
      >
        <View
          className="bg-orange-500 rounded-full items-center justify-center mb-4"
          style={{ width: r.scale(72), height: r.scale(72) }}
        >
          <Check size={r.scale(36)} color="black" strokeWidth={3} />
        </View>

        <Text
          className="font-bebas text-white text-center tracking-[2px]"
          style={{ fontSize: r.fontScale(28) }}
        >
          You're Ready to Train
        </Text>

        <View
          style={{ width: r.scale(40), height: r.scale(2), backgroundColor: 'rgba(249,115,22,0.4)', marginVertical: r.scale(16) }}
        />

        <Text
          className="font-mono text-white/50 text-center"
          style={{ fontSize: r.fontScale(12), lineHeight: r.scale(20) }}
        >
          You've learned how to:
        </Text>

        <View style={{ gap: r.scale(8), marginTop: r.scale(12), width: '100%' }}>
          {[
            { icon: '🔥', label: 'Build workout streaks' },
            { icon: '🏆', label: 'Track personal records' },
            { icon: '💪', label: 'Create custom exercises' },
            { icon: '⚡', label: 'Log reps and weights' },
            { icon: '📸', label: 'Capture workout memories' },
            { icon: '⏱', label: 'Save workout history' },
            { icon: '👤', label: 'Manage your profile' },
          ].map((item, i) => (
            <View key={i} className="flex-row items-center" style={{ gap: r.scale(10) }}>
              <Text style={{ fontSize: r.fontScale(14) }}>{item.icon}</Text>
              <Text className="font-mono text-white/70" style={{ fontSize: r.fontScale(12) }}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        <Text
          className="font-mono text-white/40 text-center mt-4"
          style={{ fontSize: r.fontScale(11), lineHeight: r.scale(18) }}
        >
          Now it's time to start your first workout and begin your fitness journey.
        </Text>

        <View style={{ gap: r.scale(10), marginTop: r.scale(20), width: '100%' }}>
          <TouchableOpacity
            onPress={onStart}
            activeOpacity={0.85}
            className="bg-orange-500 rounded-2xl items-center"
            style={{
              paddingVertical: r.scale(14),
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Text className="text-black font-bebas tracking-[2px]" style={{ fontSize: r.fontScale(22) }}>
              Start Training
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onExplore}
            activeOpacity={0.85}
            className="border border-orange-500/40 rounded-2xl items-center"
            style={{ paddingVertical: r.scale(12) }}
          >
            <Text className="text-orange-500 font-bebas tracking-[2px]" style={{ fontSize: r.fontScale(18) }}>
              Explore App
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  )
}

export default function TourOverlay() {
  const r = useResponsive()
  const { width: W, height: H } = useWindowDimensions()
  const {
    isActive,
    currentStep,
    currentStepIndex,
    registeredTargets,
    nextStep,
    skipTour,
    completeTour,
    goToStep,
  } = useTour()

  const overlayOpacity = useRef(new Animated.Value(0)).current
  const tooltipScale = useRef(new Animated.Value(0.92)).current
  const tooltipOpacity = useRef(new Animated.Value(0)).current
  const tooltipTranslateY = useRef(new Animated.Value(20)).current
  const completeScale = useRef(new Animated.Value(0.3)).current
  const completeOpacity = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  const prevStepRef = useRef(currentStepIndex)
  const prevActiveRef = useRef(isActive)
  const targetWasNull = useRef(false)
  const isCompleteStep = currentStepIndex === TOUR_STEPS.length - 1
  const isInteractionStep = currentStep?.requireInteraction ?? false
  const { step: phaseStep, total: phaseTotal } = getScreenStepInfo(TOUR_STEPS, currentStepIndex)

  const target = currentStep?.targetId ? registeredTargets[currentStep.targetId] : null
  const anchorTarget = currentStep?.anchorTargetId ? registeredTargets[currentStep.anchorTargetId] : null
  const posTarget = anchorTarget || target
  const overlayRef = useRef<View>(null)
  const [overlayOffset, setOverlayOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!isActive) { setOverlayOffset({ x: 0, y: 0 }); return }
    const retry = (count: number) => {
      requestAnimationFrame(() => {
        ;(overlayRef.current as any)?.measureInWindow?.((x: number, y: number) => {
          if (x === 0 && y === 0 && count > 0) {
            setTimeout(() => retry(count - 1), 100)
          } else {
            setOverlayOffset({ x, y })
          }
        })
      })
    }
    retry(5)
  }, [isActive])

  useEffect(() => {
    if (isActive) {
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      overlayOpacity.setValue(0)
    }
  }, [isActive])

  useLayoutEffect(() => {
    const justActivated = isActive && !prevActiveRef.current
    prevActiveRef.current = isActive

    if (isActive && !isCompleteStep && target) {
      const isStepChange = currentStepIndex !== prevStepRef.current
      prevStepRef.current = currentStepIndex

      if (justActivated) {
        tooltipScale.setValue(0.92)
        tooltipOpacity.setValue(0)
        tooltipTranslateY.setValue(0)
        Animated.parallel([
          Animated.spring(tooltipScale, { toValue: 1, damping: 16, stiffness: 220, useNativeDriver: true }),
          Animated.timing(tooltipOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start()
      } else if (isStepChange) {
        tooltipScale.setValue(0.92)
        tooltipOpacity.setValue(1)
        Animated.sequence([
          Animated.spring(tooltipScale, {
            toValue: 1.04,
            damping: 8,
            stiffness: 400,
            useNativeDriver: true,
          }),
          Animated.spring(tooltipScale, {
            toValue: 1,
            damping: 14,
            stiffness: 300,
            useNativeDriver: true,
          }),
        ]).start()
      } else if (targetWasNull.current) {
        targetWasNull.current = false
        tooltipScale.setValue(0.92)
        tooltipOpacity.setValue(0)
        Animated.parallel([
          Animated.spring(tooltipScale, { toValue: 1, damping: 12, stiffness: 260, useNativeDriver: true }),
          Animated.timing(tooltipOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start()
      }
    } else if (isActive && !isCompleteStep && !target) {
      const isStepChange = currentStepIndex !== prevStepRef.current
      if (isStepChange || justActivated) {
        if (isStepChange) prevStepRef.current = currentStepIndex
        targetWasNull.current = true
        tooltipScale.setValue(0.92)
        tooltipOpacity.setValue(0)
      }
    }
  }, [isActive, isCompleteStep, currentStepIndex, target])

  useEffect(() => {
    if (isCompleteStep && isActive) {
      completeScale.setValue(0.3)
      completeOpacity.setValue(0)
      Animated.parallel([
        Animated.spring(completeScale, {
          toValue: 1,
          damping: 10,
          stiffness: 180,
          useNativeDriver: true,
        }),
        Animated.timing(completeOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [isCompleteStep, isActive])

  useEffect(() => {
    if (isInteractionStep && isActive) {
      let pulse: Animated.CompositeAnimation | null = null
      const startTimer = setTimeout(() => {
        pulseAnim.setValue(1)
        pulse = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ])
        )
        pulse.start()
      }, 400)
      return () => {
        clearTimeout(startTimer)
        pulse?.stop()
      }
    }
  }, [isInteractionStep, isActive])

  const handleNext = () => {
    nextStep()
  }

  const tooltipWidth = Math.min(W * 0.85, r.scale(380))
  const tooltipCardHeight = r.scale(240)
  const tooltipTotalHeight = tooltipCardHeight + r.scale(ARROW_SIZE)

  const tooltipStyle = useMemo(() => {
    if (isCompleteStep || !posTarget) return {}

    const pt = posTarget
    const p = pt.padding ?? 0
    const spotBottom = pt.y + pt.height + p
    const spotTop = pt.y - p
    const topMargin = r.scale(16)
    const bottomEdge = H - tooltipTotalHeight - topMargin

    const spaceBelow = H - spotBottom
    const spaceAbove = spotTop

    const forceBelow = !!currentStep?.forceBelow
    const placeBelow = forceBelow || spaceBelow >= tooltipTotalHeight + CONNECTOR_GAP || spaceAbove < tooltipTotalHeight + CONNECTOR_GAP
    let arrowDirection: 'up' | 'down' = 'up'
    let pinnedBottom = false

    let top: number
    if (placeBelow) {
      top = spotBottom + CONNECTOR_GAP
      arrowDirection = 'up'
      if (top > bottomEdge) {
        top = bottomEdge
        pinnedBottom = true
      }
    } else {
      top = spotTop - CONNECTOR_GAP - tooltipTotalHeight
      arrowDirection = 'down'
      if (top < topMargin) {
        top = bottomEdge
        pinnedBottom = true
        arrowDirection = 'up'
      }
    }

    const cx = pt.x + pt.width / 2 - tooltipWidth / 2
    const left = Math.max(r.scale(16), Math.min(W - tooltipWidth - r.scale(16), cx))
    top = Math.max(topMargin, Math.min(bottomEdge, top))

    return { top, left, width: tooltipWidth, arrowDirection, placeBelow, pinnedBottom }
  }, [posTarget, isCompleteStep, tooltipWidth, currentStep?.forceBelow])

  if (!currentStep) return null

  const isLastRegularStep = currentStepIndex === TOUR_STEPS.length - 2
  const ts = tooltipStyle as any

  return (
    <Animated.View
      ref={overlayRef}
      style={[
        StyleSheet.absoluteFill,
        { opacity: overlayOpacity },
      ]}
      pointerEvents="box-none"
    >
      <View style={{ position: 'absolute', left: -overlayOffset.x, top: -overlayOffset.y, width: W, height: H }} pointerEvents="box-none">
      <SpotlightCutout target={target} W={W} H={H} />

        {isCompleteStep && (
          <TourCompleteModal
            onStart={() => completeTour()}
            onExplore={() => completeTour()}
            animOpacity={completeOpacity}
            animScale={completeScale}
          />
        )}

        {!isCompleteStep && target && posTarget && (
          <Animated.View
            style={{
              position: 'absolute',
              top: ts.top,
              left: ts.left,
              width: ts.width,
              opacity: tooltipOpacity,
              transform: [{ scale: tooltipScale }],
            }}
            pointerEvents="auto"
          >
            {!ts.pinnedBottom && ts.arrowDirection === 'up' && <TooltipArrow direction="up" />}

            <View
              style={{
                padding: r.scale(20),
                backgroundColor: 'rgba(15,15,15,0.96)',
                borderColor: 'rgba(249,115,22,0.25)',
                borderWidth: 1,
                borderRadius: r.scale(24),
                shadowColor: '#f97316',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.25,
                shadowRadius: 32,
                elevation: 16,
              }}
            >
              <Text
                className="font-mono text-orange-500"
              style={{
                fontSize: r.fontScale(10),
                letterSpacing: r.scale(2),
                marginBottom: r.scale(8),
              }}
              >
                STEP {phaseStep} OF {phaseTotal}
              </Text>

              <Text
                className="font-bebas text-white"
                style={{
                  fontSize: r.fontScale(24),
                  letterSpacing: r.scale(1),
                  marginBottom: r.scale(8),
                }}
              >
                {currentStep.title}
              </Text>

              <Text
                className="font-mono text-white/70"
                style={{
                  fontSize: r.fontScale(12),
                  lineHeight: r.scale(20),
                  marginBottom: r.scale(16),
                }}
              >
                {currentStep.description}
              </Text>

              <View style={{ gap: r.scale(8) }}>
                {isInteractionStep ? (
                  <Animated.View style={{ opacity: pulseAnim }}>
                    <Text
                      className="font-mono text-orange-400/80 text-center"
                      style={{ fontSize: r.fontScale(11), letterSpacing: r.scale(0.5) }}
                    >
                      Tap the highlighted feature to continue
                    </Text>
                  </Animated.View>
                ) : (
                  <View className="flex-row" style={{ gap: r.scale(8) }}>
                    <TouchableOpacity
                      onPress={handleNext}
                      activeOpacity={0.85}
                      className="flex-1 rounded-2xl overflow-hidden"
                    >
                      <LinearGradient
                        colors={['#f97316', '#ea580c']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="flex-row items-center justify-center"
                        style={{
                          paddingVertical: r.scale(12),
                          gap: r.scale(4),
                          shadowColor: '#f97316',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.4,
                          shadowRadius: 12,
                          elevation: 6,
                        }}
                      >
                        <Text
                          className="text-black font-bebas tracking-[1px]"
                          style={{ fontSize: r.fontScale(16) }}
                        >
                          {isLastRegularStep ? 'Finish' : 'Next'}
                        </Text>
                        {!isLastRegularStep && (
                          <ChevronRight size={r.scale(14)} color="black" strokeWidth={2.5} />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={skipTour}
                      activeOpacity={0.7}
                      className="rounded-2xl items-center justify-center"
                      style={{
                        paddingHorizontal: r.scale(16),
                        paddingVertical: r.scale(12),
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.2)',
                      }}
                    >
                      <Text
                        className="font-mono"
                        style={{
                          fontSize: r.fontScale(12),
                          color: 'rgba(255,255,255,0.6)',
                          letterSpacing: r.scale(0.5),
                        }}
                      >
                        Skip
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {!ts.pinnedBottom && ts.arrowDirection === 'down' && <TooltipArrow direction="down" />}
          </Animated.View>
        )}

      </View>
    </Animated.View>
  )
}
