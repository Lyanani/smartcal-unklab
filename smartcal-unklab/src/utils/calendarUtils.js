import { DAY_NAMES, TODAY } from '../data/calendarData'

export const cn = (...a) => a.flat().filter(Boolean).join(' ')

export const weekdayOf = (day) => DAY_NAMES[(day - 1) % 7]

export const eventsOnDay = (list, day) => list.filter((e) => day >= e.start && day <= e.end)

export function formatEventDateText(event) {
  return event.end > event.start
    ? `${event.start} – ${event.end} November 2026`
    : `${weekdayOf(event.start)}, ${event.start} November 2026`
}

export function getRelativeDayLabel(startDay, endDay) {
  if (TODAY >= startDay && TODAY <= endDay) return { text: 'Hari Ini', tone: 'rose' }
  if (startDay < TODAY) return { text: 'Selesai', tone: 'muted' }
  const diff = startDay - TODAY
  if (diff === 1) return { text: 'Besok (H-1)', tone: 'amber' }
  if (diff <= 4) return { text: `H-${diff} Hari`, tone: 'amber' }
  return { text: `H-${diff} Hari`, tone: 'sky' }
}

export function buildGoogleCalendarUrl(event) {
  const startDate = formatAcademicDate(event.start)
  const endDate = formatAcademicDate(event.end + 1)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[SmartCal UNKLAB] ${event.title}`,
    dates: `${startDate}/${endDate}`,
    details: `${event.description}\n\nTarget: ${event.faculty}\nWaktu: ${event.time}`,
    location: event.location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function formatAcademicDate(day) {
  return new Date(Date.UTC(2026, 10, day)).toISOString().slice(0, 10).replaceAll('-', '')
}

function escapeIcsText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function foldIcsLine(line) {
  const encoder = new TextEncoder()
  const folded = []
  let current = ''
  let byteLength = 0

  for (const character of line) {
    const characterLength = encoder.encode(character).length
    if (byteLength + characterLength > 75) {
      folded.push(current)
      current = ` ${character}`
      byteLength = 1 + characterLength
    } else {
      current += character
      byteLength += characterLength
    }
  }

  folded.push(current)
  return folded.join('\r\n')
}

export function buildIcsContent(eventList) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SmartCal UNKLAB//Kalender Akademik 2026//ID',
    'CALSCALE:GREGORIAN',
  ]
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')

  eventList.forEach((ev) => {
    const dtStart = formatAcademicDate(ev.start)
    const dtEnd = formatAcademicDate(ev.end + 1)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeIcsText(`smartcal-${ev.id}@unklab.ac.id`)}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      `SUMMARY:${escapeIcsText(ev.title)}`,
      `LOCATION:${escapeIcsText(ev.location)}`,
      `DESCRIPTION:${escapeIcsText(`${ev.description} (${ev.time})`)}`,
      'END:VEVENT',
    )
  })
  lines.push('END:VCALENDAR')

  return lines.map(foldIcsLine).join('\r\n')
}

export function downloadIcsFile(eventList, label = 'SmartCal-UNKLAB-Nov2026') {
  const blob = new Blob([buildIcsContent(eventList)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${label}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
