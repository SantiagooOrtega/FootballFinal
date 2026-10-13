import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import type { PredictionRecord } from '../../models'
import { formatDay } from '../../lib/format'
import { Colors, Radius } from '../../theme/colors'
import { PressableScale } from './PressableScale'
import { TeamCrest } from './TeamCrest'

interface PredictionRowProps {
  record: PredictionRecord
  onPress: () => void
  index?: number
}

function pickLabel(record: PredictionRecord): string {
  if (record.outcome === 'draw') return 'Empate'
  return record.outcome === 'home' ? record.homeTeam : record.awayTeam
}

export function PredictionRow({ record, onPress, index = 0 }: PredictionRowProps) {
  const { isCorrect } = record
  const badge =
    isCorrect === true
      ? { text: `+${record.pointsEarned} pts`, fg: Colors.primary, bg: Colors.primarySoft }
      : isCorrect === false
        ? { text: 'Fallado', fg: Colors.loss, bg: Colors.lossSoft }
        : { text: 'Pendiente', fg: Colors.textMuted, bg: Colors.surfaceHigh }

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 50).springify().damping(18)}>
      <PressableScale onPress={onPress} haptic style={styles.row}>
        <View style={styles.crests}>
          <TeamCrest logo={record.homeLogo} name={record.homeTeam} size={36} />
          <View style={styles.overlap}>
            <TeamCrest logo={record.awayLogo} name={record.awayTeam} size={36} />
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.match} numberOfLines={1}>
            {record.homeTeam} vs {record.awayTeam}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {pickLabel(record)} · {record.confidence}% · {formatDay(record.matchDate)}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.fg }]}>{badge.text}</Text>
        </View>
      </PressableScale>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  crests: { flexDirection: 'row', alignItems: 'center', width: 58 },
  overlap: { marginLeft: -14, borderRadius: 18, borderWidth: 2, borderColor: Colors.surface },
  info: { flex: 1, gap: 3 },
  match: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  meta: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '800' },
})
