import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { Colors, Radius } from '../../theme/colors'
import { PressableScale } from './PressableScale'

interface SegmentedControlProps<T extends string> {
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const [width, setWidth] = useState(0)
  const segment = (width - 8) / options.length
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  )
  const x = useSharedValue(0)

  useEffect(() => {
    x.value = withSpring(index * segment, { damping: 20, stiffness: 240 })
  }, [index, segment, x])

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }))

  return (
    <View style={styles.track} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && <Animated.View style={[styles.thumb, { width: segment }, thumb]} />}
      {options.map((option) => {
        const active = option.value === value
        return (
          <PressableScale
            key={option.value}
            scaleTo={0.95}
            style={styles.segment}
            onPress={() => {
              if (!active) {
                void Haptics.selectionAsync()
                onChange(option.value)
              }
            }}
          >
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {option.label}
            </Text>
          </PressableScale>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumb: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
  },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  label: { color: Colors.textMuted, fontSize: 13, fontWeight: '700' },
  labelActive: { color: Colors.onPrimary, fontWeight: '800' },
})
