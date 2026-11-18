import {
  Bell,
  Calendar,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  X,
} from 'lucide-react'
import { CATEGORIES } from '../data/calendarData'
import { buildGoogleCalendarUrl, cn, formatEventDateText } from '../utils/calendarUtils'

export default function EventDetailModal({ event, user, isReminded, isSending, onSendReminder, onCopyWhatsApp, onClose }) {
  if (!event) return null
  const cat = CATEGORIES[event.category] || CATEGORIES.akademik
  const dateText = formatEventDateText(event)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-zinc-950/50 p-3 backdrop-blur-xs sm:p-4"
      onClick={onClose}
    >
      <div
        className="my-auto max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', cat.badge)}>
            <span className={cn('size-1.5 rounded-full', cat.dot)} />
            {cat.label}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn cursor-pointer touch-manipulation"
            aria-label="Tutup detail"
          >
            <X className="size-4" />
          </button>
        </div>

        <h3 className="mt-3 text-lg font-semibold tracking-tight sm:text-xl">{event.title}</h3>

        {isReminded && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-2.5 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-200">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-semibold">Pengingat Sudah Masuk / Terkirim ke Gmail</p>
              <p className="mt-0.5 text-emerald-700/90 dark:text-emerald-300/80">
                Detail agenda ini telah dikirim ke <strong>{user.email}</strong>.
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-2.5 rounded-xl border border-line bg-canvas p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950/70 sm:p-4">
          <div className="flex items-center gap-2.5 text-zinc-600 dark:text-slate-300">
            <Calendar className="size-4 shrink-0 text-zinc-400" />
            <span>
              <strong>Tanggal:</strong> {dateText}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-600 dark:text-slate-300">
            <Clock className="size-4 shrink-0 text-zinc-400" />
            <span>
              <strong>Waktu:</strong> {event.time}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-600 dark:text-slate-300">
            <MapPin className="size-4 shrink-0 text-zinc-400" />
            <span>
              <strong>Lokasi / Platform:</strong> {event.location}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-zinc-600 dark:text-slate-300">
            <GraduationCap className="size-4 shrink-0 text-zinc-400" />
            <span>
              <strong>Target Peserta:</strong> {event.faculty}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-slate-500">
            Deskripsi Agenda
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-slate-300">
            {event.description}
          </p>
        </div>

        {user.role !== 'guest' && (
        <div className="mt-5 flex flex-col gap-2.5 border-t border-line pt-4 dark:border-slate-800">
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => onSendReminder(event)}
              disabled={isReminded || isSending}
              className={cn(
                'inline-flex min-h-[44px] flex-1 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition active:scale-[0.98]',
                isReminded
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200',
              )}
            >
              {isReminded ? (
                <>
                  <Check className="size-4" />
                  Sudah Terkirim ke Gmail
                </>
              ) : isSending ? (
                <>
                  <Bell className="size-4 animate-bounce" />
                  Mengirim ke {user.email}...
                </>
              ) : (
                <>
                  <Mail className="size-4" />
                  {user.role === 'guest' ? 'Masuk untuk pengingat Gmail' : 'Ingatkan ke Gmail (H-1)'}
                </>
              )}
            </button>

            <a
              href={buildGoogleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] touch-manipulation items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-xs font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <CalendarPlus className="size-4" />
              Google Calendar
              <ExternalLink className="size-3 opacity-60" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => onCopyWhatsApp(event, dateText)}
            className="inline-flex min-h-[40px] w-full cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-lg border border-line bg-canvas px-4 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Copy className="size-3.5" />
            Salin Format Pengumuman Grup WhatsApp
          </button>
        </div>
        )}
      </div>
    </div>
  )
}

export { EventDetailModal }
