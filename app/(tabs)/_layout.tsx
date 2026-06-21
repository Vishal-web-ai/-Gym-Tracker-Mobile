import { useState, useRef, useCallback, createContext, useContext } from 'react'
import { Pressable } from 'react-native'
import { Tabs, usePathname } from 'expo-router'
import { Dumbbell, Clock, User } from 'lucide-react-native'
import CircularReveal from '../../src/components/CircularReveal'

const RevealContext = createContext(null)

const TAB_ROUTES = { '/': 'Home', '/history': 'History', '/profile': 'Profile' }

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
  const pendingNavRef = useRef(null)
  const revealKeyRef = useRef(0)

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
            height: 60,
            paddingBottom: 8,
            paddingTop: 4,
          },
          tabBarActiveTintColor: '#f97316',
          tabBarInactiveTintColor: '#666',
          tabBarLabelStyle: { fontFamily: 'monospace', fontSize: 11 },
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
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
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
