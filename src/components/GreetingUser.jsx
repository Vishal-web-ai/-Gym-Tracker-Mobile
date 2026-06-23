import { useState, useCallback } from 'react'
import { View, Text } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { getUserName } from '../storage'
import { fontScale } from '../utils/responsive'

export default function GreetingUser() {
  const [name, setName] = useState('')

  useFocusEffect(
    useCallback(() => {
      getUserName().then(n => { if (n) setName(n) })
    }, [])
  )

  return (
    <View className="items-center self-stretch">
      <Text className="text-white font-mono text-center" style={{ fontSize: fontScale(60), marginBottom: fontScale(-18) }}>Hello,</Text>
      <Text className="text-orange-500 font-cursive-bold text-center" style={{ fontSize: fontScale(48), marginTop: fontScale(-10) }}>{name || 'Vishal'}</Text>
    </View>
  )
}
