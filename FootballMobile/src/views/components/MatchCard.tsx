import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { outcomeLabel, type Match } from '../../models'
import { formatKickoff, formatTime } from '../../lib/format'
import { Radius } from '../../theme/colors'
import { PressableScale } from './PressableScale'
import { StatusPill } from './StatusPill'
import { TeamCrest } from './TeamCrest'
import { useTheme, useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

interface MatchCardProps {
  match: Match
  onPress: () => void
  index?: number
  style?: StyleProp<ViewStyle>
}

export function MatchCard({ match, onPress, index = 0, style }: MatchCardProps) {
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const { homeTeam, awayTeam, score, ai, userPick, status } = match
  const hasScore = score !== null
  const aiText =
    ai.outcome && ai.confidence !== null
      ? `${outcomeLabel(match, ai.outcome)} · ${Math.round(ai.confidence)}%`
      : 'Análisis pendiente'

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 55).springify().damping(18)}
      style={style}
    >
      <PressableScale onPress={onPress} haptic style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.league} numberOfLines={1}>
            {match.league.name}
          </Text>
          {status === 'scheduled' ? (
            <Text style={styles.kickoff}>{formatKickoff(match.date)}</Text>
          ) : (
            <StatusPill status={status} />
          )}
        </View>

        <View style={styles.teams}>
          <View style={styles.team}>
            <TeamCrest logo={homeTeam.logo} name={homeTeam.shortName} size={52} />
            <Text style={styles.teamName} numberOfLines={1}>
              {homeTeam.name}
            </Text>
          </View>

          <View style={styles.center}>
            {hasScore ? (
              <Text style={styles.score}>
                {score.home}
                <Text style={styles.scoreDash}> - </Text>
                {score.away}
              </Text>
            ) : (
              <Text style={styles.time}>{formatTime(match.date)}</Text>
            )}
          </View>

          <View style={styles.team}>
            <TeamCrest logo={awayTeam.logo} name={awayTeam.shortName} size={52} />
            <Text style={styles.teamName} numberOfLines={1}>
              {awayTeam.name}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.aiPill}>
            <Ionicons name="sparkles" size={13} color={colors.highlight} />
            <Text style={styles.aiText} numberOfLines={1}>
              {aiText}
            </Text>
          </View>
          {userPick ? (
            <View style={styles.pickPill}>
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
              <Text style={styles.pickText}>Tu pronóstico</Text>
            </View>
          ) : null}
        </View>
      </PressableScale>
    </Animated.View>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.surface,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      gap: 16,
    },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    league: { flex: 1, color: c.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
    kickoff: { color: c.primary, fontSize: 12, fontWeight: '700' },
    teams: { flexDirection: 'row', alignItems: 'center' },
    team: { flex: 1, alignItems: 'center', gap: 8 },
    teamName: { color: c.text, fontSize: 13, fontWeight: '700', textAlign: 'center' },
    center: { width: 76, alignItems: 'center' },
    time: { color: c.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
    score: { color: c.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
    scoreDash: { color: c.textFaint },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    aiPill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.surfaceHigh,
      borderRadius: Radius.sm,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    aiText: { flex: 1, color: c.text, fontSize: 12, fontWeight: '700' },
    pickPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    pickText: { color: c.primary, fontSize: 12, fontWeight: '700' },
  })
