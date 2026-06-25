import AsyncStorage from '@react-native-async-storage/async-storage'

const KEYS = {
  completed: 'tour_completed',
  step: 'tour_step',
  active: 'tour_active',
}

export const saveTourCompleted = async () => {
  await AsyncStorage.setItem(KEYS.completed, 'true')
  await AsyncStorage.removeItem(KEYS.step)
  await AsyncStorage.setItem(KEYS.active, 'false')
}

export const isTourCompleted = async (): Promise<boolean> => {
  try {
    return await AsyncStorage.getItem(KEYS.completed) === 'true'
  } catch {
    return false
  }
}

export const saveTourStep = async (step: number) => {
  await AsyncStorage.setItem(KEYS.step, String(step))
  await AsyncStorage.setItem(KEYS.active, 'true')
}

export const getTourStep = async (): Promise<number | null> => {
  try {
    const step = await AsyncStorage.getItem(KEYS.step)
    const active = await AsyncStorage.getItem(KEYS.active)
    if (step !== null && active === 'true') {
      return parseInt(step, 10)
    }
    return null
  } catch {
    return null
  }
}

export const resetTour = async () => {
  await AsyncStorage.removeItem(KEYS.completed)
  await AsyncStorage.removeItem(KEYS.step)
  await AsyncStorage.removeItem(KEYS.active)
}
