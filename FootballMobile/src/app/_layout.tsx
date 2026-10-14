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
import { LogoMark } from '../views/components/Logo'
import { I18nProvider } from '../i18n/I18nProvider'
import { ThemeProvider, useTheme, useThemedStyles } from '../theme/ThemeProvider'
import type { Palette } from '../theme/colors'

function BootScreen() {
  const styles = useThemedStyles(createStyles)
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
  const { colors } = useTheme()
  const { status } = useAuth()

  if (status === 'loading') return <BootScreen />

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Protected guard={status === 'signedOut'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'signedIn'}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="match/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
      </Stack.Protected>
    </Stack>
  )
}

function Shell() {
  const styles = useThemedStyles(createStyles)
  const { mode } = useTheme()

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
          <Navigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <Shell />
      </I18nProvider>
    </ThemeProvider>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    boot: { flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' },
  })
