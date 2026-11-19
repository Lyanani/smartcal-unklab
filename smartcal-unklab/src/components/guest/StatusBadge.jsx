import { GUEST_CATEGORIES } from '../../data/guestCalendar'
import { cn } from '../../utils/calendarUtils'

const TONES = {
  emerald:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300',
  amber:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300',
  sky: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300',
  muted:
    'border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400',
}

export function StatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums',
        status.state === 'tbd' && 'border-dashed',
        TONES[status.tone] || TONES.muted,
        className,
      )}
    >
      {status.label}
    </span>
  )
}

export function CategoryBadge({ category, className }) {
  const cat = GUEST_CATEGORIES[category]
  if (!cat) return null
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        cat.badge,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', cat.dot)} />
      {cat.label}
    </span>
  )
}
