import { View, Text, TouchableOpacity, Modal } from 'react-native'
import { Trash2 } from 'lucide-react-native'
import { scale, fontScale } from '../utils/responsive'

export default function DeleteConfirmModal({ visible, message, onCancel, onDelete }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity className="flex-1 items-center justify-center bg-black/70" activeOpacity={1} onPress={onCancel} style={{ paddingHorizontal: scale(24) }}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}} className="bg-neutral-800 border border-orange-500/50 rounded-2xl w-full" style={{ padding: scale(24), maxWidth: scale(380), shadowColor: '#f97316', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 12 }}>
          <View className="items-center mb-5">
            <View className="bg-red-500/10 rounded-full items-center justify-center mb-3" style={{ width: scale(56), height: scale(56) }}>
              <Trash2 size={scale(28)} color="#ef4444" />
            </View>
            <Text className="text-white font-bold font-mono" style={{ fontSize: fontScale(18) }}>Delete Media</Text>
            <Text className="text-white/60 font-mono mt-2 text-center" style={{ fontSize: fontScale(14) }}>
              {message || 'Remove this photo/video?'}
            </Text>
          </View>

          <View className="flex-row" style={{ gap: scale(12) }}>
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 border border-orange-500/40 rounded-xl items-center"
              style={{ paddingVertical: scale(14) }}
            >
              <Text className="text-orange-500 font-mono font-bold" style={{ fontSize: fontScale(16) }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDelete}
              className="flex-1 bg-red-500 rounded-xl items-center"
              activeOpacity={0.8}
              style={{ paddingVertical: scale(14) }}
            >
              <Text className="text-white font-mono font-bold" style={{ fontSize: fontScale(16) }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}
