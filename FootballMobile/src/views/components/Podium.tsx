import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import type { LeaderboardEntry } from '../../models'
import { Radius } from '../../theme/colors'
import { Avatar } from './Avatar'
import { useTheme, useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

const HEIGHTS = { 1: 132, 2: 100, 3: 78 } as const

function PodiumColumn({ entry, place }: { entry: LeaderboardEntry; place: 1 | 2 | 3 }) {
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const grow = useSharedValue(0)

  useEffect(() => {
    grow.value = withDelay((4 - place) * 140, withSpring(1, { damping: 14, stiffness: 120 }))
  }, [grow, place])

  const bar = useAnimatedStyle(() => ({ height: HEIGHTS[place] * grow.value, opacity: grow.value }))
  const first = place === 1

  return (
    <View style={styles.column}>
      {first && <Ionicons name="trophy" size={22} color={colors.highlight} />}
      <Avatar name={entry.username} uri={entry.avatarUrl} size={first ? 64 : 52} />
      <Text style={styles.name} numberOfLines={1}>
        {entry.username}
      </Text>
      <Text style={styles.points}>{entry.points} pts</Text>
      <Animated.View style={[styles.bar, bar]}>
        <LinearGradient
          colors={first ? [colors.primary, colors.primaryStrong] : [colors.surfaceHigh, colors.surface]}
          style={StyleSheet.absoluteFill}
        />
        <Text style={[styles.place, first && { color: colors.onPrimary }]}>{place}</Text>
      </Animated.View>
    </View>
  )
}

export function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const styles = useThemedStyles(createStyles)
  const [first, second, third] = entries
  return (
    <View style={styles.row}>
      {second ? <PodiumColumn entry={second} place={2} /> : <View style={styles.column} />}
      {first ? <PodiumColumn entry={first} place={1} /> : <View style={styles.column} />}
      {third ? <PodiumColumn entry={third} place={3} /> : <View style={styles.column} />}
    </View>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
    column: { flex: 1, alignItems: 'center', gap: 6 },
    name: { color: c.text, fontSize: 13, fontWeight: '700', maxWidth: '100%' },
    points: { color: c.primary, fontSize: 12, fontWeight: '800' },
    bar: {
      alignSelf: 'stretch',
      marginTop: 4,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 10,
      overflow: 'hidden',
      borderTopLeftRadius: Radius.md,
      borderTopRightRadius: Radius.md,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: c.border,
    },
    place: { color: c.textMuted, fontSize: 24, fontWeight: '800' },
  })
