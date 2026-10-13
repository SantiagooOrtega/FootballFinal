import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import { Colors } from '../../theme/colors'

interface ComparisonBarProps {
  label: string
  home: number
  away: number
}

function Bar({ share, align }: { share: number; align: 'left' | 'right' }) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(200, withTiming(share, { duration: 800, easing: Easing.out(Easing.cubic) }))
  }, [share, progress])

  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }))

  return (
    <View style={[styles.track, align === 'left' ? styles.trackLeft : styles.trackRight]}>
      <Animated.View style={[styles.fill, align === 'left' ? styles.fillHome : styles.fillAway, fill]} />
    </View>
  )
}

export function ComparisonBar({ label, home, away }: ComparisonBarProps) {
  const total = home + away
  const homeShare = total === 0 ? 0 : home / total
  const awayShare = total === 0 ? 0 : away / total

  return (
    <View style={styles.wrap}>
      <View style={styles.labels}>
        <Text style={[styles.value, home >= away && styles.valueLead]}>{home}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, away >= home && styles.valueLead]}>{away}</Text>
      </View>
      <View style={styles.bars}>
        <Bar share={homeShare} align="left" />
        <Bar share={awayShare} align="right" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  labels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: Colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  value: { color: Colors.textMuted, fontSize: 15, fontWeight: '800', minWidth: 32 },
  valueLead: { color: Colors.text },
  bars: { flexDirection: 'row', gap: 6 },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: Colors.surfaceHigh, overflow: 'hidden' },
  trackLeft: { alignItems: 'flex-end' },
  trackRight: { alignItems: 'flex-start' },
  fill: { height: '100%', borderRadius: 4 },
  fillHome: { backgroundColor: Colors.primary },
  fillAway: { backgroundColor: Colors.info },
})
