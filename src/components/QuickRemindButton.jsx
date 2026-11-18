import { Bell, CheckCircle2, Mail } from 'lucide-react'
import { cn } from '../utils/calendarUtils'

export default function QuickRemindButton({ event, isSent, isSending, onSend }) {
  return (
    <button
      type="button"
      disabled={isSent || isSending}
      onClick={(e) => {
        e.stopPropagation()
        onSend(event)
      }}
      className={cn(
        'inline-flex min-h-[32px] shrink-0 cursor-pointer touch-manipulation items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition active:scale-[0.98]',
        isSent
          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300'
          : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200',
      )}
    >
      {isSent ? (
        <>
          <CheckCircle2 className="size-3.5" />
          <span>Terkirim ke Gmail</span>
        </>
      ) : isSending ? (
        <>
          <Bell className="size-3.5 animate-bounce" />
          <span>Mengirim...</span>
        </>
      ) : (
        <>
          <Mail className="size-3.5" />
          <span>Ingatkan Gmail</span>
        </>
      )}
    </button>
  )
}

export { QuickRemindButton }
