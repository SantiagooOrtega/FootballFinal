import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import type { MatchStatus } from '../../models'
import { useTheme, useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

const LABELS: Record<MatchStatus, string> = {
  scheduled: 'PROGRAMADO',
  live: 'EN VIVO',
  finished: 'FINAL',
  postponed: 'POSPUESTO',
  cancelled: 'CANCELADO',
}

function LiveDot() {
  const styles = useThemedStyles(createStyles)
  const opacity = useSharedValue(1)
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.25, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
    )
  }, [opacity])
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return <Animated.View style={[styles.dot, style]} />
}

export function StatusPill({ status }: { status: MatchStatus }) {
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const live = status === 'live'
  const finished = status === 'finished'
  const warning = status === 'postponed' || status === 'cancelled'

  return (
    <View
      style={[
        styles.pill,
        live && styles.live,
        finished && styles.finished,
        warning && styles.warning,
      ]}
    >
      {live && <LiveDot />}
      <Text
        style={[
          styles.text,
          live && { color: colors.loss },
          warning && { color: colors.draw },
          status === 'scheduled' && { color: colors.textMuted },
        ]}
      >
        {LABELS[status]}
      </Text>
    </View>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: c.surfaceHigh,
    },
    live: { backgroundColor: c.lossSoft },
    finished: { backgroundColor: c.primarySoft },
    warning: { backgroundColor: c.drawSoft },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.loss },
    text: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, color: c.primary },
  })
