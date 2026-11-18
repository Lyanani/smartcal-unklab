import { DAY_NAMES, TODAY } from '../data/calendarData'

export const cn = (...a) => a.flat().filter(Boolean).join(' ')

export const weekdayOf = (day) => DAY_NAMES[(day - 1) % 7]

export const eventsOnDay = (list, day) => list.filter((e) => day >= e.start && day <= e.end)

function getEventInterval(event) {
  if (/seharian|sehari penuh/i.test(event.time || '')) {
    return { start: 0, end: 24 * 60 }
  }

  const time = String(event.time || '')
  const match = time.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/)
  const hourOnlyMatch = match ? null : time.match(/\b([01]?\d|2[0-3])\s*(?:WITA|WIB|WIT)\b/i)
  if (!match && !hourOnlyMatch) return null

  const start = match
    ? Number(match[1]) * 60 + Number(match[2])
    : Number(hourOnlyMatch[1]) * 60
  const duration = Number(event.durationMinutes) > 0 ? Number(event.durationMinutes) : 60
  return { start, end: Math.min(24 * 60, start + duration) }
}

export function getEventConflicts(event, events) {
  const interval = getEventInterval(event)
  if (!interval) return []

  return events.filter((other) => {
    if (event.id && String(event.id) === String(other.id)) return false
    if (event.start > other.end || event.end < other.start) return false

    const otherInterval = getEventInterval(other)
    return otherInterval && interval.start < otherInterval.end && otherInterval.start < interval.end
  })
}

export function findAvailableTime(day, durationMinutes, events) {
  const duration = Number(durationMinutes) > 0 ? Number(durationMinutes) : 60
  for (let start = 8 * 60; start + duration <= 22 * 60; start += 30) {
    const time = `${String(Math.floor(start / 60)).padStart(2, '0')}:${String(start % 60).padStart(2, '0')}`
    const candidate = { start: day, end: day, time, durationMinutes: duration }
    if (getEventConflicts(candidate, events).length === 0) return start
  }
  return null
}

export function formatTimeInput(minutes) {
  const value = Number(minutes) || 0
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
}

export function parseTimeInput(time) {
  const match = String(time || '').match(/^(?:([01]\d|2[0-3])):([0-5]\d)$/)
  return match ? Number(match[1]) * 60 + Number(match[2]) : null
}

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
  const pad2 = (n) => String(n).padStart(2, '0')
  const startDate = `202611${pad2(event.start)}`
  const endDate = `202611${pad2(Math.min(30, event.end + 1))}`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[SmartCal UNKLAB] ${event.title}`,
    dates: `${startDate}/${endDate}`,
    details: `${event.description}\n\nTarget: ${event.faculty}\nWaktu: ${event.time}`,
    location: event.location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function downloadIcsFile(eventList, label = 'SmartCal-UNKLAB-Nov2026') {
  const pad2 = (n) => String(n).padStart(2, '0')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SmartCal UNKLAB//Kalender Akademik 2026//ID',
    'CALSCALE:GREGORIAN',
  ]
  eventList.forEach((ev) => {
    const dtStart = `202611${pad2(ev.start)}`
    const dtEnd = `202611${pad2(Math.min(30, ev.end + 1))}`
    lines.push(
      'BEGIN:VEVENT',
      `UID:smartcal-${ev.id}@unklab.ac.id`,
      `DTSTAMP:20261115T000000Z`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      `SUMMARY:${ev.title}`,
      `LOCATION:${ev.location}`,
      `DESCRIPTION:${ev.description.replace(/\n/g, ' ')} (${ev.time})`,
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
