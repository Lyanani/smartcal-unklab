import { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { COUNTDOWN_TARGET } from '../data/calendarData'

const pad = (n) => String(n).padStart(2, '0')
const getParts = (diff) => [
  { label: 'Hari', value: Math.floor(diff / 864e5) },
  { label: 'Jam', value: Math.floor(diff / 36e5) % 24 },
  { label: 'Menit', value: Math.floor(diff / 6e4) % 60 },
  { label: 'Detik', value: Math.floor(diff / 1e3) % 60 },
]

export default function HeroCountdown({ user }) {
  const [remaining, setRemaining] = useState(null)

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, COUNTDOWN_TARGET - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const parts = getParts(remaining ?? 0)

  return (
    <section
      className="rounded-xl border border-line bg-linear-to-br from-white via-white to-sky-50/70 shadow-2xs backdrop-blur dark:border-slate-800 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-sky-950/30"
      aria-labelledby="hero-title"
    >
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-2.5 py-0.5 font-medium text-zinc-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
              <span className="size-1.5 rounded-full bg-sky-500" /> Agenda Krusial Terdekat
            </span>
            <span>
              {user.role === 'admin' ? 'Mode Pengelola Jadwal BAA' : `Filter Aktif: ${user.faculty}`}
            </span>
          </div>

          <h1 id="hero-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Konsultasi & Pra-Pengisian KRS Semester Genap
          </h1>

          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" strokeWidth={1.75} /> Rabu, 25 November 2026
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" strokeWidth={1.75} /> 08.00 WITA
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" strokeWidth={1.75} /> Ruang Dosen PA & SIAKAD
            </span>
          </p>

          <div className="max-w-md pt-2">
            <div className="mb-1.5 flex justify-between text-xs text-zinc-500 dark:text-slate-400">
              <span>Progres Semester Ganjil 2026/2027</span>
              <span className="tabular-nums font-medium text-zinc-700 dark:text-slate-300">Minggu ke-13 dari 16</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/80 dark:bg-slate-800">
              <div className="h-full w-4/5 rounded-full bg-zinc-900 dark:bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="flex items-stretch gap-2 sm:gap-3" role="timer" aria-label="Hitung mundur menuju KRS">
          {parts.map((part) => (
            <div
              key={part.label}
              className="flex w-[68px] flex-col items-center justify-center rounded-lg border border-line bg-white/90 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:w-20 sm:py-4"
            >
              <span className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                {remaining === null ? '--' : pad(part.value)}
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-slate-500">
                {part.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { HeroCountdown }
