import { useState, useEffect, useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { scale, fontScale } from '../utils/responsive'

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function NumberOfSets({ reps, setReps, idx, placeholder = 'R', mode = 'weight' }) {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)
  const lastClickRef = useRef(0)
  const elapsedRef = useRef(0)
  const inputRef = useRef(null)

  useEffect(() => {
    elapsedRef.current = elapsed
  }, [elapsed])

  useEffect(() => {
    if (running && !paused) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running, paused])

  const handleClick = () => {
    if (mode !== 'timer') return

    const now = Date.now()
    const isDoubleClick = now - lastClickRef.current < 300
    lastClickRef.current = now

    if (isDoubleClick) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
      setRunning(false)
      setPaused(false)
      setElapsed(0)
      setReps(idx, formatTime(0))
      return
    }

    if (running && !paused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
      setPaused(true)
      setReps(idx, formatTime(elapsedRef.current))
    } else if (paused) {
      setPaused(false)
    } else {
      setRunning(true)
      setPaused(false)
    }
  }

  if (mode === 'timer') {
    const display = running ? formatTime(elapsed) : (reps && reps !== 'T' ? reps : 'T')
    return (
      <TouchableOpacity onPress={handleClick} className="bg-neutral-800 border border-orange-500/50 rounded-lg items-center justify-center" style={{ width: scale(38), height: scale(30) }}>
        <Text className="text-orange-500 text-center font-bold" style={{ fontSize: fontScale(12) }}>
          {display}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <TextInput
      ref={inputRef}
      className="bg-neutral-800 border border-orange-500/50 text-white rounded-lg text-center"
      style={{ width: scale(38), height: scale(30), color: '#FFFFFF', paddingVertical: 0, fontSize: fontScale(14) }}
      value={String(reps ?? '')}
      onChangeText={(val) => {
        if (val === '' || /^\d+$/.test(val)) {
          setReps(idx, val)
        }
      }}
      placeholder={placeholder}
      placeholderTextColor="#f97316"
      keyboardType="numeric"
    />
  )
}
