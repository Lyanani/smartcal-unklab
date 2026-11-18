import { useEffect, useMemo, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query as firestoreQuery,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'
import { CheckCircle2, X } from 'lucide-react'
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
import GuestDashboard from './components/guest/GuestDashboard'
import { GUEST_EVENTS } from './data/guestCalendar'

export default function App() {
  const [user, setUser] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dark, setDark] = useState(false)
  const [events, setEvents] = useState(INITIAL_EVENTS)
  const [cloudSynced, setCloudSynced] = useState(false)
  const [active, setActive] = useState(() => new Set(CATEGORY_KEYS))
  const [query, setQuery] = useState('')
  const [selectedDay, setSelectedDay] = useState(TODAY)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [view, setView] = useState('split')
  const [flashDay, setFlashDay] = useState(null)
  const [remindedIds, setRemindedIds] = useState(() => new Set())
  const [sendingEventId, setSendingEventId] = useState(null)
  const [allRemindersStats, setAllRemindersStats] = useState(() => new Map())
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST)
  const [toast, setToast] = useState(null)
  const searchRef = useRef(null)
  const seededRef = useRef(false)

  // Sinkronisasi Agenda dengan Firebase Firestore
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return

    const unsubscribe = onSnapshot(
      collection(db, 'events'),
      (snapshot) => {
        setCloudSynced(true)
        if (snapshot.empty) {
          if (!seededRef.current) {
            seededRef.current = true
            INITIAL_EVENTS.forEach((item) => {
              const eventData = { ...item }
              delete eventData.id
              addDoc(collection(db, 'events'), eventData).catch(() => {})
            })
          }
        } else {
          const firestoreEvents = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
          setEvents(firestoreEvents)
        }
      },
      () => {
        setCloudSynced(false)
      },
    )

    return () => unsubscribe()
  }, [])

  // Muat & sinkronkan status "Sudah Terkirim ke Gmail" + Checklist per pengguna
  useEffect(() => {
    if (!user?.email) {
      setRemindedIds(new Set())
      setChecklist(DEFAULT_CHECKLIST)
      return
    }

    const emailKey = user.email.toLowerCase()
    const storageKey = `smartcal-reminders-${emailKey}`
    const checklistKey = `smartcal-checklist-${emailKey}`

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]')
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

    if (!isFirebaseConfigured || !db) return

    const q = firestoreQuery(
      collection(db, 'reminders'),
      where('userEmail', '==', user.email),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) return
        setRemindedIds((prev) => {
          const merged = new Set(prev)
          snapshot.docs.forEach((d) => {
            const evId = d.data()?.eventId
            if (evId) merged.add(String(evId))
          })
          try {
            localStorage.setItem(storageKey, JSON.stringify([...merged]))
          } catch {}
          return merged
        })
      },
      () => {},
    )

    return () => unsubscribe()
  }, [user])

  // Statistik global pengingat dari Firestore (untuk Dashboard Admin)
  useEffect(() => {
    if (!isFirebaseConfigured || !db || user?.role !== 'admin') return
    const unsubscribe = onSnapshot(
      collection(db, 'reminders'),
      (snapshot) => {
        const counts = new Map()
        snapshot.docs.forEach((d) => {
          const evId = String(d.data()?.eventId || '')
          if (evId) counts.set(evId, (counts.get(evId) || 0) + 1)
        })
        setAllRemindersStats(counts)
      },
      () => {},
    )
    return () => unsubscribe()
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

  const facultyScopedEvents = useMemo(() => {
    if (!user) return []
    if (user.role === 'admin') {
      return events.filter((e) => !e.isPersonal)
    }
    return events.filter((e) => {
      if (e.isPersonal) return e.ownerEmail === user.email
      return e.faculty === 'Semua Fakultas' || e.faculty === user.faculty
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
    if (!event || !user?.email) return
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

      setRemindedIds((prev) => {
        const next = new Set(prev).add(idStr)
        try {
          localStorage.setItem(
            `smartcal-reminders-${user.email.toLowerCase()}`,
            JSON.stringify([...next]),
          )
        } catch {}
        return next
      })

      showToast(`Terkirim! Pengingat "${event.title}" telah masuk ke ${user.email}`)

      if (isFirebaseConfigured && db) {
        addDoc(collection(db, 'reminders'), {
          userEmail: user.email,
          userName: user.name,
          eventId: idStr,
          eventTitle: event.title,
          eventDate: dateText,
          createdAt: serverTimestamp(),
        }).catch(() => {})
      }
    } catch (err) {
      console.error('Detail Error EmailJS:', err)
      alert(`Gagal kirim ke Gmail: ${err?.text || err?.message || 'Periksa koneksi internet atau EmailJS'}`)
    } finally {
      setSendingEventId(null)
    }
  }

  const handleToggleChecklist = (itemId) => {
    setChecklist((prev) => {
      const next = prev.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item))
      if (user?.email) {
        try {
          localStorage.setItem(`smartcal-checklist-${user.email.toLowerCase()}`, JSON.stringify(next))
        } catch {}
      }
      return next
    })
  }

  const handleAddEvent = async (newEventData) => {
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'events'), {
          ...newEventData,
          createdAt: serverTimestamp(),
        })
        showToast(`Agenda "${newEventData.title}" tersimpan di Firebase Firestore`)
        return
      } catch {}
    }
    setEvents((prev) => [...prev, { id: String(Date.now()), ...newEventData }])
    showToast(`Agenda "${newEventData.title}" berhasil ditambahkan ke kalender`)
  }

  const handleDeleteEvent = async (ev) => {
    if (isFirebaseConfigured && db && !String(ev.id).startsWith('init-')) {
      try {
        await deleteDoc(doc(db, 'events', String(ev.id)))
      } catch {}
    }
    setEvents((prev) => prev.filter((item) => String(item.id) !== String(ev.id)))
    showToast(`Agenda "${ev.title}" telah dihapus`)
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

  if (!user) {
    // Halaman awal = Dashboard Tamu (tanpa login). Login hanya dibuka lewat tombol "Masuk".
    if (!showLogin) {
      // TEMP-EDIT-CALENDAR: ganti seluruh blok <TempEditCalendar> ini dengan versi tanpa fitur sementara:
      //   <GuestDashboard events={GUEST_EVENTS} onLogin={() => setShowLogin(true)} dark={dark} onToggleTheme={toggleTheme} />
      return (
      <GuestDashboard
        events={GUEST_EVENTS}
        onLogin={() => setShowLogin(true)}
        dark={dark}
        onToggleTheme={toggleTheme}
      />
    )
    }
    return (
      <LoginScreen
        onLogin={(u) => {
          setUser(u)
          setActiveTab('dashboard')
        }}
        onBack={() => setShowLogin(false)}
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
        onLogout={() => {
          setUser(null)
          setShowLogin(false)
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        remindedCount={remindedIds.size}
        query={query}
        onQueryChange={setQuery}
        searchRef={searchRef}
        dark={dark}
        onToggleTheme={toggleTheme}
        cloudSynced={cloudSynced}
      />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardTab
            user={user}
            events={facultyScopedEvents}
            remindedIds={remindedIds}
            sendingEventId={sendingEventId}
            onSendReminder={handleSendReminder}
            checklist={checklist}
            onToggleChecklist={handleToggleChecklist}
            allRemindersStats={allRemindersStats}
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
                remindedIds={remindedIds}
                sendingEventId={sendingEventId}
                onSendReminder={handleSendReminder}
                onSelectEvent={setSelectedEvent}
              />
            </section>
          </>
        )}

        {activeTab === 'workspace' && (
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
          <span>Login aktif: {user.email}</span>
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
