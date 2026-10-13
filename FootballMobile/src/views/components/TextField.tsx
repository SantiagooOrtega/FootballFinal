import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Radius } from '../../theme/colors'

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string
  icon: keyof typeof Ionicons.glyphMap
  error?: string | null
  secure?: boolean
}

export function TextField({ label, icon, error, secure, onFocus, onBlur, ...input }: TextFieldProps) {
  const [revealed, setRevealed] = useState(false)
  const focus = useSharedValue(0)

  const box = useAnimatedStyle(() => ({
    borderColor: error
      ? Colors.loss
      : interpolateColor(focus.value, [0, 1], [Colors.border, Colors.primary]),
    backgroundColor: interpolateColor(focus.value, [0, 1], [Colors.surface, Colors.surfaceHigh]),
  }))

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.box, box]}>
        <Ionicons name={icon} size={19} color={Colors.textMuted} />
        <TextInput
          {...input}
          secureTextEntry={secure && !revealed}
          placeholderTextColor={Colors.textFaint}
          selectionColor={Colors.primary}
          cursorColor={Colors.primary}
          style={styles.input}
          onFocus={(e) => {
            focus.value = withTiming(1, { duration: 180 })
            onFocus?.(e)
          }}
          onBlur={(e) => {
            focus.value = withTiming(0, { duration: 180 })
            onBlur?.(e)
          }}
        />
        {secure && (
          <Pressable hitSlop={12} onPress={() => setRevealed((v) => !v)}>
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textMuted}
            />
          </Pressable>
        )}
      </Animated.View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.3 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 54,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  input: { flex: 1, fontSize: 16, fontWeight: '500', color: Colors.text, height: '100%' },
  error: { fontSize: 12, fontWeight: '600', color: Colors.loss },
})
