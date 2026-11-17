import { useMemo } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  ClipboardCheck,
  Download,
  Flame,
  Mail,
  Plus,
} from 'lucide-react'
import { CATEGORIES, CATEGORY_KEYS, TODAY } from '../data/calendarData'
import { cn, getRelativeDayLabel } from '../utils/calendarUtils'
import HeroCountdown from './HeroCountdown'
import QuickRemindButton from './QuickRemindButton'

export default function DashboardTab({
  user,
  events,
  remindedIds,
  sendingEventId,
  onSendReminder,
  checklist,
  onToggleChecklist,
  allRemindersStats,
  onSelectEvent,
  onSwitchTab,
  onOpenAdd,
  onExportIcs,
}) {
  const isAdmin = user.role === 'admin'
  const upcomingEvents = [...events].filter((e) => e.end >= TODAY).sort((a, b) => a.start - b.start)
  const completedChecklist = checklist.filter((c) => c.done).length
  const readinessPct = checklist.length ? Math.round((completedChecklist / checklist.length) * 100) : 0

  const busyClusters = useMemo(() => {
    const critical = upcomingEvents.filter((e) => ['ujian', 'akademik', 'pribadi'].includes(e.category))
    const found = []
    for (let i = 0; i < critical.length; i++) {
      const cluster = critical.filter((ev) => ev.start >= critical[i].start && ev.start <= critical[i].start + 4)
      if (cluster.length >= 2) {
        const key = `${cluster[0].start}-${cluster[cluster.length - 1].start}`
        if (!found.some((f) => f.key === key)) {
          found.push({
            key,
            startDay: cluster[0].start,
            endDay: Math.max(...cluster.map((c) => c.end)),
            items: cluster,
          })
        }
      }
    }
    return found
  }, [upcomingEvents])

  const categoryBreakdown = CATEGORY_KEYS.map((key) => {
    const count = events.filter((e) => e.category === key).length
    const pct = events.length ? Math.round((count / events.length) * 100) : 0
    return { key, ...CATEGORIES[key], count, pct }
  }).filter((item) => isAdmin || item.count > 0)

  const topRemindedEvents = useMemo(() => {
    return events
      .map((ev) => ({
        ...ev,
        reminderCount: allRemindersStats.get(String(ev.id)) || (remindedIds.has(String(ev.id)) ? 1 : 0),
      }))
      .sort((a, b) => b.reminderCount - a.reminderCount)
      .slice(0, 5)
  }, [events, allRemindersStats, remindedIds])

  return (
    <div className="flex flex-col gap-6">
      <HeroCountdown user={user} />

      {/* 4 Kartu KPI */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Ringkasan statistik">
        <div className="rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
            <span>{isAdmin ? 'Total Jadwal Semester' : 'Agenda Fakultas Aktif'}</span>
            <Calendar className="size-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{events.length} Agenda</p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-slate-500">
            {upcomingEvents.length} agenda mendatang mulai 15 Nov
          </p>
        </div>

        <div className="rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
            <span>{isAdmin ? 'Total Pengingat Terkirim' : 'Terkirim ke Gmail Saya'}</span>
            <Mail className="size-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {isAdmin
              ? Math.max(remindedIds.size, [...allRemindersStats.values()].reduce((a, b) => a + b, 0))
              : remindedIds.size}{' '}
            Jadwal
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-slate-500">
            Tujuan: {user.email}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
            <span>Radar Pekan Padat</span>
            <Flame className="size-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{busyClusters.length} Periode</p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-slate-500">
            Tumpukan tenggat dalam 4 hari
          </p>
        </div>

        <div className="rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
            <span>{isAdmin ? 'Cakupan Fakultas' : 'Kesiapan Syarat KRS/UAS'}</span>
            <ClipboardCheck className="size-4 text-violet-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {isAdmin ? '3 Fakultas' : `${readinessPct}%`}
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-slate-500">
            {isAdmin
              ? 'FILKOM, Ekonomi, Keperawatan'
              : `${completedChecklist} dari ${checklist.length} syarat selesai`}
          </p>
        </div>
      </section>

      {/* Radar Pekan Padat Alert */}
      {busyClusters.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/50 dark:bg-amber-950/25">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  Radar Pekan Padat Terdeteksi ({busyClusters[0].startDay} – {busyClusters[0].endDay} November 2026)
                </h2>
                <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-300/80">
                  Terdapat <strong>{busyClusters[0].items.length} tenggat krusial</strong> berdekatan:{' '}
                  {busyClusters[0].items.map((i) => `${i.title} (${i.start} Nov)`).join(' • ')}.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSwitchTab('calendar')}
              className="inline-flex shrink-0 cursor-pointer touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-amber-700"
            >
              Lihat di Kalender
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* Grid Utama Dashboard (2 Kolom) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between border-b border-line pb-3.5 dark:border-slate-800">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Agenda Terdekat</h2>
              <p className="text-xs text-zinc-500 dark:text-slate-400">
                Tap kartu untuk detail atau langsung kirim pengingat Gmail
              </p>
            </div>
            <button
              type="button"
              onClick={onExportIcs}
              className="inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Download className="size-3.5" />
              Export .ics
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {upcomingEvents.slice(0, 5).map((ev) => {
              const rel = getRelativeDayLabel(ev.start, ev.end)
              const isSent = remindedIds.has(String(ev.id))
              const isSending = sendingEventId === String(ev.id)
              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectEvent(ev)}
                  className="flex cursor-pointer flex-col gap-2.5 rounded-lg border border-line bg-canvas/60 p-3.5 transition hover:border-zinc-400 hover:bg-white dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-slate-600"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('size-2 shrink-0 rounded-full', CATEGORIES[ev.category]?.dot || 'bg-sky-500')} />
                        <p className="text-sm font-medium leading-snug">{ev.title}</p>
                      </div>
                      <p className="mt-1 pl-4 text-xs text-zinc-500 dark:text-slate-400">
                        {ev.start} Nov · {ev.time} · {ev.location}
                      </p>
                    </div>

                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        rel.tone === 'rose' && 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
                        rel.tone === 'amber' && 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                        rel.tone === 'sky' && 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
                      )}
                    >
                      {rel.text}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-line/70 pt-2 dark:border-slate-800/80">
                    <span className="truncate text-[11px] text-zinc-400 dark:text-slate-500">{ev.faculty}</span>
                    <QuickRemindButton
                      event={ev}
                      isSent={isSent}
                      isSending={isSending}
                      onSend={onSendReminder}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Kolom Kanan: Dinamis sesuai Role */}
        {isAdmin ? (
          <section className="flex flex-col gap-5 rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center justify-between border-b border-line pb-3.5 dark:border-slate-800">
              <div>
                <h2 className="text-base font-semibold tracking-tight">Analitik Jadwal & Pengingat BAA</h2>
                <p className="text-xs text-zinc-500 dark:text-slate-400">
                  Proporsi kategori dan agenda paling banyak dipantau mahasiswa
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenAdd}
                className="inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-slate-950"
              >
                <Plus className="size-3.5" />
                Jadwal Baru
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.key}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-zinc-700 dark:text-slate-300">{cat.label}</span>
                    <span className="tabular-nums text-zinc-500">
                      {cat.count} agenda ({cat.pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
                    <div className={cn('h-full rounded-full transition-all', cat.bar)} style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line pt-3 dark:border-slate-800">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Agenda dengan Aktivasi Gmail Tertinggi
              </p>
              <div className="flex flex-col gap-2">
                {topRemindedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between rounded-lg border border-line bg-canvas/60 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950/50"
                  >
                    <span className="truncate pr-2 font-medium">{ev.title}</span>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 font-semibold tabular-nums text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {ev.reminderCount} mahasiswa
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="flex flex-col rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center justify-between border-b border-line pb-3.5 dark:border-slate-800">
              <div>
                <h2 className="text-base font-semibold tracking-tight">Checklist Syarat KRS & UAS</h2>
                <p className="text-xs text-zinc-500 dark:text-slate-400">
                  Centang syarat yang sudah beres sebelum minggu tenang
                </p>
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold tabular-nums dark:bg-slate-800">
                {completedChecklist}/{checklist.length}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggleChecklist(item.id)}
                  className={cn(
                    'flex cursor-pointer touch-manipulation items-start gap-3 rounded-lg border p-3 text-left transition',
                    item.done
                      ? 'border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                      : 'border-line bg-canvas/60 hover:border-zinc-400 dark:border-slate-800 dark:bg-slate-950/50',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 grid size-4 shrink-0 place-items-center rounded border transition',
                      item.done
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-zinc-300 bg-white dark:border-slate-600 dark:bg-slate-900',
                    )}
                  >
                    {item.done && <Check className="size-3" strokeWidth={2.5} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-xs font-medium', item.done && 'line-through opacity-60')}>
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-slate-500">{item.deadline}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onSwitchTab('workspace')}
              className="mt-4 inline-flex cursor-pointer touch-manipulation items-center justify-center gap-1.5 rounded-lg border border-line py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Buka Pusat Pengingat & Tugas Pribadi
              <ArrowRight className="size-3.5" />
            </button>
          </section>
        )}
      </div>
    </div>
  )
}

export { DashboardTab }
