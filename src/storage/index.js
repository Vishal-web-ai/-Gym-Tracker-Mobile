import AsyncStorage from '@react-native-async-storage/async-storage'
import { File, Directory, Paths } from 'expo-file-system'

const mediaDir = new Directory(Paths.document, 'media')

export function generateMediaId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function copyToMediaDir(sourceUri, type) {
  if (!mediaDir.exists) {
    mediaDir.create({ intermediates: true })
  }
  const ext = type === 'video' ? '.mp4' : '.jpg'
  const filename = generateMediaId() + ext
  const dest = mediaDir.uri + '/' + filename
  const sourceFile = new File(sourceUri)
  sourceFile.copy(new File(dest))
  return dest
}

export function deleteMediaFile(uri) {
  try {
    const file = new File(uri)
    if (file.exists) {
      file.delete()
    }
  } catch (e) {
    console.warn('deleteMediaFile failed:', e)
  }
}

export async function deleteSessionMediaFiles(session) {
  if (!session?.exercises) return
  for (const ex of session.exercises) {
    if (ex.media && Array.isArray(ex.media)) {
      for (const m of ex.media) {
        if (m.uri) await deleteMediaFile(m.uri)
      }
    }
  }
}

const KEYS = {
  EXERCISES: '@gymtracker/exercises',
  SESSIONS: '@gymtracker/sessions',
  USER_NAME: '@gymtracker/userName',
  USER_PROFILE: '@gymtracker/userProfile',
  STREAK: '@gymtracker/streak',
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export async function getUserName() {
  try {
    return await AsyncStorage.getItem(KEYS.USER_NAME)
  } catch {
    return null
  }
}

export async function setUserName(name) {
  try {
    await AsyncStorage.setItem(KEYS.USER_NAME, name)
  } catch (e) {
    console.warn('setUserName failed:', e)
  }
}

export async function getCustomExercises() {
  try {
    const data = await AsyncStorage.getItem(KEYS.EXERCISES)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export async function saveCustomExercise(exercise) {
  try {
    const exercises = await getCustomExercises()
    const newExercise = { ...exercise, _id: generateId(), createdAt: new Date().toISOString() }
    exercises.unshift(newExercise)
    await AsyncStorage.setItem(KEYS.EXERCISES, JSON.stringify(exercises))
    return newExercise
  } catch {
    return null
  }
}

export async function updateCustomExercise(id, updates) {
  try {
    const exercises = await getCustomExercises()
    const idx = exercises.findIndex(e => e._id === id)
    if (idx === -1) return null
    exercises[idx] = { ...exercises[idx], ...updates }
    await AsyncStorage.setItem(KEYS.EXERCISES, JSON.stringify(exercises))
    return exercises[idx]
  } catch (e) {
    console.warn('deleteCustomExercise failed:', e)
  }
}

export async function deleteCustomExercise(id) {
  try {
    const exercises = await getCustomExercises()
    const filtered = exercises.filter(e => e._id !== id)
    await AsyncStorage.setItem(KEYS.EXERCISES, JSON.stringify(filtered))
  } catch (e) {
    console.warn('deleteCustomExercise failed:', e)
  }
}

export async function getSessions() {
  try {
    const data = await AsyncStorage.getItem(KEYS.SESSIONS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export async function saveSession(session) {
  try {
    const sessions = await getSessions()
    const newSession = { ...session, _id: generateId(), createdAt: new Date().toISOString() }
    sessions.unshift(newSession)
    await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions))
    return newSession
  } catch {
    return null
  }
}

export async function updateSessionName(id, name) {
  try {
    const sessions = await getSessions()
    const idx = sessions.findIndex(s => s._id === id)
    if (idx === -1) return null
    sessions[idx] = { ...sessions[idx], name }
    await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions))
    return sessions[idx]
  } catch (e) {
    console.warn('updateSessionName failed:', e)
  }
}

export async function deleteSession(id) {
  try {
    const sessions = await getSessions()
    const target = sessions.find(s => s._id === id)
    if (target) await deleteSessionMediaFiles(target)
    const filtered = sessions.filter(s => s._id !== id)

    const targetDateKey = target?.createdAt
      ? (target.createdAt.split('T')[0])
      : null

    if (targetDateKey) {
      const hasOtherSessionsOnSameDay = filtered.some(s =>
        s.createdAt && s.createdAt.split('T')[0] === targetDateKey
      )
      if (!hasOtherSessionsOnSameDay) {
        const streak = await getStreak()
        delete streak[targetDateKey]
        await setStreak(streak)
      }
    }

    await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(filtered))
  } catch {
    // ignore
  }
}

export async function getUserProfile() {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE)
    return data ? JSON.parse(data) : {}
  } catch (e) {
    console.warn('deleteSession failed:', e)
  }
}

export async function saveUserProfile(profile) {
  try {
    const existing = await getUserProfile()
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify({ ...existing, ...profile }))
  } catch (e) {
    console.warn('saveUserProfile failed:', e)
  }
}

export async function getStreak() {
  try {
    const data = await AsyncStorage.getItem(KEYS.STREAK)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export async function setStreak(streak) {
  try {
    await AsyncStorage.setItem(KEYS.STREAK, JSON.stringify(streak))
  } catch (e) {
    console.warn('setStreak failed:', e)
  }
}

export async function getAllMedia() {
  try {
    const sessions = await getSessions()
    const allMedia = []
    for (const session of sessions) {
      if (session.exercises) {
        for (let ei = 0; ei < session.exercises.length; ei++) {
          const ex = session.exercises[ei]
          if (ex.media && Array.isArray(ex.media)) {
            for (let mi = 0; mi < ex.media.length; mi++) {
              allMedia.push({
                ...ex.media[mi],
                sessionId: session._id,
                exerciseIndex: ei,
                mediaIndex: mi,
                exerciseName: ex.name,
                sessionName: session.name,
                sessionDate: session.date,
              })
            }
          }
        }
      }
    }
    allMedia.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return allMedia
  } catch {
    return []
  }
}

export async function deleteMediaItem(sessionId, exerciseIndex, mediaIndex) {
  try {
    const sessions = await getSessions()
    const sessionIdx = sessions.findIndex(s => s._id === sessionId)
    if (sessionIdx === -1) return false
    const session = sessions[sessionIdx]
    const mediaArr = session.exercises?.[exerciseIndex]?.media
    if (!mediaArr || !mediaArr[mediaIndex]) return false
    deleteMediaFile(mediaArr[mediaIndex].uri)
    mediaArr.splice(mediaIndex, 1)
    await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions))
    return true
  } catch {
    return false
  }
}

export async function markDayComplete(date) {
  try {
    const streak = await getStreak()
    const key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
    streak[key] = true
    await setStreak(streak)
  } catch (e) {
    console.warn('markDayComplete failed:', e)
  }
}
