import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Dumbbell, Target, ArrowLeft } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { getExerciseImage } from './exerciseImages'

export default function ExerciseDetail({ exercise, onSelect, onBack }) {
  const imageSource = getExerciseImage(exercise.name)

  return (
    <View className="flex-1 items-center justify-center p-4">
      <View className="w-full max-w-md bg-black/60 border border-orange-500/30 rounded-2xl overflow-hidden">
        <View className="w-full h-56 bg-neutral-900">
          {imageSource ? (
            <Image source={imageSource} className="w-full h-full" resizeMode="contain" />
          ) : (
            <LinearGradient colors={['#1a1a1a', '#7c2d12']} className="w-full h-full items-center justify-center">
              <Dumbbell size={80} color="#f97316" style={{ opacity: 0.2 }} />
              <View className="absolute inset-0 items-center justify-center">
                <Text className="text-orange-400 text-lg font-mono mb-1">Exercise</Text>
                <Text className="text-white text-2xl font-bold">{exercise.name}</Text>
              </View>
            </LinearGradient>
          )}
        </View>

        <View className="p-6 space-y-4">
          <View className="flex-row items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
            <Target size={24} color="#f97316" />
            <View>
              <Text className="text-neutral-400 text-xs font-mono uppercase tracking-wider">Target Muscle</Text>
              <Text className="text-white font-semibold text-lg">{exercise.muscle}</Text>
            </View>
          </View>

          <View className="flex-row gap-3 pt-2">
            <TouchableOpacity onPress={onBack} className="flex-1 border border-neutral-600 rounded-xl py-3 items-center justify-center flex-row gap-2">
              <ArrowLeft size={20} color="white" />
              <Text className="text-white font-semibold">Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSelect(exercise)} className="flex-1 bg-orange-500 rounded-xl py-3 items-center">
              <Text className="text-black font-bold text-lg">Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}
