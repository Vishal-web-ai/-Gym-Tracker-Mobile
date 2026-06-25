import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native'
import { Trash2, StickyNote, X, Edit3 } from 'lucide-react-native'
import { updateSessionName, deleteMediaItem } from '../storage'
import MediaViewer from './MediaViewer'
import AnimatedStaggerCard from './AnimatedStaggerCard'
import { scale, fontScale } from '../utils/responsive'

export default function SavedSession({ sessions, onDelete, focusCount = 0, onNeedRefresh, onSessionPress }) {
  const [expandedId, setExpandedId] = useState(null)
  const [notesPopup, setNotesPopup] = useState({ open: false, text: '' })
  const [mediaViewer, setMediaViewer] = useState({ open: false, items: [], index: 0 })
  const [mediaContext, setMediaContext] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [renamed, setRenamed] = useState({})

  const getDay = (dateStr) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] 
    return days[new Date(dateStr).getDay()]
  }

  if (sessions.length === 0) {
    return (
      <Text className="text-orange-500/50 text-center font-mono tracking-wide" style={{ marginTop: scale(40), fontSize: fontScale(16) }}>
        No saved sessions yet. Start a workout and hit Save!
      </Text>
    )
  }

  return (
    <>
      {sessions.map((session, idx) => (
        <AnimatedStaggerCard key={`${focusCount}-${session._id}`} index={idx} style={{ marginBottom: scale(12) }}>
          <TouchableOpacity onPress={() => {
            setExpandedId(expandedId === session._id ? null : session._id)
            onSessionPress?.()
          }} className="bg-orange-700 border border-orange-800 rounded-xl" style={{ padding: scale(16) }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1" style={{ minWidth: 0 }}>
                {editingId === session._id ? (
                  <TextInput
                    className="text-orange-200 font-bold font-mono bg-orange-800 border border-orange-400/40 rounded" style={{ fontSize: fontScale(18), paddingHorizontal: scale(4), paddingVertical: scale(2) }}
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
                  <Text className="text-orange-200 font-bold font-mono" style={{ fontSize: fontScale(18) }} numberOfLines={1}>{renamed[session._id] || session.name || 'Workout'}</Text>
                )}
                <Text className="text-orange-300/60 font-mono mt-0.5" style={{ fontSize: fontScale(14) }}>
                  {session.date}, {getDay(session.date)}
                </Text>
              </View>
              <View className="flex-row items-center ml-3" style={{ gap: scale(8) }}>
                <TouchableOpacity onPress={() => { setEditingId(session._id); setEditValue(session.name || 'Workout') }} className="border border-orange-400/40 rounded-lg" style={{ padding: scale(8) }}>
                  <Edit3 size={scale(18)} color="#f97316" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(session._id)} className="border border-red-400/60 rounded-lg" style={{ padding: scale(8) }}>
                  <Trash2 size={scale(18)} color="#fca5a5" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          {expandedId === session._id && (
            <View className="bg-orange-500/5 border border-orange-500/20 mt-1 rounded-xl" style={{ padding: scale(16) }}>
              {session.exercises.map((ex, i) => (
                <View key={i} className="bg-orange-500/10 border border-orange-500/20 rounded-lg mb-3" style={{ padding: scale(12) }}>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-orange-400 font-semibold font-mono flex-1" style={{ fontSize: fontScale(16) }}>{ex.name}</Text>
                    <View className="flex-row items-center" style={{ gap: scale(4) }}>
                      {ex.notes && (
                        <TouchableOpacity onPress={() => setNotesPopup({ open: true, text: ex.notes })} style={{ padding: scale(4) }}>
                          <StickyNote size={scale(18)} color="#a3a3a3" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  {ex.mode === 'timer' ? (
                    <View className="mt-1" style={{ gap: scale(2) }}>
                      {[0, 1, 2].map((_, si) => (
                        <Text key={si} className="text-orange-500/60 font-mono" style={{ fontSize: fontScale(14) }}>
                          Set {si + 1}: {ex.sets?.[si] || '—'}
                        </Text>
                      ))}
                    </View>
                  ) : ex.sets && Array.isArray(ex.sets) && typeof ex.sets[0] === 'object' ? (
                    <View className="mt-1" style={{ gap: scale(2) }}>
                      {ex.sets.map((set, si) => (
                        <Text key={si} className="text-orange-500/60 font-mono" style={{ fontSize: fontScale(12) }}>
                          Set {si + 1}: {set.reps || '—'} reps @ {set.weight || '—'}
                        </Text>
                      ))}
                    </View>
                  ) : (
                    <>
                      <Text className="text-orange-500/60 font-mono mt-1" style={{ fontSize: fontScale(14) }}>Weight: {ex.weight}</Text>
                      <Text className="text-orange-500/60 font-mono" style={{ fontSize: fontScale(14) }}>Sets: {ex.sets.filter(s => s !== '—').join(' × ') || '—'}</Text>
                    </>
                  )}
                  {ex.media?.length > 0 && (
                    <View className="mt-2">
                      <TouchableOpacity
                        onPress={() => {
                          setMediaViewer({ open: true, items: ex.media, index: 0 })
                          setMediaContext({ sessionId: session._id, exerciseIndex: i })
                        }}
                        className="items-center justify-center border border-orange-500/40 bg-orange-500/20 rounded-lg"
                        style={{ width: scale(64), height: scale(48) }}
                      >
                        <Text className="text-orange-400 font-bold" style={{ fontSize: fontScale(10) }}>Media({ex.media.length})</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </AnimatedStaggerCard>
      ))}

      <Modal visible={notesPopup.open} transparent animationType="fade">
        <TouchableOpacity className="flex-1 bg-black/60 items-center justify-center" activeOpacity={1} onPress={() => setNotesPopup({ open: false, text: '' })} style={{ padding: scale(16) }}>
          <View className="bg-neutral-800 border border-orange-500/40 rounded-2xl w-full" style={{ padding: scale(24), maxWidth: scale(380) }}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-orange-400 font-bold font-mono" style={{ fontSize: fontScale(18) }}>Notes</Text>
              <TouchableOpacity onPress={() => setNotesPopup({ open: false, text: '' })}>
                <X size={scale(20)} color="#a3a3a3" />
              </TouchableOpacity>
            </View>
            <Text className="text-white font-mono" style={{ fontSize: fontScale(14) }}>{notesPopup.text}</Text>
          </View>
        </TouchableOpacity>
      </Modal>

      {mediaViewer.open && (
        <MediaViewer
          items={mediaViewer.items}
          initialIndex={mediaViewer.index}
          onClose={() => { setMediaViewer({ open: false, items: [], index: 0 }); setMediaContext(null) }}
          onDeleteItem={async (index) => {
            if (!mediaContext) return
            await deleteMediaItem(mediaContext.sessionId, mediaContext.exerciseIndex, index)
            setMediaViewer({ open: false, items: [], index: 0 })
            setMediaContext(null)
            onNeedRefresh?.()
          }}
        />
      )}
    </>
  )
}
