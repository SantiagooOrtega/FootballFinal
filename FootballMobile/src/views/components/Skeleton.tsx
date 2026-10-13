import { useEffect } from 'react'
import { StyleSheet, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { Colors } from '../../theme/colors'

interface SkeletonProps {
  height: number
  width?: DimensionValue
  radius?: number
  style?: StyleProp<ViewStyle>
}

export function Skeleton({ height, width = '100%', radius = 16, style }: SkeletonProps) {
  const opacity = useSharedValue(0.5)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0.5, { duration: 800 })),
      -1,
    )
  }, [opacity])

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View
      style={[styles.base, { height, width, borderRadius: radius }, animated, style]}
    />
  )
}

const styles = StyleSheet.create({
  base: { backgroundColor: Colors.surfaceHigh },
})
