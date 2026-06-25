import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useRouter } from 'expo-router'
import { TargetRect, TourStep } from './types'
import { TOUR_STEPS } from './tourSteps'
import { saveTourStep, saveTourCompleted, getTourStep, isTourCompleted, resetTour } from './tourStorage'

interface TourContextValue {
  isActive: boolean
  isCompleted: boolean
  currentStepIndex: number
  currentStep: TourStep | null
  registeredTargets: Record<string, TargetRect>
  registerTarget: (id: string, rect: TargetRect) => void
  unregisterTarget: (id: string) => void
  nextStep: () => void
  skipTour: () => void
  completeTour: () => void
  startTour: () => void
  goToStep: (index: number) => void
  checking: boolean
}

const TourContext = createContext<TourContextValue | null>(null)

export function TourProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(true)
  const [checking, setChecking] = useState(true)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [registeredTargets, setRegisteredTargets] = useState<Record<string, TargetRect>>({})

  useEffect(() => {
    checkTourState()
  }, [])

  const checkTourState = async () => {
    const completed = await isTourCompleted()
    setIsCompleted(completed)
    if (!completed) {
      const savedStep = await getTourStep()
      if (savedStep !== null) {
        await resetTour()
        setCurrentStepIndex(0)
        setIsActive(true)
        await saveTourStep(0)
      }
    }
    setChecking(false)
  }

  const currentStep = isActive ? TOUR_STEPS[currentStepIndex] || null : null

  const registerTarget = useCallback((id: string, rect: TargetRect) => {
    setRegisteredTargets(prev => ({ ...prev, [id]: rect }))
  }, [])

  const unregisterTarget = useCallback((id: string) => {
    setRegisteredTargets(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const goToStep = useCallback(async (index: number) => {
    const step = TOUR_STEPS[index]
    if (!step) return

    setCurrentStepIndex(index)
    await saveTourStep(index)

    if (step.screen === 'exercise-list') {
      // Already on exercise list - do nothing
    } else if (step.screen === 'exercise-detail') {
      // Already on exercise detail - do nothing
    } else if (step.screen === 'create-exercise') {
      // The create exercise form is already open
    } else if (step.screen === 'session-tracker') {
      // Already on session tracker
    } else if (step.screen === 'history') {
      router.navigate('/(tabs)/history' as any)
    } else if (step.screen === 'profile') {
      router.navigate('/(tabs)/profile' as any)
    } else if (step.screen === 'home' && step.id !== 'home-start-session') {
      router.navigate('/(tabs)' as any)
    } else if (step.screen === 'complete') {
      router.navigate('/(tabs)' as any)
      // Modal stays visible until user taps Start Training/Explore App
    }
  }, [router])

  const nextStep = useCallback(async () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex >= TOUR_STEPS.length) {
      await saveTourCompleted()
      setIsCompleted(true)
      setIsActive(false)
      return
    }
    await goToStep(nextIndex)
  }, [currentStepIndex, goToStep])

  const skipTour = useCallback(async () => {
    await saveTourCompleted()
    setIsCompleted(true)
    setIsActive(false)
  }, [])

  const completeTour = skipTour

  const startTour = useCallback(async () => {
    setIsCompleted(false)
    setIsActive(true)
    setCurrentStepIndex(0)
    await saveTourStep(0)
  }, [])

  return (
    <TourContext.Provider
      value={{
        isActive,
        isCompleted,
        currentStepIndex,
        currentStep,
        registeredTargets,
        registerTarget,
        unregisterTarget,
        nextStep,
        skipTour,
        completeTour,
        startTour,
        goToStep,
        checking,
      }}
    >
      {children}
    </TourContext.Provider>
  )
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext)
  if (!ctx) {
    throw new Error('useTour must be used within a TourProvider')
  }
  return ctx
}
