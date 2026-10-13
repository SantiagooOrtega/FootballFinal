import { StyleSheet, Text } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors } from '../../theme/colors'
import { PressableScale } from './PressableScale'

interface ChipProps {
  label: string
  active: boolean
  onPress: () => void
}

export function Chip({ label, active, onPress }: ChipProps) {
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

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  active: { backgroundColor: Colors.primarySoft, borderColor: Colors.primary },
  label: { color: Colors.textMuted, fontSize: 13, fontWeight: '700' },
  labelActive: { color: Colors.primary },
})
