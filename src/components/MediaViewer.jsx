import { useState, useRef } from 'react'
import { View, Text, Image, TouchableOpacity, Modal } from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react-native'
import DeleteConfirmModal from './DeleteConfirmModal'
import { scale, fontScale } from '../utils/responsive'

export default function MediaViewer({ items, initialIndex = 0, onClose, onDeleteItem }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
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
        <View className="flex-row justify-between items-center" style={{ paddingHorizontal: scale(16), paddingTop: scale(48), paddingBottom: scale(8) }}>
          <View className="flex-row items-center" style={{ gap: scale(12) }}>
            <Text className="text-white" style={{ fontSize: fontScale(14) }}>
              {currentIndex + 1} / {items.length}
            </Text>
            {onDeleteItem && (
              <TouchableOpacity onPress={() => setShowDeleteModal(true)} style={{ padding: scale(4) }}>
                <Trash2 size={scale(18)} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={{ padding: scale(8) }}>
            <X size={scale(24)} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center">
          {isVideo ? (
            <Video
              ref={ref => { if (ref) videoRefs.current[current.id] = ref }}
              source={{ uri: current.uri }}
              style={{ width: scale(390), height: scale(506) }}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls
              shouldPlay
              isLooping
            />
          ) : (
            <Image
              source={{ uri: current.uri }}
              style={{ width: scale(390), height: scale(506) }}
              resizeMode="contain"
            />
          )}
        </View>

        {items.length > 1 && (
          <View className="flex-row justify-center items-center" style={{ gap: scale(24), paddingBottom: scale(32) }}>
            <TouchableOpacity
              onPress={handlePrev}
              disabled={currentIndex === 0}
              className={`rounded-full ${currentIndex === 0 ? 'opacity-30' : 'bg-orange-500/20'}`}
              style={{ padding: scale(12) }}
            >
              <ChevronLeft size={scale(28)} color="white" />
            </TouchableOpacity>

            <View className="flex-row" style={{ gap: scale(8) }}>
              {items.map((_, i) => (
                <View
                  key={i}
                  className={`rounded-full ${i === currentIndex ? 'bg-orange-500' : 'bg-white/30'}`}
                  style={{ width: scale(8), height: scale(8) }}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={handleNext}
              disabled={currentIndex === items.length - 1}
              className={`rounded-full ${currentIndex === items.length - 1 ? 'opacity-30' : 'bg-orange-500/20'}`}
              style={{ padding: scale(12) }}
            >
              <ChevronRight size={scale(28)} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <DeleteConfirmModal
        visible={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onDelete={() => {
          setShowDeleteModal(false)
          onDeleteItem(currentIndex)
        }}
      />
    </Modal>
  )
}
