import { useState, useEffect, useRef } from 'react'
import { View, Text, Animated, TouchableOpacity, Modal } from 'react-native'
import { Flame, Heart, ChevronLeft, ChevronRight } from 'lucide-react-native'
import { getStreak, getUserProfile } from '../storage'
import { scale, fontScale } from '../utils/responsive'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const CALENDAR_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDates() {
  const today = new Date()
  const dayIndex = today.getDay()
  const mondayOffset = (dayIndex + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - mondayOffset)

  return DAYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toDateKey(date) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
}

function FlameIcon() {
  const animScale = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.spring(animScale, { toValue: 1.3, damping: 8, stiffness: 200, useNativeDriver: true }),
      Animated.spring(animScale, { toValue: 1, damping: 10, stiffness: 150, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <Animated.View style={{ transform: [{ scale: animScale }] }}>
      <Flame color="white" size={scale(22)} fill="white" strokeWidth={2} />
    </Animated.View>
  )
}

function IceCube() {
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.85, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <Animated.View
      className="items-center justify-center"
      style={{
        width: scale(18),
        height: scale(18),
        borderRadius: scale(4),
        backgroundColor: '#3b82f6',
        transform: [{ scale: pulse }],
      }}
    >
      <View
        style={{
          width: scale(8),
          height: scale(8),
          borderRadius: scale(1.5),
          backgroundColor: 'white',
        }}
      />
    </Animated.View>
  )
}

function RelaxIcon() {
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <Heart color="white" size={scale(16)} fill="white" strokeWidth={2} />
    </Animated.View>
  )
}

function isToday(date) {
  const now = new Date()
  return date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
}

function isBeforeToday(date) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  date = new Date(date)
  date.setHours(0, 0, 0, 0)
  return date < now
}

function getCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const grid = []
  let row = []
  for (let i = 0; i < startOffset; i++) {
    row.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    row.push(new Date(year, month, d))
    if (row.length === 7) {
      grid.push(row)
      row = []
    }
  }
  if (row.length > 0) {
    while (row.length < 7) row.push(null)
    grid.push(row)
  }
  return grid
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function Streak({ refreshKey = 0 }) {
  const [streak, setStreak] = useState({})
  const [joinedAt, setJoinedAt] = useState(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const weekDates = getWeekDates()

  useEffect(() => {
    loadStreak()
    loadProfile()
  }, [refreshKey])

  const loadStreak = async () => {
    const data = await getStreak()
    setStreak(data)
  }

  const loadProfile = async () => {
    const profile = await getUserProfile()
    if (profile.joinedAt) {
      const d = new Date(profile.joinedAt)
      d.setHours(0, 0, 0, 0)
      setJoinedAt(d)
    }
  }

  const isDateCompleted = (date) => {
    return !!streak[toDateKey(date)]
  }

  const isBeforeJoin = (date) => {
    return joinedAt && toDateKey(date) < toDateKey(joinedAt)
  }

  const isMissed = (date) => {
    if (isDateCompleted(date)) return false
    if (isToday(date)) return false
    if (date.getDay() === 0) return false
    if (isBeforeJoin(date)) return false
    return isBeforeToday(date)
  }

  const openCalendar = () => {
    const now = new Date()
    setCalYear(now.getFullYear())
    setCalMonth(now.getMonth())
    setShowCalendar(true)
  }

  const calendarGrid = getCalendarGrid(calYear, calMonth)

  return (
    <>
      <TouchableOpacity onPress={openCalendar} activeOpacity={0.7}>
        <View className="flex-row items-center justify-center" style={{ gap: scale(16) }}>
          {weekDates.map((date, i) => {
            const done = isDateCompleted(date)
            const missed = isMissed(date)
            return (
              <View key={i} className="items-center">
                <Text className="text-white/60 font-mono mb-1" style={{ fontSize: fontScale(12) }}>{DAYS[i]}</Text>
                <View
                  className={`rounded-full items-center justify-center ${
                    done ? 'bg-orange-500' : missed ? 'border-2 border-blue-400' : isBeforeJoin(date) ? '' : 'border-2 border-orange-500'
                  }`}
                  style={{ width: scale(40), height: scale(40) }}
                >
                  {done && <FlameIcon />}
                  {missed && <IceCube />}
                </View>
                <Text className="text-white/60 font-mono mt-1" style={{ fontSize: fontScale(12) }}>{date.getDate()}</Text>
              </View>
            )
          })}
        </View>
      </TouchableOpacity>

      <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
        <View className="flex-1 bg-black/70 items-center justify-center" style={{ padding: scale(16) }}>
          <View
            className="border border-orange-500/30 rounded-3xl w-full"
            style={{
              padding: scale(20),
              maxWidth: scale(380),
              backgroundColor: 'rgba(10, 10, 10, 0.95)',
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 25,
              elevation: 15,
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity onPress={() => {
                if (calMonth === 0) { setCalYear(prev => prev - 1); setCalMonth(11) }
                else setCalMonth(prev => prev - 1)
              }} style={{ padding: scale(8) }}>
                <ChevronLeft size={scale(20)} color="#f97316" />
              </TouchableOpacity>
              <Text className="font-bebas text-orange-500 tracking-[2px]" style={{ fontSize: fontScale(20) }}>
                {MONTH_NAMES[calMonth]} {calYear}
              </Text>
              <TouchableOpacity onPress={() => {
                if (calMonth === 11) { setCalYear(prev => prev + 1); setCalMonth(0) }
                else setCalMonth(prev => prev + 1)
              }} style={{ padding: scale(8) }}>
                <ChevronRight size={scale(20)} color="#f97316" />
              </TouchableOpacity>
            </View>

            <View className="flex-row mb-2">
              {CALENDAR_DAYS.map(d => (
                <View key={d} className="flex-1 items-center">
                  <Text className="text-white/40 font-mono" style={{ fontSize: fontScale(10) }}>{d}</Text>
                </View>
              ))}
            </View>

            {calendarGrid.map((week, wi) => (
              <View key={wi} className="flex-row">
                {week.map((date, di) => {
                  if (!date) return <View key={`${wi}-${di}`} className="flex-1" style={{ height: scale(40) }} />
                  const isTodayDate = isToday(date)
                  const completed = isDateCompleted(date)
                  const missed = isMissed(date)
                  const isSunday = date.getDay() === 0
                  const isPastOrToday = isBeforeToday(date) || isTodayDate
                  const afterJoin = joinedAt ? toDateKey(date) >= toDateKey(joinedAt) : true

                  if (!afterJoin) return <View key={`${wi}-${di}-empty`} className="flex-1" style={{ height: scale(40) }} />

                  return (
                    <View key={toDateKey(date)} className="flex-1 items-center" style={{ paddingVertical: scale(2) }}>
                      <View
                        className={`rounded-full items-center justify-center ${
                          completed ? 'bg-orange-500' : (isSunday && isPastOrToday && afterJoin) ? 'bg-green-500' : missed ? 'bg-blue-500' : isTodayDate ? 'border-2 border-orange-500' : ''
                        }`}
                        style={{ width: scale(36), height: scale(36) }}
                      >
                        {completed && <Flame color="white" size={scale(16)} fill="white" strokeWidth={2} />}
                        {(isSunday && isPastOrToday && afterJoin) && <RelaxIcon />}
                        {missed && (
                          <View style={{ width: scale(8), height: scale(8), borderRadius: scale(1.5), backgroundColor: 'white' }} />
                        )}
                        {!completed && !(isSunday && isPastOrToday && afterJoin) && !missed && (
                          <Text className={`font-mono ${isTodayDate ? 'text-orange-500' : 'text-white/30'}`} style={{ fontSize: fontScale(11) }}>
                            {date.getDate()}
                          </Text>
                        )}
                      </View>
                    </View>
                  )
                })}
              </View>
            ))}

            <TouchableOpacity
              onPress={() => setShowCalendar(false)}
              className="mt-4 border border-orange-500/40 rounded-2xl items-center"
              style={{ paddingVertical: scale(10) }}
            >
              <Text className="font-bebas text-orange-500 tracking-[2px]" style={{ fontSize: fontScale(18) }}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  )
}
