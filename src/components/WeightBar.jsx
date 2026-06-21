import { useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'

const weights = [
  '2.5kg', '5kg', '7.5kg', '10kg', '12.5kg', '15kg', '17.5kg', '20kg',
  '22.5kg', '25kg', '27.5kg', '30kg', '35kg', '40kg', '45kg', '50kg',
  '55kg', '60kg', '70kg', '80kg', '90kg', '100kg', '110kg', '120kg',
  '140kg', '160kg', '180kg', '200kg'
]

export default function WeightBar({ id, openDropdown, setOpenDropdown, weight, setWeight, mode, onModeChange }) {
  const isOpen = openDropdown === id
  const lastClick = useRef(0)

  const handleClick = () => {
    if (mode === 'timer') {
      const now = Date.now()
      if (now - lastClick.current < 300) {
        lastClick.current = 0
        onModeChange?.('weight')
        setOpenDropdown(null)
      } else {
        lastClick.current = now
      }
      return
    }

    const now = Date.now()
    if (now - lastClick.current < 300) {
      lastClick.current = 0
      onModeChange?.('timer')
      setOpenDropdown(null)
    } else {
      lastClick.current = now
      setOpenDropdown(prev => prev === id ? null : id)
    }
  }

  return (
    <View className="relative">
      <TouchableOpacity onPress={handleClick} className="border border-amber-800 px-3 py-1 rounded-lg">
        <Text className="text-white font-semibold">
          {mode === 'timer' ? 'Timer' : (weight || 'Weight')}
        </Text>
      </TouchableOpacity>
      {isOpen && mode !== 'timer' && (
        <View className="absolute top-full left-0 bg-orange-900 w-44 rounded-lg z-50 shadow-lg mt-2" style={{ maxHeight: 224 }}>
          <ScrollView className="p-3" nestedScrollEnabled>
            <TextInput
              placeholder="Custom weight..."
              placeholderTextColor="#f97316"
              className="bg-orange-700 text-white px-3 py-2 rounded-lg font-semibold mb-2"
              keyboardType="numeric"
              onSubmitEditing={(e) => {
                if (e.nativeEvent.text) {
                  setWeight(id, e.nativeEvent.text + 'kg')
                  setOpenDropdown(null)
                }
              }}
              onBlur={(e) => {
                if (e.nativeEvent.text) {
                  setWeight(id, e.nativeEvent.text + 'kg')
                  setOpenDropdown(null)
                }
              }}
            />
            <View className="border-t border-orange-700 my-1" />
            {weights.map((w) => (
              <TouchableOpacity
                key={w}
                onPress={() => {
                  setWeight(id, w)
                  setOpenDropdown(null)
                }}
                className={`px-3 py-2 rounded-lg ${weight === w ? 'bg-white' : 'bg-orange-600'}`}
              >
                <Text className={`font-semibold ${weight === w ? 'text-black' : 'text-black'}`}>{w}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}
