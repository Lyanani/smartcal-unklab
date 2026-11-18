import { useState } from 'react'
import { AlertTriangle, Check, Plus, Trash2 } from 'lucide-react'
import { CATEGORIES } from '../data/calendarData'
import { cn, getEventConflicts, getRelativeDayLabel } from '../utils/calendarUtils'
import ScheduleAssistant from '../../ai/ScheduleAssistant.jsx'

export default function WorkspaceTab({
  user,
  events,
  remindedIds,
  checklist,
  onToggleChecklist,
  onSelectEvent,
  onAddPersonalEvent,
  onDeleteEvent,
  onOpenAddModal,
}) {
  const isAdmin = user.role === 'admin'
  const ownerKey = user.email || 'guest'
  const [pTitle, setPTitle] = useState('')
  const [pDay, setPDay] = useState(19)
  const [pTime, setPTime] = useState('14.00 WITA')
  const [pLocation, setPLocation] = useState('Google Classroom / Lab')

  const remindedEvents = events.filter((e) => remindedIds.has(String(e.id))).sort((a, b) => a.start - b.start)
  const personalEvents = events.filter((e) => e.isPersonal && e.ownerEmail === ownerKey)
  const manualConflicts = getEventConflicts(
    { start: Number(pDay), end: Number(pDay), time: pTime, durationMinutes: 60 },
    events,
  )

  const handlePersonalSubmit = async (e) => {
    e.preventDefault()
    if (!pTitle.trim()) return
    const parsedDay = Math.min(30, Math.max(1, Number(pDay) || 15))
    await onAddPersonalEvent({
      start: parsedDay,
      end: parsedDay,
      category: 'pribadi',
      faculty: user.faculty,
      isPersonal: true,
      ownerEmail: ownerKey,
      title: pTitle.trim(),
      time: pTime.trim() || '12.00 WITA',
      durationMinutes: 60,
      location: pLocation.trim() || 'Mandiri / Online',
      description: user.email
        ? `Tugas / agenda pribadi milik ${user.name} (${user.email}).`
        : `Tugas / agenda pribadi milik ${user.name} di browser ini.`,
    })
    setPTitle('')
  }

  if (isAdmin) {
    const sortedAll = [...events].sort((a, b) => a.start - b.start)
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Kelola Jadwal Akademik Semester Ganjil</h1>
            <p className="text-xs text-zinc-500 dark:text-slate-400">
              Tambah atau hapus agenda kalender lokal di browser ini.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-slate-950"
          >
            <Plus className="size-4" />
            Tambah Agenda Baru
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-white dark:border-slate-800 dark:bg-slate-900/70">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-canvas text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Judul Agenda</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Target Fakultas</th>
                  <th className="px-4 py-3">Lokasi</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-slate-800">
                {sortedAll.map((ev) => {
                  const cat = CATEGORIES[ev.category] || CATEGORIES.akademik
                  return (
                    <tr key={ev.id} className="hover:bg-zinc-50/70 dark:hover:bg-slate-800/40">
                      <td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums">
                        {ev.end > ev.start ? `${ev.start}–${ev.end} Nov` : `${ev.start} Nov`}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-slate-100">{ev.title}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px]', cat.badge)}>
                          <span className={cn('size-1.5 rounded-full', cat.dot)} />
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-slate-400">{ev.faculty}</td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-slate-400">{ev.location}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectEvent(ev)}
                            className="cursor-pointer rounded-md border border-line px-2.5 py-1 text-[11px] font-medium hover:bg-zinc-100 dark:border-slate-700 dark:hover:bg-slate-800"
                          >
                            Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteEvent(ev)}
                            title="Hapus jadwal"
                            className="cursor-pointer rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between border-b border-line pb-3.5 dark:border-slate-800">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Riwayat Pengingat Gmail Aktif</h2>
              <p className="text-xs text-zinc-500 dark:text-slate-400">
                {user.role === 'guest'
                  ? 'Mode tamu: masuk untuk mengirim pengingat ke Gmail.'
                  : <>Tujuan pengiriman: <strong>{user.email}</strong></>}
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {remindedEvents.length} Terkirim
            </span>
          </div>

          {remindedEvents.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-500 dark:text-slate-400">
              Belum ada pengingat yang dikirim ke Gmail. Tap tombol{' '}
              <strong>&ldquo;Ingatkan Gmail&rdquo;</strong> pada agenda di Dashboard atau Kalender.
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2.5">
              {remindedEvents.map((ev) => {
                const rel = getRelativeDayLabel(ev.start, ev.end)
                return (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onSelectEvent(ev)}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-emerald-200/80 bg-emerald-50/30 p-3 transition hover:border-emerald-400 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{ev.title}</p>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                        {ev.start} Nov 2026 · {ev.time} · {ev.location}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {rel.text}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-base font-semibold tracking-tight">Tambah Tenggat Tugas Pribadi</h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
            Catat deadline tugas kuliah atau presentasi kelompok agar muncul di kalender pribadimu.
          </p>

          <form onSubmit={handlePersonalSubmit} className="mt-4 flex flex-col gap-3 text-xs">
            <div>
              <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Nama Tugas / Agenda *</label>
              <input
                required
                type="text"
                autoComplete="off"
                value={pTitle}
                onChange={(e) => setPTitle(e.target.value)}
                placeholder="Contoh: Presentasi Proyek Sistem Informasi"
                className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Tgl (Nov)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={pDay}
                  onChange={(e) => setPDay(e.target.value)}
                  className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Jam</label>
                <input
                  type="text"
                  value={pTime}
                  onChange={(e) => setPTime(e.target.value)}
                  className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Tempat / Link</label>
                <input
                  type="text"
                  value={pLocation}
                  onChange={(e) => setPLocation(e.target.value)}
                  className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-1 inline-flex h-10 cursor-pointer touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 text-xs font-medium text-white transition hover:bg-violet-700"
            >
              <Plus className="size-3.5" />
              Simpan ke Kalender Pribadi
            </button>
          </form>

          {manualConflicts.length > 0 && (
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                Waktu ini bertabrakan dengan {manualConflicts.map((event) => `“${event.title}”`).join(', ')}.
                Kamu tetap bisa menyimpan setelah memeriksa jadwal.
              </span>
            </p>
          )}

          <ScheduleAssistant user={user} events={events} onAddPersonalEvent={onAddPersonalEvent} />

          {personalEvents.length > 0 && (
            <div className="mt-4 border-t border-line pt-3 dark:border-slate-800">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Daftar Tugas Pribadi ({personalEvents.length})
              </p>
              <div className="flex flex-col gap-2">
                {personalEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between rounded-lg border border-violet-200/80 bg-violet-50/40 px-3 py-2 text-xs dark:border-violet-900/40 dark:bg-violet-950/20"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectEvent(ev)}
                      className="min-w-0 flex-1 cursor-pointer text-left font-medium hover:underline"
                    >
                      {ev.start} Nov · {ev.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEvent(ev)}
                      aria-label="Hapus tugas pribadi"
                      className="ml-2 cursor-pointer text-zinc-400 hover:text-rose-500"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="border-b border-line pb-3.5 dark:border-slate-800">
          <h2 className="text-base font-semibold tracking-tight">Checklist Syarat Akademik Semester Ganjil</h2>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
            Progres checklist otomatis tersimpan dan terhubung ke indikator Dashboard kamu.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleChecklist(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onToggleChecklist(item.id)}
              className={cn(
                'flex cursor-pointer touch-manipulation items-start gap-3 rounded-xl border p-3.5 transition',
                item.done
                  ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                  : 'border-line bg-canvas/70 hover:border-zinc-400 dark:border-slate-800 dark:bg-slate-950/60',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition',
                  item.done
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-zinc-300 bg-white dark:border-slate-600 dark:bg-slate-900',
                )}
              >
                {item.done && <Check className="size-3.5" strokeWidth={2.5} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={cn('text-sm font-medium', item.done && 'line-through opacity-60')}>{item.title}</p>
                  <span className="rounded bg-zinc-200/70 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-slate-800 dark:text-slate-300">
                    {item.deadline}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-slate-400">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export { WorkspaceTab }
