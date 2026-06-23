import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react'
import { Pressable, View, Image } from 'react-native'
import { Tabs, usePathname } from 'expo-router'
import { Dumbbell, Clock, User } from 'lucide-react-native'
import CircularReveal from '../../src/components/CircularReveal'
import { scale } from '../../src/utils/responsive'
import { getUserProfile } from '../../src/storage'

const RevealContext = createContext(null)

function TabButton({ children, onPress, tabName, ...rest }) {
  const ref = useRef(null)
  const trigger = useContext(RevealContext)
  const pathname = usePathname()
  const isActive = tabName === 'index' ? pathname === '/' : pathname === `/${tabName}`

  const handlePress = useCallback(() => {
    if (isActive) {
      onPress?.()
      return
    }
    const node = ref.current
    if (!node) return
    if (typeof node.measureInWindow !== 'function') return
    node.measureInWindow((x, y, w, h) => {
      trigger({
        x: x + w / 2,
        y: y + h / 2,
        navigate: onPress,
      })
    })
  }, [onPress, trigger, isActive])

  return (
    <Pressable ref={ref} onPress={handlePress} {...rest}>
      {children}
    </Pressable>
  )
}

export default function TabLayout() {
  const [reveal, setReveal] = useState(null)
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null)
  const pendingNavRef = useRef(null)
  const revealKeyRef = useRef(0)
  const pathname = usePathname()

  useEffect(() => {
    getUserProfile().then(profile => {
      if (profile.photoUri) {
        setProfilePhotoUri(profile.photoUri)
      }
    })
  }, [pathname])

  const trigger = useCallback((payload) => {
    pendingNavRef.current = payload.navigate
    revealKeyRef.current += 1
    setReveal({ ...payload, key: revealKeyRef.current })
  }, [])

  const handleComplete = useCallback(() => {
    if (typeof pendingNavRef.current === 'function') {
      pendingNavRef.current()
    }
    setReveal(null)
  }, [])

  return (
    <RevealContext.Provider value={trigger}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1f1f1f',
            borderTopColor: '#333',
            borderTopWidth: 1,
            height: scale(60),
            paddingBottom: scale(8),
            paddingTop: scale(4),
          },
          tabBarActiveTintColor: '#f97316',
          tabBarInactiveTintColor: '#666',
          tabBarLabelStyle: { fontFamily: 'monospace', fontSize: scale(11) },
          tabBarButton: (props) => <Pressable {...props} />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
            tabBarButton: (props) => <TabButton tabName="index" {...props} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
            tabBarButton: (props) => <TabButton tabName="history" {...props} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) =>
              profilePhotoUri ? (
                <View className="rounded-full border-2 border-orange-500 overflow-hidden" style={{ width: scale(34), height: scale(34) }}>
                  <Image source={{ uri: profilePhotoUri }} className="w-full h-full" resizeMode="cover" />
                </View>
              ) : (
                <View className="rounded-full border-2 border-orange-500 items-center justify-center" style={{ width: scale(34), height: scale(34) }}>
                  <User color={color} size={scale(20)} />
                </View>
              ),
            tabBarButton: (props) => <TabButton tabName="profile" {...props} />,
          }}
        />
      </Tabs>

      {reveal && (
        <CircularReveal key={reveal.key} x={reveal.x} y={reveal.y} onComplete={handleComplete} />
      )}
    </RevealContext.Provider>
  )
}
