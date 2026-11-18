import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Search, X } from 'lucide-react'
import { GUEST_CATEGORIES, GUEST_CATEGORY_KEYS } from '../../data/guestCalendar'
import { cn } from '../../utils/calendarUtils'
import { downloadIcs } from '../../utils/guestExport'
import {
  MONTHS_ID,
  MONTHS_SHORT,
  addDays,
  compareEvents,
  diffDays,
  endOf,
  formatDate,
  getStatus,
  hasDate,
  monthCells,
  parts,
} from '../../utils/guestDates'
import { CategoryBadge, StatusBadge } from './StatusBadge'

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export default function GuestAgenda({ events, today, onSelectEvent }) {
  const t = parts(today)
  const [cursor, setCursor] = useState({ y: t.y, m: t.m })
  const [active, setActive] = useState(() => new Set(GUEST_CATEGORY_KEYS))
  const [query, setQuery] = useState('')
  const [selectedDay, setSelectedDay] = useState(null)

  const allActive = active.size === GUEST_CATEGORY_KEYS.length

  const toggleCategory = (key) =>
    setActive((prev) => {
      if (key === 'all') return new Set(GUEST_CATEGORY_KEYS)
      if (prev.size === GUEST_CATEGORY_KEYS.length) return new Set([key])
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next.size ? next : new Set(GUEST_CATEGORY_KEYS)
    })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events
      .filter(
        (e) =>
          active.has(e.category) &&
          (!q || [e.title, e.location, e.note, e.intake].some((f) => (f || '').toLowerCase().includes(q))),
      )
      .sort(compareEvents)
  }, [events, active, query])

  const dated = useMemo(() => filtered.filter(hasDate), [filtered])
  const undated = useMemo(() => filtered.filter((e) => !hasDate(e)), [filtered])

  const byDay = useMemo(() => {
    const map = new Map()
    dated.forEach((ev) => {
      const span = Math.min(diffDays(ev.start, endOf(ev)), 90)
      for (let i = 0; i <= span; i++) {
        const iso = addDays(ev.start, i)
        if (!map.has(iso)) map.set(iso, [])
        map.get(iso).push(ev)
      }
    })
    return map
  }, [dated])

  const cells = monthCells(cursor.y, cursor.m)
  const monthStart = cells.find((c) => c.inMonth).iso
  const monthEnd = [...cells].reverse().find((c) => c.inMonth).iso

  const listed = selectedDay
    ? byDay.get(selectedDay) || []
    : dated.filter((e) => e.start <= monthEnd && endOf(e) >= monthStart)

  const shiftMonth = (delta) => {
    setSelectedDay(null)
    setCursor(({ y, m }) => {
      const d = new Date(Date.UTC(y, m + delta, 1))
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() }
    })
  }

  const goToday = () => {
    setCursor({ y: t.y, m: t.m })
    setSelectedDay(null)
  }

  return (
    <section aria-label="Agenda kalender akademik" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-base font-semibold tracking-tight">Kalender Akademik</h2>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">Cari agenda</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari agenda..."
              className="h-8 w-48 rounded-md border border-line bg-white pl-8 pr-2 text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-slate-800 dark:bg-slate-900 dark:focus:ring-white/10"
            />
          </label>
          <button
            type="button"
            onClick={() => downloadIcs(dated, 'Kalender-UNKLAB')}
            disabled={dated.length === 0}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download className="size-3.5" /> Unduh .ics
          </button>
        </div>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <button
          type="button"
          onClick={() => toggleCategory('all')}
          className={cn(
            'shrink-0 cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition',
            allActive
              ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-slate-950'
              : 'border-line bg-white text-zinc-600 hover:border-zinc-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
          )}
        >
          Semua
        </button>
        {GUEST_CATEGORY_KEYS.map((key) => {
          const on = !allActive && active.has(key)
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleCategory(key)}
              aria-pressed={on}
              className={cn(
                'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition',
                on
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-slate-950'
                  : 'border-line bg-white text-zinc-600 hover:border-zinc-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
              )}
            >
              <span className={cn('size-1.5 rounded-full', GUEST_CATEGORIES[key].dot)} />
              {GUEST_CATEGORIES[key].label}
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        {/* Kalender bulanan */}
        <div className="self-start rounded-xl border border-line bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight">
              {MONTHS_ID[cursor.m]} {cursor.y}
            </h3>
            <div className="flex items-center gap-1">
              <button type="button" onClick={goToday} className="mr-1 cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-slate-300 dark:hover:bg-slate-800">
                Hari ini
              </button>
              <button type="button" onClick={() => shiftMonth(-1)} className="icon-btn cursor-pointer" aria-label="Bulan sebelumnya">
                <ChevronLeft className="size-4" />
              </button>
              <button type="button" onClick={() => shiftMonth(1)} className="icon-btn cursor-pointer" aria-label="Bulan berikutnya">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-slate-500">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-1">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map(({ iso, inMonth }) => {
              const dayEvents = byDay.get(iso) || []
              const isToday = iso === today
              const isSelected = iso === selectedDay
              const cats = [...new Set(dayEvents.map((e) => e.category))].slice(0, 3)
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedDay(isSelected ? null : iso)}
                  aria-label={`${formatDate(iso, { weekday: true })}${dayEvents.length ? `, ${dayEvents.length} agenda` : ''}`}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex aspect-square cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border text-xs tabular-nums transition',
                    inMonth ? 'text-zinc-800 dark:text-slate-100' : 'text-zinc-300 dark:text-slate-600',
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-slate-950'
                      : isToday
                        ? 'border-rose-300 bg-rose-50 font-semibold dark:border-rose-800 dark:bg-rose-950/40'
                        : 'border-transparent hover:bg-zinc-100 dark:hover:bg-slate-800',
                  )}
                >
                  <span>{parts(iso).d}</span>
                  <span className="flex h-1.5 items-center gap-0.5">
                    {cats.map((c) => (
                      <span key={c} className={cn('size-1.5 rounded-full', GUEST_CATEGORIES[c].dot)} />
                    ))}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Daftar agenda */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-line bg-white dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3 dark:border-slate-800">
              <h3 className="text-sm font-semibold tracking-tight">
                {selectedDay ? formatDate(selectedDay, { weekday: true }) : `Agenda ${MONTHS_ID[cursor.m]} ${cursor.y}`}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs tabular-nums text-zinc-400 dark:text-slate-500">{listed.length} agenda</span>
                {selectedDay && (
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-slate-800"
                  >
                    <X className="size-3" /> Lihat bulan
                  </button>
                )}
              </div>
            </div>
            {listed.length === 0 ? (
              <p className="p-5 text-sm text-zinc-500 dark:text-slate-400">Tidak ada agenda yang cocok.</p>
            ) : (
              <ul className="divide-y divide-line dark:divide-slate-800">
                {listed.map((ev) => (
                  <EventRow key={ev.id} ev={ev} today={today} onSelect={onSelectEvent} />
                ))}
              </ul>
            )}
          </div>

          {undated.length > 0 && (
            <div className="rounded-xl border border-dashed border-line bg-white/60 dark:border-slate-800 dark:bg-slate-900/30">
              <div className="border-b border-dashed border-line px-4 py-3 dark:border-slate-800">
                <h3 className="text-sm font-semibold tracking-tight">Menunggu jadwal resmi</h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                  Agenda berikut belum memiliki tanggal di kalender akademik.
                </p>
              </div>
              <ul className="divide-y divide-dashed divide-line dark:divide-slate-800">
                {undated.map((ev) => (
                  <EventRow key={ev.id} ev={ev} today={today} onSelect={onSelectEvent} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function EventRow({ ev, today, onSelect }) {
  const status = getStatus(ev, today)
  const dated = hasDate(ev)
  const p = dated ? parts(ev.start) : null
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(ev)}
        className="flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition hover:bg-zinc-50 dark:hover:bg-slate-800/40"
      >
        <span
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-lg border text-center leading-none',
            dated
              ? 'border-line bg-white dark:border-slate-700 dark:bg-slate-900'
              : 'border-dashed border-zinc-300 text-zinc-300 dark:border-slate-700 dark:text-slate-600',
          )}
        >
          {dated ? (
            <span>
              <span className="block text-base font-semibold tabular-nums">{p.d}</span>
              <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-zinc-400">{MONTHS_SHORT[p.m]}</span>
            </span>
          ) : (
            <span className="text-base font-semibold">?</span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium leading-snug">{ev.title}</span>
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-slate-400">
            <CategoryBadge category={ev.category} />
            {dated && ev.end !== ev.start && (
              <span>
                s.d. {parts(endOf(ev)).d} {MONTHS_SHORT[parts(endOf(ev)).m]}
              </span>
            )}
            {ev.time && <span>{ev.time}</span>}
            {ev.faculty && ev.faculty !== 'Semua Fakultas' && <span>{ev.faculty.replace('Fakultas ', '')}</span>}
          </span>
        </span>
        {dated && <StatusBadge status={status} className="mt-0.5" />}
      </button>
    </li>
  )
}
