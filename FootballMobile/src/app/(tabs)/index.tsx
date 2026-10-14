import { useCallback } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useAuth } from '../../controllers/AuthContext'
import { useHome } from '../../controllers/dataControllers'
import { Avatar } from '../../views/components/Avatar'
import { MatchCard } from '../../views/components/MatchCard'
import { PredictionRow } from '../../views/components/PredictionRow'
import { Screen } from '../../views/components/Screen'
import { SectionHeader } from '../../views/components/SectionHeader'
import { Skeleton } from '../../views/components/Skeleton'
import { StatCard } from '../../views/components/StatCard'
import { StateView } from '../../views/components/StateView'
import { ThemeToggle } from '../../views/components/ThemeToggle'
import { useTheme, useType } from '../../theme/ThemeProvider'
import { useI18n } from '../../i18n/I18nProvider'

export default function HomeScreen() {
  const { t } = useI18n()
  const { colors } = useTheme()
  const type = useType()
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const { data, loading, refreshing, error, refresh, retry } = useHome()
  const { width } = useWindowDimensions()
  const cardWidth = width - 64

  useFocusEffect(
    useCallback(() => {
      void refreshUser()
    }, [refreshUser]),
  )

  const openMatch = (id: string) => router.push({ pathname: '/match/[id]', params: { id } })
  const todayIds = new Set(data?.today.map((m) => m.id))
  const upcoming = data?.upcoming.filter((m) => !todayIds.has(m.id)).slice(0, 4) ?? []

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <View style={styles.greeting}>
            <Text style={type.bodyMuted}>{t('home.welcome')}</Text>
            <Text style={type.title} numberOfLines={1}>
              {user?.username ?? t('home.player')}
            </Text>
          </View>
          <View style={styles.actions}>
            <ThemeToggle />
            <Avatar name={user?.username ?? 'FB'} uri={user?.avatarUrl} size={46} />
          </View>
        </Animated.View>

        <View style={styles.stats}>
          <StatCard icon="flash" value={String(user?.points ?? 0)} label={t('home.points')} index={0} />
          <StatCard icon="locate" value={`${Math.round(user?.accuracy ?? 0)}%`} label={t('home.accuracy')} index={1} />
          <StatCard icon="layers" value={String(data?.summary.total ?? user?.totalPredictions ?? 0)} label={t('home.predictions')} index={2} />
        </View>

        {loading && (
          <View style={styles.section}>
            <Skeleton height={26} width={180} radius={8} />
            <Skeleton height={190} />
            <Skeleton height={190} />
          </View>
        )}

        {error && !loading && (
          <StateView
            icon="cloud-offline-outline"
            title={t('home.loadError')}
            message={error}
            actionLabel={t('common.retry')}
            onAction={retry}
          />
        )}

        {data && (
          <>
            <View style={styles.section}>
              <SectionHeader title={t('home.todayTomorrow')} />
              {data.today.length === 0 ? (
                <Text style={type.bodyMuted}>{t('home.noToday')}</Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={cardWidth + 12}
                  decelerationRate="fast"
                  contentContainerStyle={styles.carousel}
                  style={styles.carouselBleed}
                >
                  {data.today.map((match, index) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      index={index}
                      style={{ width: cardWidth }}
                      onPress={() => openMatch(match.id)}
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            {upcoming.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title={t('home.upcoming')}
                  actionLabel={t('home.seeAll')}
                  onAction={() => router.navigate('/matches')}
                />
                {upcoming.map((match, index) => (
                  <MatchCard key={match.id} match={match} index={index} onPress={() => openMatch(match.id)} />
                ))}
              </View>
            )}

            <View style={styles.section}>
              <SectionHeader
                title={t('home.recent')}
                actionLabel={data.recent.length > 0 ? t('home.seeProfile') : undefined}
                onAction={() => router.navigate('/profile')}
              />
              {data.recent.length === 0 ? (
                <Text style={type.bodyMuted}>
                  {t('home.noPredictions')}
                </Text>
              ) : (
                data.recent.map((record, index) => (
                  <PredictionRow
                    key={record.id}
                    record={record}
                    index={index}
                    onPress={() => openMatch(record.matchId)}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 32, gap: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  greeting: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stats: { flexDirection: 'row', gap: 10 },
  section: { gap: 14 },
  carouselBleed: { marginHorizontal: -20 },
  carousel: { paddingHorizontal: 20, gap: 12 },
})
