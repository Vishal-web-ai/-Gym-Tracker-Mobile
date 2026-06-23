import { useState, useMemo, useCallback, useRef, memo } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react-native'
import { getCustomExercises, saveCustomExercise, updateCustomExercise, deleteCustomExercise } from '../storage'
import { scale, fontScale } from '../utils/responsive'

const CATEGORIES = ['Chest', 'Back', 'Biceps', 'Triceps', 'Arms', 'Shoulders', 'Legs', 'Core', 'Cardio']

const defaultExercises = [
  {
    category: 'Chest',
    items: [
      { name: 'Flat Bench Press', muscle: 'Chest (Middle)' },
      { name: 'Incline Bench Press', muscle: 'Chest (Upper)' },
      { name: 'Decline Bench Press', muscle: 'Chest (Lower)' },
      { name: 'Machine Chest Press', muscle: 'Chest' },
      { name: 'Pec Fly', muscle: 'Chest' },
      { name: 'Cable Crossover', muscle: 'Chest' },
      { name: 'Push-Up', muscle: 'Chest' },
      { name: 'Chest Dip', muscle: 'Chest (Lower)' },
      { name: 'Low Cable Fly', muscle: 'Chest (Upper)' },
      { name: 'High Cable Fly', muscle: 'Chest (Lower)' }
    ]
  },
  {
    category: 'Back',
    items: [
      { name: 'Lat Pulldown', muscle: 'Lats' },
      { name: 'Seated Cable Row', muscle: 'Middle Back' },
      { name: 'Wide Row', muscle: 'Upper Back' },
      { name: 'Deadlift', muscle: 'Full Back / Posterior Chain' },
      { name: 'Barbell Row', muscle: 'Middle Back' },
      { name: 'T-Bar Row', muscle: 'Middle Back' },
      { name: 'Pull-Up', muscle: 'Lats' },
      { name: 'Single Arm Dumbbell Row', muscle: 'Middle Back' },
      { name: 'Lats Pullover', muscle: 'Lats' }
    ]
  },
  {
    category: 'Biceps',
    items: [
      { name: 'Barbell Curl', muscle: 'Biceps (Both Head)' },
      { name: 'Dumbbell Curl', muscle: 'Biceps (Both Head)' },
      { name: 'Hammer Curl', muscle: 'Brachialis / Brachioradialis' },
      { name: 'Preacher Curl', muscle: 'Biceps (Short Head)' },
      { name: 'Cable Curl', muscle: 'Biceps' },
      { name: 'Incline Dumbbell Curl', muscle: 'Biceps (Long Head)' },
      { name: 'Spider Curl', muscle: 'Biceps' },
    ]
  },
  {
    category: 'Triceps',
    items: [
      { name: 'Tricep Extension', muscle: 'Triceps (All Heads)' },
      { name: 'Skull Crusher', muscle: 'Triceps (Long Head)' },
      { name: 'Overhead Tricep Extension', muscle: 'Triceps (Long Head)' },
      { name: 'Single tricep Pushdown', muscle: 'Triceps' },
    ]
  },
  {
    category: 'Arms',
    items: [
      { name: 'Wrist Curl', muscle: 'Back part of forearm' },
      { name: 'Reverse Wrist Curl', muscle: 'Front part of forearm' },
      { name: 'Reverse Curl', muscle: 'Brachioradialis' }
    ]
  },
  {
    category: 'Shoulders',
    items: [
      { name: 'Front Raise', muscle: 'Front Delts' },
      { name: 'Overhead Press', muscle: 'Front / Side Delts' },
      { name: 'Machine Shoulder Press', muscle: 'Front / Side Delts' },
      { name: 'Lateral Raises', muscle: 'Side Delts' },
      { name: 'Cable Lateral Raises', muscle: 'Side Delts' },
      { name: 'Upright Row', muscle: 'Side Delts / Traps' },
      { name: 'Rear Delt Fly', muscle: 'Rear Delts' },
      { name: 'Reverse Pec Deck', muscle: 'Rear Delts' },
      { name: 'Face Pull', muscle: 'Rear Delts' },
      { name: 'Shrugs', muscle: 'Traps' },
    ]
  },
  {
    category: 'Legs',
    items: [
      { name: 'Leg Press', muscle: 'Quads' },
      { name: 'Squat', muscle: 'Quads' },
      { name: 'Romanian Deadlift', muscle: 'Hamstrings / Glutes' },
      { name: 'Hamstring Curl', muscle: 'Hamstrings' },
      { name: 'Pendulum Squat', muscle: 'Quads' },
      { name: 'Bulgarian Split Squat', muscle: 'Quads' },
      { name: 'Leg Extension', muscle: 'Quads' },
      { name: 'Calf Raise', muscle: 'Calves' },
      { name: 'Hip Thrust', muscle: 'Glutes' },
      { name: 'Hack Squat', muscle: 'Quads' },
      { name: 'Walking Lunges', muscle: 'Quads / Glutes' },
      { name: 'Glute Kickback', muscle: 'Glutes' }
    ]
  },
  {
    category: 'Core',
    items: [
      { name: 'Plank', muscle: 'Core (Overall)' },
      { name: 'Bench Crunch', muscle: 'Upper Abs' },
      { name: 'Hanging Leg Raise', muscle: 'Lower Abs' },
      { name: 'Cable Crunch', muscle: 'Upper Abs' },
      { name: 'Wood Chop', muscle: 'Obliques / Core' }
    ]
  }
]

function groupByCategory(exercises) {
  const map = {}
  for (const ex of exercises) {
    if (!map[ex.category]) map[ex.category] = []
    map[ex.category].push(ex)
  }
  return Object.entries(map).sort(([a], [b]) => CATEGORIES.indexOf(a) - CATEGORIES.indexOf(b))
}

const formInitial = { name: '', category: 'Chest', mode: 'weight', muscle: '' }

const DefaultExerciseItem = memo(({ item, onPress }) => (
  <TouchableOpacity onPress={() => onPress(item)} style={{ paddingVertical: scale(6), paddingHorizontal: scale(20) }}>
    <Text className="text-white font-mono" style={{ fontSize: fontScale(16) }}>{item.name}</Text>
  </TouchableOpacity>
))

const CustomExerciseItem = memo(({ item, onPress, onEdit, onDelete }) => (
  <View className="flex-row items-center justify-between" style={{ paddingVertical: scale(6), paddingHorizontal: scale(20) }}>
    <TouchableOpacity onPress={() => onPress(item)}>
      <Text className="text-white font-mono" style={{ fontSize: fontScale(16) }}>{item.name}</Text>
    </TouchableOpacity>
    <View className="flex-row" style={{ gap: scale(10) }}>
      <TouchableOpacity onPress={() => onEdit(item)}>
        <Pencil size={scale(14)} color="#f97316" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(item._id)}>
        <Trash2 size={scale(14)} color="#ef4444" />
      </TouchableOpacity>
    </View>
  </View>
))

const SectionHeader = memo(({ title }) => (
  <Text className="font-bebas text-orange-500 tracking-wider uppercase" style={{ fontSize: fontScale(36), paddingTop: scale(12), paddingBottom: scale(6), paddingLeft: scale(20), paddingRight: scale(24) }}>{title}</Text>
))

function ExercisesList({ onSelectExercise, onClose }) {
  const [activeTab, setActiveTab] = useState('default')
  const [customExercises, setCustomExercises] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(formInitial)
  const [loading, setLoading] = useState(false)
  const formDataRef = useRef(formData)
  formDataRef.current = formData

  const fetchExercises = useCallback(async () => {
    setLoading(true)
    const ex = await getCustomExercises()
    setCustomExercises(ex)
    setLoading(false)
  }, [])

  const resetForm = useCallback(() => {
    setShowForm(false)
    setEditingId(null)
    setFormData(formInitial)
  }, [])

  const handleSave = useCallback(async () => {
    const data = formDataRef.current
    if (!data.name.trim() || !data.category) return
    if (editingId) {
      await updateCustomExercise(editingId, data)
    } else {
      await saveCustomExercise(data)
    }
    resetForm()
    await fetchExercises()
  }, [editingId, resetForm, fetchExercises])

  const handleEdit = useCallback((ex) => {
    setEditingId(ex._id)
    setFormData({ name: ex.name, category: ex.category, mode: ex.mode || 'weight', muscle: ex.muscle || '' })
    setShowForm(true)
  }, [])

  const handleDelete = useCallback(async (id) => {
    await deleteCustomExercise(id)
    await fetchExercises()
  }, [fetchExercises])

  const handleSelectDefault = useCallback((item) => onSelectExercise(item), [onSelectExercise])
  const handleSelectCustom = useCallback((item) => onSelectExercise(item), [onSelectExercise])

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    if (tab === 'custom') fetchExercises()
  }, [fetchExercises])

  const handleShowForm = useCallback(() => {
    setShowForm(true)
    setEditingId(null)
    setFormData(formInitial)
  }, [])

  const updateFormData = useCallback((key) => (val) => {
    setFormData(prev => ({ ...prev, [key]: val }))
  }, [])

  const updateFormCategory = useCallback((cat) => {
    setFormData(prev => ({ ...prev, category: cat }))
  }, [])

  const defaultSections = useMemo(() =>
    defaultExercises.map(group => ({
      title: group.category,
      data: group.items,
    })),
  [])

  const customSections = useMemo(() =>
    groupByCategory(customExercises).map(([category, items]) => ({
      title: category,
      data: items,
    })),
  [customExercises]
  )

  const renderDefaultSection = useCallback((section) => (
    <View key={section.title}>
      <SectionHeader title={section.title} />
      {section.data.map((item, i) => (
        <DefaultExerciseItem key={`${item.name}-${i}`} item={item} onPress={handleSelectDefault} />
      ))}
    </View>
  ), [handleSelectDefault])

  const renderCustomSection = useCallback((section) => (
    <View key={section.title}>
      <SectionHeader title={section.title} />
      {section.data.map((item) => (
        <CustomExerciseItem key={item._id} item={item} onPress={handleSelectCustom} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </View>
  ), [handleSelectCustom, handleEdit, handleDelete])

  const listHeader = useMemo(() => (
    <View>
      <View className="flex-row bg-black/30 rounded-xl items-center" style={{ padding: scale(4), marginVertical: scale(24), marginHorizontal: scale(20) }}>
        <TouchableOpacity onPress={() => handleTabChange('default')} className={`flex-1 rounded-lg items-center ${activeTab === 'default' ? 'bg-orange-500' : ''}`} style={{ paddingVertical: scale(8) }}>
          <Text numberOfLines={1} className={`font-bebas tracking-[2px] ${activeTab === 'default' ? 'text-black' : 'text-orange-500/50'}`} style={{ fontSize: fontScale(16) }}>Default</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTabChange('custom')} className={`flex-1 rounded-lg items-center ${activeTab === 'custom' ? 'bg-orange-500' : ''}`} style={{ paddingVertical: scale(8), paddingHorizontal: scale(12) }}>
          <Text className={`font-bebas tracking-[2px] ${activeTab === 'custom' ? 'text-black' : 'text-orange-500/50'}`} style={{ fontSize: fontScale(15) }}>My Exercises</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} className="bg-orange-500/20 border border-orange-500 rounded-full items-center justify-center ml-5" style={{ width: scale(32), height: scale(32) }}>
          <Text className="text-orange-500 font-bold" style={{ fontSize: fontScale(18) }}>X</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'custom' && (
        <View className="mb-4" style={{ paddingHorizontal: scale(20) }}>
          {!showForm ? (
            <TouchableOpacity onPress={handleShowForm} className="flex-row items-center mb-4" style={{ gap: scale(8) }}>
              <Plus size={scale(18)} color="#f97316" />
              <Text className="text-orange-400 font-mono" style={{ fontSize: fontScale(14) }}>Add Exercise</Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-black/40 border border-orange-500/30 rounded-xl" style={{ padding: scale(16), marginBottom: scale(16) }}>
              <TextInput value={formData.name} onChangeText={updateFormData('name')} placeholder="Exercise name" placeholderTextColor="#f97316" className="bg-black/50 border border-orange-500/30 rounded-lg text-white font-mono" style={{ paddingHorizontal: scale(12), paddingVertical: scale(8), fontSize: fontScale(14) }} />
              <View className="flex-row flex-wrap mt-3" style={{ gap: scale(8) }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat} onPress={() => updateFormCategory(cat)} className={`rounded-lg ${formData.category === cat ? 'bg-orange-500' : 'bg-black/50 border border-orange-500/30'}`} style={{ paddingHorizontal: scale(12), paddingVertical: scale(6) }}>
                    <Text className={`font-mono ${formData.category === cat ? 'text-black' : 'text-white'}`} style={{ fontSize: fontScale(12) }}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View className="flex-row mt-3" style={{ gap: scale(8) }}>
                <TouchableOpacity
                  onPress={() => updateFormData('mode')('weight')}
                  className={`flex-1 rounded-lg items-center ${formData.mode === 'weight' ? 'bg-orange-500' : 'bg-black/50 border border-orange-500/30'}`}
                  style={{ paddingVertical: scale(8) }}
                >
                  <Text className={`font-bold ${formData.mode === 'weight' ? 'text-black' : 'text-white'}`} style={{ fontSize: fontScale(12) }}>Weight</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateFormData('mode')('timer')}
                  className={`flex-1 rounded-lg items-center ${formData.mode === 'timer' ? 'bg-orange-500' : 'bg-black/50 border border-orange-500/30'}`}
                  style={{ paddingVertical: scale(8) }}
                >
                  <Text className={`font-bold ${formData.mode === 'timer' ? 'text-black' : 'text-white'}`} style={{ fontSize: fontScale(12) }}>Timer</Text>
                </TouchableOpacity>
              </View>
              <TextInput value={formData.muscle} onChangeText={updateFormData('muscle')} placeholder="Target muscle (optional)" placeholderTextColor="#f97316" className="bg-black/50 border border-orange-500/30 rounded-lg text-white font-mono mt-3" style={{ paddingHorizontal: scale(12), paddingVertical: scale(8), fontSize: fontScale(14) }} />
              <View className="flex-row mt-3" style={{ gap: scale(8) }}>
                <TouchableOpacity onPress={handleSave} className="flex-row items-center bg-orange-500 rounded-lg" style={{ gap: scale(4), paddingHorizontal: scale(16), paddingVertical: scale(8) }}>
                  <Check size={scale(16)} color="black" />
                  <Text className="text-black font-bold" style={{ fontSize: fontScale(14) }}>{editingId ? 'Update' : 'Save'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={resetForm} className="flex-row items-center border border-neutral-600 rounded-lg" style={{ gap: scale(4), paddingHorizontal: scale(16), paddingVertical: scale(8) }}>
                  <X size={scale(16)} color="white" />
                  <Text className="text-white" style={{ fontSize: fontScale(14) }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  ), [activeTab, showForm, formData, editingId, onClose, handleTabChange, handleShowForm, handleSave, resetForm, updateFormData, updateFormCategory])

  const listEmpty = useMemo(() => {
    if (activeTab === 'custom' && !loading && customExercises.length === 0) {
      return <Text className="text-orange-500/50 text-center font-mono" style={{ paddingVertical: scale(32), fontSize: fontScale(16) }}>No custom exercises yet. Add one above!</Text>
    }
    return null
  }, [activeTab, loading, customExercises.length])

  if (activeTab === 'custom' && loading) {
    return (
      <View className="flex-1 w-full" style={{ marginTop: scale(48) }}>
        {listHeader}
        <Text className="text-orange-500/50 text-center font-mono" style={{ paddingVertical: scale(32), fontSize: fontScale(16) }}>Loading...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 w-full" style={{ marginTop: scale(48) }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {listHeader}
        <View className="border border-orange-500 rounded-2xl pb-4">
          {activeTab === 'default'
            ? defaultSections.map(renderDefaultSection)
            : customSections.length === 0
              ? listEmpty
              : customSections.map(renderCustomSection)
          }
        </View>
      </ScrollView>
    </View>
  )
}

export default memo(ExercisesList)
