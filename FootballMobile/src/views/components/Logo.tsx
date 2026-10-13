import { StyleSheet, Text, View } from 'react-native'
import Svg, { ClipPath, Circle, Defs, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg'
import { Brand } from '../../theme/colors'
import { useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

const CENTER_PATCH = '50,42 59.5,48.9 55.9,60.1 44.1,60.1 40.5,48.9'
const SPOKES = 'M50 42 L50 23 M59.5 48.9 L77.6 43 M55.9 60.1 L67 75.5 M44.1 60.1 L33 75.5 M40.5 48.9 L22.4 43'
const RIM_PATCHES = [
  '62.3,35 58.7,23.8 68.2,16.9 77.7,23.8 74.1,35',
  '70,58.5 79.5,51.6 89,58.5 85.4,69.7 73.6,69.7',
  '50,73 59.5,79.9 55.9,91.1 44.1,91.1 40.5,79.9',
  '30,58.5 26.4,69.7 14.6,69.7 11,58.5 20.5,51.6',
  '37.7,35 25.9,35 22.3,23.8 31.8,16.9 41.3,23.8',
]

interface LogoProps {
  size?: number
  wordmark?: boolean
}

/** Balon de futbol con destello de IA sobre un escudo verde. */
export function LogoMark({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="badge" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#3BEB7A" />
          <Stop offset="1" stopColor="#0C8F3A" />
        </LinearGradient>
        <ClipPath id="ball">
          <Circle cx="50" cy="52" r="29" />
        </ClipPath>
      </Defs>
      <Rect x="2" y="2" width="96" height="96" rx="28" fill="url(#badge)" />
      <G clipPath="url(#ball)">
        {RIM_PATCHES.map((points) => (
          <Polygon key={points} points={points} fill={Brand.ink} />
        ))}
      </G>
      <Circle cx="50" cy="52" r="29" fill="none" stroke={Brand.ink} strokeWidth="5" />
      <Polygon points={CENTER_PATCH} fill={Brand.ink} />
      <Path d={SPOKES} stroke={Brand.ink} strokeWidth="4" strokeLinecap="round" />
      <Path
        d="M79 12 L81.2 19.8 L89 22 L81.2 24.2 L79 32 L76.8 24.2 L69 22 L76.8 19.8 Z"
        fill={Brand.spark}
      />
    </Svg>
  )
}

export function Logo({ size = 64, wordmark = true }: LogoProps) {
  const styles = useThemedStyles(createStyles)
  return (
    <View style={styles.row}>
      <LogoMark size={size} />
      {wordmark && (
        <Text style={[styles.word, { fontSize: size * 0.46 }]}>
          Football<Text style={styles.ai}>AI</Text>
        </Text>
      )}
    </View>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    word: { color: c.text, fontWeight: '800', letterSpacing: -0.6 },
    ai: { color: c.primary },
  })
