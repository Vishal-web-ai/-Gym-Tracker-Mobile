import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Dumbbell, Target, ArrowLeft } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { getExerciseImage } from './exerciseImages'
import { scale, fontScale } from '../utils/responsive'

export default function ExerciseDetail({ exercise, onSelect, onBack }) {
  const imageSource = getExerciseImage(exercise.name)

  return (
    <View className="flex-1 items-center justify-center" style={{ padding: scale(16) }}>
      <View className="w-full bg-black/60 border border-orange-500/30 rounded-2xl overflow-hidden" style={{ maxWidth: scale(440) }}>
        <View className="w-full bg-neutral-900" style={{ height: scale(224) }}>
          {imageSource ? (
            <Image source={imageSource} className="w-full h-full" resizeMode="contain" />
          ) : (
            <LinearGradient colors={['#1a1a1a', '#7c2d12']} className="w-full h-full items-center justify-center">
              <Dumbbell size={scale(80)} color="#f97316" style={{ opacity: 0.2 }} />
              <View className="absolute inset-0 items-center justify-center">
                <Text className="text-orange-400 font-mono mb-1" style={{ fontSize: fontScale(18) }}>Exercise</Text>
                <Text className="text-white font-bold" style={{ fontSize: fontScale(24) }}>{exercise.name}</Text>
              </View>
            </LinearGradient>
          )}
        </View>

        <View style={{ padding: scale(24) }}>
          <View className="flex-row items-center bg-orange-500/10 border border-orange-500/20 rounded-xl" style={{ gap: scale(12), paddingHorizontal: scale(16), paddingVertical: scale(12) }}>
            <Target size={scale(24)} color="#f97316" />
            <View>
              <Text className="text-neutral-400 font-mono uppercase tracking-wider" style={{ fontSize: fontScale(12) }}>Target Muscle</Text>
              <Text className="text-white font-semibold" style={{ fontSize: fontScale(18) }}>{exercise.muscle}</Text>
            </View>
          </View>

          <View className="flex-row pt-2" style={{ gap: scale(12) }}>
            <TouchableOpacity onPress={onBack} className="flex-1 border border-neutral-600 rounded-xl items-center justify-center flex-row" style={{ paddingVertical: scale(12), gap: scale(8) }}>
              <ArrowLeft size={scale(20)} color="white" />
              <Text className="text-white font-semibold" style={{ fontSize: fontScale(16) }}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSelect(exercise)} className="flex-1 bg-orange-500 rounded-xl items-center" style={{ paddingVertical: scale(12) }}>
              <Text className="text-black font-bold" style={{ fontSize: fontScale(18) }}>Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}
