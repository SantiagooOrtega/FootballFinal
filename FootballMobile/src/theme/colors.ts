export const darkPalette = {
  bg: '#050B08',
  surface: '#0B1711',
  surfaceHigh: '#112219',
  border: '#1B3125',
  borderStrong: '#2A4A38',
  glow: 'rgba(31, 211, 91, 0.16)',

  primary: '#1FD35B',
  primaryStrong: '#14A946',
  primarySoft: 'rgba(31, 211, 91, 0.14)',
  primaryLine: 'rgba(31, 211, 91, 0.32)',
  onPrimary: '#03140A',

  highlight: '#C8F43A',

  text: '#F1F7F3',
  textMuted: '#8DA699',
  textFaint: '#566D61',

  draw: '#F5B83D',
  drawSoft: 'rgba(245, 184, 61, 0.14)',
  loss: '#F2564D',
  lossSoft: 'rgba(242, 86, 77, 0.14)',
  info: '#4CC2FF',
}

export type Palette = Record<keyof typeof darkPalette, string>

export const lightPalette: Palette = {
  bg: '#F3F8F4',
  surface: '#FFFFFF',
  surfaceHigh: '#E9F2EC',
  border: '#D3E2D8',
  borderStrong: '#B6CDBE',
  glow: 'rgba(11, 138, 59, 0.12)',

  primary: '#0B8A3B',
  primaryStrong: '#087030',
  primarySoft: 'rgba(11, 138, 59, 0.10)',
  primaryLine: 'rgba(11, 138, 59, 0.35)',
  onPrimary: '#FFFFFF',

  highlight: '#6B8E00',

  text: '#111814',
  textMuted: '#4F6B5A',
  textFaint: '#7B9484',

  draw: '#9A6410',
  drawSoft: 'rgba(183, 121, 31, 0.14)',
  loss: '#C0352D',
  lossSoft: 'rgba(201, 60, 52, 0.10)',
  info: '#0B7FB3',
}

// Colores de marca: el logo no cambia con el tema
export const Brand = {
  ink: '#03140A',
  spark: '#C8F43A',
} as const

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const
