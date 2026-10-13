import { StyleSheet, Text, View } from 'react-native'
import type { Palette } from '../../theme/colors'
import { useTheme, useThemedStyles } from '../../theme/ThemeProvider'

const resultTones = (colors: Palette): Record<string, { bg: string; fg: string }> => ({
  W: { bg: colors.primary, fg: colors.onPrimary },
  D: { bg: colors.draw, fg: '#FFFFFF' },
  L: { bg: colors.loss, fg: '#FFFFFF' },
})

/** Racha reciente: V (victoria), E (empate), D (derrota). */
export function FormStrip({ form }: { form: string }) {
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const results = form.split('').slice(-5)
  const tones = resultTones(colors)
  if (results.length === 0) return <Text style={styles.empty}>Sin datos</Text>

  return (
    <View style={styles.row}>
      {results.map((r, i) => {
        const tone = tones[r] ?? tones.D
        const letter = r === 'W' ? 'V' : r === 'L' ? 'D' : 'E'
        return (
          <View key={i} style={[styles.chip, { backgroundColor: tone.bg }]}>
            <Text style={[styles.letter, { color: tone.fg }]}>{letter}</Text>
          </View>
        )
      })}
    </View>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: 5 },
    chip: { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
    letter: { fontSize: 11, fontWeight: '800' },
    empty: { color: c.textFaint, fontSize: 12, fontWeight: '600' },
  })
