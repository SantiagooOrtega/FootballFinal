import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Colors } from '../../theme/colors'

interface TeamCrestProps {
  logo: string | null
  name: string
  size?: number
}

/** Escudo del equipo; si la imagen no carga, muestra un monograma. */
export function TeamCrest({ logo, name, size = 48 }: TeamCrestProps) {
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

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F8F5',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
  },
  initials: { color: Colors.text, fontWeight: '800', letterSpacing: 0.5 },
})
