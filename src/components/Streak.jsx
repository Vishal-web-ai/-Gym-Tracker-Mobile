import { useState, useEffect } from 'react'
import { View, Text } from 'react-native'
import { Check } from 'lucide-react-native'
import { getStreak } from '../storage'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWeekDates() {
  const today = new Date()
  const dayIndex = today.getDay()
  const mondayOffset = (dayIndex + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - mondayOffset)

  return DAYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.getDate()
  })
}

export default function Streak() {
  const [streak, setStreak] = useState({})
  const dates = getWeekDates()

  useEffect(() => {
    loadStreak()
  }, [])

  const loadStreak = async () => {
    const data = await getStreak()
    setStreak(data) 
  }

  const isCompleted = (day) => {
    const dayMap = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' }
    return !!streak[dayMap[day]]
  }

  return (
    <View className="flex-row items-center justify-center gap-4">
      {DAYS.map((day, i) => {
        const done = isCompleted(day)
        return (
          <View key={day} className="items-center">
            <Text className="text-white/60 text-xs font-mono mb-1">{day}</Text>
            <View className={`w-10 h-10 rounded-full items-center justify-center ${done ? 'bg-orange-500' : 'border-2 border-orange-500'}`}>
              {done && <Check color="white" size={22} strokeWidth={3} />}
            </View>
            <Text className="text-white/60 text-xs font-mono mt-1">{dates[i]}</Text>
          </View>
        )
      })}
    </View>
  )
}
