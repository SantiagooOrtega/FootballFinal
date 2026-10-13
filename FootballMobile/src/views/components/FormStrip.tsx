import { StyleSheet, Text, View } from 'react-native'
import { Colors } from '../../theme/colors'

const RESULT_STYLE: Record<string, { bg: string; fg: string }> = {
  W: { bg: Colors.primary, fg: Colors.onPrimary },
  D: { bg: Colors.draw, fg: '#2B1D00' },
  L: { bg: Colors.loss, fg: '#2B0502' },
}

/** Racha reciente: V (victoria), E (empate), D (derrota). */
export function FormStrip({ form }: { form: string }) {
  const results = form.split('').slice(-5)
  if (results.length === 0) return <Text style={styles.empty}>Sin datos</Text>

  return (
    <View style={styles.row}>
      {results.map((r, i) => {
        const tone = RESULT_STYLE[r] ?? RESULT_STYLE.D
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

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 5 },
  chip: { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  letter: { fontSize: 11, fontWeight: '800' },
  empty: { color: Colors.textFaint, fontSize: 12, fontWeight: '600' },
})
