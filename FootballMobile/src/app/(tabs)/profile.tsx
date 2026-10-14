import { useCallback } from 'react'
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect, useRouter } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../controllers/AuthContext'
import { useMyPredictions } from '../../controllers/dataControllers'
import { Radius } from '../../theme/colors'
import { Avatar } from '../../views/components/Avatar'
import { Button } from '../../views/components/Button'
import { ConfidenceRing } from '../../views/components/ConfidenceRing'
import { PredictionRow } from '../../views/components/PredictionRow'
import { Screen } from '../../views/components/Screen'
import { SectionHeader } from '../../views/components/SectionHeader'
import { Skeleton } from '../../views/components/Skeleton'
import { SettingsButton } from '../../views/components/SettingsButton'
import { ThemeToggle } from '../../views/components/ThemeToggle'
import { useTheme, useThemedStyles, useType } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'
import { useI18n } from '../../i18n/I18nProvider'

function Tally({ value, label, color }: { value: number; label: string; color: string }) {
  const styles = useThemedStyles(createStyles)
  return (
    <View style={styles.tally}>
      <Text style={[styles.tallyValue, { color }]}>{value}</Text>
      <Text style={styles.tallyLabel}>{label}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const { t } = useI18n()
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const type = useType()
  const router = useRouter()
  const { user, logout, refreshUser } = useAuth()
  const { data, loading, refreshing, refresh } = useMyPredictions()

  useFocusEffect(
    useCallback(() => {
      void refreshUser()
    }, [refreshUser]),
  )

  const confirmLogout = () => {
    Alert.alert(t('profile.logout'), t('profile.logoutMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: () => void logout() },
    ])
  }

  if (!user) return null

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.topRow}>
          <ThemeToggle />
          <SettingsButton />
        </View>

        <Animated.View entering={FadeInDown.duration(500)} style={styles.identity}>
          <Avatar name={user.username} uri={user.avatarUrl} size={84} />
          <Text style={type.title}>{user.username}</Text>
          <Text style={type.bodyMuted}>{user.email}</Text>
          {user.favoriteTeam ? (
            <View style={styles.team}>
              <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
              <Text style={styles.teamText}>{user.favoriteTeam}</Text>
            </View>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify().damping(18)} style={styles.summary}>
          <ConfidenceRing value={user.accuracy} size={104} label="ACIERTO" />
          <View style={styles.tallies}>
            <Tally value={user.points} label={t('profile.points')} color={colors.primary} />
            <Tally value={user.correctPredictions} label={t('profile.correct')} color={colors.text} />
            <Tally value={user.totalPredictions} label={t('profile.predictions')} color={colors.text} />
          </View>
        </Animated.View>

        <View style={styles.section}>
          <SectionHeader title={t('profile.history')} />
          {loading && (
            <>
              <Skeleton height={68} />
              <Skeleton height={68} />
            </>
          )}
          {data && data.records.length === 0 && (
            <Text style={type.bodyMuted}>
              {t('profile.empty')}
            </Text>
          )}
          {data?.records.map((record, index) => (
            <PredictionRow
              key={record.id}
              record={record}
              index={index}
              onPress={() => router.push({ pathname: '/match/[id]', params: { id: record.matchId } })}
            />
          ))}
        </View>

        <Button label={t('profile.logout')} variant="ghost" icon="log-out-outline" onPress={confirmLogout} />
      </ScrollView>
    </Screen>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    scroll: { padding: 20, paddingBottom: 32, gap: 24 },
    topRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    identity: { alignItems: 'center', gap: 6, paddingTop: 8 },
    team: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: c.primarySoft,
      borderWidth: 1,
      borderColor: c.primaryLine,
    },
    teamText: { color: c.primary, fontSize: 13, fontWeight: '700' },
    summary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      padding: 18,
      borderRadius: Radius.lg,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    tallies: { flex: 1, gap: 12 },
    tally: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
    tallyValue: { fontSize: 20, fontWeight: '800' },
    tallyLabel: { color: c.textMuted, fontSize: 13, fontWeight: '600' },
    section: { gap: 12 },
  })
