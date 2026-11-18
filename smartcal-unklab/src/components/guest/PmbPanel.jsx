import { useState } from 'react'
import { BookOpenCheck, CalendarClock, ClipboardPen, FileCheck2, Users } from 'lucide-react'
import { PMB_STEPS } from '../../data/guestCalendar'
import { cn } from '../../utils/calendarUtils'
import { formatRange, formatShort, getStatus, hasDate } from '../../utils/guestDates'
import { pickRepresentative } from './pmb'
import { StatusBadge } from './StatusBadge'

const STEP_ICONS = {
  pendaftaran: ClipboardPen,
  tes: FileCheck2,
  orientasi: Users,
  kuliah: BookOpenCheck,
}

function dateText(ev) {
  if (!ev) return 'Tidak tercantum di kalender'
  return hasDate(ev) ? formatRange(ev.start, ev.end) : 'Menunggu kalender resmi'
}

/* Empat kartu ringkas untuk periode penerimaan yang sedang berjalan / terdekat. */
export function PmbFocusCards({ focus, today, onSelectEvent }) {
  if (!focus) {
    return (
      <p className="rounded-xl border border-dashed border-line p-5 text-sm text-zinc-500 dark:border-slate-800 dark:text-slate-400">
        Belum ada periode penerimaan yang terdaftar.
      </p>
    )
  }
  return (
    <section aria-label="Ringkasan periode penerimaan terdekat" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight">
          Penerimaan Mahasiswa Baru
          <span className="ml-2 font-normal text-zinc-500 dark:text-slate-400">{focus.intake}</span>
        </h2>
        <span className="text-xs text-zinc-400 dark:text-slate-500">Periode berjalan / terdekat</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PMB_STEPS.map((step) => {
          const list = focus.steps[step.key]
          const ev = pickRepresentative(list, today)
          const status = ev ? getStatus(ev, today) : null
          const Icon = STEP_ICONS[step.key]
          const tbd = !ev || !hasDate(ev)
          const multi = list.length > 1
          return (
            <button
              key={step.key}
              type="button"
              disabled={!ev}
              onClick={() => ev && onSelectEvent(ev)}
              className={cn(
                'flex cursor-pointer flex-col gap-3 rounded-xl border bg-white p-4 text-left transition enabled:hover:border-zinc-300 enabled:hover:shadow-2xs disabled:cursor-default dark:bg-slate-900/70 dark:enabled:hover:border-slate-600',
                status?.state === 'ongoing'
                  ? 'border-emerald-300 dark:border-emerald-800'
                  : 'border-line dark:border-slate-800',
              )}
            >
              <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Icon className="size-3.5" strokeWidth={1.8} />
                  {step.label}
                </span>
                {status && <StatusBadge status={status} />}
              </div>
              <div>
                <p
                  className={cn(
                    'text-sm font-semibold leading-snug tracking-tight',
                    tbd && 'font-medium text-zinc-400 dark:text-slate-500',
                  )}
                >
                  {dateText(ev)}
                </p>
                {multi && ev?.wave && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
                    Gelombang {ev.wave} dari {list.length}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

/* Semua periode penerimaan dalam satu tampilan. */
export function PmbIntakeTable({ intakes, today, onSelectEvent }) {
  const [showDone, setShowDone] = useState(false)
  const visible = intakes.filter((it) => showDone || !it.done)
  const doneCount = intakes.filter((it) => it.done).length

  return (
    <section
      aria-label="Jadwal penerimaan per periode"
      className="rounded-xl border border-line bg-white dark:border-slate-800 dark:bg-slate-900/70"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4 dark:border-slate-800">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <CalendarClock className="size-4 text-zinc-400" strokeWidth={1.8} />
            Jadwal Penerimaan per Periode
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
            Pendaftaran kuliah, tes masuk (per gelombang), orientasi, dan awal perkuliahan.
          </p>
        </div>
        {doneCount > 0 && (
          <button
            type="button"
            onClick={() => setShowDone((v) => !v)}
            className="cursor-pointer text-xs font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-slate-300"
          >
            {showDone ? 'Sembunyikan periode selesai' : `Tampilkan ${doneCount} periode selesai`}
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="p-5 text-sm text-zinc-500 dark:text-slate-400">Semua periode penerimaan sudah selesai.</p>
      ) : (
        <div className="grid gap-4 p-4 lg:grid-cols-3">
          {visible.map((it) => (
            <div
              key={it.key}
              className={cn(
                'flex flex-col gap-4 rounded-lg border p-4',
                it.focus
                  ? 'border-zinc-300 bg-zinc-50/70 dark:border-slate-600 dark:bg-slate-800/30'
                  : 'border-line dark:border-slate-800',
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold tracking-tight">{it.intake}</h3>
                {it.focus && (
                  <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white dark:bg-white dark:text-slate-950">
                    Terdekat
                  </span>
                )}
                {it.done && <span className="text-[11px] text-zinc-400">Selesai</span>}
              </div>

              <ol className="relative flex flex-col gap-4 border-l border-line pl-4 dark:border-slate-700">
                {PMB_STEPS.map((step) => {
                  const list = it.steps[step.key]
                  if (!list.length) return null
                  const rep = pickRepresentative(list, today)
                  const repStatus = getStatus(rep, today)
                  return (
                    <li key={step.key} className="relative">
                      <span
                        className={cn(
                          'absolute -left-[21px] top-1 size-2.5 rounded-full border-2 border-white dark:border-slate-900',
                          repStatus.state === 'ongoing' && 'bg-emerald-500',
                          repStatus.state === 'upcoming' && 'bg-sky-500',
                          repStatus.state === 'done' && 'bg-zinc-400',
                          repStatus.state === 'tbd' && 'bg-zinc-300 dark:bg-slate-600',
                        )}
                      />
                      <span className="mb-1 block text-xs font-medium text-zinc-500 dark:text-slate-400">
                        {step.short}
                      </span>
                      <ul className="flex flex-col gap-1">
                        {list.map((ev) => {
                          const st = getStatus(ev, today)
                          const showBadge = list.length === 1 || ev.id === rep.id
                          return (
                            <li key={ev.id}>
                              <button
                                type="button"
                                onClick={() => onSelectEvent(ev)}
                                className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md py-0.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-slate-800/60"
                              >
                                <span className={cn(!hasDate(ev) && 'text-zinc-400', st.state === 'done' && list.length > 1 && 'text-zinc-400 dark:text-slate-500')}>
                                  {list.length > 1 && ev.wave && (
                                    <span className="mr-1.5 text-xs text-zinc-400 dark:text-slate-500">Gel. {ev.wave}</span>
                                  )}
                                  <span className={cn(list.length === 1 && 'font-medium')}>
                                    {list.length > 1 ? formatShort(ev.start) : dateText(ev)}
                                  </span>
                                </span>
                                {showBadge && <StatusBadge status={st} />}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  )
                })}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
