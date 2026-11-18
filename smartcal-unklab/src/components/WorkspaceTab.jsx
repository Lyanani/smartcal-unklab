import AdminScheduleWorkspace from './AdminScheduleWorkspace'
import { useMemo, useState } from 'react'
import {
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock,
  Mail,
  MailCheck,
  MapPin,
  Plus,
  Trash2,
  User,
} from 'lucide-react'
import { CATEGORIES, MONTH_NAMES } from '../data/calendarData'
import { cn, formatEventDateText, getRelativeDayLabel } from '../utils/calendarUtils'

const toLocalDateInputString = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function WorkspaceTab({
  user,
  events = [],
  remindedIds = new Set(),
  sendingEventId = null,
  checklist = [],
  onToggleChecklist,
  onAddChecklistItem,
  onDeleteChecklistItem,
  onSelectEvent,
  customReminders = [],
  onAddCustomReminder,
  onDeleteCustomReminder,
  onRemoveAcademicReminder,
  onSendReminder,
  onDeleteEvent,
  onOpenAddModal,
  viewYear,
  viewMonth,
  now = new Date(),
}) {
  const isAdmin = user?.role === 'admin'
  if (isAdmin) {
    return (
      <AdminScheduleWorkspace
        events={events}
        recentlyEditedId={null}
        onSelectEvent={onSelectEvent}
        onDeleteEvent={onDeleteEvent}
        onOpenAddModal={onOpenAddModal}
        onOpenEditModal={() => {}}
      />
    )
  }
  const currentYear = viewYear ?? now.getFullYear()
  const currentMonth = viewMonth ?? now.getMonth()

  // Form Pengingat Pribadi
  const [formTitle, setFormTitle] = useState('')
  const [formDate, setFormDate] = useState(() => toLocalDateInputString(now))
  const [formTime, setFormTime] = useState('14.00 WITA')
  const [formLocation, setFormLocation] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(true)
  const [formSavedFeedback, setFormSavedFeedback] = useState(false)

  // Form Tambah Syarat / Berkas Cepat
  const [newReqTitle, setNewReqTitle] = useState('')
  const [newReqCategory, setNewReqCategory] = useState('pribadi')

  // Gabungkan Pengingat Akademik Aktif & Pengingat Pribadi ke dalam 1 Daftar Terpadu
  const unifiedReminders = useMemo(() => {
    const academic = events
      .filter((e) => !e.isPersonal && remindedIds.has(String(e.id)))
      .map((e) => ({
        ...e,
        reminderType: 'academic',
      }))

    const seenIds = new Set(academic.map((a) => String(a.id)))
    const personal = []

    customReminders.forEach((r) => {
      const idStr = String(r.id)
      if (!seenIds.has(idStr)) {
        seenIds.add(idStr)
        personal.push({
          ...r,
          reminderType: 'personal',
        })
      }
    })

    events.forEach((e) => {
      if (e.isPersonal && e.ownerEmail === user?.email) {
        const idStr = String(e.id)
        if (!seenIds.has(idStr)) {
          seenIds.add(idStr)
          personal.push({
            ...e,
            reminderType: 'personal',
          })
        }
      }
    })

    return [...academic, ...personal].sort((a, b) => {
      const timeA = new Date(a.year ?? 2026, a.month ?? 10, a.start).getTime()
      const timeB = new Date(b.year ?? 2026, b.month ?? 10, b.start).getTime()
      return timeA - timeB
    })
  }, [events, remindedIds, customReminders, user?.email])

  // Submit Pengingat Sendiri
  const handleSubmitReminder = async (e) => {
    e.preventDefault()
    if (!formTitle.trim()) return

    let year = currentYear
    let month = currentMonth
    let day = now.getDate()

    if (formDate) {
      const parts = formDate.split('-')
      if (parts.length === 3) {
        year = parseInt(parts[0], 10)
        month = parseInt(parts[1], 10) - 1
        day = parseInt(parts[2], 10)
      }
    }

    if (onAddCustomReminder) {
      await onAddCustomReminder({
        title: formTitle.trim(),
        start: day,
        end: day,
        year,
        month,
        time: formTime.trim() || 'Seharian',
        location: formLocation.trim() || 'Mandiri / Online',
        description: `Pengingat pribadi milik ${user?.name || 'Mahasiswa'}.`,
      })
    }

    setFormTitle('')
    setFormLocation('')
    setFormSavedFeedback(true)
    setTimeout(() => setFormSavedFeedback(false), 2500)
  }

  // Submit Syarat / Berkas Baru
  const handleAddRequirement = (e) => {
    if (e) e.preventDefault()
    if (!newReqTitle.trim()) return
    onAddChecklistItem?.(newReqTitle.trim(), newReqCategory)
    setNewReqTitle('')
  }

  // Metrik Checklist
  const completedChecklist = checklist.filter((c) => c.done).length
  const totalChecklist = checklist.length
  const readinessPct = totalChecklist ? Math.round((completedChecklist / totalChecklist) * 100) : 0

  // Tampilan Admin (Kelola Jadwal Resmi)
  if (isAdmin) {
    const sortedAll = [...events].sort((a, b) => {
      const timeA = new Date(a.year ?? 2026, a.month ?? 10, a.start).getTime()
      const timeB = new Date(b.year ?? 2026, b.month ?? 10, b.start).getTime()
      return timeA - timeB
    })

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Kelola Jadwal Akademik</h1>
            <p className="text-xs text-zinc-500 dark:text-slate-400">
              Tambah atau hapus agenda resmi kampus. Perubahan langsung tersinkronisasi ke seluruh mahasiswa.
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
                  const monthLabel = MONTH_NAMES[ev.month ?? 10]?.slice(0, 3) || 'Nov'
                  return (
                    <tr key={ev.id} className="hover:bg-zinc-50/70 dark:hover:bg-slate-800/40">
                      <td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums">
                        {ev.end > ev.start
                          ? `${ev.start}–${ev.end} ${monthLabel}`
                          : `${ev.start} ${monthLabel}`}
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
                            onClick={() => onSelectEvent?.(ev)}
                            className="cursor-pointer rounded-md border border-line px-2.5 py-1 text-[11px] font-medium hover:bg-zinc-100 dark:border-slate-700 dark:hover:bg-slate-800"
                          >
                            Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteEvent?.(ev)}
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

  // Tampilan Mahasiswa: Redesain Terstruktur 12 Kolom
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* ── Left Column (lg:col-span-7): Pengingat Jadwal & Agenda Pribadi ── */}
      <div className="flex flex-col gap-6 lg:col-span-7">
        {/* Section Header */}
        <section className="flex flex-col justify-between gap-3 rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/80 dark:text-sky-300">
              <Bell className="size-4.5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight">
                  Pengingat Jadwal & Agenda Pribadi
                </h1>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {unifiedReminders.length} Aktif
                </span>
              </div>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                Sinkronisasi otomatis antara agenda kalender akademik dan tenggat tugas mandiri.
              </p>
            </div>
          </div>
        </section>

        {/* Compact "Tambah Pengingat Sendiri" Form */}
        <section className="rounded-xl border border-line bg-canvas/70 p-4.5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center justify-between border-b border-line/70 pb-3 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-md bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                <Plus className="size-3.5" />
              </span>
              <h2 className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-slate-100">
                Tambah Pengingat Sendiri
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="inline-flex cursor-pointer touch-manipulation items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {isFormOpen ? (
                <>
                  <span>Tutup Form</span>
                  <ChevronUp className="size-3.5" />
                </>
              ) : (
                <>
                  <span>Buka Form</span>
                  <ChevronDown className="size-3.5" />
                </>
              )}
            </button>
          </div>

          {isFormOpen && (
            <form onSubmit={handleSubmitReminder} className="mt-3.5 flex flex-col gap-3 text-xs">
              <div>
                <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-300">
                  Judul Agenda *
                </label>
                <input
                  required
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Kumpul Draf Proposal Skripsi"
                  className="h-9 w-full rounded-lg border border-line bg-white px-3 text-xs focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-300">
                    Tanggal *
                  </label>
                  <input
                    required
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="h-9 w-full rounded-lg border border-line bg-white px-2.5 text-xs focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-300">
                    Waktu (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="Contoh: 14.00 WITA"
                    className="h-9 w-full rounded-lg border border-line bg-white px-2.5 text-xs focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-300">
                    Catatan / Lokasi
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Contoh: Lab Komputer / Online"
                    className="h-9 w-full rounded-lg border border-line bg-white px-2.5 text-xs focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="mt-1 flex items-center justify-between">
                <button
                  type="submit"
                  className="inline-flex h-9 cursor-pointer touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  <Plus className="size-3.5" />
                  <span>Simpan Pengingat</span>
                </button>

                {formSavedFeedback && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5" />
                    Tersimpan di daftar pengingat!
                  </span>
                )}
              </div>
            </form>
          )}
        </section>

        {/* Unified Reminder Cards List */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-slate-500">
              Daftar Pengingat Aktif ({unifiedReminders.length})
            </h2>
            <span className="text-[11px] text-zinc-400 dark:text-slate-500">
              Tujuan Gmail: {user?.email}
            </span>
          </div>

          {unifiedReminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-white p-8 text-center text-xs text-zinc-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500">
              <Bell className="mb-2 size-6 stroke-1 text-zinc-300 dark:text-slate-600" />
              <p className="font-medium text-zinc-600 dark:text-slate-300">
                Belum ada pengingat yang aktif.
              </p>
              <p className="mt-1 max-w-sm text-[11px]">
                Buat pengingat tugas mandiri melalui form di atas atau klik tombol{' '}
                <strong>&ldquo;Ingatkan via Gmail&rdquo;</strong> pada jadwal di Dashboard dan Kalender.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {unifiedReminders.map((ev) => {
                const rel = getRelativeDayLabel(ev, now)
                const isPersonal = ev.reminderType === 'personal'
                const isSent = remindedIds.has(String(ev.id))
                const isSending = sendingEventId === String(ev.id)

                return (
                  <article
                    key={ev.id}
                    onClick={() => onSelectEvent?.(ev)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onSelectEvent?.(ev)}
                    className="flex cursor-pointer flex-col gap-2.5 rounded-xl border border-line bg-white p-4 shadow-2xs transition hover:border-zinc-300 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700"
                  >
                    {/* Top Row: Type Tag & Dynamic Day Counter Pill */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isPersonal ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/50 dark:text-violet-300">
                            <User className="size-2.5" />
                            Pengingat Pribadi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/50 dark:text-sky-300">
                            <Calendar className="size-2.5" />
                            Kalender Akademik
                          </span>
                        )}
                      </div>

                      {/* Dynamic Live Day-Counter Pill */}
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

                    {/* Event Title */}
                    <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-slate-100">
                      {ev.title}
                    </h3>

                    {/* Metadata Row: Date, Time, Location */}
                    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-zinc-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-3.5 shrink-0 text-zinc-400 dark:text-slate-500" />
                        {formatEventDateText(ev)}
                      </span>
                      {ev.time && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5 shrink-0 text-zinc-400 dark:text-slate-500" />
                          {ev.time}
                        </span>
                      )}
                      {ev.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5 shrink-0 text-zinc-400 dark:text-slate-500" />
                          {ev.location}
                        </span>
                      )}
                    </div>

                    {/* Bottom Action Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-2.5 dark:border-slate-800/80">
                      <span className="truncate text-[11px] text-zinc-400 dark:text-slate-500">
                        {isPersonal ? `Agenda Pribadi · ${user?.name}` : ev.faculty}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Tombol Kirim ke Gmail */}
                        <button
                          type="button"
                          disabled={isSending}
                          onClick={(e) => {
                            e.stopPropagation()
                            onSendReminder?.(ev)
                          }}
                          className={cn(
                            'inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition',
                            isSent
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'border-line bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
                          )}
                          title={isSent ? 'Kirim ulang pengingat ke Gmail' : 'Kirim detail pengingat ini ke Gmail'}
                        >
                          {isSending ? (
                            <>
                              <span className="size-3 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                              <span>Mengirim...</span>
                            </>
                          ) : isSent ? (
                            <>
                              <MailCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>Terkirim ke Gmail</span>
                            </>
                          ) : (
                            <>
                              <Mail className="size-3.5 text-zinc-500 dark:text-slate-400" />
                              <span>Kirim ke Gmail</span>
                            </>
                          )}
                        </button>

                        {/* Tombol Hapus */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (isPersonal) {
                              onDeleteCustomReminder?.(ev.id)
                            } else {
                              onRemoveAcademicReminder?.(ev.id)
                            }
                          }}
                          aria-label={isPersonal ? 'Hapus pengingat pribadi' : 'Hapus dari daftar pengingat'}
                          title={isPersonal ? 'Hapus pengingat pribadi' : 'Hapus dari daftar pengingat'}
                          className="grid size-8 cursor-pointer touch-manipulation place-items-center rounded-lg border border-line bg-white text-zinc-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* ── Right Column (lg:col-span-5): Checklist Syarat & Persiapan ── */}
      <div className="flex flex-col gap-6 lg:col-span-5">
        <section className="flex flex-col gap-4 rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          {/* Header & Mini Progress Bar */}
          <div className="border-b border-line pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300">
                <ClipboardCheck className="size-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold tracking-tight">
                  Checklist Syarat & Persiapan
                </h2>
                <p className="text-xs text-zinc-500 dark:text-slate-400">
                  Pantau berkas ujian dan kelengkapan administrasi semester ini.
                </p>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-600 dark:text-slate-400">
                  Progres Kelengkapan
                </span>
                <span className="font-semibold tabular-nums text-zinc-900 dark:text-slate-100">
                  {completedChecklist} / {totalChecklist} Syarat ({readinessPct}%)
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${readinessPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick-Add Requirement Input */}
          <form onSubmit={handleAddRequirement} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newReqTitle}
                onChange={(e) => setNewReqTitle(e.target.value)}
                placeholder="Tambah syarat atau berkas baru..."
                className="h-9 flex-1 rounded-lg border border-line bg-canvas px-3 text-xs placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-500 dark:focus:border-slate-400"
              />
              <button
                type="submit"
                disabled={!newReqTitle.trim()}
                className="inline-flex h-9 cursor-pointer touch-manipulation items-center gap-1 rounded-lg bg-zinc-900 px-3.5 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:opacity-40 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                <Plus className="size-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-slate-400">
              <span>Kategori:</span>
              <button
                type="button"
                onClick={() => setNewReqCategory('pribadi')}
                className={cn(
                  'cursor-pointer rounded px-2 py-0.5 font-medium transition',
                  newReqCategory === 'pribadi'
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                    : 'hover:bg-zinc-100 dark:hover:bg-slate-800',
                )}
              >
                Pribadi
              </button>
              <button
                type="button"
                onClick={() => setNewReqCategory('akademik')}
                className={cn(
                  'cursor-pointer rounded px-2 py-0.5 font-medium transition',
                  newReqCategory === 'akademik'
                    ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                    : 'hover:bg-zinc-100 dark:hover:bg-slate-800',
                )}
              >
                Akademik
              </button>
            </div>
          </form>

          {/* Clean Checklist Items */}
          <div className="flex flex-col gap-2.5">
            {checklist.map((item) => {
              const isPersonal = item.category === 'pribadi' || item.id.startsWith('chk-custom-')
              return (
                <div
                  key={item.id}
                  onClick={() => onToggleChecklist?.(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onToggleChecklist?.(item.id)}
                  className={cn(
                    'group flex cursor-pointer touch-manipulation items-start justify-between gap-3 rounded-xl border p-3.5 transition',
                    item.done
                      ? 'border-emerald-200/70 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                      : 'border-line bg-canvas/60 hover:border-zinc-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-900/80',
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
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
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.2 text-[10px] font-semibold',
                            isPersonal
                              ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                              : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
                          )}
                        >
                          {isPersonal ? 'Pribadi' : 'Akademik'}
                        </span>
                        {item.deadline && (
                          <span className="text-[10px] text-zinc-400 dark:text-slate-500">
                            · {item.deadline}
                          </span>
                        )}
                      </div>

                      <p
                        className={cn(
                          'mt-1 text-xs font-medium leading-relaxed transition',
                          item.done
                            ? 'line-through text-zinc-400 dark:text-slate-500'
                            : 'text-zinc-900 dark:text-slate-100',
                        )}
                      >
                        {item.title}
                      </p>

                      {item.detail && (
                        <p
                          className={cn(
                            'mt-0.5 text-[11px] leading-relaxed',
                            item.done
                              ? 'line-through text-zinc-400/70 dark:text-slate-600'
                              : 'text-zinc-500 dark:text-slate-400',
                          )}
                        >
                          {item.detail}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteChecklistItem?.(item.id)
                    }}
                    aria-label={`Hapus ${item.title}`}
                    title="Hapus syarat ini"
                    className="p-1 text-zinc-400 opacity-0 transition-opacity hover:text-rose-500 focus:opacity-100 group-hover:opacity-100 dark:text-slate-500 dark:hover:text-rose-400"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

export { WorkspaceTab }
