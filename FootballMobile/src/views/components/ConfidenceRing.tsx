import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'
import { Colors } from '../../theme/colors'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

interface ConfidenceRingProps {
  value: number
  size?: number
  stroke?: number
  label?: string
  color?: string
}

export function ConfidenceRing({
  value,
  size = 96,
  stroke = 9,
  label,
  color = Colors.primary,
}: ConfidenceRingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(
      150,
      withTiming(Math.min(Math.max(value, 0), 100) / 100, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      }),
    )
  }, [value, progress])

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }))

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={styles.rotated}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.border}
          strokeWidth={stroke}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          fill="none"
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.value, { fontSize: size * 0.26 }]}>{Math.round(value)}%</Text>
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  rotated: { transform: [{ rotate: '-90deg' }] },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  value: { color: Colors.text, fontWeight: '800', letterSpacing: -0.5 },
  label: { color: Colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.6, marginTop: 1 },
})
