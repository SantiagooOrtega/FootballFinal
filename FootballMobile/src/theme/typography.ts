import { StyleSheet } from 'react-native'
import type { Palette } from './colors'

export const createType = (c: Palette) =>
  StyleSheet.create({
    display: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8, color: c.text },
    title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, color: c.text },
    heading: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2, color: c.text },
    body: { fontSize: 15, fontWeight: '500', color: c.text, lineHeight: 22 },
    bodyMuted: { fontSize: 14, fontWeight: '500', color: c.textMuted, lineHeight: 21 },
    label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: c.textMuted, textTransform: 'uppercase' },
    caption: { fontSize: 12, fontWeight: '600', color: c.textMuted },
  })
