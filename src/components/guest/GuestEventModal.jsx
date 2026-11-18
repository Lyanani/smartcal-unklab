import { useEffect } from 'react'
import { CalendarPlus, Clock, Download, GraduationCap, MapPin, X } from 'lucide-react'
import { downloadIcs, buildGoogleCalendarUrl } from '../../utils/guestExport'
import { formatRange, getStatus, hasDate } from '../../utils/guestDates'
import { CategoryBadge, StatusBadge } from './StatusBadge'

export default function GuestEventModal({ event, today, onClose }) {
  useEffect(() => {
    if (!event) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [event, onClose])

  if (!event) return null
  const status = getStatus(event, today)
  const gcal = buildGoogleCalendarUrl(event)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-line bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={event.category} />
            <StatusBadge status={status} />
          </div>
          <button type="button" onClick={onClose} className="icon-btn -mr-1 -mt-1 shrink-0 cursor-pointer" aria-label="Tutup">
            <X className="size-4" />
          </button>
        </div>

        <h3 className="mt-3 text-balance text-lg font-semibold leading-snug tracking-tight">{event.title}</h3>
        {event.intake && (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
            {event.intake}
            {event.wave ? ` · Gelombang ${event.wave}` : ''}
          </p>
        )}

        <dl className="mt-4 flex flex-col gap-2.5 text-sm text-zinc-600 dark:text-slate-300">
          <div className="flex items-start gap-2.5">
            <CalendarPlus className="mt-0.5 size-4 shrink-0 text-zinc-400" strokeWidth={1.8} />
            <dd>{hasDate(event) ? formatRange(event.start, event.end) : 'Jadwal belum diumumkan'}</dd>
          </div>
          {event.time && (
            <div className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-zinc-400" strokeWidth={1.8} />
              <dd>{event.time}</dd>
            </div>
          )}
          {event.location && (
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-zinc-400" strokeWidth={1.8} />
              <dd>{event.location}</dd>
            </div>
          )}
          {event.faculty && event.faculty !== 'Semua Fakultas' && (
            <div className="flex items-start gap-2.5">
              <GraduationCap className="mt-0.5 size-4 shrink-0 text-zinc-400" strokeWidth={1.8} />
              <dd>{event.faculty}</dd>
            </div>
          )}
        </dl>

        {event.note && (
          <p className="mt-4 rounded-lg bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-600 dark:bg-slate-800/50 dark:text-slate-300">
            {event.note}
          </p>
        )}

        {!event.verified && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            Jadwal ini belum dicocokkan dengan kalender akademik resmi. Pastikan kembali di{' '}
            <a
              href="https://www.unklab.ac.id/kalender-akademik/"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-2"
            >
              unklab.ac.id/kalender-akademik
            </a>
            .
          </p>
        )}

        {gcal && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4 dark:border-slate-800">
            <a
              href={gcal}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-zinc-900 px-3.5 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <CalendarPlus className="size-3.5" /> Tambah ke Google Calendar
            </a>
            <button
              type="button"
              onClick={() => downloadIcs([event], `UNKLAB-${event.id}`)}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-line px-3.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Download className="size-3.5" /> Unduh .ics
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
