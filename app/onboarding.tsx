import { useState, useRef, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Animated, Easing, Dimensions, Modal } from 'react-native'
import { Dumbbell, User, Camera, Folder, ChevronRight, ChevronLeft } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { saveUserProfile, copyToMediaDir } from '../src/storage'
import { useResponsive } from '../src/utils/responsive'

const { width, height } = Dimensions.get('window')
const W = width as number
const H = height as number

function FloatingDumbbell({ size, initialX, initialY, speedMultiplier = 1 }: {
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

export default function OnboardingScreen() {
  const r = useResponsive()
  const [step, setStep] = useState(0)
  const [age, setAge] = useState('')
  const [feet, setFeet] = useState('')
  const [inch, setInch] = useState('')
  const [weight, setWeight] = useState('')
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const router = useRouter()

  const getHeightCm = () => {
    const ft = parseInt(feet) || 0
    const inc = parseInt(inch) || 0
    return (ft * 30.48 + inc * 2.54).toFixed(0)
  }

  const pickFromCamera = async () => {
    setShowPicker(false)
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) return
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1] })
    if (!result.canceled && result.assets?.[0]) {
      const uri = await copyToMediaDir(result.assets[0].uri, 'photo')
      setPhotoUri(uri)
    }
  }

  const pickFromGallery = async () => {
    setShowPicker(false)
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) return
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1] })
    if (!result.canceled && result.assets?.[0]) {
      const uri = await copyToMediaDir(result.assets[0].uri, 'photo')
      setPhotoUri(uri)
    }
  }

  const handleSkipPhoto = async () => {
    await saveUserProfile({ age, height: getHeightCm(), weight, joinedAt: new Date().toISOString() })
    router.replace('/(tabs)')
  }

  const handleFinish = async () => {
    await saveUserProfile({ age, height: getHeightCm(), weight, photoUri, joinedAt: new Date().toISOString() })
    router.replace('/(tabs)')
  }

  const canProceed = () => {
    switch (step) {
      case 0: return age.trim().length > 0
      case 1: return feet.trim().length > 0
      case 2: return weight.trim().length > 0
      case 3: return true
      default: return false
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Text className="text-white font-bold font-mono text-center" style={{ fontSize: r.fontScale(24), marginBottom: r.scale(8) }}>How old are you?</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="Your age"
              placeholderTextColor="#666"
              keyboardType="numeric"
              className="bg-black/50 border border-orange-500/30 rounded-xl text-white font-mono text-center"
              style={{ paddingHorizontal: r.scale(16), paddingVertical: r.scale(12), fontSize: r.fontScale(18) }}
            />
          </>
        )
      case 1:
        return (
          <>
            <Text className="text-white font-bold font-mono text-center" style={{ fontSize: r.fontScale(24), marginBottom: r.scale(16) }}>What's your height?</Text>
            <View className="flex-row w-full" style={{ gap: r.scale(12) }}>
              <View className="flex-1">
                <Text className="text-white/50 font-mono text-center mb-1" style={{ fontSize: r.fontScale(12) }}>Feet</Text>
                <TextInput
                  value={feet}
                  onChangeText={setFeet}
                  placeholder="5"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  className="bg-black/50 border border-orange-500/30 rounded-xl text-white font-mono text-center"
                  style={{ paddingHorizontal: r.scale(16), paddingVertical: r.scale(12), fontSize: r.fontScale(18) }}
                />
              </View>
              <View className="flex-1">
                <Text className="text-white/50 font-mono text-center mb-1" style={{ fontSize: r.fontScale(12) }}>Inches</Text>
                <TextInput
                  value={inch}
                  onChangeText={setInch}
                  placeholder="0"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  className="bg-black/50 border border-orange-500/30 rounded-xl text-white font-mono text-center"
                  style={{ paddingHorizontal: r.scale(16), paddingVertical: r.scale(12), fontSize: r.fontScale(18) }}
                />
              </View>
            </View>
          </>
        )
      case 2:
        return (
          <>
            <Text className="text-white font-bold font-mono text-center" style={{ fontSize: r.fontScale(24), marginBottom: r.scale(8) }}>What's your weight?</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              placeholder="Weight in kg"
              placeholderTextColor="#666"
              keyboardType="numeric"
              className="bg-black/50 border border-orange-500/30 rounded-xl text-white font-mono text-center"
              style={{ paddingHorizontal: r.scale(16), paddingVertical: r.scale(12), fontSize: r.fontScale(18) }}
            />
          </>
        )
      case 3:
        return (
          <>
            <Text className="text-white font-bold font-mono text-center" style={{ fontSize: r.fontScale(24), marginBottom: r.scale(24) }}>Add a profile photo</Text>
            <View className="items-center" style={{ gap: r.scale(16) }}>
              <View className="relative">
                {photoUri ? (
                  <Image source={{ uri: photoUri }} className="rounded-full border-2 border-orange-500" style={{ width: r.scale(128), height: r.scale(128) }} />
                ) : (
                  <View className="rounded-full bg-orange-500/20 border-2 border-orange-500 items-center justify-center" style={{ width: r.scale(128), height: r.scale(128) }}>
                    <User size={r.scale(48)} color="#f97316" />
                  </View>
                )}
                <TouchableOpacity onPress={() => setShowPicker(true)} className="absolute -top-1 -right-1 bg-orange-500 rounded-full items-center justify-center" style={{ width: r.scale(32), height: r.scale(32) }}>
                  <Camera size={r.scale(18)} color="black" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleSkipPhoto} className="border border-orange-500 rounded-xl flex-row items-center" style={{ paddingVertical: r.scale(12), paddingHorizontal: r.scale(24), gap: r.scale(8) }}>
                <Text className="text-orange-500 font-mono font-bold" style={{ fontSize: r.fontScale(16) }}>Skip</Text>
              </TouchableOpacity>
            </View>
          </>
        )
    }
  }

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
          <View className="pt-20 pb-10 items-center justify-center min-h-full">
            <View className="items-center mb-4">
              <View className="flex-row justify-center" style={{ gap: r.scale(6) }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <View key={i} style={{ width: r.scale(32), height: r.scale(4), borderRadius: r.scale(2), backgroundColor: i <= step + 1 ? '#FF8C42' : 'rgba(255,255,255,0.3)' }} />
                ))}
              </View>
            </View>

            <View
              className="rounded-2xl w-full items-center gap-6"
              style={{
                padding: r.scale(20),
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,107,26,0.2)',
                borderWidth: 1,
              }}
            >
            {renderStep()}

            <View className="flex-row mt-4 w-full" style={{ gap: r.scale(16) }}>
              {step < 3 && (
                <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : router.replace('/')} className="border border-orange-500/50 rounded-xl flex-1 items-center flex-row justify-center" style={{ paddingVertical: r.scale(12), gap: r.scale(4) }}>
                  <ChevronLeft size={r.scale(20)} color="#f97316" />
                  <Text className="text-orange-500 font-mono font-bold" style={{ fontSize: r.fontScale(16) }}>Back</Text>
                </TouchableOpacity>
              )}
              {step < 3 ? (
                <TouchableOpacity
                  onPress={() => setStep(s => s + 1)}
                  className={`rounded-xl flex-1 items-center flex-row justify-center ${canProceed() ? 'bg-orange-500' : 'bg-orange-500/30'}`}
                  style={{ paddingVertical: r.scale(12), gap: r.scale(4) }}
                  disabled={!canProceed()}
                >
                  <Text className={`font-mono font-bold ${canProceed() ? 'text-black' : 'text-orange-500/50'}`} style={{ fontSize: r.fontScale(16) }}>Next</Text>
                  <ChevronRight size={r.scale(20)} color={canProceed() ? 'black' : '#f97316'} />
                </TouchableOpacity>
              ) : (
                <View className="flex-row w-full" style={{ gap: r.scale(16) }}>
                  <TouchableOpacity onPress={() => setStep(s => s - 1)} className="border border-orange-500/50 rounded-xl flex-1 items-center flex-row justify-center" style={{ paddingVertical: r.scale(12), gap: r.scale(4) }}>
                    <ChevronLeft size={r.scale(20)} color="#f97316" />
                    <Text className="text-orange-500 font-mono font-bold" style={{ fontSize: r.fontScale(16) }}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleFinish} className="bg-orange-500 rounded-xl flex-1 items-center" style={{ paddingVertical: r.scale(12) }}>
                    <Text className="text-black font-mono font-bold" style={{ fontSize: r.fontScale(16) }}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <Text className="font-mono text-white text-center mt-3" style={{ fontSize: r.fontScale(11) }}>
              {step + 2} of 5
            </Text>
          </View>
        </View>
      </ScrollView>
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
      <Modal transparent visible={showPicker} animationType="fade" onRequestClose={() => setShowPicker(false)}>
        <TouchableOpacity className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} activeOpacity={1} onPress={() => setShowPicker(false)}>
          <View className="rounded-2xl w-4/5" style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,107,26,0.3)', borderWidth: 1, padding: r.scale(24) }}>
            <Text className="text-white font-mono font-bold text-center mb-4" style={{ fontSize: r.fontScale(18) }}>Choose Profile Photo</Text>
            <TouchableOpacity onPress={pickFromCamera} className="border border-orange-500/50 rounded-xl flex-row items-center justify-center mb-3" style={{ paddingVertical: r.scale(14), gap: r.scale(8) }}>
              <Camera size={r.scale(20)} color="#f97316" />
              <Text className="text-orange-500 font-mono font-bold" style={{ fontSize: r.fontScale(16) }}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickFromGallery} className="border border-orange-500/50 rounded-xl flex-row items-center justify-center mb-3" style={{ paddingVertical: r.scale(14), gap: r.scale(8) }}>
              <Folder size={r.scale(20)} color="#f97316" />
              <Text className="text-orange-500 font-mono font-bold" style={{ fontSize: r.fontScale(16) }}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPicker(false)} className="rounded-xl items-center" style={{ paddingVertical: r.scale(12) }}>
              <Text className="text-white/50 font-mono" style={{ fontSize: r.fontScale(14) }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}
