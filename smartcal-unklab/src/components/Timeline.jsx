import { Fragment } from 'react'
import { ArrowRight, CalendarX, Clock, MapPin, Sparkles } from 'lucide-react'
import { CATEGORIES, TODAY } from '../data/calendarData'
import { cn, weekdayOf } from '../utils/calendarUtils'
import QuickRemindButton from './QuickRemindButton'

export default function Timeline({ events, flashDay, constrained, isGuest, remindedIds, sendingEventId, onSendReminder, onSelectEvent }) {
  const sorted = [...events].sort((a, b) => a.start - b.start)
  const groups = new Map()
  for (const event of sorted) {
    const list = groups.get(event.start) ?? []
    list.push(event)
    groups.set(event.start, list)
  }
  const markerDay = [...groups.keys()].find((d) => d >= TODAY)

  return (
    <aside
      className={cn(
        'flex flex-col rounded-xl border border-line bg-white dark:border-slate-800 dark:bg-slate-900/60',
        constrained && 'lg:max-h-[780px]',
      )}
      aria-labelledby="timeline-title"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-slate-800">
        <h2 id="timeline-title" className="text-base font-semibold tracking-tight">
          Timeline Agenda
        </h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-slate-400">
          <Sparkles className="size-[13px]" strokeWidth={1.75} />
          {isGuest ? 'Pilih agenda untuk melihat detail' : 'Tap agenda / tombol Gmail'}
        </span>
      </div>

      <ol className="flex-1 overflow-y-auto px-4 py-3">
        {groups.size === 0 ? (
          <li className="flex flex-col items-center gap-2 py-12 text-center text-sm text-zinc-500 dark:text-slate-400">
            <CalendarX className="size-5" strokeWidth={1.75} />
            Tidak ada agenda yang cocok dengan filter.
          </li>
        ) : (
          [...groups.entries()].map(([day, dayEvents]) => {
            const past = day < TODAY && dayEvents.every((e) => e.end < TODAY)
            const flashing = flashDay?.day === day
            return (
              <Fragment key={day}>
                {day === markerDay && (
                  <li className="flex items-center gap-2 py-2 text-[11px] font-medium uppercase tracking-wider text-rose-500">
                    <span className="size-1.5 rounded-full bg-rose-500" />
                    Hari ini · Minggu, 15 Nov
                    <span className="h-px flex-1 bg-rose-500/30" />
                  </li>
                )}
                <li
                  id={`tl-${day}`}
                  key={flashing ? `f-${flashDay.key}` : undefined}
                  className={cn('relative rounded-lg py-2 pl-5', past && 'opacity-55', flashing && 'animate-flash')}
                >
                  <span className="absolute bottom-0 left-[3px] top-0 w-px bg-line dark:bg-slate-800" />
                  <span className="absolute left-0 top-3.5 size-[7px] rounded-full border border-zinc-300 bg-white dark:border-slate-600 dark:bg-slate-900" />
                  <p className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-slate-400">
                    <span className="tabular-nums text-zinc-900 dark:text-slate-100">{day} Nov</span> · {weekdayOf(day)}
                  </p>
                  <div className="flex flex-col gap-2">
                    {dayEvents.map((event) => {
                      const isReminded = remindedIds.has(String(event.id))
                      const isSending = sendingEventId === String(event.id)
                      return (
                        <article
                          key={event.id}
                          onClick={() => onSelectEvent(event)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && onSelectEvent(event)}
                          className={cn(
                            'cursor-pointer touch-manipulation rounded-lg border px-3 py-2.5 transition',
                            isReminded
                              ? 'border-emerald-200/90 bg-emerald-50/30 hover:border-emerald-300 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                              : 'border-line bg-canvas/70 hover:border-zinc-400 hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-600 dark:hover:bg-slate-900',
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', CATEGORIES[event.category]?.dot || 'bg-sky-500')} />
                              <div className="min-w-0">
                                <h3 className="text-sm font-medium leading-snug">{event.title}</h3>
                                <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-zinc-500 dark:text-slate-400">
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="size-3" /> {event.time}
                                  </span>
                                  {event.end > event.start && (
                                    <span className="inline-flex items-center gap-1 tabular-nums">
                                      <ArrowRight className="size-3" /> s.d. {event.end} Nov
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="size-3" /> {event.location}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line/70 pt-2 text-[11px] dark:border-slate-800/80">
                            <span className="truncate text-zinc-400 dark:text-slate-500">{event.faculty}</span>
                            {!isGuest && (
                              <QuickRemindButton
                                event={event}
                                isSent={isReminded}
                                isSending={isSending}
                                onSend={onSendReminder}
                              />
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </li>
              </Fragment>
            )
          })
        )}
      </ol>
    </aside>
  )
}

export { Timeline }
