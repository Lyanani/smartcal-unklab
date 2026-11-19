import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowUpRight, CalendarRange, LogIn, Moon, Sun } from 'lucide-react'
import { GUEST_SOURCES, OFFICIAL_LINKS } from '../../data/guestCalendar'
import { cn } from '../../utils/calendarUtils'
import {
  compareEvents,
  endOf,
  formatDate,
  formatRange,
  getStatus,
  hasDate,
  todayISO,
} from '../../utils/guestDates'
import GuestAgenda from './GuestAgenda'
import GuestEventModal from './GuestEventModal'
import { PmbFocusCards, PmbIntakeTable } from './PmbPanel'
import { StatusBadge } from './StatusBadge'
import { buildIntakes, registrationHeadline } from './pmb'

const HEADLINE_DOT = {
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  muted: 'bg-zinc-400 dark:bg-slate-500',
}

/* Dashboard publik tanpa login.
   Props `events` dan `toolbar` bersifat generik (toolbar = elemen opsional di
   header) sehingga komponen ini tidak tahu apa pun tentang fitur sementara. */
export default function GuestDashboard({ events, toolbar = null, onLogin, dark, onToggleTheme }) {
  const [today, setToday] = useState(() => todayISO())
  const [selected, setSelected] = useState(null)

  // Segarkan tanggal bila tab dibiarkan terbuka melewati tengah malam.
  useEffect(() => {
    const id = setInterval(() => setToday(todayISO()), 60_000)
    return () => clearInterval(id)
  }, [])

  const { intakes, focus } = useMemo(() => buildIntakes(events, today), [events, today])
  const headline = useMemo(() => registrationHeadline(intakes, today), [intakes, today])

  // Tiga agenda terdekat yang dimulai hari ini atau setelahnya.
  const nextEvents = useMemo(
    () => events.filter((e) => hasDate(e) && e.start >= today).sort(compareEvents).slice(0, 3),
    [events, today],
  )

  const unverified = events.filter((e) => !e.verified).length

  return (
    <div className="min-h-screen bg-canvas text-zinc-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-md bg-zinc-900 text-white dark:bg-white dark:text-slate-950">
              <CalendarRange className="size-[15px]" strokeWidth={1.75} />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              SmartCal <span className="font-medium text-zinc-400 dark:text-slate-500">UNKLAB</span>
            </span>
            <span className="ml-1 hidden rounded-full border border-line px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:border-slate-700 dark:text-slate-400 sm:inline">
              Tamu
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {toolbar}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Ganti mode tema"
              className="grid size-8 cursor-pointer place-items-center rounded-md border border-line bg-white text-zinc-600 hover:text-zinc-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {dark ? <Sun className="size-4" strokeWidth={1.75} /> : <Moon className="size-4" strokeWidth={1.75} />}
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-zinc-900 px-3 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <LogIn className="size-3.5" />
              Masuk
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Hero */}
        <section
          aria-labelledby="guest-title"
          className="rounded-xl border border-line bg-linear-to-br from-white via-white to-sky-50/70 shadow-2xs dark:border-slate-800 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-sky-950/30"
        >
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium text-zinc-500 dark:text-slate-400">
                Universitas Klabat · Airmadidi · {formatDate(today, { weekday: true })}
              </p>
              <h1 id="guest-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                Kalender Akademik & Penerimaan Mahasiswa Baru
              </h1>
              <p className="inline-flex max-w-xl items-start gap-2.5 text-sm text-zinc-600 dark:text-slate-300">
                <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', HEADLINE_DOT[headline.tone])} />
                <span>
                  <span className="font-medium">{headline.title}</span>
                  <span className="block text-zinc-500 dark:text-slate-400">{headline.detail}</span>
                </span>
              </p>
            </div>

            <div className="rounded-lg border border-line bg-white/90 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 lg:w-80">
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-slate-500">
                Agenda terdekat
              </p>
              {nextEvents.length ? (
                <ul className="mt-2 flex flex-col divide-y divide-line dark:divide-slate-800">
                  {nextEvents.map((ev) => (
                    <li key={ev.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(ev)}
                        className="flex w-full cursor-pointer items-start justify-between gap-3 py-2 text-left first:pt-0 last:pb-0"
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-medium leading-snug">{ev.title}</span>
                          <span className="mt-0.5 block text-xs text-zinc-500 dark:text-slate-400">
                            {formatRange(ev.start, ev.end)}
                          </span>
                        </span>
                        <StatusBadge status={getStatus(ev, today)} className="mt-0.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-zinc-500 dark:text-slate-400">Belum ada agenda bertanggal.</p>
              )}
            </div>
          </div>
        </section>

        {unverified > 0 && (
          <p className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.8} />
            <span>
              {unverified} dari {events.length} agenda belum dicocokkan dengan kalender akademik resmi. Gunakan
              dashboard ini sebagai gambaran, dan pastikan tanggal final di{' '}
              <a
                href="https://www.unklab.ac.id/kalender-akademik/"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-2"
              >
                unklab.ac.id/kalender-akademik
              </a>
              .
            </span>
          </p>
        )}

        <PmbFocusCards focus={focus} today={today} onSelectEvent={setSelected} />
        <PmbIntakeTable intakes={intakes} today={today} onSelectEvent={setSelected} />
        <GuestAgenda events={events} today={today} onSelectEvent={setSelected} />

        <section aria-label="Tautan resmi" className="flex flex-col gap-3">
          <h2 className="text-base font-semibold tracking-tight">Tautan Resmi UNKLAB</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {OFFICIAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col gap-1.5 rounded-xl border border-line bg-white p-4 transition hover:border-zinc-300 hover:shadow-2xs dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-600"
              >
                <span className="flex items-center justify-between gap-2 text-sm font-medium">
                  {link.label}
                  <ArrowUpRight className="size-3.5 shrink-0 text-zinc-400 transition group-hover:text-zinc-900 dark:group-hover:text-white" />
                </span>
                <span className="text-xs leading-relaxed text-zinc-500 dark:text-slate-400">{link.desc}</span>
              </a>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-1 border-t border-line pt-5 text-xs text-zinc-500 dark:border-slate-800 dark:text-slate-500 sm:flex-row sm:justify-between">
          <span>Universitas Klabat · Mode tamu, tidak perlu login</span>
          <span>Sumber: {GUEST_SOURCES.join(' · ')}</span>
        </footer>
      </main>

      <GuestEventModal event={selected} today={today} onClose={() => setSelected(null)} />
    </div>
  )
}
