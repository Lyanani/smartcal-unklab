import { useState } from 'react'
import {
  Calendar,
  CalendarX,
  Check,
  Clock,
  Database,
  MapPin,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'
import { CAMPUS_CATEGORY_KEYS, CATEGORIES, FACULTIES } from '../data/calendarData'
import { cn } from '../utils/calendarUtils'

export default function AdminScheduleWorkspace({
  events,
  recentlyEditedId,
  onSelectEvent,
  onDeleteEvent,
  onOpenAddModal,
  onOpenEditModal,
}) {
  const [adminSearch, setAdminSearch] = useState('')
  const [adminCategory, setAdminCategory] = useState('all')
  const [adminFaculty, setAdminFaculty] = useState('all')

  const sortedAll = [...events].sort((a, b) => a.start - b.start)
  const filteredEvents = sortedAll.filter((ev) => {
    const q = adminSearch.trim().toLowerCase()
    const matchSearch =
      !q ||
      ev.title.toLowerCase().includes(q) ||
      ev.location.toLowerCase().includes(q) ||
      ev.faculty.toLowerCase().includes(q) ||
      (CATEGORIES[ev.category]?.label || '').toLowerCase().includes(q)
    const matchCategory = adminCategory === 'all' || ev.category === adminCategory
    const matchFaculty = adminFaculty === 'all' || ev.faculty === adminFaculty
    return matchSearch && matchCategory && matchFaculty
  })
  const hasActiveFilter = Boolean(adminSearch.trim() || adminCategory !== 'all' || adminFaculty !== 'all')

  return (
    <div className="flex flex-col gap-6">
        {/* Header Pengelola Agenda Admin */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-line bg-gradient-to-br from-white via-white to-zinc-50/90 p-5 shadow-2xs backdrop-blur dark:border-slate-800 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-950 sm:p-6 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-slate-950">
            <ShieldCheck className="size-5" strokeWidth={1.8} />
          </span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-slate-100 sm:text-lg">
                Pusat Kelola & Modifikasi Agenda Kampus
              </h2>
              <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-xs font-semibold tabular-nums text-zinc-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {sortedAll.length} Agenda
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                <Database className="size-2.5" /> Firestore Live
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-slate-400">
                Pusat kendali admin: ubah detail, perbarui tanggal/lokasi, atau hapus agenda resmi kampus. Perubahan langsung tersinkronisasi otomatis ke seluruh kalender mahasiswa.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex min-h-[38px] cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            <Plus className="size-4" />
            <span>Tambah Agenda Baru</span>
          </button>
        </div>
      </div>

      {/* Panel Tabel & Filter Interaktif */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-col gap-3 border-b border-line p-3.5 dark:border-slate-800 sm:p-4">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            {/* Kolom Filter & Pencarian */}
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              {/* Search Input */}
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Cari judul, fakultas, atau lokasi..."
                  className="h-9 w-full rounded-lg border border-line bg-canvas pl-8.5 pr-8 text-xs placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-500"
                />
                {adminSearch && (
                  <button
                    type="button"
                    onClick={() => setAdminSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-slate-500 dark:hover:text-slate-300"
                    aria-label="Bersihkan pencarian"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Kategori */}
              <select
                value={adminCategory}
                onChange={(e) => setAdminCategory(e.target.value)}
                className="h-9 rounded-lg border border-line bg-canvas px-2.5 text-xs text-zinc-700 focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:focus:border-slate-500"
              >
                <option value="all">Semua Kategori</option>
                {CAMPUS_CATEGORY_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {CATEGORIES[k].label}
                  </option>
                ))}
              </select>

              {/* Filter Fakultas */}
              <select
                value={adminFaculty}
                onChange={(e) => setAdminFaculty(e.target.value)}
                className="h-9 rounded-lg border border-line bg-canvas px-2.5 text-xs text-zinc-700 focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:focus:border-slate-500"
              >
                <option value="all">Semua Target Fakultas</option>
                {FACULTIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              {/* Tombol Reset Filter */}
              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setAdminSearch('')
                    setAdminCategory('all')
                    setAdminFaculty('all')
                  }}
                  className="inline-flex h-9 cursor-pointer touch-manipulation items-center gap-1 rounded-lg border border-line bg-white px-2.5 text-xs text-zinc-600 transition hover:bg-zinc-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <X className="size-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Status Jumlah Data */}
            <span className="text-xs text-zinc-500 dark:text-slate-400">
              Menampilkan <strong className="text-zinc-900 dark:text-slate-100">{filteredEvents.length}</strong> dari {sortedAll.length} agenda
            </span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="border-b border-line bg-canvas/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
              <tr>
                <th className="w-28 px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Judul Agenda</th>
                <th className="w-32 px-4 py-3">Kategori</th>
                <th className="w-44 px-4 py-3">Target Fakultas</th>
                <th className="w-40 px-4 py-3">Lokasi</th>
                <th className="w-36 px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line dark:divide-slate-800">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CalendarX className="size-6 text-zinc-400 dark:text-slate-600" />
                      <p className="font-medium text-zinc-600 dark:text-slate-400">Tidak ada agenda yang cocok</p>
                      <p className="text-xs text-zinc-400 dark:text-slate-500">
                        Coba sesuaikan kata kunci pencarian atau reset filter kategori.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => {
                  const cat = CATEGORIES[ev.category] || CATEGORIES.akademik
                  const isRecentlyEdited = String(ev.id) === String(recentlyEditedId)
                  return (
                    <tr
                      key={ev.id}
                      className={cn(
                        'transition-colors',
                        isRecentlyEdited
                          ? 'bg-emerald-50/90 ring-2 ring-inset ring-emerald-500/50 dark:bg-emerald-950/40'
                          : 'hover:bg-zinc-50/70 dark:hover:bg-slate-800/40',
                      )}
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium tabular-nums text-zinc-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 shrink-0 text-zinc-400" />
                          <span>{ev.end > ev.start ? `${ev.start}–${ev.end} Nov` : `${ev.start} Nov`}</span>
                          {ev.end > ev.start && (
                            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-slate-800 dark:text-slate-400">
                              {ev.end - ev.start + 1}h
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-slate-100">
                        <div className="flex min-w-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectEvent(ev)}
                            className="min-w-0 cursor-pointer truncate text-left hover:underline focus:outline-none"
                          >
                            {ev.title}
                          </button>
                          {isRecentlyEdited && (
                            <span className="inline-flex shrink-0 animate-pulse items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              <Check className="size-3" /> Baru Diperbarui
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium', cat.badge)}>
                          <span className={cn('size-1.5 rounded-full', cat.dot)} />
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-slate-400">
                        <span className="line-clamp-1">{ev.faculty}</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3 shrink-0 text-zinc-400" />
                          <span className="line-clamp-1">{ev.location}</span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectEvent(ev)}
                            className="cursor-pointer rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenEditModal(ev)}
                            title="Edit informasi agenda"
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50"
                          >
                            <Pencil className="size-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteEvent(ev)}
                            title="Hapus agenda"
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50"
                          >
                            <Trash2 className="size-3" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="divide-y divide-line p-3 dark:divide-slate-800 md:hidden">
          {filteredEvents.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400 dark:text-slate-500">
              <CalendarX className="mx-auto mb-2 size-6 text-zinc-400" />
              Tidak ada agenda yang cocok dengan filter pencarian.
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const cat = CATEGORIES[ev.category] || CATEGORIES.akademik
              const isRecentlyEdited = String(ev.id) === String(recentlyEditedId)
              return (
                <div
                  key={ev.id}
                  className={cn(
                    'flex flex-col gap-2.5 rounded-xl p-3 transition-all',
                    isRecentlyEdited
                      ? 'my-1 border border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-500/30 dark:border-emerald-800 dark:bg-emerald-950/40'
                      : 'py-3.5 first:pt-1 last:pb-1',
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md border border-line bg-canvas px-2 py-0.5 text-xs font-semibold tabular-nums text-zinc-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                        <Calendar className="size-3 text-sky-500" />
                        {ev.end > ev.start ? `${ev.start}–${ev.end} Nov 2026` : `${ev.start} Nov 2026`}
                      </span>
                      {isRecentlyEdited && (
                        <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <Check className="size-2.5" /> Baru Diperbarui
                        </span>
                      )}
                    </div>
                    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', cat.badge)}>
                      <span className={cn('size-1.5 rounded-full', cat.dot)} />
                      {cat.label}
                    </span>
                  </div>

                  <div>
                    <h3
                      onClick={() => onSelectEvent(ev)}
                      className="cursor-pointer text-sm font-semibold leading-snug text-zinc-900 hover:underline dark:text-slate-100"
                    >
                      {ev.title}
                    </h3>
                    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3 text-zinc-400" /> {ev.time}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3 text-zinc-400" /> {ev.location}
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-400 dark:text-slate-500">
                      Target: {ev.faculty}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-line/60 pt-2.5 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => onSelectEvent(ev)}
                      className="inline-flex min-h-[36px] cursor-pointer touch-manipulation items-center justify-center rounded-lg border border-line bg-canvas py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                    >
                      Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenEditModal(ev)}
                      className="inline-flex min-h-[36px] cursor-pointer touch-manipulation items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
                    >
                      <Pencil className="size-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEvent(ev)}
                      className="inline-flex min-h-[36px] cursor-pointer touch-manipulation items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                    >
                      <Trash2 className="size-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
