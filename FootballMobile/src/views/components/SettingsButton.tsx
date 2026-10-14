import { StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Radius } from '../../theme/colors'
import type { Palette } from '../../theme/colors'
import { useI18n } from '../../i18n/I18nProvider'
import { useTheme, useThemedStyles } from '../../theme/ThemeProvider'
import { PressableScale } from './PressableScale'

/** Abre la pantalla de ajustes (idioma y apariencia). */
export function SettingsButton() {
  const { t } = useI18n()
  const router = useRouter()
  const { colors } = useTheme()
  const styles = useThemedStyles(createStyles)

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={t('settings.title')}
      style={styles.button}
      onPress={() => {
        void Haptics.selectionAsync()
        router.push('/settings')
      }}
    >
      <Ionicons name="settings-outline" size={20} color={colors.text} />
    </PressableScale>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    button: {
      width: 42,
      height: 42,
      borderRadius: Radius.md,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
