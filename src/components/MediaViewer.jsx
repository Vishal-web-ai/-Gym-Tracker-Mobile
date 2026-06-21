import { useState, useRef } from 'react'
import { View, Text, Image, TouchableOpacity, Modal, Dimensions } from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native'

const { width, height } = Dimensions.get('window')

export default function MediaViewer({ items, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const videoRefs = useRef({})

  const current = items[currentIndex]
  if (!current) return null

  const isVideo = current.type === 'video'

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }

  const handleNext = () => {
    if (currentIndex < items.length - 1) setCurrentIndex(currentIndex + 1)
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <View className="flex-row justify-between items-center px-4 pt-12 pb-2">
          <Text className="text-white text-sm">
            {currentIndex + 1} / {items.length}
          </Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center">
          {isVideo ? (
            <Video
              ref={ref => { if (ref) videoRefs.current[current.id] = ref }}
              source={{ uri: current.uri }}
              style={{ width, height: height * 0.6 }}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              shouldPlay
              isLooping
            />
          ) : (
            <Image
              source={{ uri: current.uri }}
              style={{ width, height: height * 0.6 }}
              resizeMode="contain"
            />
          )}
        </View>

        {items.length > 1 && (
          <View className="flex-row justify-center items-center gap-6 pb-8">
            <TouchableOpacity
              onPress={handlePrev}
              disabled={currentIndex === 0}
              className={`p-3 rounded-full ${currentIndex === 0 ? 'opacity-30' : 'bg-orange-500/20'}`}
            >
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>

            <View className="flex-row gap-2">
              {items.map((_, i) => (
                <View
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === currentIndex ? 'bg-orange-500' : 'bg-white/30'}`}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={handleNext}
              disabled={currentIndex === items.length - 1}
              className={`p-3 rounded-full ${currentIndex === items.length - 1 ? 'opacity-30' : 'bg-orange-500/20'}`}
            >
              <ChevronRight size={28} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  )
}
