import { useState, useRef, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, Animated, Dimensions } from 'react-native'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import { setUserName, getUserProfile } from '../src/storage'
import { useResponsive } from '../src/utils/responsive'
import FloatingDumbbell from '../src/components/FloatingDumbbell'

const { width } = Dimensions.get('window')
const W = width as number
const H = Dimensions.get('window').height as number

export default function WelcomeScreen() {
  const r = useResponsive()
  const [name, setName] = useState('')
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    getUserProfile().then(profile => {
      if (profile && (profile.joinedAt || profile.age)) {
        router.replace('/(tabs)')
      } else {
        setChecking(false)
      }
    })
  }, [])

  const titleOpacity = useRef(new Animated.Value(0)).current
  const subtitleOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  if (checking) {
    return <View className="flex-1 bg-black" />
  }

  const handleStart = () => {
    setUserName(name.trim() || 'Athlete')
    router.replace('/onboarding')
  }

  return (
    <View className="flex-1 bg-black">

      <View className="flex-1 px-6 justify-center items-center">
        <Animated.View style={{ opacity: titleOpacity }} className="items-center mb-4">
          <Text className="font-bebas text-white tracking-[4px]" style={{ fontSize: r.fontScale(65) }}>WELCOME</Text>
          <Text className="font-bebas text-white tracking-[4px]" style={{ fontSize: r.fontScale(60), marginLeft: r.scale(0) }}>TO</Text>
          <Text className="font-bebas text-[#FF6B1A] tracking-[4px]" style={{ fontSize: r.fontScale(60) }}>GYM TRACKER</Text>
        </Animated.View>

        <Animated.View style={{ opacity: subtitleOpacity, width: r.scale(64), height: 1, backgroundColor: 'rgba(255,107,26,0.5)', marginVertical: r.scale(2), shadowColor: '#FF6B1A', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }} />

        <Animated.View style={{ opacity: subtitleOpacity }} className="items-center mb-6">
          <Text className="font-cursive text-white/60 text-center" style={{ fontSize: r.fontScale(20) }}>
            Your journey begins with a single step.
          </Text>
          <Text className="font-cursive text-white/40 text-center" style={{ fontSize: r.fontScale(15) }} numberOfLines={1}>
            Forge the strongest version of yourself.
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: subtitleOpacity }} className="w-full px-4 mb-4">
          <View className="flex-row justify-center mb-4" style={{ gap: r.scale(6) }}>
            {[0, 1, 2, 3, 4].map(i => (
              <View key={i} style={{ width: r.scale(32), height: r.scale(4), borderRadius: r.scale(2), backgroundColor: i === 0 ? '#FF8C42' : 'rgba(255,255,255,0.3)' }} />
            ))}
          </View>
          <BlurView intensity={24} tint="dark" className="rounded-2xl overflow-hidden p-5" style={{ borderColor: 'rgba(255,107,26,0.2)', borderWidth: 1 }}>
            <Text className="text-center font-bebas tracking-[3px] mb-1" style={{ fontSize: r.fontScale(22), color: '#FF6B1A' }}>
              STEP INTO GREATNESS
            </Text>
            <Text className="text-center text-white font-mono mb-4" style={{ fontSize: r.fontScale(13) }}>
              What should we call you?
            </Text>
            <View className="border border-[#FF6B1A]/40 rounded-2xl mb-4">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#666"
                className="text-white font-mono text-center bg-transparent"
                style={{ paddingHorizontal: r.scale(16), paddingVertical: r.scale(12), fontSize: r.fontScale(16) }}
              />
            </View>
            <TouchableOpacity
              onPress={handleStart}
              activeOpacity={0.85}
              disabled={!name.trim()}
              className="rounded-2xl items-center overflow-hidden"
              style={{
                paddingVertical: r.scale(14),
                backgroundColor: name.trim() ? '#FF6B1A' : '#8B3A00',
                shadowColor: name.trim() ? '#FF6B1A' : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: name.trim() ? 0.5 : 0,
                shadowRadius: 20,
                elevation: name.trim() ? 8 : 0,
              }}
            >
              <Text className="font-bebas text-center tracking-[3px]" style={{ fontSize: r.fontScale(26), color: name.trim() ? '#000' : '#FF9A4A' }}>
                BEGIN YOUR JOURNEY
              </Text>
            </TouchableOpacity>
          </BlurView>
          <Text className="font-mono text-white/30 text-center mt-3" style={{ fontSize: r.fontScale(11) }}>
            1 of 5
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: subtitleOpacity }} className="absolute bottom-10 items-center">
          <Text className="font-mono text-white/40 tracking-[2px]" style={{ fontSize: r.fontScale(9) }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
            DISCIPLINE &bull; CONSISTENCY &bull; STRENGTH
          </Text>
        </Animated.View>
      </View>
      <View className="absolute inset-0" pointerEvents="none">
        <FloatingDumbbell size={r.scale(150)} initialX={W * -0.05} initialY={H * 0.05} speedMultiplier={2.5} />
        <FloatingDumbbell size={r.scale(40)} initialX={W * 0.8} initialY={H * 0.18} speedMultiplier={0.8} />
        <FloatingDumbbell size={r.scale(95)} initialX={W * 0.25} initialY={H * 0.31} speedMultiplier={2.0} />
        <FloatingDumbbell size={r.scale(30)} initialX={W * 0.92} initialY={H * 0.44} speedMultiplier={0.6} />
        <FloatingDumbbell size={r.scale(120)} initialX={W * -0.03} initialY={H * 0.57} speedMultiplier={1.5} />
        <FloatingDumbbell size={r.scale(50)} initialX={W * 0.6} initialY={H * 0.7} speedMultiplier={1.0} />
        <FloatingDumbbell size={r.scale(140)} initialX={W * 0.15} initialY={H * 0.83} speedMultiplier={2.2} />
        <FloatingDumbbell size={r.scale(65)} initialX={W * 0.5} initialY={H * 0.95} speedMultiplier={0.5} />
      </View>
    </View>
  )
}
