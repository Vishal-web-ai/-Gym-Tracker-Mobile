import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native'
import { User, Camera, ChevronRight, ChevronLeft } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { setUserName, saveUserProfile, copyToMediaDir } from '../src/storage'

const STEPS = ['Name', 'Age', 'Height', 'Weight', 'Photo']

export default function OnboardingScreen() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [photoUri, setPhotoUri] = useState(null)
  const router = useRouter()

  const handlePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!libPerm.granted) return
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1] })
    if (!result.canceled && result.assets?.[0]) {
      const uri = await copyToMediaDir(result.assets[0].uri, 'photo')
      setPhotoUri(uri)
    }
  }

  const handleSkipPhoto = async () => {
    await setUserName(name.trim() || 'User')
    await saveUserProfile({ age, height, weight })
    router.replace('/(tabs)')
  }

  const handleFinish = async () => {
    await setUserName(name.trim() || 'User')
    await saveUserProfile({ age, height, weight, photoUri })
    router.replace('/(tabs)')
  }

  const canProceed = () => {
    switch (step) {
      case 0: return name.trim().length > 0
      case 1: return age.trim().length > 0
      case 2: return height.trim().length > 0
      case 3: return weight.trim().length > 0
      case 4: return true
      default: return false
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Text className="text-white text-2xl font-bold font-mono text-center mb-2">What's your name?</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#666"
              className="bg-black/50 border border-orange-500/30 rounded-xl px-4 py-3 text-white font-mono text-lg text-center"
              autoFocus
            />
          </>
        )
      case 1:
        return (
          <>
            <Text className="text-white text-2xl font-bold font-mono text-center mb-2">How old are you?</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="Your age"
              placeholderTextColor="#666"
              keyboardType="numeric"
              className="bg-black/50 border border-orange-500/30 rounded-xl px-4 py-3 text-white font-mono text-lg text-center"
              autoFocus
            />
          </>
        )
      case 2:
        return (
          <>
            <Text className="text-white text-2xl font-bold font-mono text-center mb-2">What's your height?</Text>
            <TextInput
              value={height}
              onChangeText={setHeight}
              placeholder="Height in cm"
              placeholderTextColor="#666"
              keyboardType="numeric"
              className="bg-black/50 border border-orange-500/30 rounded-xl px-4 py-3 text-white font-mono text-lg text-center"
              autoFocus
            />
          </>
        )
      case 3:
        return (
          <>
            <Text className="text-white text-2xl font-bold font-mono text-center mb-2">What's your weight?</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              placeholder="Weight in kg"
              placeholderTextColor="#666"
              keyboardType="numeric"
              className="bg-black/50 border border-orange-500/30 rounded-xl px-4 py-3 text-white font-mono text-lg text-center"
              autoFocus
            />
          </>
        )
      case 4:
        return (
          <>
            <Text className="text-white text-2xl font-bold font-mono text-center mb-6">Add a profile photo</Text>
            <View className="items-center gap-4">
              {photoUri ? (
                <Image source={{ uri: photoUri }} className="w-32 h-32 rounded-full border-2 border-orange-500" />
              ) : (
                <View className="w-32 h-32 rounded-full bg-orange-500/20 border-2 border-orange-500 items-center justify-center">
                  <User size={48} color="#f97316" />
                </View>
              )}
              <TouchableOpacity onPress={handlePhoto} className="border border-orange-500 rounded-xl py-3 px-6 flex-row items-center gap-2">
                <Camera size={20} color="#f97316" />
                <Text className="text-orange-500 font-mono font-bold">{photoUri ? 'Retake' : 'Take Photo'}</Text>
              </TouchableOpacity>
            </View>
          </>
        )
    }
  }

  return (
    <LinearGradient colors={['#111111', '#9a3412', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0.45, 0.86, 1]} className="flex-1">
      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
        <View className="pt-20 pb-10 items-center justify-center min-h-full">
          <View className="flex-row gap-1 mb-12">
            {STEPS.map((_, i) => (
              <View key={i} className={`h-1.5 rounded-full ${i <= step ? 'bg-orange-500' : 'bg-white/20'}`} style={{ width: 40 }} />
            ))}
          </View>

          <View
            className="border border-orange-500/50 rounded-2xl p-8 w-full items-center gap-6 bg-neutral-900"
            style={{
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            {renderStep()}

            <View className="flex-row gap-4 mt-4 w-full">
              {step > 0 && (
                <TouchableOpacity onPress={() => setStep(s => s - 1)} className="border border-orange-500/50 rounded-xl py-3 flex-1 items-center flex-row justify-center gap-1">
                  <ChevronLeft size={20} color="#f97316" />
                  <Text className="text-orange-500 font-mono font-bold">Back</Text>
                </TouchableOpacity>
              )}
              {step < 4 ? (
                <TouchableOpacity
                  onPress={() => setStep(s => s + 1)}
                  className={`rounded-xl py-3 flex-1 items-center flex-row justify-center gap-1 ${canProceed() ? 'bg-orange-500' : 'bg-orange-500/30'}`}
                  disabled={!canProceed()}
                >
                  <Text className={`font-mono font-bold ${canProceed() ? 'text-black' : 'text-orange-500/50'}`}>Next</Text>
                  <ChevronRight size={20} color={canProceed() ? 'black' : '#f97316'} />
                </TouchableOpacity>
              ) : (
                <View className="flex-row gap-4 w-full">
                  <TouchableOpacity onPress={handleSkipPhoto} className="border border-orange-500/50 rounded-xl py-3 flex-1 items-center">
                    <Text className="text-orange-500 font-mono font-bold">Skip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleFinish} className="bg-orange-500 rounded-xl py-3 flex-1 items-center">
                    <Text className="text-black font-mono font-bold">Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}
