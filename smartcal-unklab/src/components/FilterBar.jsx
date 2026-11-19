import { useEffect, useRef, useState } from 'react'
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Layers,
  LayoutPanelLeft,
  List,
  Plus,
  Search,
} from 'lucide-react'
import { CATEGORIES, CATEGORY_KEYS } from '../data/calendarData'
import { cn } from '../utils/calendarUtils'

const VIEWS = [
  { key: 'split', label: 'Grid Kalender', Icon: LayoutPanelLeft },
  { key: 'list', label: 'Daftar Timeline', Icon: List },
]

export default function FilterBar({
  events,
  active,
  onToggle,
  view,
  onViewChange,
  isAdmin,
  onOpenAdd,
  sentCount,
  onExportIcs,
  query,
  onQueryChange,
  mobileSearchRef,
}) {
  const all = active.size === CATEGORY_KEYS.length
  const [open, setOpen] = useState(false)
  const dropRef = useRef(null)

  /* tutup dropdown saat klik di luar */
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  /* label yang ditampilkan di tombol trigger */
  const triggerLabel = all
    ? 'Semua Kategori'
    : CATEGORY_KEYS.filter((k) => active.has(k))
        .map((k) => CATEGORIES[k].label)
        .join(', ') || 'Pilih Kategori'

  const totalCount = events.length

  /* semua opsi: "Semua" + tiap kategori */
  const OPTIONS = [
    { key: 'all', label: 'Semua', dot: 'bg-zinc-400 dark:bg-slate-500' },
    ...CATEGORY_KEYS
      .filter((k) => !(k === 'pribadi' && events.filter((e) => e.category === k).length === 0))
      .map((k) => ({ key: k, label: CATEGORIES[k].label, dot: CATEGORIES[k].dot })),
  ]

  return (
    <section
      className="flex flex-wrap items-center justify-between gap-2"
      aria-label="Filter dan tampilan kalender"
    >
      {/* ── Kiri: Dropdown Filter Kategori ── */}
      <div ref={dropRef} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'inline-flex h-8 cursor-pointer touch-manipulation items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors',
            open
              ? 'border-zinc-300 bg-zinc-900 text-white dark:border-slate-600 dark:bg-white dark:text-slate-950'
              : 'border-line bg-white text-zinc-700 hover:bg-zinc-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
          )}
        >
          <Layers className="size-3.5 shrink-0" strokeWidth={1.75} />
          <span className="max-w-[160px] truncate">{triggerLabel}</span>
          <span className={cn(
            'tabular-nums text-[10px] font-semibold',
            open ? 'text-white/70 dark:text-slate-900/70' : 'text-zinc-400 dark:text-slate-500',
          )}>
            {all ? totalCount : events.filter((e) => active.has(e.category)).length}
          </span>
          <ChevronRight
            className={cn('size-3.5 shrink-0 transition-transform duration-200', open && 'rotate-90')}
            strokeWidth={1.75}
          />
        </button>

        {/* Panel dropdown */}
        {open && (
          <div
            role="listbox"
            aria-label="Pilih kategori"
            className="absolute left-0 top-full z-30 mt-1.5 min-w-[220px] rounded-xl border border-line bg-white py-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            {OPTIONS.map(({ key, label, dot }) => {
              const isAll = key === 'all'
              const isOn = isAll ? all : active.has(key)
              const count = isAll
                ? totalCount
                : events.filter((e) => e.category === key).length

              return (
                <button
                  key={key}
                  type="button"
                  role="option"
                  aria-selected={isOn}
                  onClick={() => { onToggle(key); if (isAll) setOpen(false) }}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-xs transition-colors',
                    isOn
                      ? 'bg-zinc-50 font-medium text-zinc-900 dark:bg-slate-800 dark:text-slate-100'
                      : 'text-zinc-600 hover:bg-zinc-50 dark:text-slate-300 dark:hover:bg-slate-800',
                  )}
                >
                  <span className={cn('size-2 shrink-0 rounded-full', isOn ? dot : 'bg-zinc-200 dark:bg-slate-600')} />
                  <span className="flex-1 text-left">{label}</span>
                  <span className={cn(
                    'tabular-nums text-[10px] font-semibold',
                    isOn ? 'text-zinc-500 dark:text-slate-400' : 'text-zinc-300 dark:text-slate-600',
                  )}>
                    {count}
                  </span>
                  {isOn && <Check className="size-3 shrink-0 text-zinc-500 dark:text-slate-400" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Kanan: Aksi & Tampilan ── */}
      <label className="relative order-3 w-full lg:hidden">
        <span className="sr-only">Cari agenda</span>
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400 dark:text-slate-500" />
        <input
          ref={mobileSearchRef}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Cari agenda..."
          className="h-9 w-full rounded-md border border-line bg-white pl-8 pr-3 text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-slate-800 dark:bg-slate-900 dark:placeholder:text-slate-500 dark:focus:ring-white/10"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        {sentCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="size-3.5" />
            {sentCount} Terkirim ke Gmail
          </span>
        )}

        <button
          type="button"
          onClick={onExportIcs}
          title="Unduh semua jadwal ke aplikasi Kalender HP/Laptop"
          className="inline-flex h-8 cursor-pointer touch-manipulation items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Download className="size-3.5" strokeWidth={1.75} />
          Export .ics
        </button>

        <div
          className="inline-flex rounded-md border border-line bg-white p-0.5 dark:border-slate-800 dark:bg-slate-900"
          role="tablist"
          aria-label="Tampilan kalender"
        >
          {VIEWS.map(({ key, label, Icon }) => {
            const on = view === key
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => onViewChange(key)}
                className={cn(
                  'inline-flex h-7 cursor-pointer touch-manipulation items-center gap-1.5 rounded px-2.5 text-xs transition-colors',
                  on
                    ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-slate-800 dark:text-slate-100'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-slate-400 dark:hover:text-slate-100',
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
                {label}
              </button>
            )
          })}
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={onOpenAdd}
            className="inline-flex h-8 cursor-pointer touch-manipulation items-center gap-1.5 rounded-md bg-zinc-900 px-3 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            <Plus className="size-3.5" strokeWidth={2} />
            Tambah Jadwal
          </button>
        )}
      </div>
    </section>
  )
}

export { FilterBar }
