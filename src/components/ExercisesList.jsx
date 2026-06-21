import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react'
import { View, Text, TextInput, TouchableOpacity, SectionList, InteractionManager } from 'react-native'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react-native'
import { getCustomExercises, saveCustomExercise, updateCustomExercise, deleteCustomExercise } from '../storage'
import AnimatedStaggerCard from './AnimatedStaggerCard'

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
  <TouchableOpacity onPress={() => onPress(item)} className="px-3 py-2 pr-12">
    <Text className="text-white font-bold text-lg">{item.name}</Text>
  </TouchableOpacity>
))

const CustomExerciseItem = memo(({ item, onPress, onEdit, onDelete }) => (
  <View className="flex-row items-center justify-between px-3 py-2 pr-12">
    <TouchableOpacity onPress={() => onPress(item)} className="flex-1">
      <Text className="text-white font-bold text-lg">{item.name}</Text>
    </TouchableOpacity>
    <View className="flex-row gap-2">
      <TouchableOpacity onPress={() => onEdit(item)}>
        <Pencil size={16} color="#f97316" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(item._id)}>
        <Trash2 size={16} color="#ef4444" />
      </TouchableOpacity>
    </View>
  </View>
))

const SectionHeader = memo(({ title }) => (
  <Text className="font-mono font-bold text-4xl text-orange-500 tracking-wider uppercase pt-2 pb-1 pl-5 pr-6">{title}</Text>
))

export default function ExercisesList({ onSelectExercise, onClose }) {
  const [activeTab, setActiveTab] = useState('default')
  const [customExercises, setCustomExercises] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState(formInitial)
  const [loading, setLoading] = useState(false)
  const formDataRef = useRef(formData)
  formDataRef.current = formData

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      getCustomExercises().then(setCustomExercises)
    })
  }, [])

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

  const defaultItemIndex = useMemo(() => {
    const map = {}
    let idx = 0
    for (const section of defaultSections) {
      for (const item of section.data) {
        map[item.name] = idx++
      }
    }
    return map
  }, [defaultSections])

  const customItemIndex = useMemo(() => {
    const map = {}
    let idx = 0
    for (const section of customSections) {
      for (const item of section.data) {
        map[item._id || item.name] = idx++
      }
    }
    return map
  }, [customSections])

  const renderDefaultItem = useCallback(({ item }) => (
    <AnimatedStaggerCard index={defaultItemIndex[item.name] || 0}>
      <DefaultExerciseItem item={item} onPress={handleSelectDefault} />
    </AnimatedStaggerCard>
  ), [handleSelectDefault, defaultItemIndex])

  const renderCustomItem = useCallback(({ item }) => (
    <AnimatedStaggerCard index={customItemIndex[item._id || item.name] || 0}>
      <CustomExerciseItem item={item} onPress={handleSelectCustom} onEdit={handleEdit} onDelete={handleDelete} />
    </AnimatedStaggerCard>
  ), [handleSelectCustom, handleEdit, handleDelete, customItemIndex])

  const renderSectionHeader = useCallback(({ section }) => (
    <SectionHeader title={section.title} />
  ), [])

  const keyExtractorDefault = useCallback((item, index) => `${item.name}-${index}`, [])
  const keyExtractorCustom = useCallback((item) => item._id, [])

  const listHeader = useMemo(() => (
    <View>
      <View className="flex-row justify-end px-3 pb-1">
        <TouchableOpacity onPress={onClose} className="bg-orange-500/20 border border-orange-500 rounded-full w-8 h-8 items-center justify-center m-2">
          <Text className="text-orange-500 text-lg font-bold">X</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row bg-black/30 rounded-xl p-1 my-6 mx-5">
        <TouchableOpacity onPress={() => handleTabChange('default')} className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'default' ? 'bg-orange-500' : ''}`}>
          <Text className={`font-mono text-xl font-bold pr-4 ${activeTab === 'default' ? 'text-black' : 'text-orange-500/50'}`}>Default</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTabChange('custom')} className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'custom' ? 'bg-orange-500' : ''}`}>
          <Text className={`font-mono text-xl font-bold pr-4 ${activeTab === 'custom' ? 'text-black' : 'text-orange-500/50'}`}>My Exercises</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'custom' && (
        <View className="mb-4 px-1">
          {!showForm ? (
            <TouchableOpacity onPress={handleShowForm} className="flex-row items-center gap-2 mb-4">
              <Plus size={18} color="#f97316" />
              <Text className="text-orange-400 font-mono text-sm">Add Exercise</Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-black/40 border border-orange-500/30 rounded-xl p-4 mb-4">
              <TextInput value={formData.name} onChangeText={updateFormData('name')} placeholder="Exercise name" placeholderTextColor="#f97316" className="bg-black/50 border border-orange-500/30 rounded-lg px-3 py-2 text-white font-mono text-sm" />
              <View className="flex-row flex-wrap gap-2 mt-3">
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat} onPress={() => updateFormCategory(cat)} className={`px-3 py-1.5 rounded-lg ${formData.category === cat ? 'bg-orange-500' : 'bg-black/50 border border-orange-500/30'}`}>
                    <Text className={`text-xs font-mono ${formData.category === cat ? 'text-black' : 'text-white'}`}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity
                  onPress={() => updateFormData('mode')('weight')}
                  className={`flex-1 py-2 rounded-lg items-center ${formData.mode === 'weight' ? 'bg-orange-500' : 'bg-black/50 border border-orange-500/30'}`}
                >
                  <Text className={`text-xs font-bold ${formData.mode === 'weight' ? 'text-black' : 'text-white'}`}>Weight</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateFormData('mode')('timer')}
                  className={`flex-1 py-2 rounded-lg items-center ${formData.mode === 'timer' ? 'bg-orange-500' : 'bg-black/50 border border-orange-500/30'}`}
                >
                  <Text className={`text-xs font-bold ${formData.mode === 'timer' ? 'text-black' : 'text-white'}`}>Timer</Text>
                </TouchableOpacity>
              </View>
              <TextInput value={formData.muscle} onChangeText={updateFormData('muscle')} placeholder="Target muscle (optional)" placeholderTextColor="#f97316" className="bg-black/50 border border-orange-500/30 rounded-lg px-3 py-2 text-white font-mono text-sm mt-3" />
              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity onPress={handleSave} className="flex-row items-center gap-1 bg-orange-500 px-4 py-2 rounded-lg">
                  <Check size={16} color="black" />
                  <Text className="text-black font-bold text-sm">{editingId ? 'Update' : 'Save'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={resetForm} className="flex-row items-center gap-1 border border-neutral-600 px-4 py-2 rounded-lg">
                  <X size={16} color="white" />
                  <Text className="text-white text-sm">Cancel</Text>
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
      return <Text className="text-orange-500/50 text-center font-mono py-8">No custom exercises yet. Add one above!</Text>
    }
    return null
  }, [activeTab, loading, customExercises.length])

  if (activeTab === 'custom' && loading) {
    return (
      <View className="flex-1 w-full mt-12">
        {listHeader}
        <Text className="text-orange-500/50 text-center font-mono py-8">Loading...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 w-full mt-12">
      {activeTab === 'default' ? (
        <SectionList
          className="flex-1 border border-orange-500 rounded-2xl"
          sections={defaultSections}
          renderItem={renderDefaultItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={keyExtractorDefault}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          stickySectionHeadersEnabled={false}
          windowSize={5}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <SectionList
          className="flex-1 border border-orange-500 rounded-2xl"
          sections={customSections}
          renderItem={renderCustomItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={keyExtractorCustom}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          stickySectionHeadersEnabled={false}
          windowSize={5}
          maxToRenderPerBatch={10}
          initialNumToRender={10}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}
