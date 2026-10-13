import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Radius } from '../../theme/colors'
import { PressableScale } from './PressableScale'
import { useTheme, useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: 'primary' | 'ghost'
  loading?: boolean
  disabled?: boolean
  icon?: keyof typeof Ionicons.glyphMap
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, icon }: ButtonProps) {
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const inactive = disabled || loading
  const isPrimary = variant === 'primary'
  const tint = isPrimary ? colors.onPrimary : colors.text

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      haptic
      style={[styles.base, !isPrimary && styles.ghost, inactive && styles.inactive]}
    >
      {isPrimary && (
        <LinearGradient
          colors={[colors.primary, colors.primaryStrong]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={tint} />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={18} color={tint} />}
            <Text style={[styles.label, { color: tint }]}>{label}</Text>
          </>
        )}
      </View>
    </PressableScale>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    base: {
      height: 54,
      borderRadius: Radius.md,
      overflow: 'hidden',
      justifyContent: 'center',
    },
    ghost: {
      backgroundColor: c.surfaceHigh,
      borderWidth: 1,
      borderColor: c.borderStrong,
    },
    inactive: { opacity: 0.55 },
    content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    label: { fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  })
