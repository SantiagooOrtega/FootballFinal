import { useState } from 'react'
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import Animated, { FadeIn } from 'react-native-reanimated'
import type { MatchStatus } from '../../models'
import { useLeagues, useMatches } from '../../controllers/dataControllers'
import { Colors } from '../../theme/colors'
import { Type } from '../../theme/typography'
import { Chip } from '../../views/components/Chip'
import { MatchCard } from '../../views/components/MatchCard'
import { Screen } from '../../views/components/Screen'
import { SegmentedControl } from '../../views/components/SegmentedControl'
import { Skeleton } from '../../views/components/Skeleton'
import { StateView } from '../../views/components/StateView'

type StatusFilter = 'all' | MatchStatus

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'scheduled', label: 'Próximos' },
  { value: 'live', label: 'En vivo' },
  { value: 'finished', label: 'Final' },
] as const

export default function MatchesScreen() {
  const router = useRouter()
  const [status, setStatus] = useState<StatusFilter>('all')
  const [leagueId, setLeagueId] = useState<number | undefined>(undefined)
  const leagues = useLeagues()
  const matches = useMatches(status === 'all' ? undefined : status, leagueId)

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={Type.display}>Partidos</Text>
        <SegmentedControl options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipsBleed}
        >
          <Chip label="Todas las ligas" active={leagueId === undefined} onPress={() => setLeagueId(undefined)} />
          {leagues.data?.map((league) => (
            <Chip
              key={league.id}
              label={league.name}
              active={leagueId === league.id}
              onPress={() => setLeagueId(league.id)}
            />
          ))}
        </ScrollView>
      </View>

      {matches.loading ? (
        <View style={styles.list}>
          <Skeleton height={176} />
          <Skeleton height={176} />
          <Skeleton height={176} />
        </View>
      ) : matches.error ? (
        <StateView
          icon="cloud-offline-outline"
          title="No pudimos cargar los partidos"
          message={matches.error}
          actionLabel="Reintentar"
          onAction={matches.retry}
        />
      ) : (
        <Animated.View entering={FadeIn.duration(250)} style={styles.flex}>
          <FlatList
            data={matches.data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={matches.refreshing}
                onRefresh={matches.refresh}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={
              <StateView
                icon="football-outline"
                title="Sin partidos"
                message="No hay partidos que coincidan con estos filtros."
              />
            }
            renderItem={({ item, index }) => (
              <MatchCard
                match={item}
                index={index}
                onPress={() => router.push({ pathname: '/match/[id]', params: { id: item.id } })}
              />
            )}
          />
        </Animated.View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, gap: 16 },
  chipsBleed: { marginHorizontal: -20 },
  chips: { paddingHorizontal: 20, gap: 8 },
  list: { padding: 20, paddingBottom: 32, gap: 14 },
})
