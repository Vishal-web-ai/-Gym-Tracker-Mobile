import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native'
import { Camera, Video, FileEdit } from 'lucide-react-native'
import * as ImagePicker from 'expo-image-picker'
import NumberOfSets from './NumberOfSets'
import AnimatedStaggerCard from './AnimatedStaggerCard'
import MediaViewer from './MediaViewer'
import { saveSession, copyToMediaDir } from '../storage'

export default function SessionTracker({ exercises, onRemove, onAddExercises, onSessionSaved, exerciseWeights, exerciseSets, exerciseNotes, setWeight, setReps, setNotes }) {
  const [showNameModal, setShowNameModal] = useState(false)
  const [workoutName, setWorkoutName] = useState('')
  const [showNotes, setShowNotes] = useState({})
  const [exerciseMedia, setExerciseMedia] = useState({})
  const [mediaViewer, setMediaViewer] = useState({ open: false, items: [], index: 0 })

  const handleCapture = async (exerciseIdx, type) => {
    const options = type === 'photo'
      ? ['Take Photo', 'Choose from Gallery', 'Cancel']
      : ['Record Video', 'Choose from Gallery', 'Cancel']

    Alert.alert(
      type === 'photo' ? 'Add Photo' : 'Add Video',
      null,
      [
        {
          text: options[0],
          onPress: async () => {
            const perm = await ImagePicker.requestCameraPermissionsAsync()
            if (!perm.granted) {
              Alert.alert('Permission needed', 'Camera access is required to take photos.')
              return
            }
            const result = type === 'photo'
              ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
              : await ImagePicker.launchCameraAsync({ mediaTypes: ['videos'], videoMaxDuration: 60, quality: 0.7 })

            if (!result.canceled && result.assets?.[0]) {
              const uri = await copyToMediaDir(result.assets[0].uri, type)
              addMedia(exerciseIdx, type, uri)
            }
          }
        },
        {
          text: options[1],
          onPress: async () => {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
            if (!perm.granted) {
              Alert.alert('Permission needed', 'Gallery access is required to choose media.')
              return
            }
            const result = type === 'photo'
              ? await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 })
              : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], quality: 0.7 })

            if (!result.canceled && result.assets?.[0]) {
              const uri = await copyToMediaDir(result.assets[0].uri, type)
              addMedia(exerciseIdx, type, uri)
            }
          }
        },
        { text: options[2], style: 'cancel' }
      ]
    )
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
      <View className="px-5 pt-5 pb-3">
        <TouchableOpacity onPress={onAddExercises} className="border border-orange-500 rounded-xl py-3 mt-10">
          <Text className="text-orange-500 text-3xl text-center font-bold">Add Exercises</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {exercises.length > 0 ? (
          exercises.map((exercise, idx) => (
            <AnimatedStaggerCard key={idx} index={idx} className="flex-col gap-0 bg-orange-500/10 border border-neutral-500 p-3 rounded-lg mb-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-orange-400 text-sm flex-1">{exercise.name}</Text>
                <View className="flex-row items-center gap-1">
                  <TouchableOpacity onPress={() => handleCapture(idx, 'photo')} className="p-1">
                    <Camera size={16} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleCapture(idx, 'video')} className="p-1">
                    <Video size={16} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowNotes(prev => ({ ...prev, [idx]: !prev[idx] }))} className="p-1">
                    <FileEdit size={16} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onRemove(idx)} className="px-2 py-1">
                    <Text className="text-red-500">X</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View className="flex-row items-center relative">
                <Text className="text-orange-500/60 text-xs w-12">Sets</Text>
                <View className="flex-row flex-1 gap-3 pl-3">
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
                {exerciseMedia[idx]?.length > 0 && (
                  <View className="absolute top-full right-0 -mt-6 items-center">
                    <TouchableOpacity
                      onPress={() => setMediaViewer({ open: true, items: exerciseMedia[idx], index: 0 })}
                      className="w-16 h-12 items-center justify-center border border-orange-500/40 bg-orange-500/20 rounded-lg"
                    >
                      <Text className="text-orange-400 text-[10px] font-bold px-1">Media({exerciseMedia[idx].length})</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setExerciseMedia(prev => ({ ...prev, [idx]: [] }))}>
                      <Text className="text-red-500 text-[10px] mt-0.5">Clear</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              {(exercise.mode || 'weight') === 'weight' && (
                <View className="flex-row items-center">
                  <Text className="text-orange-500/60 text-xs w-12">Weight</Text>
                  <View className="flex-row flex-1 gap-3 pl-3">
                    {[0, 1, 2].map(setIdx => {
                      const weight = exerciseWeights[idx]?.[setIdx] || ''
                      return (
                        <TextInput
                          key={setIdx}
                          className="w-10 h-8 bg-black border border-orange-500/50 text-orange-500 rounded-lg text-center font-bold text-sm"
                          value={weight}
                          onChangeText={(val) => setWeight(idx, setIdx, val)}
                          placeholder="0"
                          placeholderTextColor="#f97316"
                          keyboardType="numeric"
                        />
                      )
                    })}
                  </View>
                </View>
              )}
              {showNotes[idx] && (
                <TextInput
                  value={exerciseNotes?.[idx] || ''}
                  onChangeText={(val) => setNotes(idx, val)}
                  placeholder="Notes..."
                  placeholderTextColor="#737373"
                  className="bg-neutral-900 text-white text-sm border border-orange-500/30 rounded-lg px-3 py-2"
                  multiline
                />
              )}
            </AnimatedStaggerCard>
          ))
        ) : (
          <Text className="text-orange-500/50 text-center py-10">No exercises yet. Tap "Add Exercises" to start.</Text>
        )}
      </ScrollView>

      <View className="px-5 pb-5 pt-3">
        <TouchableOpacity
          onPress={handleSaveClick}
          disabled={exercises.length === 0}
          className={`border border-orange-500 bg-orange-500 rounded-2xl py-3 items-center ${exercises.length === 0 ? 'opacity-30' : ''}`}
        >
          <Text className="text-black font-bold text-3xl">Save</Text>
        </TouchableOpacity>
      </View>

      {mediaViewer.open && (
        <MediaViewer
          items={mediaViewer.items}
          initialIndex={mediaViewer.index}
          onClose={() => setMediaViewer({ open: false, items: [], index: 0 })}
        />
      )}

      <Modal visible={showNameModal} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center p-4">
          <View className="bg-neutral-800 border border-orange-500/40 rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-white text-xl font-bold font-mono mb-4">Name this workout</Text>
            <TextInput
              value={workoutName}
              onChangeText={setWorkoutName}
              placeholder="e.g. Chest Day, Push Day..."
              placeholderTextColor="#737373"
              className="bg-neutral-900 text-white border border-orange-500/30 rounded-xl px-4 py-3 font-mono"
              autoFocus
              onSubmitEditing={handleConfirmSave}
            />
            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity onPress={() => setShowNameModal(false)} className="flex-1 border border-neutral-600 rounded-xl py-3 items-center">
                <Text className="text-white font-semibold font-mono">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmSave} className="flex-1 bg-orange-500 rounded-xl py-3 items-center">
                <Text className="text-black font-bold font-mono">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
