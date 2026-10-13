import { StyleSheet, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { Colors } from '../../theme/colors'
import { initials } from '../../lib/format'

interface AvatarProps {
  name: string
  uri?: string | null
  size?: number
}

export function Avatar({ name, uri, size = 44 }: AvatarProps) {
  const box = { width: size, height: size, borderRadius: size / 2 }

  if (uri) return <Image source={uri} style={box} contentFit="cover" />

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryStrong]}
      style={[styles.base, box]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials(name)}</Text>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  text: { color: Colors.onPrimary, fontWeight: '800' },
})
