import { StyleSheet, Text } from 'react-native'
import * as Haptics from 'expo-haptics'
import { PressableScale } from './PressableScale'
import { useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

interface ChipProps {
  label: string
  active: boolean
  onPress: () => void
}

export function Chip({ label, active, onPress }: ChipProps) {
  const styles = useThemedStyles(createStyles)
  return (
    <PressableScale
      scaleTo={0.94}
      onPress={() => {
        void Haptics.selectionAsync()
        onPress()
      }}
      style={[styles.chip, active && styles.active]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </PressableScale>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 999,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    active: { backgroundColor: c.primarySoft, borderColor: c.primary },
    label: { color: c.textMuted, fontSize: 13, fontWeight: '700' },
    labelActive: { color: c.primary },
  })
