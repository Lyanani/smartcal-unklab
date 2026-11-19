import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { AlertTriangle, Plus, Sparkles, Trash2 } from 'lucide-react'
import { functions, isAppCheckConfigured } from './client'
import {
  findAvailableTime,
  formatTimeInput,
  getEventConflicts,
  parseTimeInput,
} from '../src/utils/calendarUtils'
import { isFirebaseConfigured } from '../src/firebase'

const draftToEvent = (draft) => ({
  start: draft.day,
  end: draft.day,
  time: draft.timeMinutes === null ? '' : `${formatTimeInput(draft.timeMinutes)} WITA`,
  durationMinutes: draft.durationMinutes,
  title: draft.title,
})

export default function ScheduleAssistant({ user, events, onAddPersonalEvent }) {
  const [prompt, setPrompt] = useState('')
  const [defaultDay, setDefaultDay] = useState(19)
  const [drafts, setDrafts] = useState([])
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    if (generating) return
    setGenerating(true)
    try {
      if (!isFirebaseConfigured || !functions) {
        throw new Error('Firebase Functions belum dikonfigurasi untuk Asisten AI.')
      }
      if (!isAppCheckConfigured && !import.meta.env.DEV) {
        throw new Error('Tambahkan VITE_FIREBASE_APPCHECK_SITE_KEY ke .env.local untuk mengaktifkan App Check.')
      }

      const callScheduleAssistant = httpsCallable(functions, 'parseScheduleRequest', { timeout: 80_000 })
      const response = await callScheduleAssistant({ instructions: prompt, defaultDay: Number(defaultDay) })
      const requests = response.data?.tasks
      if (!Array.isArray(requests) || requests.length === 0) {
        throw new Error('AI tidak menemukan kegiatan pada permintaan tersebut.')
      }

      const plannedEvents = []
      const nextDrafts = requests.map((request, index) => {
        let timeMinutes = request.requestedTime ? parseTimeInput(request.requestedTime) : null
        if (request.requestedTime && timeMinutes === null) {
          throw new Error(`Jam "${request.requestedTime}" dari AI tidak valid.`)
        }

        let noAvailableTime = false
        if (timeMinutes === null) {
          timeMinutes = findAvailableTime(request.day, request.durationMinutes, [...events, ...plannedEvents])
          if (timeMinutes === null) {
            timeMinutes = 8 * 60
            noAvailableTime = true
          }
        }

        const draft = { ...request, id: `${Date.now()}-${index}`, timeMinutes, noAvailableTime }
        plannedEvents.push(draftToEvent(draft))
        return draft
      })
      setDrafts(nextDrafts)
      setMessage('')
    } catch (error) {
      setDrafts([])
      const message =
        import.meta.env.DEV && error.code === 'functions/internal'
          ? `Functions Emulator gagal memproses permintaan. Pastikan emulator berjalan di 127.0.0.1:5001 dan memakai project ID yang sama. Detail: ${error.message}`
          : error.message || 'Periksa konfigurasi Firebase dan penyedia AI.'
      setMessage(`Gagal menyusun jadwal: ${message}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!drafts.length || saving) return
    setSaving(true)
    try {
      for (const draft of drafts) {
        if (draft.timeMinutes === null) throw new Error(`Pilih waktu untuk "${draft.title}" sebelum menyimpan.`)
        await onAddPersonalEvent({
          start: draft.day,
          end: draft.day,
          category: 'pribadi',
          faculty: user.faculty,
          isPersonal: true,
          ownerEmail: user.email || 'guest',
          title: draft.title,
          time: `${formatTimeInput(draft.timeMinutes).replace(':', '.')} WITA`,
          durationMinutes: draft.durationMinutes,
          location: 'Mandiri / Online',
          description: `Jadwal pribadi yang disusun dengan Asisten Jadwal untuk ${user.name}.`,
        })
      }
      setDrafts([])
      setPrompt('')
      setMessage(`${drafts.length} jadwal berhasil ditambahkan.`)
    } catch (error) {
      setMessage(`Jadwal belum tersimpan: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-5 border-t border-line pt-4 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-violet-600 dark:text-violet-400" />
        <h3 className="text-sm font-semibold">Asisten Penyusun Jadwal</h3>
      </div>
      <p className="mt-1 text-xs text-zinc-500 dark:text-slate-400">
        AI memahami permintaanmu; sistem memilih jam kosong dan memeriksa bentrok dengan agenda kampus serta
        jadwal pribadimu. Hanya teks permintaan yang dikirim ke penyedia AI.
      </p>
      <textarea
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={'Contoh:\nTanggal 19 belajar kalkulus selama 2 jam\nTanggal 20 jam 14 rapat kelompok'}
        className="mt-3 w-full rounded-lg border border-line bg-white p-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
      />
      <div className="mt-2 flex flex-wrap items-end gap-2">
        <label className="text-xs font-medium text-zinc-600 dark:text-slate-400">
          Tanggal default (Nov 2026)
          <input
            type="number"
            min={1}
            max={30}
            value={defaultDay}
            onChange={(e) => setDefaultDay(e.target.value)}
            className="mt-1 h-9 w-28 rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
          />
        </label>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!prompt.trim() || generating}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 text-xs font-medium text-violet-800 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-200"
        >
          <Sparkles className="size-3.5" />
        {generating ? 'Menyusun jadwal...' : 'Susun jadwal'}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-zinc-400 dark:text-slate-500">
        Sebutkan tanggal dan, bila perlu, jam serta durasi. Jika tanggal tidak disebutkan, tanggal default akan digunakan.
      </p>

      {message && (
        <p className="mt-3 rounded-lg bg-canvas px-3 py-2 text-xs text-zinc-600 dark:bg-slate-950 dark:text-slate-300">
          {message}
        </p>
      )}

      {drafts.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {drafts.map((draft) => {
            const otherDraftEvents = drafts.filter((other) => other.id !== draft.id).map(draftToEvent)
            const conflicts = getEventConflicts(draftToEvent(draft), [...events, ...otherDraftEvents])
            return (
              <div
                key={draft.id}
                className="rounded-lg border border-line bg-canvas/70 p-3 dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{draft.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-slate-400">
                      {draft.day} November 2026 Â· {Math.floor(draft.durationMinutes / 60)} jam
                      {draft.durationMinutes % 60 ? ` ${draft.durationMinutes % 60} menit` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrafts((prev) => prev.filter((item) => item.id !== draft.id))}
                    aria-label={`Hapus ${draft.title} dari rancangan`}
                    className="cursor-pointer text-zinc-400 hover:text-rose-500"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <label className="mt-2 flex items-center gap-2 text-xs text-zinc-600 dark:text-slate-400">
                  Jam
                  <input
                    type="time"
                    value={draft.timeMinutes === null ? '' : formatTimeInput(draft.timeMinutes)}
                    onChange={(e) => {
                      const [hour, minute] = e.target.value.split(':').map(Number)
                      const timeMinutes = e.target.value ? hour * 60 + minute : null
                      setDrafts((prev) =>
                        prev.map((item) => (item.id === draft.id ? { ...item, timeMinutes } : item)),
                      )
                    }}
                    className="h-8 rounded-md border border-line bg-white px-2 text-sm text-zinc-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>
                {draft.noAvailableTime && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    Tidak ditemukan slot kosong. Pilih jam lain secara manual.
                  </p>
                )}
                {conflicts.length > 0 && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    Bentrok dengan {conflicts.map((event) => `"${event.title}"`).join(', ')}.
                  </p>
                )}
              </div>
            )
          })}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || drafts.some((draft) => draft.timeMinutes === null)}
            className="mt-1 inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-violet-600 px-4 text-xs font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-3.5" />
            {saving ? 'Menyimpan...' : `Tambahkan ${drafts.length} jadwal`}
          </button>
        </div>
      )}
    </div>
  )
}
