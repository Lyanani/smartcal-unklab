import {
  CheckCircle2,
  Download,
  Layers,
  LayoutPanelLeft,
  List,
  Plus,
} from 'lucide-react'
import { CATEGORIES, CATEGORY_KEYS } from '../data/calendarData'
import { cn } from '../utils/calendarUtils'

const chipClass = (on) =>
  cn(
    'inline-flex shrink-0 cursor-pointer touch-manipulation items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
    on
      ? 'border-line bg-white text-zinc-900 shadow-2xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:text-slate-400 dark:hover:text-slate-200',
  )

const VIEWS = [
  { key: 'split', label: 'Grid Kalender', Icon: LayoutPanelLeft },
  { key: 'list', label: 'Daftar Timeline', Icon: List },
]

export default function FilterBar({ events, active, onToggle, view, onViewChange, isAdmin, onOpenAdd, sentCount, onExportIcs }) {
  const all = active.size === CATEGORY_KEYS.length

  return (
    <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between" aria-label="Filter kategori">
      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <button type="button" aria-pressed={all} className={chipClass(all)} onClick={() => onToggle('all')}>
          <Layers className="size-3.5" strokeWidth={1.75} />
          Semua
        </button>
        {CATEGORY_KEYS.map((key) => {
          const on = active.has(key)
          const count = events.filter((e) => e.category === key).length
          if (key === 'pribadi' && count === 0) return null
          return (
            <button key={key} type="button" aria-pressed={on} className={chipClass(on)} onClick={() => onToggle(key)}>
              <span
                className={cn(
                  'size-2 rounded-full',
                  on ? CATEGORIES[key].dot : 'ring-1 ring-inset ring-zinc-300 dark:ring-slate-600',
                )}
              />
              {CATEGORIES[key].label}
              <span className="tabular-nums text-zinc-400 dark:text-slate-500">{count}</span>
            </button>
          )
        })}
      </div>

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
          className="inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <Download className="size-3.5" />
          Export .ics
        </button>

        <div
          className="inline-flex rounded-md border border-line bg-white p-0.5 text-xs dark:border-slate-800 dark:bg-slate-900"
          role="tablist"
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
                  'inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded px-2.5 py-1.5 transition',
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
            className="inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            <Plus className="size-3.5" />
            Tambah Jadwal
          </button>
        )}
      </div>
    </section>
  )
}

export { FilterBar }
