import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator } from 'react-native'
import { useFonts } from 'expo-font'
import { Inter_100Thin, Inter_200ExtraLight, Inter_300Light, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black } from '@expo-google-fonts/inter'
import { EduNSWACTCursive_400Regular, EduNSWACTCursive_500Medium, EduNSWACTCursive_600SemiBold, EduNSWACTCursive_700Bold } from '@expo-google-fonts/edu-nsw-act-cursive'
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue'
import { JetBrainsMono_100Thin, JetBrainsMono_200ExtraLight, JetBrainsMono_300Light, JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_600SemiBold, JetBrainsMono_700Bold, JetBrainsMono_800ExtraBold } from '@expo-google-fonts/jetbrains-mono'
import '../src/global.css'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { TourProvider, TourOverlay } from '../src/tour'

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_100Thin, Inter_200ExtraLight, Inter_300Light, Inter_400Regular,
    Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold, Inter_900Black,
    EduNSWACTCursive_400Regular, EduNSWACTCursive_500Medium, EduNSWACTCursive_600SemiBold, EduNSWACTCursive_700Bold,
    BebasNeue_400Regular,
    JetBrainsMono_100Thin, JetBrainsMono_200ExtraLight, JetBrainsMono_300Light, JetBrainsMono_400Regular,
    JetBrainsMono_500Medium, JetBrainsMono_600SemiBold, JetBrainsMono_700Bold, JetBrainsMono_800ExtraBold,
  })

  if (!loaded) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#050505' }}>
      <TourProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#050505' } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
        <TourOverlay />
      </TourProvider>
    </GestureHandlerRootView>
  )
}
