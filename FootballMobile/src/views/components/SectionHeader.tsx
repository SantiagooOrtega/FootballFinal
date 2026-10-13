import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useThemedStyles, useType } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

interface SectionHeaderProps {
  title: string
  actionLabel?: string
  onAction?: () => void
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const styles = useThemedStyles(createStyles)
  const type = useType()
  return (
    <View style={styles.row}>
      <Text style={type.heading}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable hitSlop={10} onPress={onAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    action: { color: c.primary, fontSize: 14, fontWeight: '700' },
  })
