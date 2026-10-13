import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Button } from './Button'
import { useTheme, useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

interface StateViewProps {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

/** Estado vacio o de error con una accion opcional de reintento. */
export function StateView({ icon, title, message, actionLabel, onAction }: StateViewProps) {
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.wrap}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={30} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} onPress={onAction} variant="ghost" icon="refresh" />
        </View>
      ) : null}
    </Animated.View>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48, gap: 8 },
    iconBox: {
      width: 68,
      height: 68,
      borderRadius: 22,
      backgroundColor: c.primarySoft,
      borderWidth: 1,
      borderColor: c.primaryLine,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    title: { color: c.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
    message: { color: c.textMuted, fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 20 },
    action: { marginTop: 16, alignSelf: 'stretch' },
  })
