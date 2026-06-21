import { useState, useCallback, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Check } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import ExercisesList from '../../src/components/ExercisesList'
import SessionTracker from '../../src/components/SessionTracker'
import ExerciseDetail from '../../src/components/ExerciseDetail'
import GreetingUser from '../../src/components/GreetingUser'
import Streak from '../../src/components/Streak'
import { getUserName, getUserProfile } from '../../src/storage'

export default function HomeScreen() {
  const [showSession, setShowSession] = useState(false)
  const [showExercisesList, setShowExercisesList] = useState(false)
  const [selectedExercises, setSelectedExercises] = useState([])
  const [btnActive, setBtnActive] = useState(false)
  const [previewExercise, setPreviewExercise] = useState(null)
  const [isFromStart, setIsFromStart] = useState(false)
  const isFromStartRef = useRef(isFromStart)
  isFromStartRef.current = isFromStart
  const [exerciseWeights, setExerciseWeights] = useState({})
  const [exerciseSets, setExerciseSets] = useState({})
  const [exerciseNotes, setExerciseNotes] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [savedWorkoutName, setSavedWorkoutName] = useState('')
  const router = useRouter()

  useEffect(() => {
    Promise.all([getUserName(), getUserProfile()]).then(([name, profile]) => {
      if (!name || !profile.age) {
        router.replace('/onboarding')
      }
    })
  }, [])

  const setWeight = useCallback((exerciseIdx, setIdx, weight) => {
    setExerciseWeights(prev => ({
      ...prev,
      [exerciseIdx]: {
        ...(prev[exerciseIdx] || {}),
        [setIdx]: weight
      }
    }))
  }, [])

  const setNotes = useCallback((idx, note) => {
    setExerciseNotes(prev => ({ ...prev, [idx]: note }))
  }, [])

  const setReps = useCallback((exerciseIdx, setIdx, value) => {
    setExerciseSets(prev => ({
      ...prev,
      [exerciseIdx]: {
        ...prev[exerciseIdx],
        [setIdx]: value
      }
    }))
  }, [])

  const handleSelectExercise = useCallback((exercise) => {
    setPreviewExercise(exercise)
  }, [])

  const handleConfirmExercise = useCallback((exercise) => {
    setSelectedExercises(prev => [...prev, { name: exercise.name, mode: exercise.mode || 'weight' }])
    setPreviewExercise(null)
    setShowExercisesList(false)
    setIsFromStart(false)
  }, [])

  const handleCancelPreview = useCallback(() => {
    setPreviewExercise(null)
  }, [])

  const handleRemoveExercise = useCallback((idx) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== idx))
  }, [])

  const handleStartClick = useCallback(() => {
    setBtnActive(true)
    setShowSession(true)
    setShowExercisesList(true)
    setIsFromStart(true)
  }, [])

  const handleAddExercises = useCallback(() => {
    setShowExercisesList(true)
    setIsFromStart(false)
  }, [])

  const handleCloseExercises = useCallback(() => {
    setShowExercisesList(false)
    if (isFromStartRef.current) {
      setSelectedExercises([])
      setBtnActive(false)
      setShowSession(false)
    }
  }, [])

  const handleSessionSaved = useCallback((name) => {
    setSelectedExercises([])
    setExerciseWeights({})
    setExerciseSets({})
    setExerciseNotes({})
    setSavedWorkoutName(name)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setShowSession(false)
      setBtnActive(false)
      setSavedWorkoutName('')
    }, 1800)
  }, [])

  return (
    <LinearGradient colors={['#111111', '#9a3412', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0.45, 0.86, 1]} className="flex-1">
      <View className="flex-1">
        {showSuccess && (
          <View className="absolute inset-0 items-center justify-center px-6" pointerEvents="auto">
            <View
              className="rounded-2xl"
              style={{
                shadowColor: '#f97316',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 32,
                elevation: 16,
              }}
            >
              <View className="border border-orange-500/50 rounded-2xl p-8 items-center gap-6 bg-neutral-900">
                <View className="bg-orange-500 rounded-full p-5">
                  <Check color="black" size={48} />
                </View>
                <Text className="text-orange-500 text-4xl font-bold text-center">{savedWorkoutName}</Text>
                <Text className="text-white/70 text-xl font-mono tracking-wide">Workout Saved!</Text>
              </View>
            </View>
          </View>
        )}

        <View className="absolute inset-0 px-6 pb-6" pointerEvents={showSession ? 'none' : 'auto'} style={{ opacity: showSession ? 0 : 1 }}>
          <View className="flex-[0.4]" />
          <View className="items-center gap-6">
            <Text className="font-bebas text-orange-500 text-4xl border border-orange-500 rounded-2xl px-4 py-1.5 tracking-wider text-center">
              GYM TRACKER
            </Text>
            <GreetingUser />
          </View>
          <View className="items-center mt-9 mb-4">
            <Streak />
          </View>
          <View className="flex-1" />
          <View className="items-center gap-4 pb-8">
            <View className="items-center self-stretch pb-7">
              <Text className="text-white text-4xl italic text-center flex-shrink">"Discipline today,</Text>
              <Text className="text-white text-4xl italic text-center flex-shrink"> strength tomorrow."</Text>
            </View>
            <Text className="font-bebas text-5xl text-white text-center leading-tight">
              What would you like to do{' '}
              <Text className="font-bold text-orange-500">today?</Text>
            </Text>
            <TouchableOpacity onPress={handleStartClick} className={`px-6 py-3 rounded-2xl flex-row items-center gap-3 ${btnActive ? 'bg-orange-500' : 'border border-orange-500'}`}>
              <Text className={`font-bebas text-4xl ${btnActive ? 'text-white' : 'text-orange-500'}`}>Start Session</Text>
              <Text className={`text-5xl font-semibold tracking-widest ${btnActive ? 'text-white' : 'text-orange-500'}`}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="absolute inset-0 px-4 pb-4" pointerEvents={showSession && !showSuccess ? 'auto' : 'none'} style={{ opacity: showSession && !showSuccess ? 1 : 0 }}>
          {previewExercise ? (
            <ExerciseDetail exercise={previewExercise} onSelect={handleConfirmExercise} onBack={handleCancelPreview} />
          ) : showExercisesList ? (
            <ExercisesList onSelectExercise={handleSelectExercise} onClose={handleCloseExercises} />
          ) : (
            <SessionTracker
              exercises={selectedExercises}
              onRemove={handleRemoveExercise}
              onAddExercises={handleAddExercises}
              onSessionSaved={handleSessionSaved}
              exerciseWeights={exerciseWeights}
              exerciseSets={exerciseSets}
              exerciseNotes={exerciseNotes}
              setWeight={setWeight}
              setReps={setReps}
              setNotes={setNotes}
            />
          )}
        </View>
      </View>
    </LinearGradient>
  )
}
