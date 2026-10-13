import { StyleSheet, Text } from 'react-native'
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Radius } from '../../theme/colors'
import { useTheme, useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

export function ErrorBanner({ message }: { message: string | null }) {
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  if (!message) return null
  return (
    <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOutUp.duration(180)} style={styles.box}>
      <Ionicons name="alert-circle" size={18} color={colors.loss} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    box: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 14,
      borderRadius: Radius.md,
      backgroundColor: c.lossSoft,
      borderWidth: 1,
      borderColor: c.loss,
    },
    text: { flex: 1, color: c.text, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  })
