import { useState, useEffect } from 'react'
import { View, Text } from 'react-native'
import { getUserName } from '../storage'

export default function GreetingUser() {
  const [name, setName] = useState('')

  useEffect(() => {
    getUserName().then(n => { if (n) setName(n) })
  }, [])

  return (
    <View className="items-center self-stretch">
      <Text className="text-white text-6xl font-mono text-center">Hello,</Text>
      <Text className="text-orange-500 text-5xl font-cursive-bold text-center">{name || 'Vishal'}</Text>
    </View>
  )
}
