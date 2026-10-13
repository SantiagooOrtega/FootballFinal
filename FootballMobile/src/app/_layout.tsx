import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider, useAuth } from '../controllers/AuthContext'
import { Colors } from '../theme/colors'
import { LogoMark } from '../views/components/Logo'

function BootScreen() {
  const pulse = useSharedValue(1)

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
    )
  }, [pulse])

  const style = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }))

  return (
    <View style={styles.boot}>
      <Animated.View style={style}>
        <LogoMark size={96} />
      </Animated.View>
    </View>
  )
}

function Navigator() {
  const { status } = useAuth()

  if (status === 'loading') return <BootScreen />

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Protected guard={status === 'signedOut'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'signedIn'}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="match/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <Navigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  boot: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
})
