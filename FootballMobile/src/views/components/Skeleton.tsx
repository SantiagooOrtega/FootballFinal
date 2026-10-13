import { useEffect } from 'react'
import { StyleSheet, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

interface SkeletonProps {
  height: number
  width?: DimensionValue
  radius?: number
  style?: StyleProp<ViewStyle>
}

export function Skeleton({ height, width = '100%', radius = 16, style }: SkeletonProps) {
  const styles = useThemedStyles(createStyles)
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

const createStyles = (c: Palette) =>
  StyleSheet.create({
    base: { backgroundColor: c.surfaceHigh },
  })
