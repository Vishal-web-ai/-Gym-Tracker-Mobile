import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native'
import { User, Camera, Edit3, Check } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import { getUserName, setUserName, getUserProfile, saveUserProfile, copyToMediaDir } from '../../src/storage'

export default function ProfileScreen() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [photoUri, setPhotoUri] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editAge, setEditAge] = useState('')
  const [editHeight, setEditHeight] = useState('')
  const [editWeight, setEditWeight] = useState('')
  const [editPhoto, setEditPhoto] = useState(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const n = await getUserName()
    if (n) setName(n)
    const p = await getUserProfile()
    if (p.age) setAge(p.age)
    if (p.height) setHeight(p.height)
    if (p.weight) setWeight(p.weight)
    if (p.photoUri) setPhotoUri(p.photoUri)
  }

  const startEditing = () => {
    setEditName(name)
    setEditAge(age)
    setEditHeight(height)
    setEditWeight(weight)
    setEditPhoto(photoUri)
    setEditing(true)
  }

  const handlePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) {
      const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!libPerm.granted) return
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1] })
    if (!result.canceled && result.assets?.[0]) {
      const uri = await copyToMediaDir(result.assets[0].uri, 'photo')
      setEditPhoto(uri)
    }
  }

  const saveEdit = async () => {
    await setUserName(editName.trim() || 'User')
    await saveUserProfile({ age: editAge, height: editHeight, weight: editWeight, photoUri: editPhoto })
    setName(editName.trim() || 'User')
    setAge(editAge)
    setHeight(editHeight)
    setWeight(editWeight)
    setPhotoUri(editPhoto)
    setEditing(false)
  }

  const cancelEdit = () => {
    setEditing(false)
  }

  const Row = ({ label, value, editValue, onChangeText, suffix, keyboardType }) => (
    <View className="flex-row justify-between items-center py-3 border-b border-orange-500/20 min-h-[52px]">
      <Text className="text-orange-400 font-mono font-bold text-lg">{label}</Text>
      {editing ? (
        <TextInput
          value={editValue}
          onChangeText={onChangeText}
          placeholder={label}
          placeholderTextColor="#666"
          keyboardType={keyboardType}
          className="bg-black/50 border border-orange-500/30 rounded-xl px-3 py-2 text-white font-mono text-lg text-right flex-1 max-w-[60%]"
        />
      ) : (
        <Text className="text-white font-mono text-lg">{value || '—'}</Text>
      )}
    </View>
  )

  return (
    <LinearGradient colors={['#111111', '#9a3412', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0.45, 0.86, 1]} className="flex-1">
      <View className="flex-1 pt-12">
        <ScrollView className="flex-1 px-5">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-2xl font-bold">Profile</Text>
            {editing ? (
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={cancelEdit} className="border border-orange-500/40 px-3 py-2 rounded-lg">
                  <Text className="text-orange-500 font-mono font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveEdit} className="bg-orange-500 px-3 py-2 rounded-lg flex-row items-center gap-1">
                  <Check size={16} color="black" />
                  <Text className="text-black font-mono font-bold">Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={startEditing} className="border border-orange-500/40 p-2 rounded-lg">
                <Edit3 size={18} color="#f97316" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={editing ? handlePhoto : undefined} className="items-center mb-8" disabled={!editing}>
            {editPhoto && editing ? (
              <Image source={{ uri: editPhoto }} className="w-24 h-24 rounded-full border-2 border-orange-500" />
            ) : photoUri && !editing ? (
              <Image source={{ uri: photoUri }} className="w-24 h-24 rounded-full border-2 border-orange-500" />
            ) : (
              <View className="w-24 h-24 rounded-full bg-orange-500/20 border-2 border-orange-500 items-center justify-center">
                <User size={48} color="#f97316" />
              </View>
            )}
            {editing && (
              <View className="flex-row items-center gap-1 mt-2">
                <Camera size={14} color="#f97316" />
                <Text className="text-orange-500 font-mono text-sm">{editPhoto ? 'Change photo' : 'Add photo'}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View className="border border-orange-500/50 rounded-2xl p-6 mb-6 bg-neutral-900"
            style={{
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Row label="Name" value={name} editValue={editName} onChangeText={setEditName} />
            <Row label="Age" value={age} editValue={editAge} onChangeText={setEditAge} keyboardType="numeric" />
            <Row label="Height" value={height ? `${height} cm` : '—'} editValue={editHeight} onChangeText={setEditHeight} keyboardType="numeric" suffix="cm" />
            <Row label="Weight" value={weight ? `${weight} kg` : '—'} editValue={editWeight} onChangeText={setEditWeight} keyboardType="numeric" suffix="kg" />
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  )
}
