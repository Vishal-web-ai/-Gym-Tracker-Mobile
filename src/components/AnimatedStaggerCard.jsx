import { useEffect, useRef } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withDelay, Easing } from 'react-native-reanimated'

const STAGGER_DELAY = 100
const ANIMATION_DURATION = 400
const INITIAL_TRANSLATE_Y = 30
const INITIAL_TRANSLATE_X = 300
const INITIAL_SCALE = 0.95

const easing = Easing.bezier(0.16, 1, 0.3, 1)

let appLaunched = false

export default function AnimatedStaggerCard({ index = 0, direction = 'up', children, className, style = undefined }) {
  const opacity = useSharedValue(appLaunched ? 1 : 0)
  const translateY = useSharedValue(appLaunched ? 0 : INITIAL_TRANSLATE_Y)
  const translateX = useSharedValue(appLaunched ? 0 : INITIAL_TRANSLATE_X)
  const scale = useSharedValue(appLaunched ? 1 : INITIAL_SCALE)
  const didAnimate = useRef(appLaunched)

  useEffect(() => {
    if (didAnimate.current) return
    didAnimate.current = true
    appLaunched = true

    const delay = index * STAGGER_DELAY

    opacity.value = withDelay(delay, withTiming(1, { duration: ANIMATION_DURATION, easing }))
    translateY.value = withDelay(delay, withTiming(0, { duration: ANIMATION_DURATION, easing }))
    translateX.value = withDelay(delay, withTiming(0, { duration: ANIMATION_DURATION, easing }))
    scale.value = withDelay(delay, withTiming(1, { duration: ANIMATION_DURATION, easing }))
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      direction === 'right' ? { translateX: translateX.value } : { translateY: translateY.value },
      { scale: scale.value }
    ]
  }))

  return <Animated.View style={[animatedStyle, style]} className={className}>{children}</Animated.View>
}
