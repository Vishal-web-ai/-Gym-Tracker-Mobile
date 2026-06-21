import { useState, useCallback } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from 'expo-router'
import SavedSession from '../../src/components/SavedSession'
import AnimatedStaggerCard from '../../src/components/AnimatedStaggerCard'
import { getSessions, deleteSession } from '../../src/storage'

export default function HistoryScreen() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchSessions = async () => {
    setLoading(true)
    const s = await getSessions()
    setSessions(s)
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      fetchSessions()
    }, [])
  )

  const handleDelete = async (id) => {
    await deleteSession(id)
    setSessions(prev => prev.filter(s => s._id !== id))
  }

  return (
    <LinearGradient colors={['#111111', '#9a3412', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0.45, 0.86, 1]} className="flex-1">
      <AnimatedStaggerCard direction="right" index={0} className="flex-1 pt-12">
        <View className="px-5 pb-2">
          <Text className="text-white text-2xl font-bold">Previous Sessions</Text>
        </View>
        <ScrollView className="flex-1 px-5">
          {loading ? (
            <Text className="text-orange-500/50 text-center font-mono">Loading...</Text>
          ) : (
            <SavedSession sessions={sessions} onDelete={handleDelete} />
          )}
        </ScrollView>
      </AnimatedStaggerCard>
    </LinearGradient>
  )
}
