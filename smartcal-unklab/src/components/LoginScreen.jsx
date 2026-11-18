import { useState } from 'react'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import {
  ArrowRight,
  CalendarRange,
  GraduationCap,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import { auth } from '../firebase'
import { cn } from '../utils/calendarUtils'

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

const getLoginError = (code) => {
  if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
    return 'Email atau kata sandi Firebase tidak valid.'
  }
  if (code === 'auth/too-many-requests') return 'Terlalu banyak percobaan. Coba lagi beberapa saat.'
  if (code === 'auth/network-request-failed') return 'Tidak dapat terhubung ke Firebase. Periksa koneksi internet.'
  if (code === 'auth/operation-not-allowed') return 'Metode Email/Kata Sandi belum diaktifkan di Firebase Console.'
  return 'Gagal masuk. Periksa email, kata sandi, dan koneksi internet.'
}

export default function LoginScreen({ onLogin, onGuest, initialError = '', dark, onToggleTheme }) {
  const [role, setRole] = useState('mahasiswa')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(initialError)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setError('Masukkan email akun yang valid.')
      return
    }

    const emailKey = trimmed.toLowerCase()
    const namePart = trimmed.split('@')[0].replace(/[._]/g, ' ')
    const displayName = namePart
      .split(' ')
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ''))
      .join(' ')

    setError('')
    setSubmitting(true)
    try {
      if (role === 'admin') {
        if (ADMIN_EMAILS.length === 0) {
          throw new Error('Daftarkan email admin pada VITE_ADMIN_EMAILS di file .env.local.')
        }
        if (!ADMIN_EMAILS.includes(emailKey)) {
          throw new Error('Email ini tidak terdaftar sebagai admin lokal.')
        }
        if (auth) await signOut(auth)
        onLogin({
          role: 'admin',
          email: trimmed,
          name: displayName || 'Admin BAA',
          faculty: 'Biro Administrasi Akademik',
        })
        return
      }

      if (!password) throw new Error('Masukkan kata sandi akun Firebase.')
      if (!auth) throw new Error('Firebase Authentication belum dikonfigurasi.')

      const credential = await signInWithEmailAndPassword(auth, trimmed, password)
      const accountEmail = credential.user.email || trimmed
      onLogin({
        role: 'mahasiswa',
        email: accountEmail,
        name: credential.user.displayName || displayName || 'Mahasiswa UNKLAB',
        faculty: 'Semua Fakultas',
      })
    } catch (loginError) {
      setError(loginError.code ? getLoginError(loginError.code) : loginError.message)
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
              Email Akun {role === 'mahasiswa' ? 'Firebase' : 'Admin Lokal'}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
              <input
                id="gmail-input"
                name="smartcal-gmail-login"
                type="email"
                autoComplete={role === 'mahasiswa' ? 'username' : 'off'}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder={role === 'mahasiswa' ? 'nama.kamu@gmail.com' : 'admin@kampus.ac.id'}
                className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-500"
              />
            </div>
          </div>

          {role === 'mahasiswa' && (
            <div>
              <label htmlFor="password-input" className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-slate-400">
                Kata Sandi Firebase
              </label>
              <input
                id="password-input"
                name="smartcal-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                className="h-10 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-500"
              />
            </div>
          )}

          {role === 'admin' && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              Admin masuk lokal di browser ini; email harus ada pada VITE_ADMIN_EMAILS.
            </p>
          )}

          {error && (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 inline-flex h-11 cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {submitting ? 'Memeriksa akun...' : 'Masuk ke Portal Akademik'}
            <ArrowRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={onGuest}
            className="inline-flex h-10 cursor-pointer touch-manipulation items-center justify-center rounded-lg border border-line bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Lihat Kalender Pendaftaran
          </button>
        </form>

        <p className="mt-5 border-t border-line pt-4 text-center text-[11px] text-zinc-400 dark:border-slate-800 dark:text-slate-500">
          Semester Ganjil 2026/2027 · Universitas Klabat Airmadidi
        </p>
      </div>
    </div>
  )
}

export { LoginScreen }
