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
  updateDoc,
  where,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'
import {
  AlertTriangle,
  Calendar,
  CalendarRange,
  CheckCircle2,
  ClipboardCheck,
  ShieldCheck,
  X,
} from 'lucide-react'
import {
  CATEGORY_KEYS,
  DEFAULT_CHECKLIST,
  EMAILJS_CONFIG,
  INITIAL_EVENTS,
} from './data/calendarData'
import { cn, downloadIcsFile, formatEventDateText } from './utils/calendarUtils'
import LoginScreen from './components/LoginScreen'
import FacultyPortalView from './components/FacultyPortalView'
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
import EditEventModal from './components/EditEventModal'
import './App.css'

export default function App() {
  // Sesi Pengguna Persisten di LocalStorage
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smartcal-user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Tab Aktif Persisten di LocalStorage
  const [showLogin, setShowLogin] = useState(false)
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = localStorage.getItem('smartcal-active-tab')
      if (saved && ['dashboard', 'calendar', 'workspace'].includes(saved)) {
        return saved
      }
    } catch {
      /* ignore */
    }
    return 'dashboard'
  })

  const [dark, setDark] = useState(() => {
    try {
      const savedDark = localStorage.getItem('smartcal-theme') === 'dark'
      if (savedDark) {
        document.documentElement.classList.add('dark')
      }
      return savedDark
    } catch {
      return false
    }
  })

  // Agenda Kampus Resmi (Firestore / Initial)
  const [events, setEvents] = useState(INITIAL_EVENTS)
  const [cloudSynced, setCloudSynced] = useState(false)
  const [active, setActive] = useState(() => new Set(CATEGORY_KEYS))
  const [query, setQuery] = useState('')

  // State Tanggal Dinamis Real-Time Persisten di LocalStorage
  const [now, setNow] = useState(() => new Date())
  const [viewYear, setViewYear] = useState(() => {
    try {
      const saved = localStorage.getItem('smartcal-view-year')
      if (saved && !isNaN(Number(saved))) return Number(saved)
    } catch {
      /* ignore */
    }
    return new Date().getFullYear()
  })
  const [viewMonth, setViewMonth] = useState(() => {
    try {
      const saved = localStorage.getItem('smartcal-view-month')
      if (saved !== null && !isNaN(Number(saved))) return Number(saved)
    } catch {
      /* ignore */
    }
    return new Date().getMonth()
  })
  const [selectedDay, setSelectedDay] = useState(() => {
    try {
      const saved = localStorage.getItem('smartcal-selected-day')
      if (saved && !isNaN(Number(saved))) return Number(saved)
    } catch {
      /* ignore */
    }
    return new Date().getDate()
  })

  const [selectedEvent, setSelectedEvent] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [view, setView] = useState('split')
  const [flashDay, setFlashDay] = useState(null)

  // Pengingat Pribadi / Custom Reminders (Inisialisasi Lazy Langsung dari LocalStorage)
  const [customReminders, setCustomReminders] = useState(() => {
    try {
      const saved = localStorage.getItem('smartcal_custom_reminders_v1')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {
      /* ignore */
    }
    return []
  })

  // Status "Sudah Terkirim / Diaktifkan ke Gmail" (Inisialisasi Lazy dari LocalStorage)
  const [remindedIds, setRemindedIds] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('smartcal-user') || 'null')
      if (savedUser?.email) {
        const saved = JSON.parse(
          localStorage.getItem(`smartcal-reminders-${savedUser.email.toLowerCase()}`) || '[]',
        )
        return new Set(saved.map(String))
      }
    } catch {
      /* ignore */
    }
    return new Set()
  })

  const [sendingEventId, setSendingEventId] = useState(null)
  const [allRemindersStats, setAllRemindersStats] = useState(() => new Map())

  // Checklist Syarat Akademik & Persiapan (Inisialisasi Lazy dari LocalStorage)
  const [checklist, setChecklist] = useState(() => {
    try {
      const saved = localStorage.getItem('smartcal_custom_requirements_v1')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      const savedUser = JSON.parse(localStorage.getItem('smartcal-user') || 'null')
      if (savedUser?.email) {
        const userSaved = localStorage.getItem(`smartcal-checklist-${savedUser.email.toLowerCase()}`)
        if (userSaved) {
          const parsed = JSON.parse(userSaved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      }
    } catch {
      /* ignore */
    }
    return DEFAULT_CHECKLIST
  })

  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)
  const [recentlyEditedId, setRecentlyEditedId] = useState(null)
  const searchRef = useRef(null)
  const mobileSearchRef = useRef(null)
  const seededRef = useRef(false)

  // Perbarui waktu real-time setiap 1 detik untuk countdown dan deteksi pergantian hari otomatis
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Sinkronisasi Tab & View State ke LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('smartcal-active-tab', activeTab)
    } catch {
      /* ignore */
    }
  }, [activeTab])

  useEffect(() => {
    try {
      localStorage.setItem('smartcal-view-year', String(viewYear))
      localStorage.setItem('smartcal-view-month', String(viewMonth))
      localStorage.setItem('smartcal-selected-day', String(selectedDay))
    } catch {
      /* ignore */
    }
  }, [viewYear, viewMonth, selectedDay])

  // Sinkronisasi Custom Reminders ke LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('smartcal_custom_reminders_v1', JSON.stringify(customReminders))
    } catch {
      /* ignore */
    }
  }, [customReminders])

  // Sinkronisasi Checklist Syarat ke LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('smartcal_custom_requirements_v1', JSON.stringify(checklist))
      if (user?.email) {
        localStorage.setItem(`smartcal-checklist-${user.email.toLowerCase()}`, JSON.stringify(checklist))
      }
    } catch {
      /* ignore */
    }
  }, [checklist, user?.email])

  // Sinkronisasi remindedIds ke LocalStorage
  useEffect(() => {
    if (!user?.email) return
    try {
      localStorage.setItem(
        `smartcal-reminders-${user.email.toLowerCase()}`,
        JSON.stringify([...remindedIds]),
      )
    } catch {
      /* ignore */
    }
  }, [remindedIds, user?.email])

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
              addDoc(collection(db, 'events'), eventData).catch(() => {
                /* ignore */
              })
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

  // Sinkronkan pengingat real-time dari Firestore untuk user yang sedang login
  useEffect(() => {
    if (!user?.email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
            localStorage.setItem(
              `smartcal-reminders-${user.email.toLowerCase()}`,
              JSON.stringify([...merged]),
            )
          } catch {
            /* ignore */
          }
          return merged
        })
      },
      () => {
        /* ignore */
      },
    )

    return () => unsubscribe()
  }, [user?.email])

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
      () => {
        /* ignore */
      },
    )
    return () => unsubscribe()
  }, [user])

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      try {
        localStorage.setItem('smartcal-theme', next ? 'dark' : 'light')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && activeTab === 'calendar') {
        e.preventDefault()
        const targetRef = window.matchMedia('(min-width: 1024px)').matches
          ? searchRef
          : mobileSearchRef
        targetRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [activeTab])

  const showToast = (message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    const toastObj = typeof message === 'string' ? { text: message, type } : message
    setToast(toastObj)
    toastTimerRef.current = setTimeout(() => setToast(null), 4500)
  }

  // Gabungkan Agenda Kampus dan Pengingat Pribadi
  const allEvents = useMemo(() => {
    const map = new Map()
    events.forEach((e) => map.set(String(e.id), e))
    customReminders.forEach((r) => map.set(String(r.id), r))
    return Array.from(map.values())
  }, [events, customReminders])

  const facultyScopedEvents = useMemo(() => {
    if (!user) return []
    if (user.role === 'admin') {
      return allEvents.filter((e) => !e.isPersonal)
    }
    return allEvents.filter((e) => {
      if (e.isPersonal) return e.ownerEmail === user.email
      return e.faculty === 'Semua Fakultas' || e.faculty === user.faculty
    })
  }, [allEvents, user])

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

  const handlePrevMonth = () => {
    setViewMonth((prevMonth) => {
      if (prevMonth === 0) {
        setViewYear((prevYear) => prevYear - 1)
        return 11
      }
      return prevMonth - 1
    })
  }

  const handleNextMonth = () => {
    setViewMonth((prevMonth) => {
      if (prevMonth === 11) {
        setViewYear((prevYear) => prevYear + 1)
        return 0
      }
      return prevMonth + 1
    })
  }

  const handleJumpToToday = () => {
    const today = new Date()
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDay(today.getDate())
    focusDay(today.getDate(), today.getFullYear(), today.getMonth())
  }

  const focusDay = (day, year = viewYear, month = viewMonth) => {
    setSelectedDay(day)
    if (year !== viewYear) setViewYear(year)
    if (month !== viewMonth) setViewMonth(month)
    const coveringEvent = visibleEvents
      .filter((event) => event.start <= day && event.end >= day)
      .sort((a, b) => a.start - b.start)[0]
    const nearestEvent = [...visibleEvents].sort(
      (a, b) => Math.abs(a.start - day) - Math.abs(b.start - day),
    )[0]
    const targetDay = document.getElementById(`tl-${day}`)
      ? day
      : coveringEvent?.start ?? nearestEvent?.start
    if (targetDay === undefined) return
    const tlEl = document.getElementById(`tl-${targetDay}`)
    if (tlEl) {
      const olEl = tlEl.closest('ol')
      if (olEl && olEl.scrollHeight > olEl.clientHeight) {
        olEl.scrollTo({ top: Math.max(0, tlEl.offsetTop - olEl.offsetTop - 12), behavior: 'smooth' })
      } else {
        tlEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
    setFlashDay({ day: targetDay, key: Date.now() })
  }

  const handleLogin = (u) => {
    setUser(u)
    setViewMode(u.role === 'admin' ? 'general' : 'faculty')
    try {
      localStorage.setItem('smartcal-user', JSON.stringify(u))
      const savedRem = JSON.parse(
        localStorage.getItem(`smartcal-reminders-${u.email.toLowerCase()}`) || '[]',
      )
      setRemindedIds(new Set(savedRem.map(String)))
    } catch {
      /* ignore */
    }
  }

  const handleLogout = () => {
    setUser(null)
    setRemindedIds(new Set())
    try {
      localStorage.removeItem('smartcal-user')
    setShowLogin(false)
    } catch {
      /* ignore */
    }
  }

  // Fungsi Terpusat Pengiriman Pengingat Gmail
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
        } catch {
          /* ignore */
        }
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
        }).catch(() => {
          /* ignore */
        })
      }
    } catch (err) {
      console.error('Detail Error EmailJS:', err)
      alert(`Gagal kirim ke Gmail: ${err?.text || err?.message || 'Periksa koneksi internet atau EmailJS'}`)
    } finally {
      setSendingEventId(null)
    }
  }

  // Pengingat Pribadi: Tambah & Hapus dengan LocalStorage Persisten
  const handleAddCustomReminder = async (newReminder) => {
    const reminderItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...newReminder,
      category: 'pribadi',
      isPersonal: true,
      ownerEmail: user?.email || '',
      faculty: user?.faculty || 'Semua Fakultas',
      createdAt: new Date().toISOString(),
    }
    setCustomReminders((prev) => {
      const next = [reminderItem, ...prev]
      try {
        localStorage.setItem('smartcal_custom_reminders_v1', JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
    showToast(`Pengingat "${reminderItem.title}" berhasil disimpan!`)
    if (isFirebaseConfigured && db) {
      addDoc(collection(db, 'events'), reminderItem).catch(() => {
        /* ignore */
      })
    }
    return reminderItem
  }

  const handleDeleteCustomReminder = async (id) => {
    const idStr = String(id)
    setCustomReminders((prev) => {
      const next = prev.filter((r) => String(r.id) !== idStr)
      try {
        localStorage.setItem('smartcal_custom_reminders_v1', JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
    setRemindedIds((prev) => {
      if (!prev.has(idStr)) return prev
      const next = new Set(prev)
      next.delete(idStr)
      try {
        if (user?.email) {
          localStorage.setItem(
            `smartcal-reminders-${user.email.toLowerCase()}`,
            JSON.stringify([...next]),
          )
        }
      } catch {
        /* ignore */
      }
      return next
    })
    showToast('Pengingat berhasil dihapus')
    if (isFirebaseConfigured && db && !idStr.startsWith('init-')) {
      deleteDoc(doc(db, 'events', idStr)).catch(() => {
        /* ignore */
      })
    }
  }

  const handleRemoveAcademicReminder = (id) => {
    const idStr = String(id)
    setRemindedIds((prev) => {
      const next = new Set(prev)
      next.delete(idStr)
      try {
        if (user?.email) {
          localStorage.setItem(
            `smartcal-reminders-${user.email.toLowerCase()}`,
            JSON.stringify([...next]),
          )
        }
      } catch {
        /* ignore */
      }
      return next
    })
    showToast('Pengingat akademik dihapus dari daftar aktif')
  }

  // Checklist: Toggle, Tambah, dan Hapus Persisten
  const handleToggleChecklist = (itemId) => {
    setChecklist((prev) => {
      const next = prev.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item))
      try {
        localStorage.setItem('smartcal_custom_requirements_v1', JSON.stringify(next))
        if (user?.email) {
          localStorage.setItem(`smartcal-checklist-${user.email.toLowerCase()}`, JSON.stringify(next))
        }
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const handleAddChecklistItem = (title, category = 'pribadi') => {
    if (!title.trim()) return
    const newItem = {
      id: `chk-custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      deadline: 'Tenggat Mandiri',
      detail: 'Syarat / berkas tambahan yang ditambahkan sendiri.',
      category: category || 'pribadi',
      done: false,
    }
    setChecklist((prev) => {
      const next = [newItem, ...prev]
      try {
        localStorage.setItem('smartcal_custom_requirements_v1', JSON.stringify(next))
        if (user?.email) {
          localStorage.setItem(`smartcal-checklist-${user.email.toLowerCase()}`, JSON.stringify(next))
        }
      } catch {
        /* ignore */
      }
      return next
    })
    showToast(`Syarat "${newItem.title}" berhasil ditambahkan!`)
  }

  const handleDeleteChecklistItem = (itemId) => {
    setChecklist((prev) => {
      const next = prev.filter((item) => item.id !== itemId)
      try {
        localStorage.setItem('smartcal_custom_requirements_v1', JSON.stringify(next))
        if (user?.email) {
          localStorage.setItem(`smartcal-checklist-${user.email.toLowerCase()}`, JSON.stringify(next))
        }
      } catch {
        /* ignore */
      }
      return next
    })
    showToast('Syarat berhasil dihapus')
  }

  // Tambah agenda resmi (Admin)
  const handleAddEvent = async (newEventData) => {
    if (newEventData.isPersonal) {
      await handleAddCustomReminder(newEventData)
      return
    }
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'events'), {
          ...newEventData,
          createdAt: serverTimestamp(),
        })
        showToast(`Agenda "${newEventData.title}" tersimpan di Firebase Firestore`)
        return
      } catch {
        /* ignore */
      }
    }
    setEvents((prev) => [...prev, { id: String(Date.now()), ...newEventData }])
    showToast(`Agenda "${newEventData.title}" berhasil ditambahkan ke kalender`)
  }

  const handleEditEvent = async (updatedEventData) => {
    if (!updatedEventData?.id) return

    const idStr = String(updatedEventData.id)
    const cleanData = {
      title: updatedEventData.title.trim(),
      start: Number(updatedEventData.start),
      end: Number(updatedEventData.end),
      category: updatedEventData.category,
      faculty: updatedEventData.faculty,
      time: updatedEventData.time.trim(),
      location: updatedEventData.location.trim(),
      description: updatedEventData.description.trim(),
    }

    // 1. Pembaruan State Lokal Secara Instan (Optimistic UI)
    setEvents((prev) =>
      prev.map((ev) => (String(ev.id) === idStr ? { ...ev, ...cleanData } : ev))
    )

    if (selectedEvent && String(selectedEvent.id) === idStr) {
      setSelectedEvent((prev) => (prev ? { ...prev, ...cleanData } : null))
    }

    // 2. Indikator visual: tandai agenda yang baru diperbarui
    setRecentlyEditedId(idStr)
    setTimeout(() => setRecentlyEditedId(null), 4500)

    // 3. Sorot tanggal pada timeline
    setFlashDay({ day: cleanData.start, key: Date.now() })

    // 4. Notifikasi toast
    showToast(`Perubahan agenda "${cleanData.title}" berhasil disimpan!`, 'success')

    // 5. Sinkronisasi ke Firestore di latar belakang
    if (isFirebaseConfigured && db) {
      const syncTask = (async () => {
        if (!idStr.startsWith('init-')) {
          await updateDoc(doc(db, 'events', idStr), {
            ...cleanData,
            updatedAt: serverTimestamp(),
          })
        } else {
          const docRef = await addDoc(collection(db, 'events'), {
            ...cleanData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
          setEvents((prev) =>
            prev.map((ev) => (String(ev.id) === idStr ? { ...ev, id: docRef.id, ...cleanData } : ev))
          )
        }
      })()

      const timeoutTask = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Koneksi Firestore timeout')), 3500)
      )

      try {
        await Promise.race([syncTask, timeoutTask])
      } catch (err) {
        console.warn('Catatan sinkronisasi Firestore:', err?.message || err)
      }
    }
  }

  const handleDeleteEvent = async (ev) => {
    const idStr = String(ev.id)
    if (ev.isPersonal) {
      await handleDeleteCustomReminder(idStr)
      return
    }
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Yakin ingin menghapus agenda "${ev.title}"? Perubahan akan langsung tersinkronisasi ke seluruh mahasiswa.`)
    ) {
      return
    }
    if (isFirebaseConfigured && db && !idStr.startsWith('init-')) {
      try {
        await deleteDoc(doc(db, 'events', idStr))
      } catch {
        /* ignore */
      }
    }
    setEvents((prev) => prev.filter((item) => String(item.id) !== idStr))
    showToast(`Agenda "${ev.title}" telah dihapus`)
  }

  const handleCopyWhatsApp = async (ev, dateText) => {
    const message = [
      `*INFO AKADEMIK UNKLAB*`,
      `*${ev.title}*`,
      `Tanggal: ${dateText}`,
      `Waktu: ${ev.time}`,
      `Lokasi: ${ev.location}`,
      `Target: ${ev.faculty}`,
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
    if (!showLogin) {
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
        onBack={() => setShowLogin(false)}
        onLogin={handleLogin}
        dark={dark}
        onToggleTheme={toggleTheme}
      />
    )
  }

  if (user && user.role !== 'admin' && viewMode === 'faculty') {
    return (
      <FacultyPortalView
        user={user}
        events={allEvents}
        remindedIds={remindedIds}
        sendingEventId={sendingEventId}
        onSendReminder={handleSendReminder}
        onOpenGeneral={() => {
          setFacultyScope('all')
          setViewMode('general')
        }}
        onLogout={handleLogout}
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
        cloudSynced={cloudSynced}
        now={now}
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
            now={now}
            onSelectDay={(day, year, month) => {
              focusDay(day, year, month)
              setActiveTab('calendar')
            }}
          />
        )}

        {activeTab === 'calendar' && (
          <div className="flex flex-col gap-7">
            {/* Navigasi Cepat Dalam Halaman Terpadu */}
            <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white/80 p-3.5 shadow-2xs backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-slate-950">
                  <CalendarRange className="size-4" strokeWidth={1.8} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-semibold tracking-tight sm:text-lg">Kalender & Kelola Jadwal Akademik</h1>
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.2 text-[10px] font-semibold text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300">
                      Halaman Terpadu
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-slate-400">
                    {user.role === 'admin'
                      ? 'Visualisasi kalender dan tabel pengelolaan agenda resmi kampus dalam satu tampilan utuh.'
                      : `Kalender akademik ${user.faculty}, pusat pengingat Gmail, dan checklist syarat UAS.`}
                  </p>
                </div>
              </div>

              {/* Tombol Lompat Cepat */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => document.getElementById('kalender-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Calendar className="size-3.5 text-sky-500" />
                  <span>Kalender & Timeline</span>
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById('kelola-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {user.role === 'admin' ? (
                    <>
                      <ShieldCheck className="size-3.5 text-amber-500" />
                      <span>Tabel Kelola</span>
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="size-3.5 text-emerald-500" />
                      <span>Pengingat & Syarat</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Bar Kategori & Tampilan */}
            <FilterBar
              events={facultyScopedEvents}
              active={active}
              onToggle={toggleCategory}
              view={view}
              onViewChange={setView}
              isAdmin={user.role === 'admin'}
              onOpenAdd={() => setAddModalOpen(true)}
              sentCount={remindedIds.size}
              query={query}
              onQueryChange={setQuery}
              mobileSearchRef={mobileSearchRef}
              onExportIcs={() => {
                downloadIcsFile(visibleEvents)
                showToast('File kalender (.ics) berhasil diunduh!')
              }}
            />

            {/* Bagian 1: Kalender Grid & Timeline */}
            <section
              id="kalender-section"
              className={cn('scroll-mt-20 grid gap-6', split && 'lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start')}
              aria-label="Kalender dan timeline"
            >
              {split && (
                <MonthGrid
                  events={visibleEvents}
                  selected={selectedDay}
                  remindedIds={remindedIds}
                  onSelectDay={(d) => focusDay(d, viewYear, viewMonth)}
                  onSelectEvent={setSelectedEvent}
                  viewYear={viewYear}
                  viewMonth={viewMonth}
                  now={now}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onJumpToToday={handleJumpToToday}
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
                now={now}
              />
            </section>

            {/* Bagian 2: Terpadu Kelola Jadwal (Admin) / Pengingat & Syarat (Mahasiswa) */}
            <div id="kelola-section" className="scroll-mt-20 border-t border-line pt-6 dark:border-slate-800">
              <WorkspaceTab
                user={user}
                events={facultyScopedEvents}
                remindedIds={remindedIds}
                sendingEventId={sendingEventId}
                recentlyEditedId={recentlyEditedId}
                checklist={checklist}
                onToggleChecklist={handleToggleChecklist}
                onAddChecklistItem={handleAddChecklistItem}
                onDeleteChecklistItem={handleDeleteChecklistItem}
                onSelectEvent={setSelectedEvent}
                customReminders={customReminders}
                onAddCustomReminder={handleAddCustomReminder}
                onDeleteCustomReminder={handleDeleteCustomReminder}
                onRemoveAcademicReminder={handleRemoveAcademicReminder}
                onSendReminder={handleSendReminder}
                onAddPersonalEvent={handleAddCustomReminder}
                onDeleteEvent={handleDeleteEvent}
                onOpenAddModal={() => setAddModalOpen(true)}
                onOpenEditModal={(ev) => setEditingEvent(ev)}
                viewYear={viewYear}
                viewMonth={viewMonth}
                now={now}
              />
            </div>
          </div>
        )}

        {activeTab === "workspace" && (
          <WorkspaceTab
                user={user}
                events={facultyScopedEvents}
                remindedIds={remindedIds}
                sendingEventId={sendingEventId}
                recentlyEditedId={recentlyEditedId}
                checklist={checklist}
                onToggleChecklist={handleToggleChecklist}
                onAddChecklistItem={handleAddChecklistItem}
                onDeleteChecklistItem={handleDeleteChecklistItem}
                onSelectEvent={setSelectedEvent}
                customReminders={customReminders}
                onAddCustomReminder={handleAddCustomReminder}
                onDeleteCustomReminder={handleDeleteCustomReminder}
                onRemoveAcademicReminder={handleRemoveAcademicReminder}
                onSendReminder={handleSendReminder}
                onAddPersonalEvent={handleAddCustomReminder}
                onDeleteEvent={handleDeleteEvent}
                onOpenAddModal={() => setAddModalOpen(true)}
                onOpenEditModal={(ev) => setEditingEvent(ev)}
                viewYear={viewYear}
                viewMonth={viewMonth}
                now={now}
          />
        )}

        <footer className="flex flex-col gap-1 border-t border-line pt-5 text-xs text-zinc-500 dark:border-slate-800 dark:text-slate-500 sm:flex-row sm:justify-between">
          <span>SmartCal — Universitas Klabat</span>
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
        onOpenEdit={(ev) => setEditingEvent(ev)}
      />

      <AddEventModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddEvent}
        viewYear={viewYear}
        viewMonth={viewMonth}
        now={now}
      />

      <EditEventModal
        key={editingEvent ? String(editingEvent.id) : 'none'}
        open={Boolean(editingEvent)}
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
        onSave={handleEditEvent}
      />

      {toast && (
        <div
          className={cn(
            'fixed bottom-5 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-medium shadow-xl backdrop-blur-md transition-all sm:left-auto sm:right-5 sm:max-w-md',
            (typeof toast === 'object' && toast.type === 'error') || (typeof toast === 'string' && toast.toLowerCase().includes('gagal'))
              ? 'border-rose-200 bg-rose-50/95 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/90 dark:text-rose-200'
              : 'border-emerald-200 bg-white/95 text-zinc-800 dark:border-emerald-900/60 dark:bg-slate-900/95 dark:text-slate-100',
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            {(typeof toast === 'object' && toast.type === 'error') || (typeof toast === 'string' && toast.toLowerCase().includes('gagal')) ? (
              <AlertTriangle className="size-4 shrink-0 text-rose-500" />
            ) : (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            )}
            <span className="truncate">{typeof toast === 'string' ? toast : toast?.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-1 shrink-0 cursor-pointer text-zinc-400 hover:text-zinc-700 dark:hover:text-slate-200"
            aria-label="Tutup notifikasi"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
