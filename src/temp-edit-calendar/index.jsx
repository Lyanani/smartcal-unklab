import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Pencil } from 'lucide-react'
import EditCalendarModal from './EditCalendarModal'
import { disableEditMode, isEditEnabled, useStoredEvents } from './useStoredEvents'
import './temp-edit-calendar.css'

/* FITUR SEMENTARA — Edit Kalender.
   Cara menghapus: lihat README.md di folder ini.

   Pemakaian (render-prop):
     <TempEditCalendar base={GUEST_EVENTS}>
       {({ events, toolbar }) => <GuestDashboard events={events} toolbar={toolbar} />}
     </TempEditCalendar>

   Bila mode edit tidak aktif, `events` = `base` dan `toolbar` = null,
   sehingga pengunjung biasa tidak melihat apa pun dari fitur ini. */
export default function TempEditCalendar({ base, children }) {
  const [enabled, setEnabled] = useState(() => isEditEnabled())
  const [open, setOpen] = useState(false)
  const { events, isCustom, save, reset } = useStoredEvents(base, enabled)

  const toolbar = enabled ? (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/70"
      >
        <Pencil className="size-3.5" />
        <span className="hidden sm:inline">Edit Kalender</span>
        {isCustom && <span className="size-1.5 rounded-full bg-amber-500" title="Memakai draf lokal" />}
      </button>
      {/* Portal: header memakai backdrop-blur, yang membuat `fixed` anak terikat ke header. */}
      {open &&
        createPortal(
          <EditCalendarModal
            events={events}
            isCustom={isCustom}
            onSave={save}
            onReset={reset}
            onClose={() => setOpen(false)}
            onDisable={() => {
              disableEditMode()
              setEnabled(false)
              setOpen(false)
            }}
          />,
          document.body,
        )}
    </>
  ) : null

  return children({ events, toolbar })
}
