import { DAY_NAMES, MONTH_NAMES } from '../data/calendarData'

export const cn = (...a) => a.flat().filter(Boolean).join(' ')

export const weekdayOf = (day, year = 2026, month = 10) => {
  const d = new Date(year, month, day)
  return DAY_NAMES[d.getDay()]
}

export function normalizeEventDate(event) {
  if (!event) return null
  return {
    ...event,
    year: event.year ?? 2026,
    month: event.month ?? 10,
  }
}

export const eventsOnDay = (list, day, year = 2026, month = 10) =>
  list.filter((e) => {
    const ey = e.year ?? 2026
    const em = e.month ?? 10
    return ey === year && em === month && day >= e.start && day <= e.end
  })

export function formatEventDateText(event) {
  if (!event) return ''
  const year = event.year ?? 2026
  const month = event.month ?? 10
  const monthName = MONTH_NAMES[month] ?? 'November'
  return event.end > event.start
    ? `${event.start} – ${event.end} ${monthName} ${year}`
    : `${weekdayOf(event.start, year, month)}, ${event.start} ${monthName} ${year}`
}

/**
 * Mengurai rentang waktu mulai dan selesai event secara presisi
 */
export function getEventDateRange(event) {
  if (!event) {
    const d = new Date()
    return { startDateTime: d, endDateTime: d }
  }

  const year = event.year ?? 2026
  const month = event.month ?? 10
  const startDay = Number(event.start) || 1
  const endDay = Number(event.end ?? event.start) || startDay

  let startHour = 8
  let startMinute = 0
  if (event.time) {
    const match = event.time.match(/(\d{1,2})[.:](\d{2})/)
    if (match) {
      startHour = parseInt(match[1], 10)
      startMinute = parseInt(match[2], 10)
    } else if (event.time.toLowerCase().includes('seharian')) {
      startHour = 7
      startMinute = 0
    }
  }

  // Jam selesai default 17:00 WITA, atau 23:59 bila batas malam
  let endHour = 17
  let endMinute = 0
  if (startHour >= 17 || (event.time && event.time.includes('23.59'))) {
    endHour = 23
    endMinute = 59
  }

  const startDateTime = new Date(year, month, startDay, startHour, startMinute, 0, 0)
  const endDateTime = new Date(year, month, endDay, endHour, endMinute, 59, 999)

  return { startDateTime, endDateTime }
}

/**
 * Status dinamis event: ongoing, upcoming, atau completed
 */
export function getEventStatus(event, now = new Date()) {
  if (!event) return null
  const { startDateTime, endDateTime } = getEventDateRange(event)
  const currentTime = now.getTime()
  const startTime = startDateTime.getTime()
  const endTime = endDateTime.getTime()

  const year = event.year ?? 2026
  const month = event.month ?? 10
  const totalDays = Math.max(1, (event.end ?? event.start) - event.start + 1)

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const eventStartDay = new Date(year, month, event.start).getTime()
  const dayIndex = Math.min(
    totalDays,
    Math.max(1, Math.floor((todayStart - eventStartDay) / 864e5) + 1),
  )

  // 1. Sudah Selesai
  if (currentTime > endTime) {
    return {
      status: 'completed',
      isOngoing: false,
      isUpcoming: false,
      isCompleted: true,
      startDateTime,
      endDateTime,
      targetTime: null,
      countdownLabel: 'Selesai',
      badgeText: 'TELAH SELESAI',
      badgeTone: 'muted',
    }
  }

  // 2. Sedang Berlangsung (multi-day atau hari ini dalam jam aktif)
  if (currentTime >= startTime && currentTime <= endTime) {
    const badgeText =
      totalDays > 1
        ? `SEDANG BERLANGSUNG · Hari ke-${dayIndex} dari ${totalDays}`
        : 'SEDANG BERLANGSUNG · Hari Ini'

    return {
      status: 'ongoing',
      isOngoing: true,
      isUpcoming: false,
      isCompleted: false,
      startDateTime,
      endDateTime,
      targetTime: endTime,
      countdownLabel: 'Berakhir dalam:',
      badgeText,
      badgeTone: 'emerald',
    }
  }

  // 3. Akan Datang
  const rel = getRelativeDayLabel(event, now)
  return {
    status: 'upcoming',
    isOngoing: false,
    isUpcoming: true,
    isCompleted: false,
    startDateTime,
    endDateTime,
    targetTime: startTime,
    countdownLabel: 'Dimulai dalam:',
    badgeText: `AKAN DATANG · ${rel.text}`,
    badgeTone: rel.tone,
  }
}

/**
 * Label hari relatif (Hari Ini, Besok (H-1), Berlangsung (Sisa X Hari), H-X Hari, Selesai)
 */
export function getRelativeDayLabel(eventOrStart, maybeEndOrNow, maybeNow) {
  let startDay
  let endDay
  let year = 2026
  let month = 10
  let now = new Date()

  if (typeof eventOrStart === 'object' && eventOrStart !== null) {
    startDay = Number(eventOrStart.start) || 1
    endDay = Number(eventOrStart.end ?? eventOrStart.start) || startDay
    year = eventOrStart.year ?? 2026
    month = eventOrStart.month ?? 10
    if (maybeEndOrNow instanceof Date) {
      now = maybeEndOrNow
    }
  } else {
    startDay = Number(eventOrStart) || 1
    if (typeof maybeEndOrNow === 'number') {
      endDay = maybeEndOrNow
      if (maybeNow instanceof Date) now = maybeNow
    } else {
      endDay = startDay
      if (maybeEndOrNow instanceof Date) now = maybeEndOrNow
    }
  }

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startDate = new Date(year, month, startDay).getTime()
  const endDate = new Date(year, month, endDay).getTime()
  const oneDay = 864e5

  // Sedang aktif dalam rentang hari
  if (todayStart >= startDate && todayStart <= endDate) {
    if (endDate > startDate) {
      const remainingDays = Math.max(0, Math.round((endDate - todayStart) / oneDay))
      if (remainingDays === 0) {
        return { text: 'Berlangsung (Hari Terakhir)', tone: 'emerald' }
      }
      return { text: `Berlangsung (Sisa ${remainingDays} Hari)`, tone: 'emerald' }
    }
    return { text: 'Hari Ini', tone: 'rose' }
  }

  if (todayStart > endDate) {
    return { text: 'Selesai', tone: 'muted' }
  }

  const diffDays = Math.round((startDate - todayStart) / oneDay)
  if (diffDays === 1) {
    return { text: 'Besok (H-1)', tone: 'amber' }
  }
  if (diffDays <= 4) {
    return { text: `H-${diffDays} Hari`, tone: 'amber' }
  }
  return { text: `H-${diffDays} Hari`, tone: 'sky' }
}

export function getEventTargetTime(event) {
  if (!event) return 0
  const status = getEventStatus(event)
  return status?.targetTime || 0
}

export function buildGoogleCalendarUrl(event) {
  const pad2 = (n) => String(n).padStart(2, '0')
  const year = event.year ?? 2026
  const month = (event.month ?? 10) + 1
  const lastDayOfMonth = new Date(year, month, 0).getDate()
  const startDate = `${year}${pad2(month)}${pad2(event.start)}`
  const endDay = event.end + 1
  let endDate
  if (endDay > lastDayOfMonth) {
    const nextDate = new Date(year, month - 1, event.end + 1)
    endDate = `${nextDate.getFullYear()}${pad2(nextDate.getMonth() + 1)}${pad2(nextDate.getDate())}`
  } else {
    endDate = `${year}${pad2(month)}${pad2(endDay)}`
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[SmartCal UNKLAB] ${event.title}`,
    dates: `${startDate}/${endDate}`,
    details: `${event.description}\n\nTarget: ${event.faculty}\nWaktu: ${event.time}`,
    location: event.location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function downloadIcsFile(eventList, label = 'SmartCal-UNKLAB') {
  const pad2 = (n) => String(n).padStart(2, '0')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SmartCal UNKLAB//Kalender Akademik//ID',
    'CALSCALE:GREGORIAN',
  ]
  eventList.forEach((ev) => {
    const year = ev.year ?? 2026
    const month = (ev.month ?? 10) + 1
    const lastDayOfMonth = new Date(year, month, 0).getDate()
    const dtStart = `${year}${pad2(month)}${pad2(ev.start)}`
    let dtEnd
    if (ev.end + 1 > lastDayOfMonth) {
      const nextDate = new Date(year, month - 1, ev.end + 1)
      dtEnd = `${nextDate.getFullYear()}${pad2(nextDate.getMonth() + 1)}${pad2(nextDate.getDate())}`
    } else {
      dtEnd = `${year}${pad2(month)}${pad2(ev.end + 1)}`
    }
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

function getEventInterval(event) {
  if (/seharian|sehari penuh/i.test(event.time || "")) {
    return { start: 0, end: 24 * 60 }
  }
  const time = String(event.time || "")
  const match = time.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/)
  const hourOnlyMatch = match ? null : time.match(/\b([01]?\d|2[0-3])\s*(?:WITA|WIB|WIT)\b/i)
  if (!match && !hourOnlyMatch) return null
  const start = match ? Number(match[1]) * 60 + Number(match[2]) : Number(hourOnlyMatch[1]) * 60
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
    const time = `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}`
    const candidate = { start: day, end: day, time, durationMinutes: duration }
    if (getEventConflicts(candidate, events).length === 0) return start
  }
  return null
}

export function formatTimeInput(minutes) {
  const value = Number(minutes) || 0
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`
}

export function parseTimeInput(time) {
  const match = String(time || "").match(/^(?:([01]\d|2[0-3])):([0-5]\d)$/)
  return match ? Number(match[1]) * 60 + Number(match[2]) : null
}
