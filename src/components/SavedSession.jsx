import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native'
import { Trash2, StickyNote, X, Edit3 } from 'lucide-react-native'
import { deleteSession, updateSessionName } from '../storage'
import MediaViewer from './MediaViewer'

export default function SavedSession({ sessions, onDelete }) {
  const [expandedId, setExpandedId] = useState(null)
  const [notesPopup, setNotesPopup] = useState({ open: false, text: '' })
  const [mediaViewer, setMediaViewer] = useState({ open: false, items: [], index: 0 })
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [renamed, setRenamed] = useState({})

  const getDay = (dateStr) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] 
    return days[new Date(dateStr).getDay()]
  }

  if (sessions.length === 0) {
    return (
      <Text className="text-orange-500/50 text-center mt-10 font-mono tracking-wide">
        No saved sessions yet. Start a workout and hit Save!
      </Text>
    )
  }

  return (
    <>
      {sessions.map((session) => (
        <View key={session._id} className="mb-3">
          <TouchableOpacity onPress={() => setExpandedId(expandedId === session._id ? null : session._id)} className="bg-orange-700 border border-orange-800 p-4 rounded-xl">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 min-w-0">
                {editingId === session._id ? (
                  <TextInput
                    className="text-orange-200 font-bold font-mono text-lg bg-orange-800 border border-orange-400/40 rounded px-1 py-0.5"
                    value={editValue}
                    onChangeText={setEditValue}
                    onSubmitEditing={() => setEditingId(null)}
                    onBlur={async () => {
                      const currentName = renamed[session._id] || session.name || ''
                      if (editValue.trim() && editValue.trim() !== currentName) {
                        await updateSessionName(session._id, editValue.trim())
                        setRenamed(prev => ({ ...prev, [session._id]: editValue.trim() }))
                      }
                      setEditingId(null)
                    }}
                    autoFocus
                  />
                ) : (
                  <Text className="text-orange-200 font-bold font-mono text-lg" numberOfLines={1}>{renamed[session._id] || session.name || 'Workout'}</Text>
                )}
                <Text className="text-orange-300/60 font-mono text-sm mt-0.5">
                  {session.date}, {getDay(session.date)}
                </Text>
              </View>
              <View className="flex-row items-center gap-2 ml-3">
                <TouchableOpacity onPress={() => { setEditingId(session._id); setEditValue(session.name || 'Workout') }} className="border border-orange-400/40 p-2 rounded-lg">
                  <Edit3 size={18} color="#f97316" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(session._id)} className="border border-red-400/60 p-2 rounded-lg">
                  <Trash2 size={18} color="#fca5a5" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          {expandedId === session._id && (
            <View className="bg-orange-500/5 border border-orange-500/20 mt-1 rounded-xl p-4 space-y-4">
              {session.exercises.map((ex, i) => (
                <View key={i} className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg relative mb-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-orange-400 font-semibold font-mono flex-1">{ex.name}</Text>
                    <View className="flex-row items-center gap-1">
                      {ex.notes && (
                        <TouchableOpacity onPress={() => setNotesPopup({ open: true, text: ex.notes })} className="p-1">
                          <StickyNote size={18} color="#a3a3a3" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  {ex.mode === 'timer' ? (
                    <Text className="text-orange-500/60 font-mono text-sm mt-1">
                      Time: {ex.sets.filter(s => s !== '—').join(' × ') || '—'} min
                    </Text>
                  ) : ex.sets && Array.isArray(ex.sets) && typeof ex.sets[0] === 'object' ? (
                    <View className="mt-1 gap-0.5">
                      {ex.sets.map((set, si) => (
                        <Text key={si} className="text-orange-500/60 font-mono text-xs">
                          Set {si + 1}: {set.reps || '—'} reps @ {set.weight || '—'}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <>
                      <Text className="text-orange-500/60 font-mono text-sm mt-1">Weight: {ex.weight}</Text>
                      <Text className="text-orange-500/60 font-mono text-sm">Sets: {ex.sets.filter(s => s !== '—').join(' × ') || '—'}</Text>
                    </>
                  )}
                  {ex.media?.length > 0 && (
                    <View className="absolute bottom-2 right-3">
                      <TouchableOpacity
                        onPress={() => setMediaViewer({ open: true, items: ex.media, index: 0 })}
                        className="w-16 h-12 items-center justify-center border border-orange-500/40 bg-orange-500/20 rounded-lg"
                      >
                        <Text className="text-orange-400 text-[10px] font-bold">Media({ex.media.length})</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      ))}

      <Modal visible={notesPopup.open} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/60 items-center justify-center p-4" activeOpacity={1} onPress={() => setNotesPopup({ open: false, text: '' })}>
          <View className="bg-neutral-800 border border-orange-500/40 rounded-2xl p-6 w-full max-w-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-orange-400 font-bold font-mono text-lg">Notes</Text>
              <TouchableOpacity onPress={() => setNotesPopup({ open: false, text: '' })}>
                <X size={20} color="#a3a3a3" />
              </TouchableOpacity>
            </View>
            <Text className="text-white font-mono text-sm">{notesPopup.text}</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      {mediaViewer.open && (
        <MediaViewer
          items={mediaViewer.items}
          initialIndex={mediaViewer.index}
          onClose={() => setMediaViewer({ open: false, items: [], index: 0 })}
        />
      )}
    </>
  )
}
