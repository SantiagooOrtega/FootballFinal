import type { ReactNode } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'
import { useTheme, useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

interface ScreenProps {
  children: ReactNode
  edges?: Edge[]
  style?: StyleProp<ViewStyle>
}

/** Fondo base de la app: negro verdoso con un resplandor de cesped en la parte superior (adaptado al tema). */
export function Screen({ children, edges = ['top'], style }: ScreenProps) {
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  return (
    <View style={styles.root}>
      <LinearGradient
        pointerEvents="none"
        colors={[colors.glow, colors.glow.replace(/[\d.]+\)$/, '0)')]}
        style={styles.glow}
      />
      <SafeAreaView edges={edges} style={[styles.safe, style]}>
        {children}
      </SafeAreaView>
    </View>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },
    safe: { flex: 1 },
  })
