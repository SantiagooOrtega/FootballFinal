import { StyleSheet, Text } from 'react-native'
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Radius } from '../../theme/colors'

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <Animated.View entering={FadeInDown.duration(250)} exiting={FadeOutUp.duration(180)} style={styles.box}>
      <Ionicons name="alert-circle" size={18} color={Colors.loss} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.lossSoft,
    borderWidth: 1,
    borderColor: 'rgba(242, 86, 77, 0.35)',
  },
  text: { flex: 1, color: Colors.text, fontSize: 13, fontWeight: '600', lineHeight: 18 },
})
