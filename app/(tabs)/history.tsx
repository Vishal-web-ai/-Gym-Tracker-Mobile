import { useState, useCallback, useRef } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useFocusEffect } from 'expo-router'
import SavedSession from '../../src/components/SavedSession'
import { getSessions, deleteSession } from '../../src/storage'
import { useResponsive } from '../../src/utils/responsive'

export default function HistoryScreen() {
  const r = useResponsive()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(false)
  const focusCount = useRef(0)

  const fetchSessions = async () => {
    setLoading(true)
    const s = await getSessions()
    setSessions(s)
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      focusCount.current += 1
      fetchSessions()
    }, [])
  )

  const handleDelete = async (id) => {
    await deleteSession(id)
    setSessions(prev => prev.filter(s => s._id !== id))
  }

  const handleNeedRefresh = () => {
    fetchSessions()
  }

  return (
    <LinearGradient colors={['#111111', '#9a3412', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0.45, 0.86, 1]} className="flex-1">
      <View className="flex-1" style={{ paddingTop: r.scale(48) }}>
        <View style={{ paddingHorizontal: r.scale(20), paddingBottom: r.scale(8) }}>
          <Text className="text-white font-bold" style={{ fontSize: r.fontScale(24) }}>Previous Sessions</Text>
        </View>
        <ScrollView className="flex-1" style={{ paddingHorizontal: r.scale(20) }}>
          {loading ? (
            <Text className="text-orange-500/50 text-center font-mono" style={{ fontSize: r.fontScale(16) }}>Loading...</Text>
          ) : (
            <SavedSession sessions={sessions} onDelete={handleDelete} focusCount={focusCount.current} onNeedRefresh={handleNeedRefresh} />
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  )
}
