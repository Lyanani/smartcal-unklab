/* Util tanggal untuk Dashboard Tamu. Semua tanggal berformat 'YYYY-MM-DD'
   dan dihitung pada zona waktu WITA (Asia/Makassar), zona kampus UNKLAB. */

export const TZ = 'Asia/Makassar'

export const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
export const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

const toUtc = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export const isISO = (value) => {
  if (typeof value !== 'string' || !ISO_RE.test(value)) return false
  const t = toUtc(value)
  return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === value
}

export const todayISO = (now = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)

export const diffDays = (from, to) => Math.round((toUtc(to) - toUtc(from)) / 864e5)

export const addDays = (iso, n) => new Date(toUtc(iso) + n * 864e5).toISOString().slice(0, 10)

export const parts = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m: m - 1, d }
}

export const weekdayName = (iso) => DAYS_ID[new Date(toUtc(iso)).getUTCDay()]

export function formatDate(iso, { weekday = false } = {}) {
  if (!isISO(iso)) return ''
  const { y, m, d } = parts(iso)
  const base = `${d} ${MONTHS_ID[m]} ${y}`
  return weekday ? `${weekdayName(iso)}, ${base}` : base
}

export function formatShort(iso) {
  if (!isISO(iso)) return ''
  const { y, m, d } = parts(iso)
  return `${d} ${MONTHS_SHORT[m]} ${y}`
}

export function formatRange(start, end) {
  if (!isISO(start)) return ''
  if (!isISO(end) || end === start) return formatDate(start, { weekday: true })
  const a = parts(start)
  const b = parts(end)
  if (a.y === b.y && a.m === b.m) return `${a.d} – ${b.d} ${MONTHS_ID[a.m]} ${a.y}`
  if (a.y === b.y) return `${a.d} ${MONTHS_SHORT[a.m]} – ${b.d} ${MONTHS_SHORT[b.m]} ${a.y}`
  return `${a.d} ${MONTHS_SHORT[a.m]} ${a.y} – ${b.d} ${MONTHS_SHORT[b.m]} ${b.y}`
}

export const hasDate = (ev) => isISO(ev?.start)
export const endOf = (ev) => (isISO(ev.end) && ev.end >= ev.start ? ev.end : ev.start)

/* Status sebuah agenda relatif terhadap `today`.
   state: 'tbd' | 'ongoing' | 'upcoming' | 'done' */
export function getStatus(ev, today) {
  if (!hasDate(ev)) return { state: 'tbd', label: 'Belum diumumkan', days: null, tone: 'muted' }
  const end = endOf(ev)
  if (today >= ev.start && today <= end) {
    const left = diffDays(today, end)
    return {
      state: 'ongoing',
      label: left === 0 ? (ev.start === end ? 'Hari ini' : 'Hari terakhir') : `Berlangsung · sisa ${left} hari`,
      days: 0,
      tone: 'emerald',
    }
  }
  if (ev.start > today) {
    const days = diffDays(today, ev.start)
    return {
      state: 'upcoming',
      label: days === 1 ? 'Besok' : `H-${days}`,
      days,
      tone: days <= 7 ? 'amber' : 'sky',
    }
  }
  return { state: 'done', label: 'Selesai', days: null, tone: 'muted' }
}

export const compareEvents = (a, b) => {
  const da = hasDate(a)
  const db = hasDate(b)
  if (da && db) return a.start.localeCompare(b.start) || endOf(a).localeCompare(endOf(b))
  if (da) return -1
  if (db) return 1
  return 0
}

/* Sel kalender bulanan (minggu dimulai Senin). */
export function monthCells(year, month0) {
  const first = Date.UTC(year, month0, 1)
  const offset = (new Date(first).getUTCDay() + 6) % 7
  const start = first - offset * 864e5
  const cells = Array.from({ length: 42 }, (_, i) => {
    const t = new Date(start + i * 864e5)
    return { iso: t.toISOString().slice(0, 10), inMonth: t.getUTCMonth() === month0 }
  })
  return cells[35].inMonth ? cells : cells.slice(0, 35)
}
