import { StyleSheet, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { initials } from '../../lib/format'
import { useTheme, useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

interface AvatarProps {
  name: string
  uri?: string | null
  size?: number
}

export function Avatar({ name, uri, size = 44 }: AvatarProps) {
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const box = { width: size, height: size, borderRadius: size / 2 }

  if (uri) return <Image source={uri} style={box} contentFit="cover" />

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryStrong]}
      style={[styles.base, box]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials(name)}</Text>
    </LinearGradient>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    base: { alignItems: 'center', justifyContent: 'center' },
    text: { color: c.onPrimary, fontWeight: '800' },
  })
