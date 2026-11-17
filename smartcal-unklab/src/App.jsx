import { useEffect, useMemo, useRef, useState, Fragment } from 'react'
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
  AlertTriangle, ArrowRight, Bell, Calendar, CalendarPlus, CalendarRange, CalendarX,
  Check, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Clock, Copy,
  Database, Download, ExternalLink, Flame, GraduationCap, Layers, LayoutDashboard,
  LayoutPanelLeft, List, LogOut, Mail, MapPin, Moon, Pencil, Plus, Search, ShieldCheck,
  Sparkles, Sun, Trash2, User, X,
} from 'lucide-react'

/* ---------- Konfigurasi EmailJS ---------- */
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_jo4id2t',
  TEMPLATE_ID: 'template_operlmo',
  PUBLIC_KEY: '674ejfky3n1alm5ce',
}

/* ---------- Util & Styles ---------- */
const cn = (...a) => a.flat().filter(Boolean).join(' ')

const STYLES = `
.bg-canvas{background-color:#fafafa}
.dark .bg-canvas{background-color:#020617}
.border-line{border-color:#e4e4e7}
.dark .border-line{border-color:#1e293b}
.icon-btn{display:grid;place-items:center;width:2rem;height:2rem;border-radius:.375rem;color:#52525b}
.icon-btn:hover{background:#f4f4f5;color:#18181b}
.dark .icon-btn{color:#94a3b8}
.dark .icon-btn:hover{background:rgb(30 41 59/.7);color:#f1f5f9}
.no-scrollbar{scrollbar-width:none}
.no-scrollbar::-webkit-scrollbar{display:none}
@keyframes sc-flash{0%{background-color:rgb(244 63 94/.18)}100%{background-color:transparent}}
.animate-flash{animation:sc-flash 1.4s ease-out}
`

/* ---------- Data Master ---------- */
const CATEGORIES = {
  akademik: {
    label: 'Akademik & KRS',
    dot: 'bg-sky-500',
    bar: 'bg-sky-500',
    badge: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/60 dark:text-sky-300',
  },
  ujian: {
    label: 'Ujian UTS/UAS',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
    badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300',
  },
  libur: {
    label: 'Hari Libur',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  kegiatan: {
    label: 'Kegiatan Kampus',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
    badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300',
  },
  pribadi: {
    label: 'Tugas Pribadi',
    dot: 'bg-violet-500',
    bar: 'bg-violet-500',
    badge: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/60 dark:text-violet-300',
  },
}
const CATEGORY_KEYS = Object.keys(CATEGORIES)
const CAMPUS_CATEGORY_KEYS = ['akademik', 'ujian', 'libur', 'kegiatan']

const FACULTIES = [
  'Semua Fakultas',
  'Fakultas Ilmu Komputer (FILKOM)',
  'Fakultas Ekonomi',
  'Fakultas Keperawatan',
]

const DEFAULT_CHECKLIST = [
  {
    id: 'chk-1',
    title: 'Selesaikan Pengisian EDOM 100% di SIAKAD',
    deadline: 'Batas: 23 Nov 2026',
    detail: 'Wajib sebelum pencetakan kartu UAS dan pembukaan akses Pra-KRS.',
    done: false,
  },
  {
    id: 'chk-2',
    title: 'Verifikasi Status Bebas Tunggakan Keuangan',
    deadline: 'Batas: 24 Nov 2026',
    detail: 'Pastikan tagihan semester ganjil lunas agar validasi KRS tidak terkunci.',
    done: false,
  },
  {
    id: 'chk-3',
    title: 'Susun Draf Rencana Mata Kuliah Semester Genap',
    deadline: 'Batas: 25 Nov 2026',
    detail: 'Cek mata kuliah prasyarat dan jumlah SKS maksimal berdasarkan IPS terakhir.',
    done: false,
  },
  {
    id: 'chk-4',
    title: 'Konsultasi & Tanda Tangan Validasi Dosen PA',
    deadline: '25 – 27 Nov 2026',
    detail: 'Temui Dosen Pembimbing Akademik sesuai jadwal prodi masing-masing.',
    done: false,
  },
  {
    id: 'chk-5',
    title: 'Kumpulkan Berkas / Laporan Praktikum Akhir',
    deadline: 'Sebelum 30 Nov 2026',
    detail: 'Pastikan seluruh nilai praktikum laboratorium sudah terinput sebelum Minggu Tenang.',
    done: false,
  },
]

const INITIAL_EVENTS = [
  {
    id: 'init-1',
    start: 2,
    end: 6,
    category: 'kegiatan',
    faculty: 'Semua Fakultas',
    title: 'Pekan Doa Mahasiswa Semester Ganjil',
    time: '07.00 WITA',
    location: 'Gedung Pniel UNKLAB',
    description: 'Ibadah kebangunan rohani wajib bagi seluruh mahasiswa reguler dan asrama bersama pembicara tamu.',
  },
  {
    id: 'init-2',
    start: 3,
    end: 3,
    category: 'akademik',
    faculty: 'Fakultas Ilmu Komputer (FILKOM)',
    title: 'Batas Pengumpulan Proposal Skripsi & Proyek Sistem',
    time: '16.00 WITA',
    location: 'Portal SIAKAD / Lab FILKOM',
    description: 'Batas akhir unggah dokumen proposal bab 1-3 beserta lembar persetujuan dosen pembimbing.',
  },
  {
    id: 'init-3',
    start: 6,
    end: 6,
    category: 'akademik',
    faculty: 'Semua Fakultas',
    title: 'Batas Input Nilai Mid-Semester oleh Dosen',
    time: '23.59 WITA',
    location: 'Portal Akademik SIAKAD',
    description: 'Seluruh nilai ujian tengah semester dapat diakses mahasiswa melalui transkrip sementara.',
  },
  {
    id: 'init-4',
    start: 10,
    end: 10,
    category: 'ujian',
    faculty: 'Fakultas Keperawatan',
    title: 'Ujian Praktik Klinik & OSCE Keperawatan Dasar',
    time: '08.00 WITA',
    location: 'Laboratorium Mini Hospital',
    description: 'Mahasiswa wajib mengenakan seragam praktik lengkap dan hadir 30 menit sebelum sesi dimulai.',
  },
  {
    id: 'init-5',
    start: 12,
    end: 12,
    category: 'kegiatan',
    faculty: 'Fakultas Ilmu Komputer (FILKOM)',
    title: 'Seminar Nasional AI & Rekayasa Perangkat Lunak',
    time: '09.00 WITA',
    location: 'Auditorium Utama UNKLAB',
    description: 'Kuliah umum bersama praktisi industri teknologi mengenai tren pengembangan sistem cerdas.',
  },
  {
    id: 'init-6',
    start: 16,
    end: 20,
    category: 'ujian',
    faculty: 'Semua Fakultas',
    title: 'Ujian Praktikum Laboratorium Terpadu',
    time: '08.00 WITA',
    location: 'Gedung Laboratorium Terpadu',
    description: 'Pelaksanaan evaluasi akhir mata kuliah praktikum sesuai jadwal kelompok masing-masing program studi.',
  },
  {
    id: 'init-7',
    start: 18,
    end: 18,
    category: 'kegiatan',
    faculty: 'Fakultas Ekonomi',
    title: 'Business Plan Expo & Pameran Kewirausahaan',
    time: '10.00 WITA',
    location: 'Student Center UNKLAB',
    description: 'Presentasi produk inovasi mahasiswa Fakultas Ekonomi yang terbuka untuk seluruh civitas akademika.',
  },
  {
    id: 'init-8',
    start: 20,
    end: 20,
    category: 'libur',
    faculty: 'Semua Fakultas',
    title: 'Dies Natalis Universitas Klabat — Kuliah Ditiadakan',
    time: 'Seharian',
    location: 'Seluruh Lingkungan Kampus',
    description: 'Hari libur akademik memperingati hari jadi Universitas Klabat. Kegiatan perkuliahan diliburkan.',
  },
  {
    id: 'init-9',
    start: 23,
    end: 23,
    category: 'akademik',
    faculty: 'Semua Fakultas',
    title: 'Batas Akhir Pengisian Evaluasi Kinerja Dosen (EDOM)',
    time: '23.59 WITA',
    location: 'Portal SIAKAD Online',
    description: 'Syarat wajib sebelum pencetakan kartu ujian akhir semester (UAS) dan pengisian KRS berikutnya.',
  },
  {
    id: 'init-10',
    start: 25,
    end: 27,
    category: 'akademik',
    faculty: 'Semua Fakultas',
    title: 'Konsultasi & Pra-Pengisian KRS Semester Genap 2026/2027',
    time: '08.00 WITA',
    location: 'Ruang Dosen Pembimbing Akademik',
    description: 'Mahasiswa wajib berkonsultasi dengan Dosen PA untuk validasi mata kuliah semester depan.',
  },
  {
    id: 'init-11',
    start: 30,
    end: 30,
    category: 'ujian',
    faculty: 'Semua Fakultas',
    title: 'Mulai Minggu Tenang Menjelang UAS Ganjil',
    time: 'Seharian',
    location: 'Perpustakaan & Kampus Airmadidi',
    description: 'Tidak ada perkuliahan tatap muka; mahasiswa dipersilakan mempersiapkan diri untuk Ujian Akhir Semester.',
  },
]

const TODAY = 15
const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const weekdayOf = (day) => DAY_NAMES[(day - 1) % 7]
const eventsOnDay = (list, day) => list.filter((e) => day >= e.start && day <= e.end)
const COUNTDOWN_TARGET = new Date('2026-11-25T08:00:00+08:00').getTime()

function formatEventDateText(event) {
  return event.end > event.start
    ? `${event.start} – ${event.end} November 2026`
    : `${weekdayOf(event.start)}, ${event.start} November 2026`
}

function getRelativeDayLabel(startDay, endDay) {
  if (TODAY >= startDay && TODAY <= endDay) return { text: 'Hari Ini', tone: 'rose' }
  if (startDay < TODAY) return { text: 'Selesai', tone: 'muted' }
  const diff = startDay - TODAY
  if (diff === 1) return { text: 'Besok (H-1)', tone: 'amber' }
  if (diff <= 4) return { text: `H-${diff} Hari`, tone: 'amber' }
  return { text: `H-${diff} Hari`, tone: 'sky' }
}

function buildGoogleCalendarUrl(event) {
  const pad2 = (n) => String(n).padStart(2, '0')
  const startDate = `202611${pad2(event.start)}`
  const endDate = `202611${pad2(Math.min(30, event.end + 1))}`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `[SmartCal UNKLAB] ${event.title}`,
    dates: `${startDate}/${endDate}`,
    details: `${event.description}\n\nTarget: ${event.faculty}\nWaktu: ${event.time}`,
    location: event.location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function downloadIcsFile(eventList, label = 'SmartCal-UNKLAB-Nov2026') {
  const pad2 = (n) => String(n).padStart(2, '0')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SmartCal UNKLAB//Kalender Akademik 2026//ID',
    'CALSCALE:GREGORIAN',
  ]
  eventList.forEach((ev) => {
    const dtStart = `202611${pad2(ev.start)}`
    const dtEnd = `202611${pad2(Math.min(30, ev.end + 1))}`
    lines.push(
      'BEGIN:VEVENT',
      `UID:smartcal-${ev.id}@unklab.ac.id`,
      `DTSTAMP:20261115T000000Z`,
      `DTSTART;VALUE=DATE:${dtStart}`,
      `DTEND;VALUE=DATE:${dtEnd}`,
      `SUMMARY:${ev.title}`,
      `LOCATION:${ev.location}`,
      `DESCRIPTION:${ev.description.replace(/\n/g, ' ')} (${ev.time})`,
      'END:VEVENT',
    )
  })
  lines.push('END:VCALENDAR')

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${label}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/* ---------- 1. Halaman Login ---------- */
function LoginScreen({ onLogin, dark, onToggleTheme }) {
  const [role, setRole] = useState('mahasiswa')
  const [email, setEmail] = useState('')
  const [faculty, setFaculty] = useState('Fakultas Ilmu Komputer (FILKOM)')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setError('Masukkan alamat Gmail aktif untuk menerima pengingat jadwal.')
      return
    }
    const namePart = trimmed.split('@')[0].replace(/[._]/g, ' ')
    const displayName = namePart
      .split(' ')
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
      .join(' ')

    onLogin({
      role,
      email: trimmed,
      name: displayName || (role === 'admin' ? 'Admin BAA' : 'Mahasiswa UNKLAB'),
      faculty: role === 'admin' ? 'Biro Administrasi Akademik' : faculty,
    })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-12 text-zinc-900 dark:bg-slate-950 dark:text-slate-100">
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label="Ganti mode tema"
        className="fixed right-5 top-5 grid size-9 cursor-pointer touch-manipulation place-items-center rounded-lg border border-line bg-white text-zinc-600 transition hover:text-zinc-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        {dark ? <Sun className="size-4" strokeWidth={1.75} /> : <Moon className="size-4" strokeWidth={1.75} />}
      </button>

      <div className="w-full max-w-md rounded-2xl border border-line bg-white/90 p-7 shadow-xs backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-slate-950">
            <CalendarRange className="size-4" strokeWidth={1.75} />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              SmartCal <span className="font-normal text-zinc-400 dark:text-slate-500">UNKLAB</span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-slate-400">
              Sistem Informasi Kalender Akademik Interaktif
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-slate-400">
              Masuk Sebagai
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-line bg-canvas p-1 dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setRole('mahasiswa')}
                className={cn(
                  'flex cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition',
                  role === 'mahasiswa'
                    ? 'bg-white text-zinc-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-slate-400',
                )}
              >
                <GraduationCap className="size-3.5" />
                Mahasiswa
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={cn(
                  'flex cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-md py-2 text-xs font-medium transition',
                  role === 'admin'
                    ? 'bg-white text-zinc-900 shadow-2xs dark:bg-slate-800 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-slate-400',
                )}
              >
                <ShieldCheck className="size-3.5" />
                Admin Akademik
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="gmail-input" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-slate-400">
              Alamat Gmail Aktif (Tujuan Pengingat)
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="gmail-input"
                name="smartcal-gmail-login"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="nama.kamu@gmail.com"
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-500"
              />
            </div>
          </div>

          {role === 'mahasiswa' && (
            <div>
              <label htmlFor="faculty-select" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-slate-400">
                Fakultas (Filter Jadwal Otomatis)
              </label>
              <select
                id="faculty-select"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-500"
              >
                <option value="Fakultas Ilmu Komputer (FILKOM)">Fakultas Ilmu Komputer (FILKOM)</option>
                <option value="Fakultas Ekonomi">Fakultas Ekonomi</option>
                <option value="Fakultas Keperawatan">Fakultas Keperawatan</option>
              </select>
            </div>
          )}

          {error && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-1 inline-flex h-11 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Masuk ke Portal Akademik
            <ArrowRight className="size-4" />
          </button>
        </form>

        <p className="mt-5 border-t border-line pt-4 text-center text-[11px] text-zinc-400 dark:border-slate-800 dark:text-slate-500">
          Semester Ganjil 2026/2027 · Universitas Klabat Airmadidi
        </p>
      </div>
    </div>
  )
}

/* ---------- 2. Top Navbar + 3 Tab Navigasi Utama ---------- */
function Navbar({
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
                {user.role === 'admin' ? 'Admin BAA' : user.faculty.replace('Fakultas ', '')}
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

      {/* 3 Tab Navigasi Utama (Mobile Bar) */}
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

/* ---------- 3. Hero Countdown Widget ---------- */
const pad = (n) => String(n).padStart(2, '0')
const getParts = (diff) => [
  { label: 'Hari', value: Math.floor(diff / 864e5) },
  { label: 'Jam', value: Math.floor(diff / 36e5) % 24 },
  { label: 'Menit', value: Math.floor(diff / 6e4) % 60 },
  { label: 'Detik', value: Math.floor(diff / 1e3) % 60 },
]

function HeroCountdown({ user }) {
  const [remaining, setRemaining] = useState(null)

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, COUNTDOWN_TARGET - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const parts = getParts(remaining ?? 0)

  return (
    <section
      className="rounded-xl border border-line bg-linear-to-br from-white via-white to-sky-50/70 shadow-2xs backdrop-blur dark:border-slate-800 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-sky-950/30"
      aria-labelledby="hero-title"
    >
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-2.5 py-0.5 font-medium text-zinc-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
              <span className="size-1.5 rounded-full bg-sky-500" /> Agenda Krusial Terdekat
            </span>
            <span>
              {user.role === 'admin' ? 'Mode Pengelola Jadwal BAA' : `Filter Aktif: ${user.faculty}`}
            </span>
          </div>

          <h1 id="hero-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Konsultasi & Pra-Pengisian KRS Semester Genap
          </h1>

          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" strokeWidth={1.75} /> Rabu, 25 November 2026
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" strokeWidth={1.75} /> 08.00 WITA
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" strokeWidth={1.75} /> Ruang Dosen PA & SIAKAD
            </span>
          </p>

          <div className="max-w-md pt-2">
            <div className="mb-1.5 flex justify-between text-xs text-zinc-500 dark:text-slate-400">
              <span>Progres Semester Ganjil 2026/2027</span>
              <span className="tabular-nums font-medium text-zinc-700 dark:text-slate-300">Minggu ke-13 dari 16</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/80 dark:bg-slate-800">
              <div className="h-full w-4/5 rounded-full bg-zinc-900 dark:bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="flex items-stretch gap-2 sm:gap-3" role="timer" aria-label="Hitung mundur menuju KRS">
          {parts.map((part) => (
            <div
              key={part.label}
              className="flex w-[68px] flex-col items-center justify-center rounded-lg border border-line bg-white/90 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:w-20 sm:py-4"
            >
              <span className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
                {remaining === null ? '--' : pad(part.value)}
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-slate-500">
                {part.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------- Tombol Pengingat Gmail Cepat (Dipakai di Card Dashboard & Timeline) ---------- */
function QuickRemindButton({ event, isSent, isSending, onSend }) {
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

/* ---------- TAB 1: DASHBOARD (MAHASISWA & ADMIN) ---------- */
function DashboardTab({
  user,
  events,
  remindedIds,
  sendingEventId,
  onSendReminder,
  checklist,
  onToggleChecklist,
  allRemindersStats,
  onSelectEvent,
  onSwitchTab,
  onOpenAdd,
  onExportIcs,
}) {
  const isAdmin = user.role === 'admin'
  const upcomingEvents = [...events].filter((e) => e.end >= TODAY).sort((a, b) => a.start - b.start)
  const completedChecklist = checklist.filter((c) => c.done).length
  const readinessPct = checklist.length ? Math.round((completedChecklist / checklist.length) * 100) : 0

  const busyClusters = useMemo(() => {
    const critical = upcomingEvents.filter((e) => ['ujian', 'akademik', 'pribadi'].includes(e.category))
    const found = []
    for (let i = 0; i < critical.length; i++) {
      const cluster = critical.filter((ev) => ev.start >= critical[i].start && ev.start <= critical[i].start + 4)
      if (cluster.length >= 2) {
        const key = `${cluster[0].start}-${cluster[cluster.length - 1].start}`
        if (!found.some((f) => f.key === key)) {
          found.push({
            key,
            startDay: cluster[0].start,
            endDay: Math.max(...cluster.map((c) => c.end)),
            items: cluster,
          })
        }
      }
    }
    return found
  }, [upcomingEvents])

  const categoryBreakdown = CATEGORY_KEYS.map((key) => {
    const count = events.filter((e) => e.category === key).length
    const pct = events.length ? Math.round((count / events.length) * 100) : 0
    return { key, ...CATEGORIES[key], count, pct }
  }).filter((item) => isAdmin || item.count > 0)

  const topRemindedEvents = useMemo(() => {
    return events
      .map((ev) => ({
        ...ev,
        reminderCount: allRemindersStats.get(String(ev.id)) || (remindedIds.has(String(ev.id)) ? 1 : 0),
      }))
      .sort((a, b) => b.reminderCount - a.reminderCount)
      .slice(0, 5)
  }, [events, allRemindersStats, remindedIds])

  return (
    <div className="flex flex-col gap-6">
      <HeroCountdown user={user} />

      {/* 4 Kartu KPI */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Ringkasan statistik">
        <div className="rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
            <span>{isAdmin ? 'Total Jadwal Semester' : 'Agenda Fakultas Aktif'}</span>
            <Calendar className="size-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{events.length} Agenda</p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-slate-500">
            {upcomingEvents.length} agenda mendatang mulai 15 Nov
          </p>
        </div>

        <div className="rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
            <span>{isAdmin ? 'Total Pengingat Terkirim' : 'Terkirim ke Gmail Saya'}</span>
            <Mail className="size-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {isAdmin
              ? Math.max(remindedIds.size, [...allRemindersStats.values()].reduce((a, b) => a + b, 0))
              : remindedIds.size}{' '}
            Jadwal
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-slate-500">
            Tujuan: {user.email}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
            <span>Radar Pekan Padat</span>
            <Flame className="size-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{busyClusters.length} Periode</p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-slate-500">
            Tumpukan tenggat dalam 4 hari
          </p>
        </div>

        <div className="rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-slate-400">
            <span>{isAdmin ? 'Cakupan Fakultas' : 'Kesiapan Syarat KRS/UAS'}</span>
            <ClipboardCheck className="size-4 text-violet-500" />
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {isAdmin ? '3 Fakultas' : `${readinessPct}%`}
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-slate-500">
            {isAdmin
              ? 'FILKOM, Ekonomi, Keperawatan'
              : `${completedChecklist} dari ${checklist.length} syarat selesai`}
          </p>
        </div>
      </section>

      {/* Radar Pekan Padat Alert */}
      {busyClusters.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/50 dark:bg-amber-950/25">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  Radar Pekan Padat Terdeteksi ({busyClusters[0].startDay} – {busyClusters[0].endDay} November 2026)
                </h2>
                <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-300/80">
                  Terdapat <strong>{busyClusters[0].items.length} tenggat krusial</strong> berdekatan:{' '}
                  {busyClusters[0].items.map((i) => `${i.title} (${i.start} Nov)`).join(' • ')}.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSwitchTab('calendar')}
              className="inline-flex shrink-0 cursor-pointer touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-amber-700"
            >
              Lihat di Kalender
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* Grid Utama Dashboard (2 Kolom) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between border-b border-line pb-3.5 dark:border-slate-800">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Agenda Terdekat</h2>
              <p className="text-xs text-zinc-500 dark:text-slate-400">
                Tap kartu untuk detail atau langsung kirim pengingat Gmail
              </p>
            </div>
            <button
              type="button"
              onClick={onExportIcs}
              className="inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Download className="size-3.5" />
              Export .ics
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {upcomingEvents.slice(0, 5).map((ev) => {
              const rel = getRelativeDayLabel(ev.start, ev.end)
              const isSent = remindedIds.has(String(ev.id))
              const isSending = sendingEventId === String(ev.id)
              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectEvent(ev)}
                  className="flex cursor-pointer flex-col gap-2.5 rounded-lg border border-line bg-canvas/60 p-3.5 transition hover:border-zinc-400 hover:bg-white dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-slate-600"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('size-2 shrink-0 rounded-full', CATEGORIES[ev.category]?.dot || 'bg-sky-500')} />
                        <p className="text-sm font-medium leading-snug">{ev.title}</p>
                      </div>
                      <p className="mt-1 pl-4 text-xs text-zinc-500 dark:text-slate-400">
                        {ev.start} Nov · {ev.time} · {ev.location}
                      </p>
                    </div>

                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        rel.tone === 'rose' && 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
                        rel.tone === 'amber' && 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                        rel.tone === 'sky' && 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
                      )}
                    >
                      {rel.text}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-line/70 pt-2 dark:border-slate-800/80">
                    <span className="truncate text-[11px] text-zinc-400 dark:text-slate-500">{ev.faculty}</span>
                    <QuickRemindButton
                      event={ev}
                      isSent={isSent}
                      isSending={isSending}
                      onSend={onSendReminder}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Kolom Kanan: Dinamis sesuai Role */}
        {isAdmin ? (
          <section className="flex flex-col gap-5 rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center justify-between border-b border-line pb-3.5 dark:border-slate-800">
              <div>
                <h2 className="text-base font-semibold tracking-tight">Analitik Jadwal & Pengingat BAA</h2>
                <p className="text-xs text-zinc-500 dark:text-slate-400">
                  Proporsi kategori dan agenda paling banyak dipantau mahasiswa
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenAdd}
                className="inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-slate-950"
              >
                <Plus className="size-3.5" />
                Jadwal Baru
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.key}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-zinc-700 dark:text-slate-300">{cat.label}</span>
                    <span className="tabular-nums text-zinc-500">
                      {cat.count} agenda ({cat.pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
                    <div className={cn('h-full rounded-full transition-all', cat.bar)} style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line pt-3 dark:border-slate-800">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Agenda dengan Aktivasi Gmail Tertinggi
              </p>
              <div className="flex flex-col gap-2">
                {topRemindedEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between rounded-lg border border-line bg-canvas/60 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950/50"
                  >
                    <span className="truncate pr-2 font-medium">{ev.title}</span>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 font-semibold tabular-nums text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {ev.reminderCount} mahasiswa
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="flex flex-col rounded-xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center justify-between border-b border-line pb-3.5 dark:border-slate-800">
              <div>
                <h2 className="text-base font-semibold tracking-tight">Checklist Syarat KRS & UAS</h2>
                <p className="text-xs text-zinc-500 dark:text-slate-400">
                  Centang syarat yang sudah beres sebelum minggu tenang
                </p>
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold tabular-nums dark:bg-slate-800">
                {completedChecklist}/{checklist.length}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggleChecklist(item.id)}
                  className={cn(
                    'flex cursor-pointer touch-manipulation items-start gap-3 rounded-lg border p-3 text-left transition',
                    item.done
                      ? 'border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                      : 'border-line bg-canvas/60 hover:border-zinc-400 dark:border-slate-800 dark:bg-slate-950/50',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 grid size-4 shrink-0 place-items-center rounded border transition',
                      item.done
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-zinc-300 bg-white dark:border-slate-600 dark:bg-slate-900',
                    )}
                  >
                    {item.done && <Check className="size-3" strokeWidth={2.5} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-xs font-medium', item.done && 'line-through opacity-60')}>
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-slate-500">{item.deadline}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onSwitchTab('calendar')}
              className="mt-4 inline-flex cursor-pointer touch-manipulation items-center justify-center gap-1.5 rounded-lg border border-line py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Buka Pusat Pengingat & Tugas Pribadi
              <ArrowRight className="size-3.5" />
            </button>
          </section>
        )}
      </div>
    </div>
  )
}

/* ---------- TAB 2: KALENDER AKADEMIK (FILTER BAR, GRID, TIMELINE) ---------- */
const VIEWS = [
  { key: 'split', label: 'Grid Kalender', Icon: LayoutPanelLeft },
  { key: 'list', label: 'Daftar Timeline', Icon: List },
]

/* Dropdown filter kategori — satu baris sejajar dengan tombol aksi */
function FilterBar({ events, active, onToggle, view, onViewChange, isAdmin, onOpenAdd, sentCount, onExportIcs }) {
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

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const CELLS = (() => {
  const cells = []
  for (let d = 26; d <= 31; d++) cells.push({ day: d, muted: true })
  for (let d = 1; d <= 30; d++) cells.push({ day: d })
  for (let d = 1; cells.length < 42; d++) cells.push({ day: d, muted: true })
  return cells
})()

function MonthGrid({ events, selected, remindedIds, onSelectDay, onSelectEvent }) {
  return (
    <div className="rounded-xl border border-line bg-white dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold tracking-tight">November 2026</h2>
          <span className="text-xs tabular-nums text-zinc-500 dark:text-slate-400">{events.length} agenda</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="icon-btn" aria-label="Bulan sebelumnya">
            <ChevronLeft className="size-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => onSelectDay(TODAY)}
            className="cursor-pointer touch-manipulation rounded-md border border-line px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Hari Ini (15 Nov)
          </button>
          <button type="button" className="icon-btn" aria-label="Bulan berikutnya">
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-line text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:border-slate-800 dark:text-slate-500">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2 py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {CELLS.map((cell, idx) => {
          const col = idx % 7
          const border = cn(col < 6 && 'border-r', idx < 35 && 'border-b', 'border-line dark:border-slate-800')
          if (cell.muted) {
            return (
              <div
                key={`m-${idx}`}
                className={cn(
                  border,
                  'min-h-16 bg-zinc-50/50 p-1.5 text-xs text-zinc-300 dark:bg-slate-950/30 dark:text-slate-700 sm:min-h-[108px] sm:p-2',
                )}
              >
                {cell.day}
              </div>
            )
          }
          const dayEvents = eventsOnDay(events, cell.day)
          const isToday = cell.day === TODAY
          const isSelected = cell.day === selected
          const weekend = col >= 5

          return (
            <div
              key={cell.day}
              onClick={() => onSelectDay(cell.day)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelectDay(cell.day)}
              className={cn(
                border,
                'flex min-h-16 cursor-pointer touch-manipulation flex-col gap-1 p-1.5 text-left transition-colors sm:min-h-[108px] sm:p-2',
                isSelected
                  ? 'bg-zinc-50/90 ring-1 ring-inset ring-zinc-900/70 dark:bg-slate-800/50 dark:ring-slate-300/60'
                  : 'hover:bg-zinc-50/70 dark:hover:bg-slate-800/30',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'grid size-6 place-items-center rounded-full text-xs font-medium tabular-nums',
                    isToday
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-slate-950'
                      : weekend && 'text-zinc-400 dark:text-slate-500',
                  )}
                >
                  {cell.day}
                </span>
                {isToday && (
                  <span className="hidden text-[10px] font-medium text-zinc-500 dark:text-slate-400 xl:inline">
                    Hari ini
                  </span>
                )}
              </div>

              {dayEvents.slice(0, 2).map((event) => {
                const isSent = remindedIds.has(String(event.id))
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectEvent(event)
                    }}
                    className={cn(
                      'hidden cursor-pointer items-center gap-1.5 truncate rounded border px-1.5 py-0.5 text-left text-[11px] font-medium transition hover:opacity-80 sm:flex',
                      CATEGORIES[event.category]?.badge || CATEGORIES.akademik.badge,
                    )}
                  >
                    {isSent ? (
                      <CheckCircle2 className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span className={cn('size-1.5 shrink-0 rounded-full', CATEGORIES[event.category]?.dot || 'bg-sky-500')} />
                    )}
                    <span className="truncate">{event.title}</span>
                  </button>
                )
              })}

              {dayEvents.length > 2 && (
                <span className="hidden px-1 text-[10px] font-medium text-zinc-400 dark:text-slate-500 sm:block">
                  +{dayEvents.length - 2} agenda lagi
                </span>
              )}

              <span className="mt-1 flex gap-1 sm:hidden">
                {dayEvents.map((event) => (
                  <span key={event.id} className={cn('size-1.5 rounded-full', CATEGORIES[event.category]?.dot || 'bg-sky-500')} />
                ))}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Timeline({ events, flashDay, constrained, remindedIds, sendingEventId, onSendReminder, onSelectEvent }) {
  const sorted = [...events].sort((a, b) => a.start - b.start)
  const groups = new Map()
  for (const event of sorted) {
    const list = groups.get(event.start) ?? []
    list.push(event)
    groups.set(event.start, list)
  }
  const markerDay = [...groups.keys()].find((d) => d >= TODAY)

  return (
    <aside
      className={cn(
        'flex flex-col rounded-xl border border-line bg-white dark:border-slate-800 dark:bg-slate-900/60',
        constrained && 'lg:max-h-[780px]',
      )}
      aria-labelledby="timeline-title"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-slate-800">
        <h2 id="timeline-title" className="text-base font-semibold tracking-tight">
          Timeline Agenda
        </h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-slate-400">
          <Sparkles className="size-[13px]" strokeWidth={1.75} />
          Tap agenda / tombol Gmail
        </span>
      </div>

      <ol className="flex-1 overflow-y-auto px-4 py-3">
        {groups.size === 0 ? (
          <li className="flex flex-col items-center gap-2 py-12 text-center text-sm text-zinc-500 dark:text-slate-400">
            <CalendarX className="size-5" strokeWidth={1.75} />
            Tidak ada agenda yang cocok dengan filter.
          </li>
        ) : (
          [...groups.entries()].map(([day, dayEvents]) => {
            const past = day < TODAY && dayEvents.every((e) => e.end < TODAY)
            const flashing = flashDay?.day === day
            return (
              <Fragment key={day}>
                {day === markerDay && (
                  <li className="flex items-center gap-2 py-2 text-[11px] font-medium uppercase tracking-wider text-rose-500">
                    <span className="size-1.5 rounded-full bg-rose-500" />
                    Hari ini · Minggu, 15 Nov
                    <span className="h-px flex-1 bg-rose-500/30" />
                  </li>
                )}
                <li
                  id={`tl-${day}`}
                  key={flashing ? `f-${flashDay.key}` : undefined}
                  className={cn('relative rounded-lg py-2 pl-5', past && 'opacity-55', flashing && 'animate-flash')}
                >
                  <span className="absolute bottom-0 left-[3px] top-0 w-px bg-line dark:bg-slate-800" />
                  <span className="absolute left-0 top-3.5 size-[7px] rounded-full border border-zinc-300 bg-white dark:border-slate-600 dark:bg-slate-900" />
                  <p className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-slate-400">
                    <span className="tabular-nums text-zinc-900 dark:text-slate-100">{day} Nov</span> · {weekdayOf(day)}
                  </p>
                  <div className="flex flex-col gap-2">
                    {dayEvents.map((event) => {
                      const isReminded = remindedIds.has(String(event.id))
                      const isSending = sendingEventId === String(event.id)
                      return (
                        <article
                          key={event.id}
                          onClick={() => onSelectEvent(event)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && onSelectEvent(event)}
                          className={cn(
                            'cursor-pointer touch-manipulation rounded-lg border px-3 py-2.5 transition',
                            isReminded
                              ? 'border-emerald-200/90 bg-emerald-50/30 hover:border-emerald-300 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                              : 'border-line bg-canvas/70 hover:border-zinc-400 hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-600 dark:hover:bg-slate-900',
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', CATEGORIES[event.category]?.dot || 'bg-sky-500')} />
                              <div className="min-w-0">
                                <h3 className="text-sm font-medium leading-snug">{event.title}</h3>
                                <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-zinc-500 dark:text-slate-400">
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="size-3" /> {event.time}
                                  </span>
                                  {event.end > event.start && (
                                    <span className="inline-flex items-center gap-1 tabular-nums">
                                      <ArrowRight className="size-3" /> s.d. {event.end} Nov
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="size-3" /> {event.location}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line/70 pt-2 text-[11px] dark:border-slate-800/80">
                            <span className="truncate text-zinc-400 dark:text-slate-500">{event.faculty}</span>
                            <QuickRemindButton
                              event={event}
                              isSent={isReminded}
                              isSending={isSending}
                              onSend={onSendReminder}
                            />
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </li>
              </Fragment>
            )
          })
        )}
      </ol>
    </aside>
  )
}

/* ---------- TAB 3: PENGINGAT & SYARAT (MAHASISWA) / KELOLA JADWAL (ADMIN) ---------- */
function WorkspaceTab({
  user,
  events,
  remindedIds,
  recentlyEditedId,
  checklist,
  onToggleChecklist,
  onSelectEvent,
  onAddPersonalEvent,
  onDeleteEvent,
  onOpenAddModal,
  onOpenEditModal,
}) {
  const isAdmin = user.role === 'admin'
  const [adminSearch, setAdminSearch] = useState('')
  const [adminCategory, setAdminCategory] = useState('all')
  const [adminFaculty, setAdminFaculty] = useState('all')
  const [pTitle, setPTitle] = useState('')
  const [pDay, setPDay] = useState(19)
  const [pTime, setPTime] = useState('14.00 WITA')
  const [pLocation, setPLocation] = useState('Google Classroom / SIAKAD')

  const remindedEvents = events.filter((e) => remindedIds.has(String(e.id))).sort((a, b) => a.start - b.start)
  const personalEvents = events.filter((e) => e.isPersonal && e.ownerEmail === user.email)

  const handlePersonalSubmit = async (e) => {
    e.preventDefault()
    if (!pTitle.trim()) return
    const parsedDay = Math.min(30, Math.max(1, Number(pDay) || 15))
    await onAddPersonalEvent({
      start: parsedDay,
      end: parsedDay,
      category: 'pribadi',
      faculty: user.faculty,
      isPersonal: true,
      ownerEmail: user.email,
      title: pTitle.trim(),
      time: pTime.trim() || '12.00 WITA',
      location: pLocation.trim() || 'Mandiri / Online',
      description: `Tugas / agenda pribadi milik ${user.name} (${user.email}).`,
    })
    setPTitle('')
  }

  if (isAdmin) {
    const sortedAll = [...events].sort((a, b) => a.start - b.start)
    const filteredEvents = sortedAll.filter((ev) => {
      const q = adminSearch.trim().toLowerCase()
      const matchSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q) ||
        ev.faculty.toLowerCase().includes(q) ||
        (CATEGORIES[ev.category]?.label || '').toLowerCase().includes(q)
      const matchCategory = adminCategory === 'all' || ev.category === adminCategory
      const matchFaculty = adminFaculty === 'all' || ev.faculty === adminFaculty
      return matchSearch && matchCategory && matchFaculty
    })
    const hasActiveFilter = Boolean(adminSearch.trim() || adminCategory !== 'all' || adminFaculty !== 'all')

    return (
      <div className="flex flex-col gap-6">
        {/* Header Eksekutif Pengelola Agenda BAA */}
        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-line bg-gradient-to-br from-white via-white to-zinc-50/90 p-5 shadow-2xs backdrop-blur dark:border-slate-800 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-950 sm:p-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-slate-950">
              <ShieldCheck className="size-5" strokeWidth={1.8} />
            </span>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-slate-100 sm:text-lg">
                  Pusat Kelola & Modifikasi Agenda Kampus
                </h2>
                <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-xs font-semibold tabular-nums text-zinc-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {sortedAll.length} Agenda
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <Database className="size-2.5" /> Firestore Live
                </span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-slate-400">
                Pusat kendali BAA: ubah detail, perbarui tanggal/lokasi, atau hapus agenda resmi kampus. Perubahan langsung tersinkronisasi otomatis ke seluruh kalender mahasiswa.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex min-h-[38px] cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <Plus className="size-4" />
              <span>Tambah Agenda Baru</span>
            </button>
          </div>
        </div>

        {/* Panel Tabel & Filter Interaktif */}
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex flex-col gap-3 border-b border-line p-3.5 sm:p-4 dark:border-slate-800">
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
              {/* Kolom Filter & Pencarian */}
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                {/* Search Input */}
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Cari judul, fakultas, atau lokasi..."
                    className="h-9 w-full rounded-lg border border-line bg-canvas pl-8.5 pr-8 text-xs placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-500"
                  />
                  {adminSearch && (
                    <button
                      type="button"
                      onClick={() => setAdminSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-slate-500 dark:hover:text-slate-300"
                      aria-label="Bersihkan pencarian"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Kategori */}
                <select
                  value={adminCategory}
                  onChange={(e) => setAdminCategory(e.target.value)}
                  className="h-9 rounded-lg border border-line bg-canvas px-2.5 text-xs text-zinc-700 focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:focus:border-slate-500"
                >
                  <option value="all">Semua Kategori</option>
                  {CAMPUS_CATEGORY_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {CATEGORIES[k].label}
                    </option>
                  ))}
                </select>

                {/* Filter Fakultas */}
                <select
                  value={adminFaculty}
                  onChange={(e) => setAdminFaculty(e.target.value)}
                  className="h-9 rounded-lg border border-line bg-canvas px-2.5 text-xs text-zinc-700 focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:focus:border-slate-500"
                >
                  <option value="all">Semua Target Fakultas</option>
                  {FACULTIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>

                {/* Tombol Reset Filter */}
                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={() => {
                      setAdminSearch('')
                      setAdminCategory('all')
                      setAdminFaculty('all')
                    }}
                    className="inline-flex h-9 cursor-pointer touch-manipulation items-center gap-1 rounded-lg border border-line bg-white px-2.5 text-xs text-zinc-600 transition hover:bg-zinc-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <X className="size-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Status Jumlah Data */}
              <span className="text-xs text-zinc-500 dark:text-slate-400">
                Menampilkan <strong className="text-zinc-900 dark:text-slate-100">{filteredEvents.length}</strong> dari {sortedAll.length} agenda
              </span>
            </div>
          </div>

          {/* Desktop Table View (Layar Desktop / Tablet Lebar) */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-canvas/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3.5">Tanggal</th>
                  <th className="px-4 py-3.5">Judul Agenda</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5">Target Fakultas</th>
                  <th className="px-4 py-3.5">Lokasi</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-slate-800">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-zinc-400 dark:text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CalendarX className="size-6 text-zinc-400 dark:text-slate-600" />
                        <p className="font-medium text-zinc-600 dark:text-slate-400">Tidak ada agenda yang cocok</p>
                        <p className="text-xs text-zinc-400 dark:text-slate-500">
                          Coba sesuaikan kata kunci pencarian atau reset filter kategori.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => {
                    const cat = CATEGORIES[ev.category] || CATEGORIES.akademik
                    const isRecentlyEdited = String(ev.id) === String(recentlyEditedId)
                    return (
                      <tr
                        key={ev.id}
                        className={cn(
                          'transition-colors',
                          isRecentlyEdited
                            ? 'bg-emerald-50/90 ring-2 ring-inset ring-emerald-500/50 dark:bg-emerald-950/40'
                            : 'hover:bg-zinc-50/70 dark:hover:bg-slate-800/40',
                        )}
                      >
                        <td className="whitespace-nowrap px-4 py-3.5 font-medium tabular-nums text-zinc-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 text-zinc-400" />
                            <span>{ev.end > ev.start ? `${ev.start}–${ev.end} Nov` : `${ev.start} Nov`}</span>
                            {ev.end > ev.start && (
                              <span className="rounded bg-zinc-100 px-1.5 py-0.2 text-[10px] text-zinc-500 dark:bg-slate-800 dark:text-slate-400">
                                {ev.end - ev.start + 1}h
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-zinc-900 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onSelectEvent(ev)}
                              className="cursor-pointer text-left hover:underline focus:outline-none"
                            >
                              {ev.title}
                            </button>
                            {isRecentlyEdited && (
                              <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                <Check className="size-3" /> Baru Diperbarui
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium', cat.badge)}>
                            <span className={cn('size-1.5 rounded-full', cat.dot)} />
                            {cat.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-zinc-500 dark:text-slate-400">{ev.faculty}</td>
                        <td className="px-4 py-3.5 text-zinc-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3 text-zinc-400" />
                            {ev.location}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onSelectEvent(ev)}
                              className="cursor-pointer rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                              Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenEditModal(ev)}
                              title="Edit informasi agenda"
                              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50"
                            >
                              <Pencil className="size-3" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteEvent(ev)}
                              title="Hapus agenda"
                              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (Layar Smartphone / Handphone) */}
          <div className="divide-y divide-line p-3 md:hidden dark:divide-slate-800">
            {filteredEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-400 dark:text-slate-500">
                <CalendarX className="mx-auto mb-2 size-6 text-zinc-400" />
                Tidak ada agenda yang cocok dengan filter pencarian.
              </div>
            ) : (
              filteredEvents.map((ev) => {
                const cat = CATEGORIES[ev.category] || CATEGORIES.akademik
                const isRecentlyEdited = String(ev.id) === String(recentlyEditedId)
                return (
                  <div
                    key={ev.id}
                    className={cn(
                      'flex flex-col gap-2.5 rounded-xl p-3 transition-all',
                      isRecentlyEdited
                        ? 'border border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-500/30 dark:border-emerald-800 dark:bg-emerald-950/40 my-1'
                        : 'py-3.5 first:pt-1 last:pb-1',
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md border border-line bg-canvas px-2 py-0.5 text-xs font-semibold tabular-nums text-zinc-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                          <Calendar className="size-3 text-sky-500" />
                          {ev.end > ev.start ? `${ev.start}–${ev.end} Nov 2026` : `${ev.start} Nov 2026`}
                        </span>
                        {isRecentlyEdited && (
                          <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <Check className="size-2.5" /> Baru Diperbarui
                          </span>
                        )}
                      </div>
                      <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', cat.badge)}>
                        <span className={cn('size-1.5 rounded-full', cat.dot)} />
                        {cat.label}
                      </span>
                    </div>

                    <div>
                      <h3
                        onClick={() => onSelectEvent(ev)}
                        className="cursor-pointer text-sm font-semibold leading-snug text-zinc-900 hover:underline dark:text-slate-100"
                      >
                        {ev.title}
                      </h3>
                      <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3 text-zinc-400" /> {ev.time}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3 text-zinc-400" /> {ev.location}
                        </span>
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-400 dark:text-slate-500">
                        Target: {ev.faculty}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-line/60 pt-2.5 dark:border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => onSelectEvent(ev)}
                        className="inline-flex min-h-[36px] cursor-pointer touch-manipulation items-center justify-center rounded-lg border border-line bg-canvas py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                      >
                        Detail
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenEditModal(ev)}
                        className="inline-flex min-h-[36px] cursor-pointer touch-manipulation items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
                      >
                        <Pencil className="size-3" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteEvent(ev)}
                        className="inline-flex min-h-[36px] cursor-pointer touch-manipulation items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                      >
                        <Trash2 className="size-3.5" />
                        Hapus
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    )
  }

  // View untuk Mahasiswa
  const completedChecklist = checklist.filter((c) => c.done).length
  const readinessPct = checklist.length ? Math.round((completedChecklist / checklist.length) * 100) : 0

  return (
    <div className="flex flex-col gap-6">
      {/* Header Mahasiswa */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-line bg-gradient-to-br from-white via-white to-zinc-50/90 p-5 shadow-2xs backdrop-blur dark:border-slate-800 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-950 sm:p-6 lg:flex-row lg:items-center">
        <div className="flex items-start gap-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-slate-950">
            <ClipboardCheck className="size-5" strokeWidth={1.8} />
          </span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-slate-100 sm:text-lg">
                Pusat Pengingat Gmail & Kelengkapan Akademik
              </h2>
              <span className="rounded-full border border-line bg-white px-2.5 py-0.5 text-xs font-semibold tabular-nums text-zinc-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {user.faculty}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-slate-400">
              Pantau jadwal yang dikirim ke email <strong>{user.email}</strong>, catat tenggat tugas pribadi, dan penuhi syarat kelulusan administrasi KRS/UAS.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="size-3.5" />
            {remindedEvents.length} Jadwal Terkirim
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/50 dark:text-violet-300">
            <Sparkles className="size-3.5" />
            {personalEvents.length} Tugas Pribadi
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold tabular-nums text-zinc-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            {readinessPct}% Syarat Selesai
          </span>
        </div>
      </div>

      {/* 2 Kolom Konten Mahasiswa */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kolom Kiri: Riwayat Pengingat Gmail + Tambah Tugas Pribadi */}
        <div className="flex flex-col gap-6">
          {/* Riwayat Gmail */}
          <section className="rounded-2xl border border-line bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between border-b border-line pb-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-emerald-500" />
                <div>
                  <h3 className="text-base font-semibold tracking-tight">Riwayat Pengingat Gmail Aktif</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-slate-400">
                    Tujuan notifikasi: <strong className="text-zinc-700 dark:text-slate-300">{user.email}</strong>
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {remindedEvents.length} Terkirim
              </span>
            </div>

            {remindedEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 dark:text-slate-400">
                <Mail className="mx-auto mb-2 size-6 text-zinc-300 dark:text-slate-600" />
                <p className="font-medium text-zinc-700 dark:text-slate-300">Belum ada pengingat dikirim</p>
                <p className="mt-1">
                  Tap tombol <strong>&ldquo;Ingatkan Gmail&rdquo;</strong> pada agenda di kalender atau timeline di atas.
                </p>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2.5">
                {remindedEvents.map((ev) => {
                  const rel = getRelativeDayLabel(ev.start, ev.end)
                  return (
                    <div
                      key={ev.id}
                      onClick={() => onSelectEvent(ev)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && onSelectEvent(ev)}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-3 transition hover:border-emerald-400 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{ev.title}</p>
                        <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                          {ev.start} Nov 2026 · {ev.time} · {ev.location}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {rel.text}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Tambah Tugas Pribadi */}
          <section className="rounded-2xl border border-line bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 border-b border-line pb-3.5 dark:border-slate-800">
              <Sparkles className="size-4 text-violet-500" />
              <div>
                <h3 className="text-base font-semibold tracking-tight">Catat Tenggat Tugas Pribadi</h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                  Agenda khusus Anda (tugas kuliah, ujian lab, presentasi). Otomatis tampil di kalender.
                </p>
              </div>
            </div>

            <form onSubmit={handlePersonalSubmit} className="mt-4 flex flex-col gap-3 text-xs">
              <div>
                <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">
                  Nama Tugas / Agenda Pribadi *
                </label>
                <input
                  required
                  type="text"
                  autoComplete="off"
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                  placeholder="Contoh: Pengumpulan Makalah Etika Profesi"
                  className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Tgl (Nov 2026)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={pDay}
                    onChange={(e) => setPDay(e.target.value)}
                    className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Jam</label>
                  <input
                    type="text"
                    value={pTime}
                    onChange={(e) => setPTime(e.target.value)}
                    className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Tempat / SIAKAD</label>
                  <input
                    type="text"
                    value={pLocation}
                    onChange={(e) => setPLocation(e.target.value)}
                    className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-1 inline-flex min-h-[40px] cursor-pointer touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 text-xs font-medium text-white transition hover:bg-violet-700 active:scale-[0.98]"
              >
                <Plus className="size-4" />
                Simpan ke Kalender Pribadi
              </button>
            </form>

            {personalEvents.length > 0 && (
              <div className="mt-5 border-t border-line pt-3.5 dark:border-slate-800">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-slate-500">
                  Daftar Tugas Pribadi Tersimpan ({personalEvents.length})
                </p>
                <div className="flex flex-col gap-2">
                  {personalEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between rounded-lg border border-violet-200/80 bg-violet-50/40 px-3 py-2.5 text-xs dark:border-violet-900/40 dark:bg-violet-950/20"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectEvent(ev)}
                        className="min-w-0 flex-1 cursor-pointer text-left font-medium hover:underline"
                      >
                        <span className="font-semibold text-violet-700 dark:text-violet-300">{ev.start} Nov:</span>{' '}
                        {ev.title}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteEvent(ev)}
                        aria-label="Hapus tugas pribadi"
                        className="ml-2 cursor-pointer p-1 text-zinc-400 transition hover:text-rose-500"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Kolom Kanan: Checklist Syarat KRS & UAS */}
        <section className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
          <div className="border-b border-line pb-3.5 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold tracking-tight">Checklist Syarat Akademik Semester Ganjil</h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-slate-400">
                  Centang setiap syarat yang telah beres. Progres otomatis terhubung ke Dashboard.
                </p>
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold tabular-nums dark:bg-slate-800">
                {completedChecklist}/{checklist.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-zinc-500 dark:text-slate-400">
                <span>Tingkat Kesiapan Administrasi</span>
                <span className="font-semibold text-zinc-800 dark:text-slate-200">{readinessPct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${readinessPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-1 flex-col gap-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleChecklist(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onToggleChecklist(item.id)}
                className={cn(
                  'flex cursor-pointer touch-manipulation items-start gap-3 rounded-xl border p-3.5 transition active:scale-[0.99]',
                  item.done
                    ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                    : 'border-line bg-canvas/70 hover:border-zinc-400 dark:border-slate-800 dark:bg-slate-950/60',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition',
                    item.done
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-zinc-300 bg-white dark:border-slate-600 dark:bg-slate-900',
                  )}
                >
                  {item.done && <Check className="size-3.5" strokeWidth={2.5} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className={cn('text-sm font-medium', item.done && 'line-through opacity-60')}>{item.title}</p>
                    <span className="rounded bg-zinc-200/70 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-slate-800 dark:text-slate-300">
                      {item.deadline}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-slate-400">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

/* ---------- 7. Modal Detail Agenda (Scrollable di HP & Langsung Aktif) ---------- */
function EventDetailModal({ event, user, isReminded, isSending, onSendReminder, onCopyWhatsApp, onClose, onOpenEdit }) {
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

        <div className="mt-5 flex flex-col gap-2.5 border-t border-line pt-4 dark:border-slate-800">
          {user?.role === 'admin' && onOpenEdit && !event.isPersonal && (
            <button
              type="button"
              onClick={() => {
                const target = event
                onClose()
                onOpenEdit(target)
              }}
              className="inline-flex min-h-[42px] w-full cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/60"
            >
              <Pencil className="size-4 text-amber-600 dark:text-amber-400" />
              Edit Informasi Agenda Ini
            </button>
          )}

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
                  Ingatkan ke Gmail (H-1)
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
      </div>
    </div>
  )
}

/* ---------- 8. Modal Tambah Agenda (Khusus Admin) ---------- */
function AddEventModal({ open, onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [startDay, setStartDay] = useState(21)
  const [endDay, setEndDay] = useState(21)
  const [category, setCategory] = useState('akademik')
  const [faculty, setFaculty] = useState('Semua Fakultas')
  const [time, setTime] = useState('09.00 WITA')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || saving) return
    setSaving(true)
    const s = Math.min(30, Math.max(1, Number(startDay) || 15))
    const en = Math.min(30, Math.max(s, Number(endDay) || s))
    await onAdd({
      start: s,
      end: en,
      category,
      faculty,
      title: title.trim(),
      time: time.trim() || '08.00 WITA',
      location: location.trim() || 'Kampus UNKLAB',
      description: description.trim() || 'Agenda resmi ditambahkan oleh Admin Akademik.',
    })
    setSaving(false)
    setTitle('')
    setLocation('')
    setDescription('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-zinc-950/50 p-3 backdrop-blur-xs sm:p-4"
      onClick={onClose}
    >
      <div
        className="my-auto max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line pb-3 dark:border-slate-800">
          <h3 className="text-base font-semibold tracking-tight">Tambah Agenda Akademik Baru</h3>
          <button type="button" onClick={onClose} className="icon-btn cursor-pointer">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3.5 text-xs">
          <div>
            <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Judul Agenda *</label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Batas Akhir Revisi Nilai Ujian"
              className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">
                Tanggal Mulai (Nov 2026)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={startDay}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setStartDay(val)
                  if (val > endDay) setEndDay(val)
                }}
                className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">
                Tanggal Selesai (Nov 2026)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={endDay}
                onChange={(e) => setEndDay(Number(e.target.value))}
                className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Kategori Warna</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              >
                {CAMPUS_CATEGORY_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {CATEGORIES[k].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Target Fakultas</label>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              >
                {FACULTIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Waktu</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="08.00 WITA"
                className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Lokasi / Platform</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Auditorium / Portal SIAKAD"
                className="h-9 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-medium text-zinc-600 dark:text-slate-400">Keterangan Tambahan</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail persyaratan atau informasi penting untuk mahasiswa..."
              className="w-full rounded-lg border border-line bg-white p-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
            />
          </div>

          <div className="mt-2 flex justify-end gap-2 border-t border-line pt-3 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-line px-4 py-2 font-medium text-zinc-600 hover:bg-zinc-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              {saving ? 'Menyimpan...' : 'Simpan ke Kalender'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ---------- 9. Modal Edit Agenda (Khusus Admin) ---------- */
/* Inner component: hooks dipanggil normal, tidak ada early return sebelum hooks */
function EditEventModalInner({ event, onClose, onSave }) {
  const sInit = Number(event.start) || 1
  const [fields, setFields] = useState({
    title: event.title || '',
    startDay: sInit,
    endDay: Number(event.end) || sInit,
    category: event.category || 'akademik',
    faculty: event.faculty || 'Semua Fakultas',
    time: event.time || '08.00 WITA',
    location: event.location || '',
    description: event.description || '',
  })
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Keyboard shortcut Escape untuk tutup modal
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && !saving && !savedSuccess) onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [saving, savedSuccess, onClose])

  const updateField = (key) => (e) => {
    const raw = e.target.value
    const val = key === 'startDay' || key === 'endDay' ? Number(raw) : raw
    setFields((prev) => {
      const next = { ...prev, [key]: val }
      // Auto-koreksi: jika startDay naik melebihi endDay, sesuaikan endDay
      if (key === 'startDay' && Number(val) > Number(prev.endDay)) {
        next.endDay = Number(val)
      }
      return next
    })
    if (errorMsg) setErrorMsg('')
  }

  const sNum = Math.min(30, Math.max(1, Number(fields.startDay) || 1))
  const eNum = Math.min(30, Math.max(1, Number(fields.endDay) || sNum))
  const dateError = eNum < sNum
  const durationDays = dateError ? 0 : eNum - sNum + 1
  const selectedCat = CATEGORIES[fields.category] || CATEGORIES.akademik
  const charCount = fields.description.length

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!fields.title.trim() || saving || savedSuccess) return
    if (dateError) {
      setErrorMsg('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.')
      return
    }
    if (!fields.location.trim() || !fields.time.trim()) {
      setErrorMsg('Waktu dan lokasi tidak boleh kosong.')
      return
    }
    setSaving(true)
    setErrorMsg('')
    try {
      await onSave({
        ...event,
        title: fields.title.trim(),
        start: sNum,
        end: eNum,
        category: fields.category,
        faculty: fields.faculty,
        time: fields.time.trim(),
        location: fields.location.trim(),
        description: fields.description.trim() || 'Agenda resmi akademik Universitas Klabat.',
      })
      setSavedSuccess(true)
      setTimeout(() => {
        onClose()
      }, 400)
    } catch (err) {
      console.error('Error saat simpan:', err)
      setErrorMsg(err?.message || 'Gagal menyimpan perubahan. Periksa koneksi internet.')
      setSaving(false)
    }
  }

  const baseInput = 'h-9 w-full rounded-lg border border-line bg-white px-3 text-sm transition focus:border-zinc-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950'

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-950/60 p-3 backdrop-blur-xs sm:p-4"
      onClick={saving ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Edit Agenda Akademik"
    >
      <div
        className="relative my-auto max-h-[90dvh] overflow-y-auto w-full max-w-lg rounded-2xl border border-line bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Pencil className="size-4" />
            </span>
            <div>
              <h3 className="text-base font-semibold tracking-tight">Edit Agenda Akademik</h3>
              <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-slate-400">
                Perubahan tersinkron real-time ke seluruh kalender mahasiswa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="icon-btn ml-2 shrink-0 cursor-pointer disabled:opacity-40"
            aria-label="Tutup (Esc)"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ── Error Banner ── */}
        {errorMsg && (
          <div className="mx-5 mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 text-xs">

          {/* Judul Agenda */}
          <div>
            <label className="mb-1.5 block font-semibold text-zinc-700 dark:text-slate-200">
              Judul Agenda <span className="text-rose-500">*</span>
            </label>
            <input
              required
              autoFocus
              type="text"
              value={fields.title}
              onChange={updateField('title')}
              placeholder="Contoh: Batas Akhir Pengisian KRS Semester Genap"
              className={baseInput}
            />
          </div>

          {/* Tanggal Mulai & Selesai */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block font-semibold text-zinc-700 dark:text-slate-200">
                Tgl Mulai <span className="text-rose-500">*</span>
                <span className="ml-1 font-normal text-zinc-400 dark:text-slate-500">(Nov 2026)</span>
              </label>
              <input
                required
                type="number"
                min={1}
                max={30}
                value={fields.startDay}
                onChange={updateField('startDay')}
                className={baseInput}
              />
            </div>
            <div>
              <label className="mb-1.5 block font-semibold text-zinc-700 dark:text-slate-200">
                Tgl Selesai <span className="text-rose-500">*</span>
                <span className="ml-1 font-normal text-zinc-400 dark:text-slate-500">(Nov 2026)</span>
              </label>
              <input
                required
                type="number"
                min={1}
                max={30}
                value={fields.endDay}
                onChange={updateField('endDay')}
                className={cn(
                  'h-9 w-full rounded-lg border px-3 text-sm transition focus:outline-none dark:bg-slate-950',
                  dateError
                    ? 'border-rose-400 bg-rose-50 focus:border-rose-500 dark:border-rose-700 dark:bg-rose-950/30'
                    : 'border-line bg-white focus:border-zinc-900 dark:border-slate-700',
                )}
              />
            </div>
          </div>

          {/* Indikator Rentang Tanggal */}
          <div className={cn(
            'flex items-center justify-between rounded-lg border px-3 py-2 text-[11px]',
            dateError
              ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300'
              : 'border-line bg-canvas text-zinc-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400',
          )}>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3 opacity-70" />
              {dateError ? (
                <strong>⚠ Tgl selesai tidak boleh lebih awal dari tgl mulai</strong>
              ) : (
                <strong>
                  {sNum === eNum
                    ? `${sNum} November 2026`
                    : `${sNum} \u2013 ${eNum} November 2026`}
                </strong>
              )}
            </span>
            {!dateError && (
              <span className="rounded-full bg-zinc-200/70 px-2 py-0.5 font-semibold text-zinc-700 dark:bg-slate-700/60 dark:text-slate-200">
                {durationDays === 1 ? '1 Hari' : `${durationDays} Hari`}
              </span>
            )}
          </div>

          {/* Kategori & Fakultas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-1">
                <label className="font-semibold text-zinc-700 dark:text-slate-200">
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <span className={cn('inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]', selectedCat.badge)}>
                  <span className={cn('size-1.5 rounded-full', selectedCat.dot)} />
                  {selectedCat.label}
                </span>
              </div>
              <select
                value={fields.category}
                onChange={updateField('category')}
                className={baseInput}
              >
                {CAMPUS_CATEGORY_KEYS.map((k) => (
                  <option key={k} value={k}>{CATEGORIES[k].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block font-semibold text-zinc-700 dark:text-slate-200">
                Target Fakultas <span className="text-rose-500">*</span>
              </label>
              <select
                value={fields.faculty}
                onChange={updateField('faculty')}
                className={baseInput}
              >
                {FACULTIES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Waktu & Lokasi */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block font-semibold text-zinc-700 dark:text-slate-200">
                Waktu <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                value={fields.time}
                onChange={updateField('time')}
                placeholder="08.00 WITA / Seharian"
                className={baseInput}
              />
            </div>
            <div>
              <label className="mb-1.5 block font-semibold text-zinc-700 dark:text-slate-200">
                Lokasi / Platform <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                value={fields.location}
                onChange={updateField('location')}
                placeholder="Auditorium / Portal SIAKAD"
                className={baseInput}
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="font-semibold text-zinc-700 dark:text-slate-200">
                Deskripsi <span className="text-rose-500">*</span>
              </label>
              <span className={cn(
                'text-[10px]',
                charCount > 300 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400 dark:text-slate-500',
              )}>
                {charCount} karakter
              </span>
            </div>
            <textarea
              required
              rows={3}
              value={fields.description}
              onChange={updateField('description')}
              placeholder="Detail persyaratan atau informasi penting untuk mahasiswa..."
              className="w-full resize-y rounded-lg border border-line bg-white p-3 text-sm transition focus:border-zinc-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          {/* Info sinkronisasi */}
          <div className="flex items-start gap-2 rounded-lg border border-sky-200/80 bg-sky-50/60 p-2.5 text-[11px] text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300">
            <Database className="mt-0.5 size-3.5 shrink-0 text-sky-500" />
            <span>
              <span className="font-semibold">Real-time Sync Firestore:</span> Disimpan ke cloud dan langsung ter-update di kalender semua mahasiswa tanpa reload halaman.
            </span>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-between gap-2 border-t border-line pt-3 dark:border-slate-800">
            <p className="text-[10px] text-zinc-400 dark:text-slate-500">
              Tekan{' '}
              <kbd className="rounded border border-zinc-300 bg-zinc-100 px-1 py-0.5 font-mono text-zinc-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Esc
              </kbd>{' '}
              untuk batal
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="cursor-pointer rounded-lg border border-line px-4 py-2 font-semibold text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || dateError || savedSuccess}
                className={cn(
                  'inline-flex min-h-[38px] cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 py-2 font-semibold text-white transition disabled:cursor-not-allowed',
                  savedSuccess
                    ? 'bg-emerald-600 hover:bg-emerald-600'
                    : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 disabled:opacity-50',
                )}
              >
                {savedSuccess ? (
                  <>
                    <Check className="size-4" strokeWidth={2.5} />
                    Berhasil Diperbarui!
                  </>
                ) : saving ? (
                  <>
                    <Sparkles className="size-3.5 animate-spin" />
                    Menyimpan…
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

/* Wrapper: guard open/event sebelum render inner (menghindari hooks early-return violation) */
function EditEventModal({ open, event, onClose, onSave }) {
  if (!open || !event) return null
  return <EditEventModalInner key={String(event.id)} event={event} onClose={onClose} onSave={onSave} />
}

/* ---------- Komponen Utama App ---------- */
export default function App() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dark, setDark] = useState(false)
  const [events, setEvents] = useState(INITIAL_EVENTS)
  const [cloudSynced, setCloudSynced] = useState(false)
  const [active, setActive] = useState(() => new Set(CATEGORY_KEYS))
  const [query, setQuery] = useState('')
  const [selectedDay, setSelectedDay] = useState(TODAY)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [view, setView] = useState('split')
  const [flashDay, setFlashDay] = useState(null)
  const [remindedIds, setRemindedIds] = useState(() => new Set())
  const [sendingEventId, setSendingEventId] = useState(null)
  const [allRemindersStats, setAllRemindersStats] = useState(() => new Map())
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST)
  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)
  const [recentlyEditedId, setRecentlyEditedId] = useState(null)
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
            INITIAL_EVENTS.forEach(({ ...eventData }) => {
              addDoc(collection(db, 'events'), eventData).catch(() => { /* ignore */ })
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
            localStorage.setItem(storageKey, JSON.stringify([...merged]))
          } catch { /* ignore */ }
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
      
      () => { /* ignore Firestore error */ },
    )
    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    try {
      const savedDark = localStorage.getItem('smartcal-theme') === 'dark'
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDark(savedDark)
      document.documentElement.classList.toggle('dark', savedDark)
    } catch { /* ignore */ }
  }, [])

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      try {
        localStorage.setItem('smartcal-theme', next ? 'dark' : 'light')
      } catch { /* ignore */ }
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

  const showToast = (message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    const toastObj = typeof message === 'string' ? { text: message, type } : message
    setToast(toastObj)
    toastTimerRef.current = setTimeout(() => setToast(null), 4500)
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
        } catch { /* ignore */ }
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
        } catch { /* ignore */ }
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
      } catch { /* ignore */ }
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

    // 1. Pembaruan State Lokal Secara Instan (Optimistic UI - Cepat & Tanpa Delay)
    setEvents((prev) =>
      prev.map((ev) => (String(ev.id) === idStr ? { ...ev, ...cleanData } : ev))
    )

    if (selectedEvent && String(selectedEvent.id) === idStr) {
      setSelectedEvent((prev) => (prev ? { ...prev, ...cleanData } : null))
    }

    // 2. Berikan indikator visual kuat: tandai agenda yang baru diperbarui
    setRecentlyEditedId(idStr)
    setTimeout(() => setRecentlyEditedId(null), 4500)

    // 3. Sorot tanggal pada timeline agar posisi kalender langsung terlihat
    setFlashDay({ day: cleanData.start, key: Date.now() })

    // 4. Notifikasi toast sukses yang jelas
    showToast(`Perubahan agenda "${cleanData.title}" berhasil disimpan!`, 'success')

    // 5. Sinkronisasi ke Firestore di latar belakang dengan safe timeout agar UI tidak pernah freeze/stuck
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
    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Yakin ingin menghapus agenda "${ev.title}"? Perubahan akan langsung tersinkronisasi ke seluruh mahasiswa.`)
    ) {
      return
    }
    if (isFirebaseConfigured && db && !String(ev.id).startsWith('init-')) {
      try {
        await deleteDoc(doc(db, 'events', String(ev.id)))
      } catch { /* ignore */ }
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
    return (
      <>
        <style>{STYLES}</style>
        <LoginScreen
          onLogin={(u) => {
            setUser(u)
            setActiveTab('dashboard')
          }}
          dark={dark}
          onToggleTheme={toggleTheme}
        />
      </>
    )
  }

  const split = view === 'split'

  return (
    <div className="min-h-screen bg-canvas text-zinc-900 dark:bg-slate-950 dark:text-slate-100">
      <style>{STYLES}</style>

      <Navbar
        user={user}
        onLogout={() => setUser(null)}
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
              onExportIcs={() => {
                downloadIcsFile(visibleEvents)
                showToast('File kalender (.ics) berhasil diunduh!')
              }}
            />

            {/* Bagian 1: Kalender Grid & Timeline */}
            <section
              id="kalender-section"
              className={cn('scroll-mt-20 grid gap-6', split && 'lg:grid-cols-[minmax(0,1fr)_380px]')}
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

            {/* Bagian 2: Terpadu Kelola Jadwal (Admin) / Pengingat & Syarat (Mahasiswa) */}
            <div id="kelola-section" className="scroll-mt-20 border-t border-line pt-6 dark:border-slate-800">
              <WorkspaceTab
                user={user}
                events={facultyScopedEvents}
                remindedIds={remindedIds}
                recentlyEditedId={recentlyEditedId}
                checklist={checklist}
                onToggleChecklist={handleToggleChecklist}
                onSelectEvent={setSelectedEvent}
                onAddPersonalEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
                onOpenAddModal={() => setAddModalOpen(true)}
                onOpenEditModal={(ev) => setEditingEvent(ev)}
              />
            </div>
          </div>
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
        onOpenEdit={(ev) => setEditingEvent(ev)}
      />

      <AddEventModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddEvent}
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
            'fixed bottom-5 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-medium shadow-xl sm:left-auto sm:right-5 sm:max-w-md backdrop-blur-md transition-all',
            (typeof toast === 'object' && toast.type === 'error') || (typeof toast === 'string' && toast.toLowerCase().includes('gagal'))
              ? 'border-rose-200 bg-rose-50/95 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/90 dark:text-rose-200'
              : 'border-emerald-200 bg-white/95 text-zinc-800 dark:border-emerald-900/60 dark:bg-slate-900/95 dark:text-slate-100',
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
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
