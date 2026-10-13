import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Colors } from '../../theme/colors'
import { Type } from '../../theme/typography'

interface SectionHeaderProps {
  title: string
  actionLabel?: string
  onAction?: () => void
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={Type.heading}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable hitSlop={10} onPress={onAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  action: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
})
