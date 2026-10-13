import { StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { useEffect } from 'react'
import { Radius } from '../../theme/colors'
import { useTheme, useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'
import { PressableScale } from './PressableScale'

/** Boton sol/luna para alternar entre modo claro y oscuro. */
export function ThemeToggle() {
  const { mode, colors, toggleTheme } = useTheme()
  const styles = useThemedStyles(createStyles)
  const spin = useSharedValue(0)
  const isDark = mode === 'dark'

  useEffect(() => {
    spin.value = withSpring(isDark ? 0 : 1, { damping: 14, stiffness: 140 })
  }, [isDark, spin])

  const icon = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }, { scale: 1 - Math.abs(spin.value - 0.5) * 0.2 }],
  }))

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      style={styles.button}
      onPress={() => {
        void Haptics.selectionAsync()
        toggleTheme()
      }}
    >
      <Animated.View style={icon}>
        <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={isDark ? colors.highlight : colors.primary} />
      </Animated.View>
    </PressableScale>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    button: {
      width: 42,
      height: 42,
      borderRadius: Radius.md,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
