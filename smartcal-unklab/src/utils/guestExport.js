import { addDays, endOf, hasDate } from './guestDates'

const compact = (iso) => iso.replaceAll('-', '')
const escapeIcs = (text = '') =>
  String(text).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

export function buildGoogleCalendarUrl(ev) {
  if (!hasDate(ev)) return null
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[UNKLAB] ${ev.title}`,
    dates: `${compact(ev.start)}/${compact(addDays(endOf(ev), 1))}`,
    details: [ev.note, ev.time && `Waktu: ${ev.time}`, 'Sumber: https://www.unklab.ac.id/kalender-akademik/']
      .filter(Boolean)
      .join('\n'),
    location: ev.location || 'Universitas Klabat, Airmadidi',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function downloadIcs(events, label = 'Kalender-UNKLAB') {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SmartCal UNKLAB//Dashboard Tamu//ID', 'CALSCALE:GREGORIAN']
  events.filter(hasDate).forEach((ev) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:smartcal-${ev.id}@unklab.ac.id`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(ev.start)}`,
      `DTEND;VALUE=DATE:${compact(addDays(endOf(ev), 1))}`,
      `SUMMARY:${escapeIcs(ev.title)}`,
      `LOCATION:${escapeIcs(ev.location)}`,
      `DESCRIPTION:${escapeIcs([ev.note, ev.time].filter(Boolean).join(' — '))}`,
      'END:VEVENT',
    )
  })
  lines.push('END:VCALENDAR')

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${label}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
