import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

interface TeamCrestProps {
  logo: string | null
  name: string
  size?: number
}

/** Escudo del equipo; si la imagen no carga, muestra un monograma. */
export function TeamCrest({ logo, name, size = 48 }: TeamCrestProps) {
  const styles = useThemedStyles(createStyles)
  const [failed, setFailed] = useState(false)
  const box = { width: size, height: size, borderRadius: size / 2 }

  if (!logo || failed) {
    return (
      <View style={[styles.fallback, box]}>
        <Text style={[styles.initials, { fontSize: size * 0.34 }]}>{name.slice(0, 3).toUpperCase()}</Text>
      </View>
    )
  }

  return (
    <View style={[styles.frame, box]}>
      <Image
        source={logo}
        contentFit="contain"
        transition={200}
        onError={() => setFailed(true)}
        style={{ width: size * 0.72, height: size * 0.72 }}
      />
    </View>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    frame: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F4F8F5',
    },
    fallback: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surfaceHigh,
      borderWidth: 1,
      borderColor: c.borderStrong,
    },
    initials: { color: c.text, fontWeight: '800', letterSpacing: 0.5 },
  })
