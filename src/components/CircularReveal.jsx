import { useEffect } from 'react'
import { Dimensions, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing, runOnJS } from 'react-native-reanimated'

const { width: W, height: H } = Dimensions.get('window')
const MAX_RADIUS = Math.sqrt(W * W + H * H) * 2

export default function CircularReveal({ x, y, onComplete }) {
  const radius = useSharedValue(0)
  const overlayOpacity = useSharedValue(1)

  useEffect(() => {
    radius.value = withTiming(MAX_RADIUS, {
      duration: 500,
      easing: Easing.inOut(Easing.cubic),
    }, (finished) => {
      if (finished) {
        runOnJS(onComplete)()
      }
    })
  }, [])

  const circleStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: x - radius.value,
    top: y - radius.value,
    width: radius.value * 2,
    height: radius.value * 2,
    borderRadius: radius.value,
    overflow: 'hidden',
  }))

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  return (
    <Animated.View style={[StyleSheet.absoluteFill, overlayStyle, { zIndex: 100 }]} pointerEvents="none">
      <Animated.View style={circleStyle}>
        <LinearGradient
          colors={['#111111', '#9a3412', '#f97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0.45, 0.86, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </Animated.View>
  )
}
