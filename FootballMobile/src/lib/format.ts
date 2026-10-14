import { getLanguage, translate } from '../i18n'

const DAYS = {
  es: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}
const MONTHS = {
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

const pad = (n: number) => String(n).padStart(2, '0')

export function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDay(iso: string): string {
  const language = getLanguage()
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  if (same(d, today)) return translate('date.today')
  if (same(d, tomorrow)) return translate('date.tomorrow')
  const day = DAYS[language][d.getDay()]
  const month = MONTHS[language][d.getMonth()]
  return language === 'en' ? `${day}, ${month} ${d.getDate()}` : `${day} ${d.getDate()} ${month}`
}

export function formatKickoff(iso: string): string {
  return `${formatDay(iso)} · ${formatTime(iso)}`
}

/** Traduce la ronda guardada por el backend ("Jornada 12", "LEAGUE_STAGE", ...). */
export function formatRound(round: string): string {
  const matchday = round.match(/^Jornada (\d+)$/)
  if (matchday) return translate('match.matchday', { n: matchday[1] })
  if (round === 'LEAGUE_STAGE') return translate('match.leagueStage')
  if (/FINAL|ROUND|PLAYOFF|KNOCKOUT/.test(round)) return translate('match.knockout')
  return round
}

export function initials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase()
}
