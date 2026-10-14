import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../controllers/AuthContext'
import type { Language } from '../i18n'
import { useI18n } from '../i18n/I18nProvider'
import { Radius } from '../theme/colors'
import type { Palette } from '../theme/colors'
import { useTheme, useThemedStyles, useType, type ThemeMode } from '../theme/ThemeProvider'
import { Button } from '../views/components/Button'
import { Screen } from '../views/components/Screen'
import { SegmentedControl } from '../views/components/SegmentedControl'

export default function SettingsScreen() {
  const { t, language, setLanguage } = useI18n()
  const { mode, colors, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()
  const styles = useThemedStyles(createStyles)
  const type = useType()

  const languages: { value: Language; label: string }[] = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
  ]
  const themes: { value: ThemeMode; label: string }[] = [
    { value: 'dark', label: t('settings.themeDark') },
    { value: 'light', label: t('settings.themeLight') },
  ]

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.bar}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.barTitle}>{t('settings.title')}</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="language" size={18} color={colors.primary} />
            <Text style={type.heading}>{t('settings.language')}</Text>
          </View>
          <Text style={type.bodyMuted}>{t('settings.languageHint')}</Text>
          <SegmentedControl options={languages} value={language} onChange={setLanguage} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name={mode === 'dark' ? 'moon' : 'sunny'} size={18} color={colors.primary} />
            <Text style={type.heading}>{t('settings.appearance')}</Text>
          </View>
          <Text style={type.bodyMuted}>{t('settings.appearanceHint')}</Text>
          <SegmentedControl
            options={themes}
            value={mode}
            onChange={(next) => {
              if (next !== mode) toggleTheme()
            }}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
            <Text style={type.heading}>{t('settings.account')}</Text>
          </View>
          {user ? (
            <View style={styles.account}>
              <Text style={type.body}>{user.username}</Text>
              <Text style={type.bodyMuted}>{user.email}</Text>
            </View>
          ) : null}
          <Button
            label={t('profile.logout')}
            variant="ghost"
            icon="log-out-outline"
            onPress={() => void logout()}
          />
        </Animated.View>

        <Text style={styles.version}>
          {t('settings.version')} {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </ScrollView>
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
    card: {
      gap: 14,
      padding: 18,
      borderRadius: Radius.lg,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    account: { gap: 2 },
    version: { color: c.textFaint, fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  })
