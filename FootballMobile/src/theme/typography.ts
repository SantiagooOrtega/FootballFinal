import { StyleSheet } from 'react-native'
import { Colors } from './colors'

export const Type = StyleSheet.create({
  display: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8, color: Colors.text },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, color: Colors.text },
  heading: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2, color: Colors.text },
  body: { fontSize: 15, fontWeight: '500', color: Colors.text, lineHeight: 22 },
  bodyMuted: { fontSize: 14, fontWeight: '500', color: Colors.textMuted, lineHeight: 21 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: Colors.textMuted, textTransform: 'uppercase' },
  caption: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
})
