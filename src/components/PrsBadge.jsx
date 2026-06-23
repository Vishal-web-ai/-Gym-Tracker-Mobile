import { View, Text } from 'react-native'

export default function PrsBadge({ size = 48 }) {
  const borderW = 1
  const fontSize = size * 0.35

  return (
    <View
      className="items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: borderW,
        borderColor: '#f97316',
        backgroundColor: 'transparent',
      }}
    >
      <Text
        className="font-bebas text-orange-500"
        style={{ fontSize, lineHeight: fontSize * 1.1, letterSpacing: size * 0.04 }}
      >
        PRS
      </Text>
    </View>
  )
}
