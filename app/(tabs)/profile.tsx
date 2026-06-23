import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Modal, Animated } from 'react-native'
import { User, Camera, Edit3, Check, Image as ImageIcon, Play, Film } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import { getUserName, setUserName, getUserProfile, saveUserProfile, copyToMediaDir, getAllMedia, deleteMediaItem } from '../../src/storage'
import { useFocusEffect } from 'expo-router'
import MediaViewer from '../../src/components/MediaViewer'
import DeleteConfirmModal from '../../src/components/DeleteConfirmModal'
import AnimatedStaggerCard from '../../src/components/AnimatedStaggerCard'
import { useResponsive } from '../../src/utils/responsive'

function Row({ label, value, editValue, onChangeText, editing, keyboardType, r }: {
  label: string; value: string; editValue: string; onChangeText: (v: string) => void; editing: boolean; keyboardType?: 'default' | 'numeric'; r: ReturnType<typeof useResponsive>
}) {
  return (
    <View className="flex-row justify-between items-center border-b border-orange-500/20" style={{ paddingVertical: r.scale(12), minHeight: r.scale(52) }}>
      <Text className="text-orange-400 font-mono font-bold" style={{ fontSize: r.fontScale(18) }}>{label}</Text>
      {editing ? (
        <TextInput
          value={editValue}
          onChangeText={onChangeText}
          placeholder={label}
          placeholderTextColor="#666"
          keyboardType={keyboardType}
          className="bg-black/50 border border-orange-500/30 rounded-xl text-white font-mono text-right flex-1" style={{ paddingHorizontal: r.scale(12), paddingVertical: r.scale(8), fontSize: r.fontScale(18), maxWidth: '60%' }}
        />
      ) : (
        <Text className="text-white font-mono" style={{ fontSize: r.fontScale(18) }}>{value || '—'}</Text>
      )}
    </View>
  )
}

export default function ProfileScreen() {
  const r = useResponsive()
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
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [media, setMedia] = useState([])
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false)
  const [mediaViewerIndex, setMediaViewerIndex] = useState(0)
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(null)
  const focusCount = useRef(0)
  const scrollY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    loadProfile()
  }, [])

  const loadMedia = useCallback(async () => {
    const items = await getAllMedia()
    setMedia(items)
  }, [])

  useFocusEffect(
    useCallback(() => {
      focusCount.current += 1
      loadProfile()
      loadMedia()
    }, [loadMedia, loadProfile])
  )

  const handleDeleteMedia = (index) => {
    if (!media[index]?.sessionId) return
    setPendingDeleteIndex(index)
  }

  const confirmDeleteMedia = async () => {
    if (pendingDeleteIndex === null) return
    const item = media[pendingDeleteIndex]
    const success = await deleteMediaItem(item.sessionId, item.exerciseIndex, item.mediaIndex)
    if (success) {
      setMedia(prev => prev.filter((_, i) => i !== pendingDeleteIndex))
    }
    setPendingDeleteIndex(null)
  }

  const loadProfile = useCallback(async () => {
    const n = await getUserName()
    if (n) setName(n)
    const p = await getUserProfile()
    if (p.age) setAge(p.age)
    if (p.height) setHeight(p.height)
    if (p.weight) setWeight(p.weight)
    if (p.photoUri) setPhotoUri(p.photoUri)
  }, [])

  const startEditing = () => {
    setEditName(name)
    setEditAge(age)
    setEditHeight(height)
    setEditWeight(weight)
    setEditPhoto(photoUri)
    setEditing(true)
  }

  const pickFromCamera = async () => {
    setShowActionSheet(false)
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) return
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1] })
    if (!result.canceled && result.assets?.[0]) {
      const uri = await copyToMediaDir(result.assets[0].uri, 'photo')
      setEditPhoto(uri)
    }
  }

  const pickFromGallery = async () => {
    setShowActionSheet(false)
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) return
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1] })
    if (!result.canceled && result.assets?.[0]) {
      const uri = await copyToMediaDir(result.assets[0].uri, 'photo')
      setEditPhoto(uri)
    }
  }

  const handlePhoto = () => {
    setShowActionSheet(true)
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

  return (
    <LinearGradient colors={['#111111', '#9a3412', '#f97316']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0.45, 0.86, 1]} className="flex-1">
      <View className="flex-1 pt-12">
        <Animated.ScrollView
          className="flex-1 px-5"
          stickyHeaderIndices={[1]}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          <Animated.View style={{
            opacity: scrollY.interpolate({
              inputRange: [0, 180],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, 180],
                outputRange: [0, -30],
                extrapolate: 'clamp',
              }),
            }],
          }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white font-bold" style={{ fontSize: r.fontScale(24) }}>Profile</Text>
              {editing ? (
                <View className="flex-row" style={{ gap: r.scale(8) }}>
                  <TouchableOpacity onPress={cancelEdit} className="border border-orange-500/40 rounded-lg" style={{ paddingHorizontal: r.scale(12), paddingVertical: r.scale(8) }}>
                    <Text className="text-orange-500 font-mono font-bold" style={{ fontSize: r.fontScale(14) }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={saveEdit} className="bg-orange-500 rounded-lg flex-row items-center" style={{ paddingHorizontal: r.scale(12), paddingVertical: r.scale(8), gap: r.scale(4) }}>
                    <Check size={r.scale(16)} color="black" />
                    <Text className="text-black font-mono font-bold" style={{ fontSize: r.fontScale(14) }}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={startEditing} className="border border-orange-500/40 rounded-lg" style={{ padding: r.scale(8) }}>
                  <Edit3 size={r.scale(18)} color="#f97316" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity onPress={editing ? handlePhoto : undefined} className="items-center mb-8" disabled={!editing}>
              {editPhoto && editing ? (
                <Image source={{ uri: editPhoto }} className="rounded-full border-2 border-orange-500" style={{ width: r.scale(96), height: r.scale(96) }} />
              ) : photoUri && !editing ? (
                <Image source={{ uri: photoUri }} className="rounded-full border-2 border-orange-500" style={{ width: r.scale(96), height: r.scale(96) }} />
              ) : (
                <View className="rounded-full bg-orange-500/20 border-2 border-orange-500 items-center justify-center" style={{ width: r.scale(96), height: r.scale(96) }}>
                  <User size={r.scale(48)} color="#f97316" />
                </View>
              )}
              {editing && (
                <View className="flex-row items-center mt-2" style={{ gap: r.scale(4) }}>
                  <Camera size={r.scale(14)} color="#f97316" />
                  <Text className="text-orange-500 font-mono" style={{ fontSize: r.fontScale(14) }}>{editPhoto ? 'Change photo' : 'Add photo'}</Text>
                </View>
              )}
            </TouchableOpacity>

            <View className="border border-orange-500/50 rounded-2xl mb-6 bg-neutral-900" style={{
                padding: r.scale(24),
                shadowColor: '#f97316',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
            <Row label="Name" value={name} editValue={editName} onChangeText={setEditName} editing={editing} r={r} />
              <Row label="Age" value={age} editValue={editAge} onChangeText={setEditAge} keyboardType="numeric" editing={editing} r={r} />
              <Row label="Height" value={height ? `${height} cm` : '—'} editValue={editHeight} onChangeText={setEditHeight} keyboardType="numeric" editing={editing} r={r} />
              <Row label="Weight" value={weight ? `${weight} kg` : '—'} editValue={editWeight} onChangeText={setEditWeight} keyboardType="numeric" editing={editing} r={r} />
            </View>
          </Animated.View>

          {/* Sticky header */}
          <View className="bg-orange-800 rounded-2xl mb-4 border border-orange-500/50" style={{ padding: r.scale(16), shadowColor: '#f97316', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}>
            <View className="flex-row justify-between items-center" style={{ paddingHorizontal: r.scale(12), paddingVertical: r.scale(8) }}>
              <Text className="text-white font-bold " style={{ fontSize: r.fontScale(20) }}>Your Gym Memory</Text>
              <Text className="text-orange-400 font-mono" style={{ fontSize: r.fontScale(14) }}>{media.length} items</Text>
            </View>
          </View>

          {/* Gallery */}
          <View className="pb-6">
            {media.length === 0 ? (
              <View className="border border-orange-500/30 rounded-2xl items-center bg-neutral-900/60 mt-4" style={{ padding: r.scale(32) }}>
                <Film size={r.scale(40)} color="#f97316" style={{ opacity: 0.4 }} />
                <Text className="text-white/40 font-mono text-center mt-3" style={{ fontSize: r.fontScale(14) }}>
                  No photos or videos yet. Take a snapshot during your next workout!
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap mt-4" style={{ marginHorizontal: -4 }}>
                {media.map((item, index) => {
                  const size = (r.width - r.scale(40) - 8) / 2
                  return (
                    <AnimatedStaggerCard key={`${focusCount.current}-${item.id || index}`} index={index} direction="up" className="" style={{ width: size, height: size, margin: 4 }}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          setMediaViewerIndex(index)
                          setMediaViewerOpen(true)
                        }}
                        onLongPress={() => handleDeleteMedia(index)}
                        delayLongPress={500}
                        className="flex-1 rounded-xl overflow-hidden bg-neutral-800"
                      >
                        <Image source={{ uri: item.uri }} style={{ width: size, height: size }} resizeMode="cover" />
                        {item.type === 'video' && (
                          <View className="absolute inset-0 items-center justify-center bg-black/30">
                            <View className="bg-orange-500 rounded-full items-center justify-center" style={{ width: r.scale(40), height: r.scale(40) }}>
                              <Play size={r.scale(20)} color="white" fill="white" />
                            </View>
                          </View>
                        )}
                      </TouchableOpacity>
                    </AnimatedStaggerCard>
                  )
                })}
              </View>
            )}
          </View>
        </Animated.ScrollView>
      </View>

      {mediaViewerOpen && (
        <MediaViewer items={media} initialIndex={mediaViewerIndex} onClose={() => setMediaViewerOpen(false)} onDeleteItem={handleDeleteMedia} />
      )}

      <DeleteConfirmModal
        visible={pendingDeleteIndex !== null}
        message="Remove this photo/video?"
        onCancel={() => setPendingDeleteIndex(null)}
        onDelete={confirmDeleteMedia}
      />

      <Modal visible={showActionSheet} transparent animationType="slide" onRequestClose={() => setShowActionSheet(false)}>
        <TouchableOpacity className="flex-1 justify-end" activeOpacity={1} onPress={() => setShowActionSheet(false)}>
          <View className="bg-[#1a1a1a] rounded-t-3xl" style={{
            padding: r.scale(24),
            gap: r.scale(8),
            shadowColor: '#f97316',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 20,
          }}>
            <TouchableOpacity onPress={pickFromCamera} className="flex-row items-center bg-[#111] rounded-2xl border border-orange-500/20" style={{ gap: r.scale(16), paddingVertical: r.scale(16), paddingHorizontal: r.scale(20) }}>
              <View className="bg-orange-500/10 rounded-full items-center justify-center" style={{ width: r.scale(40), height: r.scale(40) }}>
                <Camera size={r.scale(20)} color="#f97316" />
              </View>
              <Text className="font-inter text-white" style={{ fontSize: r.fontScale(16) }}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickFromGallery} className="flex-row items-center bg-[#111] rounded-2xl border border-orange-500/20" style={{ gap: r.scale(16), paddingVertical: r.scale(16), paddingHorizontal: r.scale(20) }}>
              <View className="bg-orange-500/10 rounded-full items-center justify-center" style={{ width: r.scale(40), height: r.scale(40) }}>
                <ImageIcon size={r.scale(20)} color="#f97316" />
              </View>
              <Text className="font-inter text-white" style={{ fontSize: r.fontScale(16) }}>Choose from Gallery</Text>
            </TouchableOpacity>
            <View style={{ height: r.scale(12) }} />
            <TouchableOpacity onPress={() => setShowActionSheet(false)} className="items-center bg-[#111] rounded-2xl border border-white/10" style={{ paddingVertical: r.scale(16), paddingHorizontal: r.scale(20) }}>
              <Text className="font-inter text-white/50" style={{ fontSize: r.fontScale(16) }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  )
}
