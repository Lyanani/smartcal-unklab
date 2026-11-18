import { useEffect, useMemo, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { CheckCircle2, X } from 'lucide-react'
import { auth } from './firebase'
import {
  CATEGORY_KEYS,
  DEFAULT_CHECKLIST,
  EMAILJS_CONFIG,
  INITIAL_EVENTS,
  TODAY,
} from './data/calendarData'
import { cn, downloadIcsFile, formatEventDateText } from './utils/calendarUtils'
import LoginScreen from './components/LoginScreen'
import Navbar from './components/Navbar'
import DashboardTab from './components/DashboardTab'
import FilterBar from './components/FilterBar'
import MonthGrid from './components/MonthGrid'
import Timeline from './components/Timeline'
import WorkspaceTab from './components/WorkspaceTab'
import EventDetailModal from './components/EventDetailModal'
import AddEventModal from './components/AddEventModal'

const LOCAL_EVENTS_KEY = 'smartcal-events-v1'
const GUEST_USER = { role: 'guest', email: '', name: 'Tamu', faculty: 'Semua Fakultas' }

function loadLocalEvents() {
  try {
    const saved = localStorage.getItem(LOCAL_EVENTS_KEY)
    if (saved === null) return { events: INITIAL_EVENTS, error: null }

    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) throw new Error('Data jadwal lokal bukan daftar agenda.')
    return { events: parsed, error: null }
  } catch (error) {
    console.error('Gagal memuat agenda lokal.', error)
    return {
      events: INITIAL_EVENTS,
      error: 'Jadwal lokal gagal dibaca. Kalender awal ditampilkan.',
    }
  }
}

function getStudentUser(firebaseUser) {
  const email = firebaseUser?.email
  if (!email) return null

  const emailName = email
    .split('@')[0]
    .replace(/[._]/g, ' ')
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ''))
    .join(' ')

  return {
    role: 'mahasiswa',
    email,
    name: firebaseUser.displayName || emailName || 'Mahasiswa UNKLAB',
    faculty: 'Semua Fakultas',
  }
}

export default function App() {
  const [initialLocalEvents] = useState(loadLocalEvents)
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(!auth)
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dark, setDark] = useState(false)
  const [events, setEvents] = useState(initialLocalEvents.events)
  const [active, setActive] = useState(() => new Set(CATEGORY_KEYS))
  const [query, setQuery] = useState('')
  const [selectedDay, setSelectedDay] = useState(TODAY)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [view, setView] = useState('split')
  const [flashDay, setFlashDay] = useState(null)
  const [remindedIds, setRemindedIds] = useState(() => new Set())
  const [sendingEventId, setSendingEventId] = useState(null)
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST)
  const [toast, setToast] = useState(initialLocalEvents.error)
  const searchRef = useRef(null)

  useEffect(() => {
    if (!auth) return

    return onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser((currentUser) => {
          if (currentUser?.role === 'admin') return currentUser
          return firebaseUser ? getStudentUser(firebaseUser) : null
        })
        setAuthReady(true)
      },
      (error) => {
        console.error('Firebase Authentication gagal memeriksa sesi.', error)
        setAuthError('Sesi akun tidak dapat diperiksa. Coba muat ulang aplikasi.')
        setAuthReady(true)
      },
    )
  }, [])

  // Muat status pengingat dan checklist dari browser untuk pengguna aktif.
  useEffect(() => {
    if (!user) {
      setRemindedIds(new Set())
      setChecklist(DEFAULT_CHECKLIST)
      return
    }

    const emailKey = user.email?.toLowerCase()
    const storageKey = emailKey ? `smartcal-reminders-${emailKey}` : ''
    const checklistKey = `smartcal-checklist-${emailKey || 'guest'}`

    try {
      const saved = emailKey ? JSON.parse(localStorage.getItem(storageKey) || '[]') : []
      setRemindedIds(new Set(saved.map(String)))
    } catch {
      setRemindedIds(new Set())
    }

    try {
      const savedChk = JSON.parse(localStorage.getItem(checklistKey) || 'null')
      if (Array.isArray(savedChk) && savedChk.length > 0) {
        setChecklist(savedChk)
      } else {
        setChecklist(DEFAULT_CHECKLIST)
      }
    } catch {
      setChecklist(DEFAULT_CHECKLIST)
    }
  }, [user])

  useEffect(() => {
    try {
      const savedDark = localStorage.getItem('smartcal-theme') === 'dark'
      setDark(savedDark)
      document.documentElement.classList.toggle('dark', savedDark)
    } catch {}
  }, [])

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      try {
        localStorage.setItem('smartcal-theme', next ? 'dark' : 'light')
      } catch {}
      return next
    })
  }

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && activeTab === 'calendar') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [activeTab])

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 5000)
  }

  const updateLocalEvents = (update, errorMessage) => {
    try {
      const saved = localStorage.getItem(LOCAL_EVENTS_KEY)
      const current = saved === null ? events : JSON.parse(saved)
      if (!Array.isArray(current)) throw new Error('Data jadwal lokal bukan daftar agenda.')

      const next = update(current)
      localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(next))
      setEvents(next)
      return true
    } catch (error) {
      console.error('Gagal menyimpan agenda lokal.', error)
      showToast(errorMessage)
      return false
    }
  }

  const facultyScopedEvents = useMemo(() => {
    if (!user) return []
    if (user.role === 'admin') {
      return events.filter((e) => !e.isPersonal)
    }
    if (user.role === 'guest') return events.filter((e) => !e.isPersonal)
    return events.filter((e) => {
      if (e.isPersonal) return e.ownerEmail === (user.email || 'guest')
      return true
    })
  }, [events, user])

  const visibleEvents = useMemo(() => {
    const q = query.trim().toLowerCase()
    return facultyScopedEvents.filter(
      (e) =>
        active.has(e.category) &&
        (e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)),
    )
  }, [facultyScopedEvents, active, query])

  const toggleCategory = (key) => {
    setActive((prev) => {
      if (key === 'all') return new Set(CATEGORY_KEYS)
      if (prev.size === CATEGORY_KEYS.length) return new Set([key])
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next.size ? next : new Set(CATEGORY_KEYS)
    })
  }

  const focusDay = (day) => {
    setSelectedDay(day)
    const candidates = visibleEvents.filter((e) => e.start <= day).sort((a, b) => b.start - a.start)
    const targetDay = document.getElementById(`tl-${day}`) ? day : candidates[0]?.start
    if (targetDay === undefined) return
    document.getElementById(`tl-${targetDay}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    setFlashDay({ day: targetDay, key: Date.now() })
  }

  // Fungsi Terpusat Pengiriman Pengingat Gmail (Dipakai oleh Modal Detail, Dashboard, & Timeline)
  const handleSendReminder = async (event) => {
    if (!event) return
    if (!user?.email) {
      showToast('Masuk dengan akun untuk mengirim pengingat ke Gmail.')
      return
    }
    const idStr = String(event.id)
    if (remindedIds.has(idStr) || sendingEventId) return

    setSendingEventId(idStr)
    const dateText = formatEventDateText(event)

    try {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          to_email: user.email,
          to_name: user.name,
          event_title: event.title,
          event_date: dateText,
          event_time: event.time,
          event_location: event.location,
          event_description: event.description,
        },
        EMAILJS_CONFIG.PUBLIC_KEY,
      )

      const nextRemindedIds = new Set(remindedIds).add(idStr)
      setRemindedIds(nextRemindedIds)
      try {
        localStorage.setItem(
          `smartcal-reminders-${user.email.toLowerCase()}`,
          JSON.stringify([...nextRemindedIds]),
        )
        showToast(`Terkirim! Pengingat "${event.title}" telah masuk ke ${user.email}`)
      } catch (storageError) {
        console.error('Gagal menyimpan status pengingat lokal.', storageError)
        showToast(`Pengingat terkirim, tetapi statusnya gagal disimpan di browser.`)
      }

    } catch (err) {
      console.error('Detail Error EmailJS:', err)
      alert(`Gagal kirim ke Gmail: ${err?.text || err?.message || 'Periksa koneksi internet atau EmailJS'}`)
    } finally {
      setSendingEventId(null)
    }
  }

  const handleToggleChecklist = (itemId) => {
    const next = checklist.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item))
    if (user) {
      try {
        const ownerKey = user.email?.toLowerCase() || 'guest'
        localStorage.setItem(`smartcal-checklist-${ownerKey}`, JSON.stringify(next))
      } catch (error) {
        console.error('Gagal menyimpan checklist lokal.', error)
        showToast('Checklist gagal disimpan di browser.')
        return
      }
    }
    setChecklist(next)
  }

  const handleAddEvent = (newEventData) => {
    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const saved = updateLocalEvents(
      (current) => [...current, { id: localId, ...newEventData }],
      'Agenda gagal disimpan di browser. Periksa ruang penyimpanan lokal.',
    )
    if (saved) showToast(`Agenda "${newEventData.title}" berhasil ditambahkan ke kalender`)
  }

  const handleDeleteEvent = (ev) => {
    const saved = updateLocalEvents(
      (current) => current.filter((item) => String(item.id) !== String(ev.id)),
      'Agenda gagal dihapus dari penyimpanan browser.',
    )
    if (saved) showToast(`Agenda "${ev.title}" telah dihapus`)
  }

  const handleLogout = async () => {
    if (user?.role === 'mahasiswa' && auth) {
      try {
        await signOut(auth)
      } catch (error) {
        console.error('Firebase Authentication gagal mengeluarkan akun.', error)
        showToast('Tidak dapat keluar dari akun Firebase. Coba lagi.')
        return
      }
    }
    setUser(null)
  }

  const handleCopyWhatsApp = async (ev, dateText) => {
    const message = [
      `📅 *INFO AKADEMIK UNKLAB*`,
      `*${ev.title}*`,
      `🗓 Tanggal: ${dateText}`,
      `⏰ Waktu: ${ev.time}`,
      `📍 Lokasi: ${ev.location}`,
      `🎓 Target: ${ev.faculty}`,
      ``,
      `_${ev.description}_`,
      `— Dikirim via SmartCal UNKLAB`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(message)
      showToast('Format pengumuman WhatsApp berhasil disalin!')
    } catch {
      showToast('Gagal menyalin otomatis. Silakan salin manual dari detail.')
    }
  }

  if (!authReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas text-sm text-zinc-500 dark:bg-slate-950 dark:text-slate-400">
        Memeriksa sesi akun...
      </div>
    )
  }

  if (!user) {
    return (
      <LoginScreen
        onLogin={(u) => {
          setAuthError('')
          setUser(u)
          setActiveTab('dashboard')
        }}
        onGuest={() => {
          setAuthError('')
          setUser(GUEST_USER)
          setActiveTab('calendar')
        }}
        initialError={authError}
        dark={dark}
        onToggleTheme={toggleTheme}
      />
    )
  }

  const split = view === 'split'

  return (
    <div className="min-h-screen bg-canvas text-zinc-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        remindedCount={remindedIds.size}
        query={query}
        onQueryChange={setQuery}
        searchRef={searchRef}
        dark={dark}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        {activeTab === 'dashboard' && user.role !== 'guest' && (
          <DashboardTab
            user={user}
            events={facultyScopedEvents}
            remindedIds={remindedIds}
            sendingEventId={sendingEventId}
            onSendReminder={handleSendReminder}
            checklist={checklist}
            onToggleChecklist={handleToggleChecklist}
            onSelectEvent={setSelectedEvent}
            onSwitchTab={setActiveTab}
            onOpenAdd={() => setAddModalOpen(true)}
            onExportIcs={() => {
              downloadIcsFile(facultyScopedEvents)
              showToast('File kalender (.ics) berhasil diunduh!')
            }}
          />
        )}

        {activeTab === 'calendar' && (
          <>
            <FilterBar
              events={facultyScopedEvents}
              active={active}
              onToggle={toggleCategory}
              view={view}
              onViewChange={setView}
              isAdmin={user.role === 'admin'}
              isGuest={user.role === 'guest'}
              onOpenAdd={() => setAddModalOpen(true)}
              sentCount={remindedIds.size}
              onExportIcs={() => {
                downloadIcsFile(visibleEvents)
                showToast('File kalender (.ics) berhasil diunduh!')
              }}
            />

            <section
              className={cn('grid gap-6', split && 'lg:grid-cols-[minmax(0,1fr)_380px]')}
              aria-label="Kalender dan timeline"
            >
              {split && (
                <MonthGrid
                  events={visibleEvents}
                  selected={selectedDay}
                  remindedIds={remindedIds}
                  onSelectDay={focusDay}
                  onSelectEvent={setSelectedEvent}
                />
              )}
              <Timeline
                events={visibleEvents}
                flashDay={flashDay}
                constrained={split}
                isGuest={user.role === 'guest'}
                remindedIds={remindedIds}
                sendingEventId={sendingEventId}
                onSendReminder={handleSendReminder}
                onSelectEvent={setSelectedEvent}
              />
            </section>
          </>
        )}

        {activeTab === 'workspace' && user.role !== 'guest' && (
          <WorkspaceTab
            user={user}
            events={facultyScopedEvents}
            remindedIds={remindedIds}
            checklist={checklist}
            onToggleChecklist={handleToggleChecklist}
            onSelectEvent={setSelectedEvent}
            onAddPersonalEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onOpenAddModal={() => setAddModalOpen(true)}
          />
        )}

        <footer className="flex flex-col gap-1 border-t border-line pt-5 text-xs text-zinc-500 dark:border-slate-800 dark:text-slate-500 sm:flex-row sm:justify-between">
          <span>Biro Administrasi Akademik — Universitas Klabat</span>
          <span>{user.role === 'guest' ? 'Mode tamu · hanya melihat kalender pendaftaran' : `Login aktif: ${user.email}`}</span>
        </footer>
      </main>

      <EventDetailModal
        event={selectedEvent}
        user={user}
        isReminded={selectedEvent ? remindedIds.has(String(selectedEvent.id)) : false}
        isSending={selectedEvent ? sendingEventId === String(selectedEvent.id) : false}
        onSendReminder={handleSendReminder}
        onCopyWhatsApp={handleCopyWhatsApp}
        onClose={() => setSelectedEvent(null)}
      />

      <AddEventModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddEvent}
      />

      {toast && (
        <div className="fixed bottom-5 left-4 right-4 z-50 flex items-center justify-between gap-2.5 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-xs font-medium text-zinc-800 shadow-lg dark:border-emerald-900/60 dark:bg-slate-900 dark:text-slate-100 sm:left-auto sm:right-5 sm:max-w-md">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            <span>{toast}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-1 cursor-pointer text-zinc-400 hover:text-zinc-700 dark:hover:text-slate-200"
            aria-label="Tutup notifikasi"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
