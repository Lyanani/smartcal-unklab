import {
  CalendarRange,
  Database,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Sun,
  User,
} from 'lucide-react'
import { MONTH_NAMES } from '../data/calendarData'
import { cn, weekdayOf } from '../utils/calendarUtils'

export default function Navbar({
  user,
  onLogout,
  activeTab,
  onTabChange,
  remindedCount,
  query,
  onQueryChange,
  searchRef,
  dark,
  onToggleTheme,
  cloudSynced,
  now = new Date(),
}) {
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase()

  const navTabs = [
    { key: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    {
      key: 'calendar',
      label: 'Kalender & Jadwal',
      Icon: CalendarRange,
      badge: user.role === 'mahasiswa' && remindedCount > 0 ? remindedCount : null,
    },
  ]

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-md bg-zinc-900 text-white dark:bg-white dark:text-slate-950">
            <CalendarRange className="size-[15px]" strokeWidth={1.75} />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            SmartCal <span className="font-medium text-zinc-400 dark:text-slate-500">UNKLAB</span>
          </span>
        </div>

        <nav aria-label="Menu utama" className="ml-2 hidden items-center gap-1 md:flex">
          {navTabs.map(({ key, label, Icon, badge }) => {
            const on = activeTab === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onTabChange(key)}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  on
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-slate-950'
                    : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.8} />
                {label}
                {badge !== null && badge !== undefined && (
                  <span
                    className={cn(
                      'ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-semibold tabular-nums',
                      on
                        ? 'bg-emerald-400 text-zinc-950'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                    )}
                  >
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Tanggal Real-Time Header */}
        <div className="hidden items-center gap-1.5 rounded-full border border-line bg-white/70 px-2.5 py-1 text-xs text-zinc-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 lg:inline-flex">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span className="font-medium tabular-nums">
            {weekdayOf(now.getDate(), now.getFullYear(), now.getMonth())}, {now.getDate()}{' '}
            {MONTH_NAMES[now.getMonth()]} {now.getFullYear()}
          </span>
        </div>

        {cloudSynced && (
          <span
            title="Tersinkronisasi dengan Firebase Firestore"
            className="hidden items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300 xl:inline-flex"
          >
            <Database className="size-2.5" /> Firestore Live
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {activeTab === 'calendar' && (
            <label className="relative hidden lg:block">
              <span className="sr-only">Cari agenda</span>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400 dark:text-slate-500" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Cari agenda..."
                className="h-8 w-44 rounded-md border border-line bg-white pl-8 pr-7 text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-slate-800 dark:bg-slate-900 dark:placeholder:text-slate-500 dark:focus:ring-white/10"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-line px-1 text-[10px] text-zinc-400 dark:border-slate-700 dark:text-slate-500">
                /
              </kbd>
            </label>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Ganti mode tema"
            className="grid size-8 cursor-pointer touch-manipulation place-items-center rounded-md border border-line bg-white text-zinc-600 hover:text-zinc-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            {dark ? <Sun className="size-4" strokeWidth={1.75} /> : <Moon className="size-4" strokeWidth={1.75} />}
          </button>

          <div className="flex items-center gap-2 rounded-md border border-line bg-white px-2.5 py-1 dark:border-slate-800 dark:bg-slate-900">
            <span className="grid size-5 place-items-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white dark:bg-white dark:text-slate-950">
              {initials || <User className="size-3" />}
            </span>
            <div className="hidden text-left sm:block">
              <p className="max-w-[120px] truncate text-xs font-medium leading-none">{user.name}</p>
              <p className="mt-0.5 max-w-[120px] truncate text-[10px] text-zinc-400 dark:text-slate-500">
                {user.role === 'admin' ? 'Admin' : user.faculty.replace('Fakultas ', '')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Keluar"
            className="inline-flex h-8 cursor-pointer touch-manipulation items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-xs font-medium text-zinc-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-rose-900/60 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* 2 Tab Navigasi Utama (Mobile Bar) */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-t border-line px-4 py-2 dark:border-slate-800 md:hidden">
        {navTabs.map(({ key, label, Icon, badge }) => {
          const on = activeTab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              className={cn(
                'inline-flex shrink-0 cursor-pointer touch-manipulation items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition',
                on
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-slate-950'
                  : 'border border-line bg-white text-zinc-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
              )}
            >
              <Icon className="size-3.5" />
              {label}
              {badge !== null && badge !== undefined && (
                <span className="rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </header>
  )
}

export { Navbar }
