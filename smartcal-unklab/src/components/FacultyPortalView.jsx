import { useState } from 'react'
import {
  Bell,
  Building2,
  Calendar,
  CalendarRange,
  Check,
  Clock,
  Globe,
  Loader2,
  LogOut,
  MapPin,
  Moon,
  Sun,
} from 'lucide-react'
import { CATEGORIES, MONTH_NAMES } from '../data/calendarData'
import { cn, weekdayOf } from '../utils/calendarUtils'

const FACULTY_OPTIONS = [
  'Fakultas Ilmu Komputer (FILKOM)',
  'Fakultas Ekonomi',
  'Fakultas Keperawatan',
]

export default function FacultyPortalView({
  user,
  events = [],
  remindedIds = new Set(),
  sendingEventId = null,
  onSendReminder,
  onOpenGeneral,
  onLogout,
  dark,
  onToggleTheme,
}) {
  const initialFaculty = FACULTY_OPTIONS.includes(user?.faculty)
    ? user.faculty
    : 'Fakultas Ilmu Komputer (FILKOM)'
  const [selectedFaculty, setSelectedFaculty] = useState(initialFaculty)

  const facultyEvents = events
    .filter((ev) => !ev.isPersonal && ev.faculty === selectedFaculty)
    .sort((a, b) => a.month - b.month || a.start - b.start)

  return (
    <div className="min-h-screen bg-canvas text-zinc-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-slate-950">
              <CalendarRange className="size-4" strokeWidth={1.75} />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              SmartCal <span className="font-normal text-zinc-400 dark:text-slate-500">UNKLAB</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Ganti mode tema"
              className="grid size-8 cursor-pointer touch-manipulation place-items-center rounded-md border border-line bg-white text-zinc-600 hover:text-zinc-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {dark ? <Sun className="size-4" strokeWidth={1.75} /> : <Moon className="size-4" strokeWidth={1.75} />}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex h-8 cursor-pointer touch-manipulation items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-xs font-medium text-zinc-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
            >
              <LogOut className="size-3.5" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Hero Kartu Kalender Khusus Fakultas */}
        <section className="rounded-2xl border border-line bg-white/90 p-6 shadow-2xs backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:p-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300">
                  <Building2 className="size-3" />
                  Mode Khusus Fakultas
                </span>
                <span className="rounded-full border border-line bg-canvas px-2.5 py-0.5 text-[11px] text-zinc-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  Login: {user?.email}
                </span>
              </div>

              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Kalender Khusus {selectedFaculty}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-slate-400 sm:text-sm">
                Menampilkan jadwal akademik spesifik untuk fakultas pilihanmu.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <select
                aria-label="Pilih fakultas"
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="h-10 rounded-lg border border-line bg-canvas px-3 text-xs font-medium text-zinc-800 focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-slate-500"
              >
                {FACULTY_OPTIONS.map((fac) => (
                  <option key={fac} value={fac}>
                    {fac}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={onOpenGeneral}
                className="inline-flex h-10 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white shadow-2xs transition hover:bg-zinc-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 sm:text-sm"
              >
                <Globe className="size-4" />
                Buka Kalender General
              </button>
            </div>
          </div>
        </section>

        {/* Daftar Agenda Khusus Fakultas */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
              Daftar Agenda Internal {selectedFaculty} ({facultyEvents.length})
            </h2>
          </div>

          {facultyEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white/60 p-8 text-center text-xs text-zinc-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
              Belum ada agenda khusus untuk fakultas ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {facultyEvents.map((ev) => {
                const cat = CATEGORIES[ev.category] || CATEGORIES.akademik
                const isReminded = remindedIds.has(String(ev.id))
                const isSending = sendingEventId === ev.id
                const dateRange =
                  ev.end && ev.end !== ev.start
                    ? `${ev.start}–${ev.end} ${MONTH_NAMES[ev.month]} ${ev.year}`
                    : `${weekdayOf(ev.start, ev.year, ev.month)}, ${ev.start} ${MONTH_NAMES[ev.month]} ${ev.year}`

                return (
                  <article
                    key={ev.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-line bg-white/90 p-5 shadow-2xs transition hover:border-zinc-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700 sm:flex-row sm:items-center"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
                            cat.badge,
                          )}
                        >
                          <span className={cn('size-1.5 rounded-full', cat.dot)} />
                          {cat.label}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-slate-300">
                          <Calendar className="size-3.5 text-zinc-400" />
                          {dateRange}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold tracking-tight">{ev.title}</h3>
                      {ev.description && (
                        <p className="text-xs leading-relaxed text-zinc-500 dark:text-slate-400">
                          {ev.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 pt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {ev.time}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {ev.location}
                        </span>
                      </div>
                    </div>

                    {onSendReminder && (
                      <button
                        type="button"
                        disabled={isSending}
                        onClick={() => onSendReminder(ev)}
                        className={cn(
                          'inline-flex h-9 shrink-0 cursor-pointer touch-manipulation items-center justify-center gap-1.5 self-start rounded-lg border px-3 text-xs font-medium transition sm:self-center',
                          isReminded
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'border-line bg-canvas text-zinc-700 hover:bg-zinc-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800',
                        )}
                      >
                        {isSending ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : isReminded ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Bell className="size-3.5" />
                        )}
                        {isReminded ? 'Terkirim ke Gmail' : 'Ingatkan Gmail'}
                      </button>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
