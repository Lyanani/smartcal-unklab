import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  ClipboardCheck,
  Clock,
  Download,
  Flame,
  Mail,
  MapPin,
  Plus,
} from 'lucide-react'
import { CATEGORIES, CATEGORY_KEYS, MONTH_NAMES } from '../data/calendarData'
import { cn, getRelativeDayLabel, weekdayOf } from '../utils/calendarUtils'
import HeroCountdown from './HeroCountdown'
import QuickRemindButton from './QuickRemindButton'

export default function DashboardTab({
  user,
  facultyScope = 'all',
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
  now = new Date(),
  onSelectDay,
}) {
  const [filterMode, setFilterMode] = useState('all') // 'all' | 'reminded'
  const isAdmin = user.role === 'admin'
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((e) => {
        const endTime = new Date(
          e.year ?? 2026,
          e.month ?? 10,
          e.end,
          23,
          59,
          59,
        ).getTime()
        return endTime >= todayStart
      })
      .sort((a, b) => {
        const timeA = new Date(a.year ?? 2026, a.month ?? 10, a.start).getTime()
        const timeB = new Date(b.year ?? 2026, b.month ?? 10, b.start).getTime()
        return timeA - timeB
      })
  }, [events, todayStart])

  const remindedEvents = useMemo(() => {
    return events
      .filter((e) => remindedIds.has(String(e.id)))
      .sort((a, b) => {
        const timeA = new Date(a.year ?? 2026, a.month ?? 10, a.start).getTime()
        const timeB = new Date(b.year ?? 2026, b.month ?? 10, b.start).getTime()
        return timeA - timeB
      })
  }, [events, remindedIds])

  const displayedAgendaList = filterMode === 'reminded' ? remindedEvents : upcomingEvents

  const completedChecklist = checklist.filter((c) => c.done).length
  const readinessPct = checklist.length ? Math.round((completedChecklist / checklist.length) * 100) : 0

  const busyClusters = useMemo(() => {
    const critical = upcomingEvents.filter((e) => ['ujian', 'akademik', 'pribadi'].includes(e.category))
    const found = []
    for (let i = 0; i < critical.length; i++) {
      const startTime = new Date(
        critical[i].year ?? 2026,
        critical[i].month ?? 10,
        critical[i].start,
      ).getTime()
      const fourDaysLater = startTime + 4 * 864e5
      const cluster = critical.filter((ev) => {
        const evTime = new Date(ev.year ?? 2026, ev.month ?? 10, ev.start).getTime()
        return evTime >= startTime && evTime <= fourDaysLater
      })
      if (cluster.length >= 2) {
        const key = `${cluster[0].id}-${cluster[cluster.length - 1].id}`
        if (!found.some((f) => f.key === key)) {
          const firstEv = cluster[0]
          found.push({
            key,
            startDay: firstEv.start,
            endDay: Math.max(...cluster.map((c) => c.end)),
            monthName: MONTH_NAMES[firstEv.month ?? 10] || 'November',
            year: firstEv.year ?? 2026,
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

      {/* ── Slim Academic Context Strip ───────────────────────────────── */}
      <div className="flex flex-col gap-2 rounded-lg border border-line bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: live date + phase */}
        <p className="flex items-center gap-2 text-xs text-zinc-600 dark:text-slate-300">
          <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
          <span className="font-medium">
            Hari ini: {weekdayOf(now.getDate(), now.getFullYear(), now.getMonth())},{' '}
            {now.getDate()} {MONTH_NAMES[now.getMonth()]} {now.getFullYear()}
          </span>
          <span className="hidden text-zinc-400 dark:text-slate-500 sm:inline">·</span>
          <span className="hidden text-zinc-400 dark:text-slate-500 sm:inline">
            Pekan Praktikum &amp; Evaluasi Akhir
          </span>
        </p>

        {/* Right: compact semester progress */}
        <div className="flex items-center gap-3">
          <span className="hidden whitespace-nowrap text-xs text-zinc-500 dark:text-slate-400 sm:inline">
            Semester Ganjil 2026/2027 · Minggu 13/16
          </span>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-slate-700">
              <div className="h-full w-[81%] rounded-full bg-zinc-800 dark:bg-slate-200" />
            </div>
            <span className="text-[11px] font-semibold tabular-nums text-zinc-700 dark:text-slate-300">
              81%
            </span>
          </div>
        </div>
      </div>

      {/* ── Hero Countdown Card ─────────────────────────────────────────── */}
      <HeroCountdown user={user} facultyScope={facultyScope} events={events} now={now} />

      {/* 4 Kartu KPI */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Ringkasan statistik">
        <div className="rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
            <span>{isAdmin ? 'Total Jadwal Semester' : 'Agenda Fakultas Aktif'}</span>
            <Calendar className="size-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{events.length} Agenda</p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-slate-500">
            {upcomingEvents.length} agenda mendatang mulai {now.getDate()}{' '}
            {MONTH_NAMES[now.getMonth()]?.slice(0, 3) || ''}
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
                  Radar Pekan Padat Terdeteksi ({busyClusters[0].startDay} – {busyClusters[0].endDay}{' '}
                  {busyClusters[0].monthName} {busyClusters[0].year})
                </h2>
                <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-300/80">
                  Terdapat <strong>{busyClusters[0].items.length} tenggat krusial</strong> berdekatan:{' '}
                  {busyClusters[0].items
                    .map(
                      (i) =>
                        `${i.title} (${i.start} ${MONTH_NAMES[i.month ?? 10]?.slice(0, 3) || ''})`,
                    )
                    .join(' • ')}
                  .
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
        {/* Kolom Kiri: Hitung Mundur Pengingat & Agenda Terdekat */}
        <section className="flex flex-col rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex flex-col gap-3 border-b border-line pb-3.5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold tracking-tight">
                Hitung Mundur Pengingat & Agenda Terdekat
              </h2>
              <p className="text-xs text-zinc-500 dark:text-slate-400">
                Pantau sisa hari tenggat krusial dan kelola aktivasi pengingat Gmail otomatis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExportIcs}
                className="inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Download className="size-3.5" />
                Export .ics
              </button>
            </div>
          </div>

          {/* Filter Sub-Tab Pengingat / Agenda */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={cn(
                'inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition',
                filterMode === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-slate-950'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
              )}
            >
              <Calendar className="size-3" />
              Semua Agenda ({upcomingEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('reminded')}
              className={cn(
                'inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition',
                filterMode === 'reminded'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-950/80',
              )}
            >
              <Bell className="size-3" />
              Pengingat Gmail Saya ({remindedEvents.length})
            </button>
          </div>

          {/* Daftar Agenda Terdekat / Pengingat */}
          <div className="mt-4 flex flex-col gap-3">
            {displayedAgendaList.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line p-8 text-center text-xs text-zinc-400 dark:border-slate-800 dark:text-slate-500">
                <Bell className="mb-2 size-6 stroke-1 text-zinc-300 dark:text-slate-600" />
                <p className="font-medium text-zinc-600 dark:text-slate-300">
                  {filterMode === 'reminded'
                    ? 'Belum ada agenda yang diaktifkan pengingat Gmail-nya.'
                    : 'Tidak ada agenda mendatang.'}
                </p>
                <p className="mt-1 max-w-xs">
                  {filterMode === 'reminded'
                    ? 'Klik tombol "Ingatkan via Gmail" pada salah satu agenda untuk menerima notifikasi tepat waktu.'
                    : 'Semua jadwal untuk rentang waktu ini telah selesai.'}
                </p>
              </div>
            ) : (
              displayedAgendaList.slice(0, 6).map((ev) => {
                const rel = getRelativeDayLabel(ev, now)
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
                          <span
                            className={cn(
                              'size-2 shrink-0 rounded-full',
                              CATEGORIES[ev.category]?.dot || 'bg-sky-500',
                            )}
                          />
                          <p className="text-sm font-medium leading-snug">{ev.title}</p>
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 pl-4 text-xs text-zinc-500 dark:text-slate-400">
                          <span className="font-medium text-zinc-700 dark:text-slate-300">
                            {ev.start}
                            {ev.end > ev.start ? ` – ${ev.end}` : ''}{' '}
                            {MONTH_NAMES[ev.month ?? 10]?.slice(0, 3)} {ev.year ?? 2026}
                          </span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" /> {ev.time}
                          </span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" /> {ev.location}
                          </span>
                        </p>
                      </div>

                      {/* Badge Hitung Mundur Hari yang Jelas & Dinamis */}
                      <span
                        className={cn(
                          'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                          rel.tone === 'emerald' &&
                            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/70 dark:text-emerald-300',
                          rel.tone === 'rose' &&
                            'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/70 dark:text-rose-300',
                          rel.tone === 'amber' &&
                            'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/70 dark:text-amber-300',
                          rel.tone === 'sky' &&
                            'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/70 dark:text-sky-300',
                          rel.tone === 'muted' &&
                            'border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400',
                        )}
                      >
                        {rel.tone === 'emerald' && (
                          <span className="relative flex size-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                          </span>
                        )}
                        {rel.text}
                      </span>
                    </div>

                    {/* Footer Kartu dengan Tombol Langsung ke Kalender & Quick Remind */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-2.5 dark:border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[11px] text-zinc-400 dark:text-slate-500">
                          {ev.faculty}
                        </span>
                        {isSent && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <Mail className="size-2.5" /> Gmail Aktif
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (onSelectDay) {
                              onSelectDay(ev.start, ev.year ?? 2026, ev.month ?? 10)
                            }
                            if (onSelectEvent) {
                              onSelectEvent(ev)
                            }
                            onSwitchTab('calendar')
                          }}
                          className="inline-flex cursor-pointer touch-manipulation items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          title="Buka tanggal ini di Kalender Akademik"
                        >
                          <Calendar className="size-3" strokeWidth={1.75} />
                          <span>Lihat di Kalender</span>
                        </button>

                        <QuickRemindButton
                          event={ev}
                          isSent={isSent}
                          isSending={isSending}
                          onSend={onSendReminder}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* Kolom Kanan: Dinamis sesuai Role */}
        {isAdmin ? (
          <section className="flex flex-col gap-5 rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center justify-between border-b border-line pb-3.5 dark:border-slate-800">
              <div>
                <h2 className="text-base font-semibold tracking-tight">Analitik Jadwal & Pengingat</h2>
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
              onClick={() => onSwitchTab('calendar')}
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
