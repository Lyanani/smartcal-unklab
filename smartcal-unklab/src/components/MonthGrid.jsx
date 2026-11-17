import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { CATEGORIES, TODAY } from '../data/calendarData'
import { cn, eventsOnDay } from '../utils/calendarUtils'

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const CELLS = (() => {
  const cells = []
  for (let d = 26; d <= 31; d++) cells.push({ day: d, muted: true })
  for (let d = 1; d <= 30; d++) cells.push({ day: d })
  for (let d = 1; cells.length < 42; d++) cells.push({ day: d, muted: true })
  return cells
})()

export default function MonthGrid({ events, selected, remindedIds, onSelectDay, onSelectEvent }) {
  return (
    <div className="rounded-xl border border-line bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold tracking-tight">November 2026</h2>
          <span className="text-xs tabular-nums text-zinc-500 dark:text-slate-400">{events.length} agenda</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="icon-btn" aria-label="Bulan sebelumnya">
            <ChevronLeft className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => onSelectDay(TODAY)}
            className="cursor-pointer touch-manipulation rounded-md border border-line px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Hari Ini (15 Nov)
          </button>
          <button type="button" className="icon-btn" aria-label="Bulan berikutnya">
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
        {CELLS.map((cell, idx) => {
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
          const dayEvents = eventsOnDay(events, cell.day)
          const isToday = cell.day === TODAY
          const isSelected = cell.day === selected
          const weekend = col >= 5

          return (
            <div
              key={cell.day}
              onClick={() => onSelectDay(cell.day)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectDay(cell.day)}
              className={cn(
                border,
                'flex min-h-16 cursor-pointer touch-manipulation flex-col gap-1 p-1.5 text-left transition-colors sm:min-h-[108px] sm:p-2',
                isSelected
                  ? 'bg-zinc-50/90 ring-1 ring-inset ring-zinc-900/70 dark:bg-slate-800/50 dark:ring-slate-300/60'
                  : 'hover:bg-zinc-50/70 dark:hover:bg-slate-800/30',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'grid size-6 place-items-center rounded-full text-xs font-medium tabular-nums',
                    isToday
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-slate-950'
                      : weekend && 'text-zinc-400 dark:text-slate-500',
                  )}
                >
                  {cell.day}
                </span>
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
