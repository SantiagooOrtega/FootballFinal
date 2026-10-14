import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useAuth } from '../../controllers/AuthContext'
import { useLeaderboard } from '../../controllers/dataControllers'
import { Radius } from '../../theme/colors'
import { Avatar } from '../../views/components/Avatar'
import { Podium } from '../../views/components/Podium'
import { Screen } from '../../views/components/Screen'
import { Skeleton } from '../../views/components/Skeleton'
import { StateView } from '../../views/components/StateView'
import { useTheme, useThemedStyles, useType } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'
import { useI18n } from '../../i18n/I18nProvider'

export default function RankingScreen() {
  const { t } = useI18n()
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const type = useType()
  const { user } = useAuth()
  const { data, loading, refreshing, error, refresh, retry } = useLeaderboard()
  const rest = data?.slice(3) ?? []

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.heading}>
          <Text style={type.display}>{t('ranking.title')}</Text>
          <Text style={type.bodyMuted}>{t('ranking.subtitle')}</Text>
        </View>

        {loading && (
          <View style={styles.skeletons}>
            <Skeleton height={230} />
            <Skeleton height={64} />
            <Skeleton height={64} />
          </View>
        )}

        {error && !loading && (
          <StateView
            icon="cloud-offline-outline"
            title={t('ranking.loadError')}
            message={error}
            actionLabel={t('common.retry')}
            onAction={retry}
          />
        )}

        {data && data.length === 0 && (
          <StateView
            icon="trophy-outline"
            title={t('ranking.emptyTitle')}
            message={t('ranking.emptyMessage')}
          />
        )}

        {data && data.length > 0 && (
          <>
            <Podium entries={data.slice(0, 3)} />
            <View style={styles.list}>
              {rest.map((entry, index) => {
                const isMe = entry.id === user?.id
                return (
                  <Animated.View
                    key={entry.id}
                    entering={FadeInDown.delay(300 + Math.min(index, 8) * 50).springify().damping(18)}
                    style={[styles.row, isMe && styles.rowMe]}
                  >
                    <Text style={styles.rank}>{entry.rank}</Text>
                    <Avatar name={entry.username} uri={entry.avatarUrl} size={40} />
                    <View style={styles.info}>
                      <Text style={styles.name} numberOfLines={1}>
                        {entry.username}
                        {isMe ? `  ${t('ranking.you')}` : ''}
                      </Text>
                      <Text style={styles.meta}>
                        {t('ranking.stats', { accuracy: Math.round(entry.accuracy), total: entry.totalPredictions })}
                      </Text>
                    </View>
                    <Text style={styles.points}>{entry.points}</Text>
                  </Animated.View>
                )
              })}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    scroll: { padding: 20, paddingBottom: 32, gap: 24 },
    heading: { gap: 4 },
    skeletons: { gap: 12 },
    list: { gap: 10 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: Radius.md,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    rowMe: { borderColor: c.primary, backgroundColor: c.primarySoft },
    rank: { width: 26, textAlign: 'center', color: c.textMuted, fontSize: 15, fontWeight: '800' },
    info: { flex: 1, gap: 2 },
    name: { color: c.text, fontSize: 15, fontWeight: '700' },
    meta: { color: c.textMuted, fontSize: 12, fontWeight: '600' },
    points: { color: c.primary, fontSize: 17, fontWeight: '800' },
  })
