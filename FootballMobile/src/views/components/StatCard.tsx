import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Radius } from '../../theme/colors'

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap
  value: string
  label: string
  index?: number
}

export function StatCard({ icon, value, label, index = 0 }: StatCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 90).springify().damping(16)}
      style={styles.card}
    >
      <View style={styles.icon}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 6,
    padding: 14,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { color: Colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  label: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
})
