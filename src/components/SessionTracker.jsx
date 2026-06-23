import { useState, useEffect, useRef, memo } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert, Animated } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { Camera, Video, FileEdit } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import NumberOfSets from './NumberOfSets'
import AnimatedStaggerCard from './AnimatedStaggerCard'
import MediaViewer from './MediaViewer'
import { saveSession, copyToMediaDir } from '../storage'
import { scale, fontScale } from '../utils/responsive'

function WeightCell({ value, onChangeText }) {
  return (
    <TextInput
      className="bg-neutral-800 border border-orange-500/50 text-white rounded-lg text-center"
      style={{ width: scale(38), height: scale(30), color: '#FFFFFF', paddingVertical: 0, fontSize: fontScale(14) }}
      value={String(value ?? '')}
      onChangeText={(val) => onChangeText(val)}
      placeholder="0"
      placeholderTextColor="#f97316"
      keyboardType="numeric"
    />
  )
}

function SessionTracker({ exercises, onRemove, onAddExercises, onSessionSaved, exerciseWeights, exerciseSets, exerciseNotes, exerciseMedia, setExerciseMedia, setWeight, setReps, setNotes }) {
  const [showNameModal, setShowNameModal] = useState(false)
  const [workoutName, setWorkoutName] = useState('')
  const popScale = useRef(new Animated.Value(0)).current
  const popOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (showNameModal) {
      Animated.parallel([
        Animated.spring(popScale, {
          toValue: 1,
          damping: 10,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(popOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      popScale.setValue(0)
      popOpacity.setValue(0)
    }
  }, [showNameModal])
  const [showNotes, setShowNotes] = useState({})
  const [mediaViewer, setMediaViewer] = useState({ open: false, items: [], index: 0 })
  const [captureModal, setCaptureModal] = useState({ visible: false, exerciseIdx: null, type: null })
  const [timers, setTimers] = useState({})
  const timerIntervals = useRef({})
  const timerLastClick = useRef({})

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const getTimer = (idx) => timers[idx] || { elapsed: 0, running: false, paused: false }

  useEffect(() => {
    const ids = timerIntervals.current
    Object.keys(timers).forEach(idx => {
      const t = timers[idx]
      if (t.running && !t.paused) {
        if (!ids[idx]) {
          ids[idx] = setInterval(() => {
            setTimers(prev => {
              const cur = prev[idx]
              if (!cur || !cur.running || cur.paused) return prev
              return { ...prev, [idx]: { ...cur, elapsed: cur.elapsed + 1 } }
            })
          }, 1000)
        }
      } else if (ids[idx]) {
        clearInterval(ids[idx])
        delete ids[idx]
      }
    })
  }, [timers])

  useEffect(() => {
    return () => { Object.values(timerIntervals.current).forEach(clearInterval) }
  }, [])

  const handleTimerClick = (idx) => {
    const now = Date.now()
    const lastClick = timerLastClick.current[idx] || 0
    timerLastClick.current[idx] = now
    const isDoubleClick = now - lastClick < 300

    if (isDoubleClick) {
      if (timerIntervals.current[idx]) clearInterval(timerIntervals.current[idx])
      delete timerIntervals.current[idx]
      setTimers(prev => ({ ...prev, [idx]: { elapsed: 0, running: false, paused: false } }))
      return
    }

    const t = getTimer(idx)
    if (t.running && !t.paused) {
      if (timerIntervals.current[idx]) clearInterval(timerIntervals.current[idx])
      delete timerIntervals.current[idx]
      setTimers(prev => ({ ...prev, [idx]: { ...(prev[idx] || { elapsed: 0 }), running: true, paused: true } }))
    } else if (t.paused) {
      setTimers(prev => ({ ...prev, [idx]: { ...(prev[idx] || { elapsed: 0 }), running: true, paused: false } }))
    } else {
      setTimers(prev => ({ ...prev, [idx]: { elapsed: 0, running: true, paused: false } }))
    }
  }

  const handleCapturePress = (exerciseIdx, type) => {
    setCaptureModal({ visible: true, exerciseIdx, type })
  }

  const handleCaptureAction = async (action) => {
    const { exerciseIdx, type } = captureModal
    setCaptureModal({ visible: false, exerciseIdx: null, type: null })

    if (action === 'cancel') return

    const isCamera = action === 'camera'

    if (isCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync()
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Camera access is required.')
        return
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Gallery access is required.')
        return
      }
    }

    const result = isCamera
      ? type === 'photo'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
        : await ImagePicker.launchCameraAsync({ mediaTypes: ['videos'], videoMaxDuration: 60, quality: 0.7 })
      : type === 'photo'
        ? await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], quality: 0.7 })

    if (!result.canceled && result.assets?.[0]) {
      const uri = await copyToMediaDir(result.assets[0].uri, type)
      addMedia(exerciseIdx, type, uri)
    }
  }

  const addMedia = (exerciseIdx, type, uri) => {
    const item = { id: Date.now().toString(36), type, uri, createdAt: new Date().toISOString() }
    setExerciseMedia(prev => ({
      ...prev,
      [exerciseIdx]: [...(prev[exerciseIdx] || []), item]
    }))
  }

  const removeMedia = (exerciseIdx, mediaId) => {
    setExerciseMedia(prev => {
      const items = (prev[exerciseIdx] || []).filter(m => m.id !== mediaId)
      return { ...prev, [exerciseIdx]: items }
    })
  }

  const handleSaveClick = () => {
    setWorkoutName('')
    setShowNameModal(true)
  }

  const handleConfirmSave = async () => {
    if (exercises.length === 0) return
    setShowNameModal(false)
    const now = new Date()
    const session = {
      date: now.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      }),
      name: workoutName.trim() || 'Workout',
      exercises: exercises.map((exercise, idx) => ({
        name: exercise.name,
        mode: exercise.mode || 'weight',
        sets: (exercise.mode || 'weight') === 'weight'
          ? [0, 1, 2].map(setIdx => ({
              reps: exerciseSets[idx]?.[setIdx] || '—',
              weight: exerciseWeights[idx]?.[setIdx] ? exerciseWeights[idx][setIdx] + 'kg' : '—'
            }))
          : [exerciseSets[idx]?.[0] || '—', exerciseSets[idx]?.[1] || '—', exerciseSets[idx]?.[2] || '—'],
        notes: exerciseNotes?.[idx] || '',
        media: exerciseMedia[idx] || []
      }))
    }
    await saveSession(session)
    if (onSessionSaved) onSessionSaved(workoutName.trim() || 'Workout')
  }

  return (
    <View className="flex-1 w-full">
      <View style={{ paddingHorizontal: scale(20), paddingTop: scale(20), paddingBottom: scale(12) }}>
        <TouchableOpacity onPress={onAddExercises} className="border border-orange-500 rounded-xl" style={{ paddingVertical: scale(12), marginTop: scale(40) }}>
          <Text className="text-orange-500 text-center font-bebas" style={{ fontSize: fontScale(30) }}>Add Exercises</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" style={{ paddingHorizontal: scale(20) }} showsVerticalScrollIndicator={false}>
        {exercises.length > 0 ? (
          exercises.map((exercise, idx) => (
            <Swipeable key={idx} renderRightActions={(progress, dragX) => {
              const translateX = dragX.interpolate({
                inputRange: [-80, 0],
                outputRange: [0, 80],
                extrapolate: 'clamp',
              })
              return (
                <Animated.View style={{ transform: [{ translateX }] }} className="justify-center items-end mr-3">
                  <View className="bg-red-500/90 rounded-lg h-full justify-center" style={{ paddingHorizontal: scale(20) }}>
                    <Text className="text-white font-bebas" style={{ fontSize: fontScale(18) }}>Delete</Text>
                  </View>
                </Animated.View>
              )
            }} onSwipeableWillOpen={() => onRemove(idx)} rightThreshold={80} containerStyle={{ marginBottom: 12 }}>
              <AnimatedStaggerCard index={idx} className="flex-col gap-0 bg-orange-500/10 border border-orange-500/50 rounded-lg relative" style={{ padding: scale(12) }}>
              <View className="flex-row items-center">
                <Text className="text-orange-400 font-bebas pb-1 flex-1 mr-2" style={{ fontSize: fontScale(24) }} numberOfLines={1}>{exercise.name}</Text>
                <View className="flex-row items-center border border-orange-500/40 rounded-lg mb-2 flex-shrink-0" style={{ paddingHorizontal: scale(8), paddingVertical: scale(4), gap: scale(12) }}>
                  <TouchableOpacity onPress={() => handleCapturePress(idx, 'photo')}>
                    <Camera size={scale(20)} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleCapturePress(idx, 'video')}>
                    <Video size={scale(20)} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowNotes(prev => ({ ...prev, [idx]: !prev[idx] }))}>
                    <FileEdit size={scale(17)} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
              <View className="flex-row items-center relative">
                <Text className="text-orange-500/60 font-bebas" style={{ fontSize: fontScale(12), width: scale(48) }}>Sets</Text>
                <View className="flex-row flex-1" style={{ gap: scale(12) }}>
                  {[0, 1, 2].map(setIdx => {
                    const mode = exercise.mode || 'weight'
                    return (
                      <NumberOfSets
                        key={setIdx}
                        reps={exerciseSets[idx]?.[setIdx] || ''}
                        setReps={(_, val) => setReps(idx, setIdx, val)}
                        idx={setIdx}
                        placeholder={mode === 'timer' ? 'T' : 'R'}
                        mode={mode}
                      />
                    )
                  })}
                </View>
                <TouchableOpacity onPress={() => handleTimerClick(idx)} className="border border-orange-500/40 bg-orange-500/20 rounded mr-2" style={{ paddingHorizontal: scale(12), paddingVertical: scale(4) }}>
                  <Text className="text-orange-400 font-bebas" style={{ fontSize: fontScale(18) }}>{formatTime(getTimer(idx).elapsed)}</Text>
                </TouchableOpacity>
              </View>
              {(exercise.mode || 'weight') === 'weight' && (
                <View className="flex-row items-center">
                  <Text className="text-orange-500/60 font-bebas" style={{ fontSize: fontScale(12), width: scale(48) }}>Weight</Text>
                  <View className="flex-row flex-1" style={{ gap: scale(12) }}>
                    {[0, 1, 2].map(setIdx => {
                      return (
                        <WeightCell
                          key={setIdx}
                          value={exerciseWeights[idx]?.[setIdx] || ''}
                          onChangeText={(val) => setWeight(idx, setIdx, val)}
                        />
                      )
                    })}
                  </View>
                </View>
              )}
              {exerciseMedia[idx]?.length > 0 && (
                <View className="flex-row items-center justify-end mt-2">
                  <TouchableOpacity onPress={() => setExerciseMedia(prev => ({ ...prev, [idx]: [] }))} className="mr-2">
                    <Text className="text-red-500 font-bebas" style={{ fontSize: fontScale(18) }}>x</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setMediaViewer({ open: true, items: exerciseMedia[idx], index: 0 })}
                    className="border border-orange-500/40 bg-orange-500/20 rounded" style={{ paddingHorizontal: scale(8), paddingVertical: scale(4) }}
                  >
                    <Text className="text-orange-400 font-bebas" style={{ fontSize: fontScale(15) }}>Media({exerciseMedia[idx].length})</Text>
                  </TouchableOpacity>
                </View>
              )}
              {showNotes[idx] && (
                <TextInput
                  value={exerciseNotes?.[idx] || ''}
                  onChangeText={(val) => setNotes(idx, val)}
                  placeholder="Notes..."
                  placeholderTextColor="#737373"
                  className="bg-neutral-900 text-white border border-orange-500/30 rounded-lg mt-2"
                  style={{ fontSize: fontScale(14), paddingHorizontal: scale(12), paddingVertical: scale(8) }}
                  multiline
                />
              )}

            </AnimatedStaggerCard>
            </Swipeable>
          ))
        ) : (
          <Text className="text-orange-500/50 text-center font-bebas" style={{ paddingVertical: scale(40), fontSize: fontScale(18) }}>No exercises yet. Tap Add Exercises to start.</Text>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: scale(20), paddingBottom: scale(20), paddingTop: scale(12) }}>
        <TouchableOpacity
          onPress={handleSaveClick}
          disabled={exercises.length === 0}
          activeOpacity={0.85}
          className={`bg-[#f97316] border border-[#c2410c] rounded-2xl items-center ${exercises.length === 0 ? 'opacity-30' : ''}`}
          style={{ paddingVertical: scale(14) }}
        >
          <Text className="text-black font-bebas" style={{ fontSize: fontScale(30) }}>Save</Text>
        </TouchableOpacity>
      </View>

      {mediaViewer.open && (
        <MediaViewer
          items={mediaViewer.items}
          initialIndex={mediaViewer.index} 
          onClose={() => setMediaViewer({ open: false, items: [], index: 0 })}
        />
      )}

      <Modal visible={showNameModal} transparent animationType="none">
        <View className="flex-1 bg-black/60 items-center justify-center" style={{ padding: scale(16) }}>
          <Animated.View className="bg-neutral-800 border border-orange-500/40 rounded-2xl w-full" style={{ padding: scale(24), maxWidth: scale(380), opacity: popOpacity, transform: [{ scale: popScale }] }}>
            <Text className="text-white font-bebas mb-4" style={{ fontSize: fontScale(20) }}>Name this workout</Text>
            <TextInput
              value={workoutName}
              onChangeText={setWorkoutName}
              placeholder="e.g. Chest Day, Push Day..."
              placeholderTextColor="#737373"
              className="bg-neutral-900 text-white border border-orange-500/30 rounded-xl font-mono"
              style={{ paddingHorizontal: scale(16), paddingVertical: scale(12), fontSize: fontScale(16) }}
              autoFocus
              onSubmitEditing={handleConfirmSave}
            />
            <View className="flex-row mt-6" style={{ gap: scale(12) }}>
              <TouchableOpacity onPress={() => setShowNameModal(false)} className="flex-1 border border-neutral-600 rounded-xl items-center" style={{ paddingVertical: scale(12) }}>
                <Text className="text-white font-bebas" style={{ fontSize: fontScale(16) }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmSave} className="flex-1 bg-orange-500 rounded-xl items-center" style={{ paddingVertical: scale(12) }}>
                <Text className="text-black font-bebas" style={{ fontSize: fontScale(16) }}>Save</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={captureModal.visible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center" style={{ padding: scale(16) }}>
          <View className="bg-neutral-800 border border-orange-500/40 rounded-2xl w-full" style={{ padding: scale(24), maxWidth: scale(380) }}>
            <Text className="text-white font-bebas text-center mb-4" style={{ fontSize: fontScale(20) }}>{captureModal.type === 'photo' ? 'Add Photo' : 'Add Video'}</Text>
            <TouchableOpacity onPress={() => handleCaptureAction('camera')} className="bg-orange-500 rounded-xl items-center mb-3" style={{ paddingVertical: scale(12) }}>
              <Text className="text-black font-bebas" style={{ fontSize: fontScale(18) }}>{captureModal.type === 'photo' ? 'Take Photo' : 'Record Video'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCaptureAction('gallery')} className="border border-orange-500/40 rounded-xl items-center mb-3" style={{ paddingVertical: scale(12) }}>
              <Text className="text-orange-500 font-bebas" style={{ fontSize: fontScale(18) }}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCaptureAction('cancel')} className="border border-neutral-600 rounded-xl items-center" style={{ paddingVertical: scale(12) }}>
              <Text className="text-white/60 font-bebas" style={{ fontSize: fontScale(18) }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default memo(SessionTracker)
