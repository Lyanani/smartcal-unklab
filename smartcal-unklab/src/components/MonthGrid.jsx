import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { CATEGORIES } from '../data/calendarData'
import { cn, eventsOnDay } from '../utils/calendarUtils'

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const MONTH_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]

function buildCells(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7
  const cells = []
  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, muted: true })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d })
  }
  let nextDay = 1
  while (cells.length < 42) {
    cells.push({ day: nextDay++, muted: true })
  }
  return cells
}

const REAL_TODAY = new Date()
const REAL_TODAY_DAY = REAL_TODAY.getDate()
const REAL_TODAY_MONTH = REAL_TODAY.getMonth()
const REAL_TODAY_YEAR = REAL_TODAY.getFullYear()

export default function MonthGrid({ events, selected, remindedIds, onSelectDay, onSelectEvent }) {
  const [viewYear, setViewYear] = useState(REAL_TODAY_YEAR)
  const [viewMonth, setViewMonth] = useState(REAL_TODAY_MONTH)

  const isCurrentMonth = viewYear === REAL_TODAY_YEAR && viewMonth === REAL_TODAY_MONTH
  const cells = useMemo(() => buildCells(viewYear, viewMonth), [viewYear, viewMonth])

  const goToPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else { setViewMonth((m) => m - 1) }
  }
  const goToNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else { setViewMonth((m) => m + 1) }
  }
  const goToToday = () => {
    setViewYear(REAL_TODAY_YEAR)
    setViewMonth(REAL_TODAY_MONTH)
    onSelectDay(REAL_TODAY_DAY)
  }

  const todayLabel = `${REAL_TODAY_DAY} ${MONTH_NAMES[REAL_TODAY_MONTH].slice(0, 3)}`

  // Only show events for the month that has data (Nov 2026)
  const isEventMonth = viewYear === 2026 && viewMonth === 10
  const monthEvents = isEventMonth ? events : []

  return (
    <div className="rounded-xl border border-line bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold tracking-tight">{MONTH_NAMES[viewMonth]} {viewYear}</h2>
          <span className="text-xs tabular-nums text-zinc-500 dark:text-slate-400">{monthEvents.length} agenda</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="icon-btn" aria-label="Bulan sebelumnya" onClick={goToPrev}>
            <ChevronLeft className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={goToToday}
            className={cn(
              'cursor-pointer touch-manipulation rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-slate-700 dark:hover:bg-slate-800',
              isCurrentMonth
                ? 'border-zinc-900 font-semibold text-zinc-900 dark:border-white dark:text-white'
                : 'border-line',
            )}
          >
            Hari Ini ({todayLabel})
          </button>
          <button type="button" className="icon-btn" aria-label="Bulan berikutnya" onClick={goToNext}>
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-line text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:border-slate-800 dark:text-slate-500">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2 py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          const col = idx % 7
          const border = cn(col < 6 && 'border-r', idx < 35 && 'border-b', 'border-line dark:border-slate-800')
          if (cell.muted) {
            return (
              <div
                key={`m-${idx}`}
                className={cn(
                  border,
                  'min-h-16 bg-zinc-50/50 p-1.5 text-xs text-zinc-300 dark:bg-slate-950/30 dark:text-slate-700 sm:min-h-[108px] sm:p-2',
                )}
              >
                {cell.day}
              </div>
            )
          }
          const dayEvents = eventsOnDay(monthEvents, cell.day)
          const isToday = isCurrentMonth && cell.day === REAL_TODAY_DAY
          const isSelected = isCurrentMonth && cell.day === selected
          const weekend = col >= 5

          return (
            <div
              key={`${viewYear}-${viewMonth}-${cell.day}`}
              onClick={() => { if (isCurrentMonth) onSelectDay(cell.day) }}
              className={cn(
                border,
                'flex min-h-16 cursor-pointer touch-manipulation flex-col gap-1 p-1.5 text-left transition-colors sm:min-h-[108px] sm:p-2',
                isSelected
                  ? 'bg-zinc-50/90 ring-1 ring-inset ring-zinc-900/70 dark:bg-slate-800/50 dark:ring-slate-300/60'
                  : 'hover:bg-zinc-50/70 dark:hover:bg-slate-800/30',
              )}
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  aria-label={`Pilih ${cell.day} ${MONTH_NAMES[viewMonth]} ${viewYear}`}
                  aria-pressed={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isCurrentMonth) onSelectDay(cell.day)
                  }}
                  className={cn(
                    'grid size-6 cursor-pointer place-items-center rounded-full text-xs font-medium tabular-nums',
                    isToday
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-slate-950'
                      : weekend && 'text-zinc-400 dark:text-slate-500',
                  )}
                >
                  {cell.day}
                </button>
                {isToday && (
                  <span className="hidden text-[10px] font-medium text-zinc-500 dark:text-slate-400 xl:inline">
                    Hari ini
                  </span>
                )}
              </div>

              {dayEvents.slice(0, 2).map((event) => {
                const isSent = remindedIds.has(String(event.id))
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectEvent(event)
                    }}
                    className={cn(
                      'hidden cursor-pointer items-center gap-1.5 truncate rounded border px-1.5 py-0.5 text-left text-[11px] font-medium transition hover:opacity-80 sm:flex',
                      CATEGORIES[event.category]?.badge || CATEGORIES.akademik.badge,
                    )}
                  >
                    {isSent ? (
                      <CheckCircle2 className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span className={cn('size-1.5 shrink-0 rounded-full', CATEGORIES[event.category]?.dot || 'bg-sky-500')} />
                    )}
                    <span className="truncate">{event.title}</span>
                  </button>
                )
              })}

              {dayEvents.length > 2 && (
                <span className="hidden px-1 text-[10px] font-medium text-zinc-400 dark:text-slate-500 sm:block">
                  +{dayEvents.length - 2} agenda lagi
                </span>
              )}

              <span className="mt-1 flex gap-1 sm:hidden">
                {dayEvents.map((event) => (
                  <span key={event.id} className={cn('size-1.5 rounded-full', CATEGORIES[event.category]?.dot || 'bg-sky-500')} />
                ))}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { MonthGrid }
