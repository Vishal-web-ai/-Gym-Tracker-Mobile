import { useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withDelay, withSpring, Easing } from 'react-native-reanimated'

const STAGGER_DELAY = 80
const ANIMATION_DURATION = 350
const INITIAL_TRANSLATE_Y = 25
const INITIAL_TRANSLATE_X = 300
const INITIAL_SCALE = 0.92

const easing = Easing.bezier(0.16, 1, 0.3, 1)

export default function AnimatedStaggerCard({ index = 0, direction = 'up', children, className, style = undefined }) {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(INITIAL_TRANSLATE_Y)
  const translateX = useSharedValue(INITIAL_TRANSLATE_X)
  const scale = useSharedValue(INITIAL_SCALE)

  useEffect(() => {
    const delay = index * STAGGER_DELAY

    opacity.value = withDelay(delay, withTiming(1, { duration: ANIMATION_DURATION, easing }))
    translateY.value = withDelay(delay, withTiming(0, { duration: ANIMATION_DURATION, easing }))
    translateX.value = withDelay(delay, withTiming(0, { duration: ANIMATION_DURATION, easing }))
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 150 }))
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
