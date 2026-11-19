import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import {
  ArrowRight,
  CalendarRange,
  GraduationCap,
  KeyRound,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import { aiAuth } from '../../ai/client.js'
import { cn } from '../utils/calendarUtils'

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

const mapFirebaseAuthError = (code) => {
  if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
    return 'Email atau kata sandi Firebase tidak cocok dengan akun yang terdaftar.'
  }
  if (code === 'auth/too-many-requests') {
    return 'Terlalu banyak percobaan login. Tunggu sebentar lalu coba lagi.'
  }
  if (code === 'auth/network-request-failed') {
    return 'Gagal terhubung ke server Firebase. Periksa koneksi internet kamu.'
  }
  return 'Gagal memverifikasi akun Firebase. Periksa kembali email dan kata sandi.'
}

export default function LoginScreen({ onLogin, onBack, dark, onToggleTheme }) {
  const [role, setRole] = useState('mahasiswa')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [faculty, setFaculty] = useState('Fakultas Ilmu Komputer (FILKOM)')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = email.trim()

    if (!trimmed || !trimmed.includes('@')) {
      setError(
        role === 'admin'
          ? 'Masukkan email akun admin yang terdaftar pada VITE_ADMIN_EMAILS.'
          : 'Masukkan alamat Gmail aktif untuk menerima pengingat jadwal.',
      )
      return
    }

    const namePart = trimmed.split('@')[0].replace(/[._]/g, ' ')
    const displayName = namePart
      .split(' ')
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
      .join(' ')

    if (role === 'admin') {
      if (ADMIN_EMAILS.length === 0) {
        setError('VITE_ADMIN_EMAILS belum diatur pada file .env.')
        return
      }
      if (!ADMIN_EMAILS.includes(trimmed.toLowerCase())) {
        setError('Email tidak terdaftar pada VITE_ADMIN_EMAILS.')
        return
      }
      onLogin({
        role: 'admin',
        email: trimmed,
        name: displayName || 'Admin Akademik',
        faculty: 'Admin',
      })
      return
    }

    const passTrimmed = password.trim()
    if (!passTrimmed) {
      setError('Masukkan kata sandi Firebase terlebih dahulu.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const credential = await signInWithEmailAndPassword(aiAuth, trimmed, passTrimmed)
      const verifiedEmail = credential.user?.email || trimmed

      onLogin({
        role: 'mahasiswa',
        email: verifiedEmail,
        uid: credential.user?.uid,
        name: displayName || 'Mahasiswa UNKLAB',
        faculty,
      })
    } catch (err) {
      setError(mapFirebaseAuthError(err?.code))
    } finally {
      setSubmitting(false)
    }
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
                onClick={() => {
                  setRole('mahasiswa')
                  setError('')
                }}
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
                onClick={() => {
                  setRole('admin')
                  setError('')
                }}
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
              {role === 'admin' ? 'Email Akun Admin Lokal' : 'Alamat Gmail Aktif (Tujuan Pengingat)'}
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
                placeholder={role === 'admin' ? 'admin@kampus.ac.id' : 'nama.kamu@gmail.com'}
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-500"
              />
            </div>
          </div>

          {role === 'admin' ? (
            <p className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
              Admin masuk lokal di browser ini; email harus ada pada VITE_ADMIN_EMAILS.
            </p>
          ) : (
            <>
              <div>
                <label htmlFor="firebase-token-input" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-slate-400">
                  Kata Sandi Firebase
                </label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="firebase-token-input"
                    name="smartcal-firebase-token"
                    type="password"
                    autoComplete="off"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    placeholder="Masukkan kata sandi Firebase"
                    className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-500"
                  />
                </div>
              </div>

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
            </>
          )}

          {error && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 inline-flex h-11 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {submitting ? 'Memverifikasi Firebase...' : 'Masuk ke Portal Akademik'}
            <ArrowRight className="size-4" />
          </button>
        </form>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-4 w-full cursor-pointer text-center text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-slate-400 dark:hover:text-slate-100"
          >
            ← Kembali ke Dashboard Tamu
          </button>
        )}

        <p className="mt-5 border-t border-line pt-4 text-center text-[11px] text-zinc-400 dark:border-slate-800 dark:text-slate-500">
          Semester Ganjil 2026/2027 · Universitas Klabat Airmadidi
        </p>
      </div>
    </div>
  )
}

export { LoginScreen }
