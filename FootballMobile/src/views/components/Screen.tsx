import type { ReactNode } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'
import { Colors } from '../../theme/colors'

interface ScreenProps {
  children: ReactNode
  edges?: Edge[]
  style?: StyleProp<ViewStyle>
}

/** Fondo base de la app: negro verdoso con un resplandor de cesped en la parte superior. */
export function Screen({ children, edges = ['top'], style }: ScreenProps) {
  return (
    <View style={styles.root}>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(31, 211, 91, 0.16)', 'rgba(31, 211, 91, 0)']}
        style={styles.glow}
      />
      <SafeAreaView edges={edges} style={[styles.safe, style]}>
        {children}
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  glow: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },
  safe: { flex: 1 },
})
