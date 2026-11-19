import { useEffect, useMemo, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import { formatEventDateText, getEventStatus } from '../utils/calendarUtils'

const pad = (n) => String(n).padStart(2, '0')
const getParts = (diff) => [
  { label: 'Hari', value: Math.floor(diff / 864e5) },
  { label: 'Jam', value: Math.floor(diff / 36e5) % 24 },
  { label: 'Menit', value: Math.floor(diff / 6e4) % 60 },
  { label: 'Detik', value: Math.floor(diff / 1e3) % 60 },
]

export default function HeroCountdown({ user, facultyScope = 'all', events = [], now = new Date() }) {
  const [currentTime, setCurrentTime] = useState(() => Date.now())
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Kumpulkan agenda sedang berlangsung atau akan datang, urutkan ongoing dulu
  const activeItems = useMemo(() => {
    return events
      .map((e) => ({
        event: e,
        status: getEventStatus(e, now),
      }))
      .filter((item) => item.status && !item.status.isCompleted)
      .sort((a, b) => {
        if (a.status.isOngoing && !b.status.isOngoing) return -1
        if (!a.status.isOngoing && b.status.isOngoing) return 1
        return a.status.startDateTime.getTime() - b.status.startDateTime.getTime()
      })
  }, [events, now])

  const safeIndex = Math.min(index, Math.max(0, activeItems.length - 1))
  const currentItem = activeItems[safeIndex] || null
  const currentEvent = currentItem?.event || null
  const currentStatus = currentItem?.status || null

  const targetTime = currentStatus?.targetTime ?? null
  const remaining = targetTime ? Math.max(0, targetTime - currentTime) : 0
  const parts = getParts(remaining)

  const handlePrev = () =>
    setIndex((prev) => (prev > 0 ? prev - 1 : activeItems.length - 1))

  const handleNext = () =>
    setIndex((prev) => (prev < activeItems.length - 1 ? prev + 1 : 0))

  return (
    <section
      className="rounded-xl border border-line bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900/70"
      aria-labelledby="hero-title"
    >
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-2.5 py-0.5 font-medium text-zinc-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
              <span className="size-1.5 rounded-full bg-sky-500" /> Agenda Krusial Terdekat
            </span>
            <span>
              {user?.role === 'admin' ? 'Mode admin' : facultyScope === 'faculty' ? `Khusus ${user?.faculty}` : facultyScope === 'general' ? 'Kalender General (Semua Fakultas)' : `${user?.faculty} & General`}
            </span>
          </div>

          {/* Event title */}
          <h1
            id="hero-title"
            className="text-balance text-xl font-semibold tracking-tight sm:text-2xl"
          >
            {currentEvent ? currentEvent.title : 'Semua Agenda Semester Telah Selesai'}
          </h1>

          {/* Metadata row */}
          {currentEvent ? (
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" strokeWidth={1.75} />
                {formatEventDateText(currentEvent)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 shrink-0" strokeWidth={1.75} />
                {currentEvent.time}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} />
                {currentEvent.location}
              </span>
            </p>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-slate-400">
              Belum ada agenda akademik mendatang yang dijadwalkan saat ini.
            </p>
          )}
        </div>

        {/* ── Right column: Countdown (5/12) ───────────────────────── */}
        <div className="flex flex-col items-center justify-center gap-3 px-5 py-5 sm:px-6 lg:col-span-5">

          {/* Switcher — only shown when multiple events */}
          {activeItems.length > 1 ? (
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-slate-400">
                {currentStatus?.countdownLabel || 'Hitung Mundur:'}
              </span>
              <div className="inline-flex items-center gap-1 rounded-lg border border-line bg-zinc-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Agenda sebelumnya"
                  className="grid size-6 cursor-pointer touch-manipulation place-items-center rounded-md text-zinc-500 transition hover:bg-white hover:text-zinc-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <span className="min-w-[2.5rem] text-center text-[11px] font-semibold tabular-nums text-zinc-700 dark:text-slate-200">
                  {safeIndex + 1} / {activeItems.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Agenda selanjutnya"
                  className="grid size-6 cursor-pointer touch-manipulation place-items-center rounded-md text-zinc-500 transition hover:bg-white hover:text-zinc-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <p className="w-full text-left text-xs font-medium text-zinc-500 dark:text-slate-400">
              {currentStatus?.countdownLabel || 'Hitung Mundur:'}
            </p>
          )}

          {/* Timer boxes */}
          <div
            className="flex w-full items-stretch justify-center gap-2"
            role="timer"
            aria-label="Hitung mundur agenda terpilih"
          >
            {parts.map((part) => (
              <div
                key={part.label}
                className="flex flex-1 flex-col items-center justify-center rounded-lg border border-line bg-zinc-50/80 py-3 dark:border-slate-700 dark:bg-slate-800/60"
              >
                <span className="text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">
                  {!currentEvent ? '--' : pad(part.value)}
                </span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-slate-500">
                  {part.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export { HeroCountdown }
