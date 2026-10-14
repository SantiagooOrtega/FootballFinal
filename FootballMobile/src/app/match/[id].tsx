import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import {
  CONFIDENCE_LEVELS,
  isOpenForPrediction,
  outcomeLabel,
  type Match,
  type Outcome,
} from '../../models'
import { useMatch } from '../../controllers/dataControllers'
import { formatKickoff, formatRound } from '../../lib/format'
import { Radius } from '../../theme/colors'
import { Button } from '../../views/components/Button'
import { Chip } from '../../views/components/Chip'
import { ComparisonBar } from '../../views/components/ComparisonBar'
import { ConfidenceRing } from '../../views/components/ConfidenceRing'
import { ErrorBanner } from '../../views/components/ErrorBanner'
import { FormStrip } from '../../views/components/FormStrip'
import { OutcomePicker } from '../../views/components/OutcomePicker'
import { Screen } from '../../views/components/Screen'
import { Skeleton } from '../../views/components/Skeleton'
import { StateView } from '../../views/components/StateView'
import { StatusPill } from '../../views/components/StatusPill'
import { TeamCrest } from '../../views/components/TeamCrest'
import { useTheme, useThemedStyles, useType } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'
import { useI18n } from '../../i18n/I18nProvider'

function Hero({ match }: { match: Match }) {
  const { t } = useI18n()
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const { homeTeam, awayTeam, score } = match
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.hero}>
      <View style={styles.heroTop}>
        <Text style={styles.league} numberOfLines={1}>
          {match.league.name}
          {match.round ? ` · ${formatRound(match.round)}` : ''}
        </Text>
        <StatusPill status={match.status} />
      </View>
      <View style={styles.heroTeams}>
        <View style={styles.heroTeam}>
          <TeamCrest logo={homeTeam.logo} name={homeTeam.shortName} size={72} />
          <Text style={styles.heroName} numberOfLines={2}>
            {homeTeam.name}
          </Text>
        </View>
        <View style={styles.heroCenter}>
          {score ? (
            <Text style={styles.heroScore}>
              {score.home} - {score.away}
            </Text>
          ) : (
            <Text style={styles.heroVs}>{t('match.vs')}</Text>
          )}
        </View>
        <View style={styles.heroTeam}>
          <TeamCrest logo={awayTeam.logo} name={awayTeam.shortName} size={72} />
          <Text style={styles.heroName} numberOfLines={2}>
            {awayTeam.name}
          </Text>
        </View>
      </View>
      <View style={styles.heroMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{formatKickoff(match.date)}</Text>
        </View>
        {match.venue ? (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {match.venue}
            </Text>
          </View>
        ) : null}
      </View>
    </Animated.View>
  )
}

function AiCard({ match }: { match: Match }) {
  const { t } = useI18n()
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const type = useType()
  const { ai } = match
  const headline = ai.outcome
    ? ai.outcome === 'draw'
      ? t('detail.aiDraw')
      : t('detail.aiHome', { team: outcomeLabel(match, ai.outcome) })
    : t('detail.aiPending')

  return (
    <Animated.View entering={FadeInDown.delay(120).springify().damping(18)} style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="sparkles" size={16} color={colors.highlight} />
        <Text style={type.label}>{t('detail.aiTitle')}</Text>
      </View>
      <View style={styles.aiRow}>
        {ai.confidence !== null && <ConfidenceRing value={ai.confidence} size={92} label="CONFIANZA" />}
        <Text style={styles.aiHeadline}>{headline}</Text>
      </View>
      {ai.analysis ? <Text style={type.bodyMuted}>{ai.analysis}</Text> : null}
    </Animated.View>
  )
}

function ComparisonCard({ match }: { match: Match }) {
  const { t } = useI18n()
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const type = useType()
  const { homeTeam, awayTeam } = match
  return (
    <Animated.View entering={FadeInDown.delay(220).springify().damping(18)} style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="stats-chart" size={16} color={colors.primary} />
        <Text style={type.label}>{t('detail.compare')}</Text>
      </View>
      <View style={styles.formRow}>
        <FormStrip form={homeTeam.form} />
        <Text style={styles.formLabel}>{t('detail.form')}</Text>
        <FormStrip form={awayTeam.form} />
      </View>
      <ComparisonBar label={t('detail.wins')} home={homeTeam.stats.wins} away={awayTeam.stats.wins} />
      <ComparisonBar label={t('detail.draws')} home={homeTeam.stats.draws} away={awayTeam.stats.draws} />
      <ComparisonBar label={t('detail.goalsFor')} home={homeTeam.stats.goalsFor} away={awayTeam.stats.goalsFor} />
      <ComparisonBar
        label={t('detail.goalsAgainst')}
        home={homeTeam.stats.goalsAgainst}
        away={awayTeam.stats.goalsAgainst}
      />
    </Animated.View>
  )
}

export default function MatchDetailScreen() {
  const { t } = useI18n()
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const type = useType()
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: match, loading, error, retry, saving, saveError, savePrediction } = useMatch(id)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [confidence, setConfidence] = useState<number>(60)

  const savedPick = match?.userPick ?? null
  useEffect(() => {
    if (savedPick) {
      setOutcome(savedPick.outcome)
      setConfidence(savedPick.confidence)
    }
  }, [savedPick])

  const open = match ? isOpenForPrediction(match.status) : false
  const unchanged = savedPick?.outcome === outcome && savedPick?.confidence === confidence
  const canSave = open && outcome !== null && !unchanged

  const handleSave = async () => {
    if (!outcome) return
    const ok = await savePrediction(outcome, confidence)
    if (ok) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.bar}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.barTitle}>{t('detail.title')}</Text>
        <View style={styles.back} />
      </View>

      {loading && (
        <View style={styles.scroll}>
          <Skeleton height={230} />
          <Skeleton height={180} />
          <Skeleton height={220} />
        </View>
      )}

      {error && !loading && (
        <StateView
          icon="cloud-offline-outline"
          title={t('detail.loadError')}
          message={error}
          actionLabel={t('common.retry')}
          onAction={retry}
        />
      )}

      {match && (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Hero match={match} />
          <AiCard match={match} />
          <ComparisonCard match={match} />

          <Animated.View entering={FadeInDown.delay(320).springify().damping(18)} style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="locate" size={16} color={colors.primary} />
              <Text style={type.label}>{t('detail.yourPick')}</Text>
            </View>

            {!open ? (
              <Text style={type.bodyMuted}>
                {savedPick
                  ? t('detail.pickClosed', {
                      pick: outcomeLabel(match, savedPick.outcome),
                      confidence: savedPick.confidence,
                    })
                  : t('detail.noPickClosed')}
              </Text>
            ) : (
              <>
                <OutcomePicker match={match} value={outcome} onChange={setOutcome} />
                <View style={styles.confidence}>
                  <Text style={styles.confidenceLabel}>{t('detail.confidence')}</Text>
                  <View style={styles.chips}>
                    {CONFIDENCE_LEVELS.map((level) => (
                      <Chip
                        key={level.value}
                        label={`${t(level.key)} ${level.value}%`}
                        active={confidence === level.value}
                        onPress={() => setConfidence(level.value)}
                      />
                    ))}
                  </View>
                </View>
                <ErrorBanner message={saveError} />
                <Button
                  label={savedPick && unchanged ? t('detail.saved') : t('detail.save')}
                  icon={savedPick && unchanged ? 'checkmark-circle' : 'save-outline'}
                  loading={saving}
                  disabled={!canSave}
                  onPress={handleSave}
                />
              </>
            )}
          </Animated.View>
        </ScrollView>
      )}
    </Screen>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    back: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    barTitle: { color: c.text, fontSize: 16, fontWeight: '800' },
    scroll: { padding: 20, paddingTop: 8, paddingBottom: 32, gap: 16 },

    hero: {
      gap: 20,
      padding: 18,
      borderRadius: Radius.xl,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    league: { flex: 1, color: c.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
    heroTeams: { flexDirection: 'row', alignItems: 'center' },
    heroTeam: { flex: 1, alignItems: 'center', gap: 10 },
    heroName: { color: c.text, fontSize: 15, fontWeight: '800', textAlign: 'center' },
    heroCenter: { width: 84, alignItems: 'center' },
    heroVs: { color: c.textFaint, fontSize: 18, fontWeight: '800', letterSpacing: 2 },
    heroScore: { color: c.text, fontSize: 32, fontWeight: '800', letterSpacing: -1 },
    heroMeta: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 16 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '60%' },
    metaText: { color: c.textMuted, fontSize: 12, fontWeight: '600' },

    card: {
      gap: 16,
      padding: 18,
      borderRadius: Radius.lg,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    aiRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    aiHeadline: { flex: 1, color: c.text, fontSize: 17, fontWeight: '800', lineHeight: 23 },

    formRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    formLabel: { color: c.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },

    confidence: { gap: 10 },
    confidenceLabel: { color: c.textMuted, fontSize: 13, fontWeight: '700' },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  })
