import { useRef, useEffect } from 'react'
import { Animated, Easing } from 'react-native'
import { Dumbbell } from 'lucide-react-native'

export default function FloatingDumbbell({ size, initialX, initialY, speedMultiplier = 1 }: {
  size: number; initialX: number; initialY: number; speedMultiplier?: number
}) {
  const animValue = useRef(new Animated.Value(0)).current
  const delay = useRef(Math.random() * 3000).current
  const tx = useRef(40 + Math.random() * 40).current
  const ty = useRef(40 + Math.random() * 40).current
  const rot = useRef(10 + Math.random() * 10).current
  const dirX = useRef(Math.random() > 0.5 ? 1 : -1).current
  const dirY = useRef(Math.random() > 0.5 ? 1 : -1).current
  const dirR = useRef(Math.random() > 0.5 ? 1 : -1).current
  const stableOpacity = useRef(0.3).current

  useEffect(() => {
    const baseDuration = 10000 + Math.random() * 8000
    const duration = baseDuration / (speedMultiplier || 1)

    const loop = () => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(animValue, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(animValue, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]).start(loop)
    }
    loop()
  }, [])

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tx * dirX],
  })
  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, ty * dirY],
  })
  const rotate = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${rot * dirR}deg`],
  })

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: initialX,
        top: initialY,
        opacity: stableOpacity,
        transform: [{ translateX }, { translateY }, { rotate }],
      }}
    >
      <Dumbbell size={size} color="#FF6B1A" strokeWidth={1} />
    </Animated.View>
  )
}
