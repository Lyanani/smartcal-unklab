import { useState } from 'react'
import { Check, CheckCircle2, ClipboardCheck, Mail, Plus, Sparkles, Trash2 } from 'lucide-react'
import { cn, getRelativeDayLabel } from '../utils/calendarUtils'

export default function StudentAcademicWorkspace({
  user,
  events,
  remindedIds,
  checklist,
  onToggleChecklist,
  onSelectEvent,
  onAddPersonalEvent,
  onDeleteEvent,
}) {
  const [pTitle, setPTitle] = useState('')
  const [pDay, setPDay] = useState(19)
  const [pTime, setPTime] = useState('14.00 WITA')
  const [pLocation, setPLocation] = useState('Google Classroom / SIAKAD')

  const remindedEvents = events.filter((e) => remindedIds.has(String(e.id))).sort((a, b) => a.start - b.start)
  const personalEvents = events.filter((e) => e.isPersonal && e.ownerEmail === user.email)

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
      ownerEmail: user.email,
      title: pTitle.trim(),
      time: pTime.trim() || '12.00 WITA',
      location: pLocation.trim() || 'Mandiri / Online',
      description: `Tugas / agenda pribadi milik ${user.name} (${user.email}).`,
    })
    setPTitle('')
  }
  const completedChecklist = checklist.filter((c) => c.done).length
  const readinessPct = checklist.length ? Math.round((completedChecklist / checklist.length) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Header Mahasiswa */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-line bg-gradient-to-br from-white via-white to-zinc-50/90 p-5 shadow-2xs backdrop-blur dark:border-slate-800 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-950 sm:p-6 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-slate-950">
            <ClipboardCheck className="size-5" strokeWidth={1.8} />
          </span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-slate-100 sm:text-lg">
                Pusat Pengingat Gmail & Kelengkapan Akademik
              </h2>
              <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-xs font-semibold tabular-nums text-zinc-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {user.faculty}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-slate-400">
              Pantau jadwal yang dikirim ke email <strong>{user.email}</strong>, catat tenggat tugas pribadi, dan penuhi syarat kelulusan administrasi KRS/UAS.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="size-3.5" />
            {remindedEvents.length} Jadwal Terkirim
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/50 dark:text-violet-300">
            <Sparkles className="size-3.5" />
            {personalEvents.length} Tugas Pribadi
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold tabular-nums text-zinc-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {readinessPct}% Syarat Selesai
          </span>
        </div>
      </div>

      {/* 2 Kolom Konten Mahasiswa */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kolom Kiri: Riwayat Pengingat Gmail + Tambah Tugas Pribadi */}
        <div className="flex flex-col gap-6">
          {/* Riwayat Gmail */}
          <section className="rounded-2xl border border-line bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between border-b border-line pb-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-emerald-500" />
                <div>
                  <h3 className="text-base font-semibold tracking-tight">Riwayat Pengingat Gmail Aktif</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-slate-400">
                    Tujuan notifikasi: <strong className="text-zinc-700 dark:text-slate-300">{user.email}</strong>
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {remindedEvents.length} Terkirim
              </span>
            </div>

            {remindedEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 dark:text-slate-400">
                <Mail className="mx-auto mb-2 size-6 text-zinc-300 dark:text-slate-600" />
                <p className="font-medium text-zinc-700 dark:text-slate-300">Belum ada pengingat dikirim</p>
                <p className="mt-1">
                  Tap tombol <strong>&ldquo;Ingatkan Gmail&rdquo;</strong> pada agenda di kalender atau timeline di atas.
                </p>
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
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-3 transition hover:border-emerald-400 dark:border-emerald-900/50 dark:bg-emerald-950/20"
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

          {/* Tambah Tugas Pribadi */}
          <section className="rounded-2xl border border-line bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 border-b border-line pb-3.5 dark:border-slate-800">
              <Sparkles className="size-4 text-violet-500" />
              <div>
                <h3 className="text-base font-semibold tracking-tight">Catat Tenggat Tugas Pribadi</h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                  Agenda khusus Anda (tugas kuliah, ujian lab, presentasi). Otomatis tampil di kalender.
                </p>
              </div>
            </div>

            <form onSubmit={handlePersonalSubmit} className="mt-4 flex flex-col gap-3 text-xs">
              <div>
                <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">
                  Nama Tugas / Agenda Pribadi *
                </label>
                <input
                  required
                  type="text"
                  autoComplete="off"
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                  placeholder="Contoh: Pengumpulan Makalah Etika Profesi"
                  className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Tgl (Nov 2026)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={pDay}
                    onChange={(e) => setPDay(e.target.value)}
                    className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Jam</label>
                  <input
                    type="text"
                    value={pTime}
                    onChange={(e) => setPTime(e.target.value)}
                    className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Tempat / SIAKAD</label>
                  <input
                    type="text"
                    value={pLocation}
                    onChange={(e) => setPLocation(e.target.value)}
                    className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-1 inline-flex min-h-[40px] cursor-pointer touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 text-xs font-medium text-white transition hover:bg-violet-700 active:scale-[0.98]"
              >
                <Plus className="size-4" />
                Simpan ke Kalender Pribadi
              </button>
            </form>

            {personalEvents.length > 0 && (
              <div className="mt-5 border-t border-line pt-3.5 dark:border-slate-800">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-slate-500">
                  Daftar Tugas Pribadi Tersimpan ({personalEvents.length})
                </p>
                <div className="flex flex-col gap-2">
                  {personalEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between rounded-lg border border-violet-200/80 bg-violet-50/40 px-3 py-2.5 text-xs dark:border-violet-900/40 dark:bg-violet-950/20"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectEvent(ev)}
                        className="min-w-0 flex-1 cursor-pointer text-left font-medium hover:underline"
                      >
                        <span className="font-semibold text-violet-700 dark:text-violet-300">{ev.start} Nov:</span>{' '}
                        {ev.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteEvent(ev)}
                        aria-label="Hapus tugas pribadi"
                        className="ml-2 cursor-pointer p-1 text-zinc-400 transition hover:text-rose-500"
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

        {/* Kolom Kanan: Checklist Syarat KRS & UAS */}
        <section className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
          <div className="border-b border-line pb-3.5 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold tracking-tight">Checklist Syarat Akademik Semester Ganjil</h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                  Centang setiap syarat yang telah beres. Progres otomatis terhubung ke Dashboard.
                </p>
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold tabular-nums dark:bg-slate-800">
                {completedChecklist}/{checklist.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-zinc-500 dark:text-slate-400">
                <span>Tingkat Kesiapan Administrasi</span>
                <span className="font-semibold text-zinc-800 dark:text-slate-200">{readinessPct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${readinessPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-1 flex-col gap-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleChecklist(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onToggleChecklist(item.id)}
                className={cn(
                  'flex cursor-pointer touch-manipulation items-start gap-3 rounded-xl border p-3.5 transition active:scale-[0.99]',
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
    </div>
  )
}
