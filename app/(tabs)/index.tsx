import { useState, useCallback, useRef, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, Animated, Easing, Dimensions, Modal, ScrollView } from 'react-native'
import { Check, Zap, BicepsFlexed, Edit3 } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter, useFocusEffect } from 'expo-router'
import ExercisesList from '../../src/components/ExercisesList'
import SessionTracker from '../../src/components/SessionTracker'
import ExerciseDetail from '../../src/components/ExerciseDetail'
import GreetingUser from '../../src/components/GreetingUser'
import Streak from '../../src/components/Streak'
import PrsBadge from '../../src/components/PrsBadge'
import { getUserName, getUserProfile, getSessions, markDayComplete } from '../../src/storage'
import { useResponsive } from '../../src/utils/responsive'
import { TourTarget, useTour } from '../../src/tour'

const { width, height } = Dimensions.get('window')
const W = width as number

export default function HomeScreen() {
  const r = useResponsive()
  const [showSession, setShowSession] = useState(false)
  const [showExercisesList, setShowExercisesList] = useState(false)
  const [selectedExercises, setSelectedExercises] = useState([])
  const [previewExercise, setPreviewExercise] = useState(null)
  const [isFromStart, setIsFromStart] = useState(false)
  const isFromStartRef = useRef(isFromStart)
  isFromStartRef.current = isFromStart
  const [exerciseWeights, setExerciseWeights] = useState({})
  const [exerciseSets, setExerciseSets] = useState({})
  const [exerciseNotes, setExerciseNotes] = useState({})
  const [exerciseMedia, setExerciseMedia] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [savedWorkoutName, setSavedWorkoutName] = useState('')
  const [monthlyCount, setMonthlyCount] = useState(0)
  const [streakRefreshKey, setStreakRefreshKey] = useState(0)
  const [prs, setPrs] = useState<{ name: string; weight: string; reps: string }[]>([])
  const [showAddPr, setShowAddPr] = useState(false)
  const [showManagePr, setShowManagePr] = useState(false)
  const [editingPrIndex, setEditingPrIndex] = useState<number | null>(null)
  const [editPrName, setEditPrName] = useState('')
  const [editPrWeight, setEditPrWeight] = useState('')
  const [editPrReps, setEditPrReps] = useState('')
  const [prName, setPrName] = useState('')
  const [prWeight, setPrWeight] = useState('')
  const [prReps, setPrReps] = useState('')
  const router = useRouter()
  const tour = useTour()
  const hideFloatAnimation = tour.isActive && tour.currentStep?.id === 'home-start-session'

  const refreshMonthlyCount = () => {
    getSessions().then(sessions => {
      const now = new Date()
      const days = new Set(sessions.filter(s => {
        const d = new Date(s.createdAt)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).map(s => new Date(s.createdAt).toDateString()))
      const count = days.size
      setMonthlyCount(count)
    })
  }

  const titleOpacity = useRef(new Animated.Value(0)).current
  const cardOpacity = useRef(new Animated.Value(0)).current
  const cardTranslate = useRef(new Animated.Value(30)).current
  const bottomOpacity = useRef(new Animated.Value(0)).current
  const bottomTranslate = useRef(new Animated.Value(20)).current
  const floatY = useRef(new Animated.Value(0)).current
  const sessionSlide = useRef(new Animated.Value(W)).current
  const bgOpacity = useRef(new Animated.Value(1)).current
  const previewScale = useRef(new Animated.Value(0.9)).current
  const previewOpacity = useRef(new Animated.Value(0)).current
  const successScale = useRef(new Animated.Value(0.3)).current
  const successOpacity = useRef(new Animated.Value(0)).current
  const managePrScale = useRef(new Animated.Value(0.3)).current
  const managePrOpacity = useRef(new Animated.Value(0)).current
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (previewExercise) {
      Animated.parallel([
        Animated.spring(previewScale, {
          toValue: 1,
          damping: 12,
          stiffness: 120,
          useNativeDriver: true,
        }),
        Animated.timing(previewOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      previewScale.setValue(0.9)
      previewOpacity.setValue(0)
    }
  }, [previewExercise])

  useEffect(() => {
    if (showSuccess) {
      Animated.sequence([
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(successScale, {
          toValue: 1,
          damping: 8,
          stiffness: 180,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      successScale.setValue(0.3)
      successOpacity.setValue(0)
    }
  }, [showSuccess])

  useEffect(() => {
    if (showManagePr) {
      managePrOpacity.setValue(0)
      managePrScale.setValue(0.3)
      Animated.parallel([
        Animated.timing(managePrOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(managePrScale, { toValue: 1, damping: 10, stiffness: 200, useNativeDriver: true }),
      ]).start()
    }
  }, [showManagePr])

  const runEntranceAnimation = useCallback(() => {
    titleOpacity.setValue(0)
    cardOpacity.setValue(0)
    cardTranslate.setValue(30)
    bottomOpacity.setValue(0)
    bottomTranslate.setValue(20)

    Animated.sequence([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslate, {
          toValue: 0,
          damping: 18,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(bottomOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(bottomTranslate, {
          toValue: 0,
          damping: 20,
          stiffness: 250,
          useNativeDriver: true,
        }),
      ]),
    ]).start()
  }, [])

  useFocusEffect(
    useCallback(() => {
      refreshMonthlyCount()
      setStreakRefreshKey(prev => prev + 1)
      if (!hasAnimated.current) {
        hasAnimated.current = true
        runEntranceAnimation()
      }
    }, [runEntranceAnimation])
  )

  const animateSession = useCallback((open) => {
    bgOpacity.setValue(open ? 1 : 0)
    Animated.timing(bgOpacity, {
      toValue: open ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
    sessionSlide.setValue(open ? W : 0)
    Animated.timing(sessionSlide, {
      toValue: open ? 0 : W,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [])

  useEffect(() => {
    Promise.all([getUserName(), getUserProfile()]).then(([name, profile]) => {
      if (!name || !profile.age) {
        router.replace('/onboarding')
      }
    })

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -8,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start()
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
        ...(prev[exerciseIdx] || {}),
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
    setTimeout(() => {
      if (tour.currentStep?.id === 'exercise-detail') tour.nextStep()
    }, 200)
  }, [tour])

  const handleCancelPreview = useCallback(() => {
    setPreviewExercise(null)
  }, [])

  const handleRemoveExercise = useCallback((idx) => {
    setSelectedExercises(prev => prev.filter((_, i) => i !== idx))
    setExerciseWeights(prev => {
      const next = {}
      Object.keys(prev).forEach(key => {
        const k = parseInt(key)
        if (k < idx) next[k] = prev[k]
        if (k > idx) next[k - 1] = prev[k]
      })
      return next
    })
    setExerciseSets(prev => {
      const next = {}
      Object.keys(prev).forEach(key => {
        const k = parseInt(key)
        if (k < idx) next[k] = prev[k]
        if (k > idx) next[k - 1] = prev[k]
      })
      return next
    })
    setExerciseNotes(prev => {
      const next = {}
      Object.keys(prev).forEach(key => {
        const k = parseInt(key)
        if (k < idx) next[k] = prev[k]
        if (k > idx) next[k - 1] = prev[k]
      })
      return next
    })
    setExerciseMedia(prev => {
      const next = {}
      Object.keys(prev).forEach(key => {
        const k = parseInt(key)
        if (k < idx) next[k] = prev[k]
        if (k > idx) next[k - 1] = prev[k]
      })
      return next
    })
  }, [])

  const handleStartClick = useCallback(() => {
    if (tour.currentStep?.id === 'home-start-session') tour.nextStep()
    animateSession(true)
    setShowSession(true)
    setShowExercisesList(true)
    setIsFromStart(true)
  }, [animateSession, tour])

  const handleAddExercises = useCallback(() => {
    setShowExercisesList(true)
    setIsFromStart(false)
  }, [])

  const handleCloseExercises = useCallback(() => {
    setShowExercisesList(false)
    if (isFromStartRef.current) {
      setSelectedExercises([])
      animateSession(false)
      setShowSession(false)
    }
  }, [animateSession])

  const handleAddPr = () => {
    if (prName.trim() && prWeight.trim() && prReps.trim()) {
      setPrs(prev => [...prev, { name: prName.trim(), weight: prWeight.trim(), reps: prReps.trim() }])
      setPrName('')
      setPrWeight('')
      setPrReps('')
      setShowAddPr(false)
    }
  }

  const handleEditPr = (i: number) => {
    const pr = prs[i]
    setEditingPrIndex(i)
    setEditPrName(pr.name)
    setEditPrWeight(pr.weight)
    setEditPrReps(pr.reps)
  }

  const handleSaveEditPr = () => {
    if (editingPrIndex === null || !editPrName.trim() || !editPrWeight.trim() || !editPrReps.trim()) return
    setPrs(prev => prev.map((pr, i) =>
      i === editingPrIndex ? { name: editPrName.trim(), weight: editPrWeight.trim(), reps: editPrReps.trim() } : pr
    ))
    setEditingPrIndex(null)
    setEditPrName('')
    setEditPrWeight('')
    setEditPrReps('')
  }

  const handleSessionSaved = useCallback((name) => {
    setSelectedExercises([])
    setExerciseWeights({})
    setExerciseSets({})
    setExerciseNotes({})
    setExerciseMedia({})
    setSavedWorkoutName(name)
    refreshMonthlyCount()
    markDayComplete(new Date())
    setStreakRefreshKey(prev => prev + 1)
    setShowSuccess(true)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(successOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(successScale, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowSuccess(false)
        animateSession(false)
        setTimeout(() => {
          setShowSession(false)
          setSavedWorkoutName('')
          setTimeout(() => {
            if (tour.currentStep?.id === 'save-session') tour.nextStep()
          }, 300)
        }, 350)
      })
    }, 1800)
  }, [animateSession, tour])

  return (
    <LinearGradient colors={['#111111', '#9a3412', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0.45, 0.86, 1]} className="flex-1">

      <View className="flex-1">
        {showSuccess && (
          <Animated.View className="absolute inset-0 items-center justify-center z-50" pointerEvents="auto" style={{ opacity: successOpacity, paddingHorizontal: r.scale(24) }}>
            <Animated.View
              className="rounded-2xl"
              style={{
                shadowColor: '#f97316',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 32,
                elevation: 16,
                transform: [{ scale: successScale }],
              }}
            >
              <View className="border border-orange-500/50 rounded-2xl items-center bg-neutral-900" style={{ padding: r.scale(32), gap: r.scale(24) }}>
                <View className="bg-orange-500 rounded-full" style={{ padding: r.scale(20) }}>
                  <Check color="black" size={r.scale(48)} />
                </View>
                <Text className="text-orange-500 font-bold text-center" style={{ fontSize: r.fontScale(36) }}>{savedWorkoutName}</Text>
                <Text className="text-white/70 font-mono tracking-wide" style={{ fontSize: r.fontScale(20) }}>Workout Saved!</Text>
              </View>
            </Animated.View>
          </Animated.View>
        )}

        <Animated.View className="absolute inset-0" pointerEvents={showSession ? 'none' : 'auto'} style={{ opacity: bgOpacity, paddingHorizontal: r.scale(24), paddingBottom: r.scale(16) }} renderToHardwareTextureAndroid={true} shouldRasterizeIOS={true}>
          <View style={{ height: r.scale(48) }} />

          <Animated.View style={{ opacity: titleOpacity, marginBottom: r.scale(24) }} className="items-center justify-center">
            <Text className="font-bebas text-orange-500 border border-orange-500 rounded-2xl tracking-wider text-center" style={{ fontSize: r.fontScale(36), paddingHorizontal: r.scale(16), paddingVertical: r.scale(6) }}>
              GYM TRACKER
            </Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslate }],
            }}
            className="w-full"
            renderToHardwareTextureAndroid={true}
            shouldRasterizeIOS={true}
          >
            <View className="relative w-full">
              <View className="absolute rounded-full" style={{ width: r.scale(288), height: r.scale(288), backgroundColor: 'rgba(249,115,22,0.025)', left: '50%', marginLeft: r.scale(-144), top: '50%', marginTop: r.scale(-144) }} pointerEvents="none" />
              <View className="absolute rounded-full" style={{ width: r.scale(192), height: r.scale(192), backgroundColor: 'rgba(249,115,22,0.045)', left: '50%', marginLeft: r.scale(-96), top: '50%', marginTop: r.scale(-96) }} pointerEvents="none" />
              <View className="absolute rounded-full" style={{ width: r.scale(112), height: r.scale(112), backgroundColor: 'rgba(249,115,22,0.07)', left: '50%', marginLeft: r.scale(-56), top: '50%', marginTop: r.scale(-56) }} pointerEvents="none" />
              <View className="absolute rounded-full" style={{ width: r.scale(56), height: r.scale(56), backgroundColor: 'rgba(249,115,22,0.12)', left: '50%', marginLeft: r.scale(-28), top: '50%', marginTop: r.scale(-28) }} pointerEvents="none" />
              <View className="rounded-2xl w-full" style={{ paddingHorizontal: r.scale(12), backgroundColor: 'rgba(10, 10, 10, 0.85)' }}>
                <GreetingUser />
            </View>
            </View>
           </Animated.View>

          <Animated.View
            style={{
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslate }],
              marginTop: r.scale(12),
            }}
            className="w-full"
            renderToHardwareTextureAndroid={true}
            shouldRasterizeIOS={true}
          >
            <View className="relative w-full">
              <View className="absolute rounded-full" style={{ width: r.scale(288), height: r.scale(288), backgroundColor: 'rgba(249,115,22,0.025)', left: '50%', marginLeft: r.scale(-144), top: '50%', marginTop: r.scale(-144) }} pointerEvents="none" />
              <View className="absolute rounded-full" style={{ width: r.scale(192), height: r.scale(192), backgroundColor: 'rgba(249,115,22,0.045)', left: '50%', marginLeft: r.scale(-96), top: '50%', marginTop: r.scale(-96) }} pointerEvents="none" />
              <View className="absolute rounded-full" style={{ width: r.scale(112), height: r.scale(112), backgroundColor: 'rgba(249,115,22,0.07)', left: '50%', marginLeft: r.scale(-56), top: '50%', marginTop: r.scale(-56) }} pointerEvents="none" />
              <View className="absolute rounded-full" style={{ width: r.scale(56), height: r.scale(56), backgroundColor: 'rgba(249,115,22,0.12)', left: '50%', marginLeft: r.scale(-28), top: '50%', marginTop: r.scale(-28) }} pointerEvents="none" />
              <TourTarget id="streak-card" spotlightRadius={24} className="border border-orange-500/30 rounded-3xl w-full" style={{ padding: r.scale(20), backgroundColor: 'rgba(10, 10, 10, 0.85)' }}>
                <Streak refreshKey={streakRefreshKey} />
              </TourTarget>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslate }],
              marginTop: r.scale(12),
              gap: r.scale(12),
            }}
            className="w-full flex-row"
            renderToHardwareTextureAndroid={true}
            shouldRasterizeIOS={true}
          >
            <View className="relative" style={{ flex: 0.4 }}>
              <View className="absolute rounded-full" style={{ width: r.scale(176), height: r.scale(176), backgroundColor: 'rgba(249,115,22,0.025)', left: '50%', marginLeft: r.scale(-88), top: '50%', marginTop: r.scale(-88) }} pointerEvents="none" />
              <View className="absolute rounded-full" style={{ width: r.scale(96), height: r.scale(96), backgroundColor: 'rgba(249,115,22,0.055)', left: '50%', marginLeft: r.scale(-48), top: '50%', marginTop: r.scale(-48) }} pointerEvents="none" />
              <View className="absolute rounded-full" style={{ width: r.scale(48), height: r.scale(48), backgroundColor: 'rgba(249,115,22,0.1)', left: '50%', marginLeft: r.scale(-24), top: '50%', marginTop: r.scale(-24) }} pointerEvents="none" />
              <TourTarget id="monthly-count" spotlightRadius={24}>
              <View
                className="border border-orange-500/30 rounded-3xl items-center justify-center w-full"
                style={{ paddingHorizontal: r.scale(16), paddingVertical: r.scale(12), height: r.scale(128), backgroundColor: 'rgba(10, 10, 10, 0.85)' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: r.scale(12), marginTop: r.scale(12), marginBottom: r.scale(8), marginLeft: r.scale(8), marginRight: r.scale(8) }}>
                <View className="border border-orange-500/50 rounded-full items-center justify-center" style={{ width: r.scale(28), height: r.scale(28) }}>
                  <BicepsFlexed size={r.scale(16)} color="#f97316" fill="#f97316" />
                </View>
                <View>
                  <Text className="font-inter text-white/40 tracking-[1px]" style={{ fontSize: r.fontScale(6) }}>WORKOUT IN</Text>
                  <Text className="font-inter text-white/40 tracking-[1px]" style={{ fontSize: r.fontScale(6) }}>THIS MONTH</Text>
                </View>
              </View>
              <Text className="font-bebas text-orange-500 tracking-[2px]" style={{ fontSize: r.fontScale(48) }}>{monthlyCount}</Text>
              <Text className="font-inter-bold text-white/50 tracking-[1px]" style={{ fontSize: r.fontScale(11), marginTop: r.scale(-12) }}>Days</Text>
            </View>
            </TourTarget>
            </View>

            <TourTarget id="pr-section" spotlightRadius={24} className="relative border border-orange-500/30 rounded-3xl w-full items-start" style={{ flex: 0.6, paddingHorizontal: r.scale(16), paddingTop: r.scale(12), paddingBottom: r.scale(12), height: r.scale(128), backgroundColor: 'rgba(10, 10, 10, 0.85)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: r.scale(4) }}>
                <PrsBadge size={r.scale(26)} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: r.scale(8) }}>
                  <TouchableOpacity onPress={() => setShowManagePr(true)} style={{ padding: r.scale(4) }}>
                    <Edit3 size={r.scale(14)} color="#f97316" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowAddPr(true)} className="bg-orange-500 rounded-full items-center justify-center" style={{ width: r.scale(20), height: r.scale(20) }}>
                    <Text className="text-black font-inter-bold leading-none" style={{ fontSize: r.fontScale(12) }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {prs.length === 0 ? (
                <Text className="font-inter text-white/30 italic text-center w-full" style={{ fontSize: r.fontScale(12) }}>Write your PR here</Text>
              ) : (
                <ScrollView className="gap-1" showsVerticalScrollIndicator={false} style={{ maxHeight: r.scale(80) }}>
                  {prs.map((pr, i) => (
                    <View key={i} className="flex-row justify-between items-center w-full">
                      <Text numberOfLines={1} className="font-mono text-gray-300 flex-1" style={{ fontSize: r.fontScale(10) }}>{pr.name}</Text>
                      <Text className="font-mono text-gray-300" style={{ fontSize: r.fontScale(10) }}>{pr.weight}kg × {pr.reps}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </TourTarget>
          </Animated.View>

          <Animated.View
            style={{
              opacity: bottomOpacity,
              transform: [{ translateY: bottomTranslate }],
              gap: r.scale(4),
            }}
            className="items-center justify-center"
          >
            <Text className="font-bebas text-white/80 text-center tracking-[2px]" style={{ fontSize: r.fontScale(40) }}>
              WHAT WILL YOU CONQUER{' '}
              <Text className="text-orange-500">TODAY?</Text>
            </Text>

            <Animated.View style={{ transform: hideFloatAnimation ? [] : [{ translateY: floatY }] }}>
              <View className="items-center justify-center">
                <TourTarget id="start-session-btn">
                <TouchableOpacity
                  onPress={handleStartClick}
                  activeOpacity={0.85}
                  className="flex-row items-center rounded-2xl bg-[#f97316] border border-[#c2410c]"
                  style={{ gap: r.scale(12), paddingHorizontal: r.scale(32), paddingVertical: r.scale(10) }}
                >
                  <Zap size={r.scale(24)} color="black" />
                  <Text className="font-bebas tracking-[2px] text-black" style={{ fontSize: r.fontScale(30) }}>Start Session</Text>
                </TouchableOpacity>
                </TourTarget>
              </View>
            </Animated.View>
          </Animated.View>

          <Animated.View style={{ opacity: bottomOpacity }} className="items-center">
            <Text numberOfLines={1} className="font-mono text-white/40 tracking-[2px]" style={{ fontSize: r.fontScale(9) }}>
              DISCIPLINE &bull; CONSISTENCY &bull; STRENGTH
            </Text>
          </Animated.View>
        </Animated.View>

        <Animated.View className="absolute inset-0" pointerEvents={showSession && !showSuccess ? 'auto' : 'none'} style={{ transform: [{ translateX: sessionSlide }], paddingHorizontal: r.scale(16), paddingBottom: r.scale(16) }}>
          {previewExercise ? (
            <Animated.View className="absolute inset-0 z-10 bg-[#050505]" style={{ opacity: previewOpacity, transform: [{ scale: previewScale }], paddingHorizontal: r.scale(16), paddingBottom: r.scale(16) }}>
              <ExerciseDetail exercise={previewExercise} onSelect={handleConfirmExercise} onBack={handleCancelPreview} />
            </Animated.View>
          ) : null}
          <View style={{ flex: 1, display: !previewExercise && showExercisesList && !showSuccess ? 'flex' : 'none' }}>
            <ExercisesList onSelectExercise={handleSelectExercise} onClose={handleCloseExercises} />
          </View>
          <View style={{ flex: 1, display: !previewExercise && !showExercisesList && !showSuccess ? 'flex' : 'none' }}>
            <SessionTracker
              exercises={selectedExercises}
              onRemove={handleRemoveExercise}
              onAddExercises={handleAddExercises}
              onSessionSaved={handleSessionSaved}
              exerciseWeights={exerciseWeights}
              exerciseSets={exerciseSets}
              exerciseNotes={exerciseNotes}
              exerciseMedia={exerciseMedia}
              setExerciseMedia={setExerciseMedia}
              setWeight={setWeight}
              setReps={setReps}
              setNotes={setNotes}
            />
          </View>
        </Animated.View>
      </View>

      <Modal visible={showAddPr} transparent animationType="slide" onRequestClose={() => setShowAddPr(false)}>
        <TouchableOpacity className="flex-1 justify-end" activeOpacity={1} onPress={() => setShowAddPr(false)}>
          <View className="bg-[#1a1a1a] rounded-t-3xl" style={{
            padding: r.scale(24),
            gap: r.scale(16),
            shadowColor: '#f97316',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 20,
          }}>
            <Text className="font-bebas text-orange-500 tracking-[2px] text-center" style={{ fontSize: r.fontScale(24) }}>ADD PERSONAL RECORD</Text>
            <TextInput
              value={prName}
              onChangeText={setPrName}
              placeholder="Exercise name"
              placeholderTextColor="#555"
              className="border border-orange-500/30 rounded-2xl text-white font-inter" style={{ paddingHorizontal: r.scale(16), paddingVertical: r.scale(12), fontSize: r.fontScale(14) }}
            />
            <View className="flex-row" style={{ gap: r.scale(12) }}>
              <TextInput
                value={prWeight}
                onChangeText={setPrWeight}
                placeholder="Weight (kg)"
                placeholderTextColor="#555"
                keyboardType="numeric"
                className="border border-orange-500/30 rounded-2xl text-white font-inter flex-1" style={{ paddingHorizontal: r.scale(16), paddingVertical: r.scale(12), fontSize: r.fontScale(14) }}
              />
              <TextInput
                value={prReps}
                onChangeText={setPrReps}
                placeholder="Reps"
                placeholderTextColor="#555"
                keyboardType="numeric"
                className="border border-orange-500/30 rounded-2xl text-white font-inter flex-1" style={{ paddingHorizontal: r.scale(16), paddingVertical: r.scale(12), fontSize: r.fontScale(14) }}
              />
            </View>
            <TouchableOpacity
              onPress={handleAddPr}
              className="bg-orange-500 rounded-2xl items-center"
              style={{
                paddingVertical: r.scale(14),
                shadowColor: '#f97316',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Text className="font-bebas text-black tracking-[2px]" style={{ fontSize: r.fontScale(20) }}>ADD PR</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showManagePr} transparent animationType="none" onRequestClose={() => { setEditingPrIndex(null); setShowManagePr(false) }}>
        <TouchableOpacity className="flex-1 justify-end" activeOpacity={1} onPress={() => { setEditingPrIndex(null); setShowManagePr(false) }}>
          <Animated.View className="flex-1 justify-end" style={{ opacity: managePrOpacity }}>
            <Animated.View className="bg-[#1a1a1a] rounded-t-3xl" style={{
              padding: r.scale(24),
              gap: r.scale(16),
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 20,
              transform: [{ scale: managePrScale }],
            }}>
              <Text className="font-bebas text-orange-500 tracking-[2px] text-center" style={{ fontSize: r.fontScale(24) }}>
                {editingPrIndex !== null ? 'EDIT PR' : 'MANAGE PRs'}
              </Text>
              {editingPrIndex !== null ? (
                <>
                  <TextInput
                    value={editPrName}
                    onChangeText={setEditPrName}
                    placeholder="Exercise name"
                    placeholderTextColor="#555"
                    className="border border-orange-500/30 rounded-2xl text-white font-inter" style={{ paddingHorizontal: r.scale(16), paddingVertical: r.scale(12), fontSize: r.fontScale(14) }}
                  />
                  <View className="flex-row" style={{ gap: r.scale(12) }}>
                    <TextInput
                      value={editPrWeight}
                      onChangeText={setEditPrWeight}
                      placeholder="Weight (kg)"
                      placeholderTextColor="#555"
                      keyboardType="numeric"
                      className="border border-orange-500/30 rounded-2xl text-white font-inter flex-1" style={{ paddingHorizontal: r.scale(16), paddingVertical: r.scale(12), fontSize: r.fontScale(14) }}
                    />
                    <TextInput
                      value={editPrReps}
                      onChangeText={setEditPrReps}
                      placeholder="Reps"
                      placeholderTextColor="#555"
                      keyboardType="numeric"
                      className="border border-orange-500/30 rounded-2xl text-white font-inter flex-1" style={{ paddingHorizontal: r.scale(16), paddingVertical: r.scale(12), fontSize: r.fontScale(14) }}
                    />
                  </View>
                  <View className="flex-row" style={{ gap: r.scale(12) }}>
                    <TouchableOpacity onPress={() => setEditingPrIndex(null)} className="flex-1 border border-orange-500/40 rounded-2xl items-center" style={{ paddingVertical: r.scale(14) }}>
                      <Text className="font-bebas text-orange-500 tracking-[2px]" style={{ fontSize: r.fontScale(18) }}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSaveEditPr} className="flex-1 bg-orange-500 rounded-2xl items-center" style={{ paddingVertical: r.scale(14) }}>
                      <Text className="font-bebas text-black tracking-[2px]" style={{ fontSize: r.fontScale(18) }}>SAVE</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : prs.length === 0 ? (
                <Text className="font-inter text-white/40 text-center" style={{ fontSize: r.fontScale(14) }}>No PRs yet. Add one!</Text>
              ) : (
                prs.map((pr, i) => (
                  <TouchableOpacity key={i} onPress={() => handleEditPr(i)} className="flex-row items-center justify-between bg-[#111] rounded-2xl border border-orange-500/20" style={{ paddingHorizontal: r.scale(16), paddingVertical: r.scale(12) }}>
                    <View>
                      <Text className="font-inter text-white" style={{ fontSize: r.fontScale(14) }}>{pr.name}</Text>
                      <Text className="font-mono text-gray-400" style={{ fontSize: r.fontScale(12) }}>{pr.weight} kg × {pr.reps}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setPrs(prev => prev.filter((_, idx) => idx !== i))}>
                      <Text className="font-inter-bold text-red-400" style={{ fontSize: r.fontScale(14) }}>Delete</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  )
}
