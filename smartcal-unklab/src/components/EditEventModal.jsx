import { useEffect, useState } from 'react'
import { AlertTriangle, Calendar, Check, Database, Pencil, Sparkles, X } from 'lucide-react'
import { CAMPUS_CATEGORY_KEYS, CATEGORIES, FACULTIES } from '../data/calendarData'
import { cn } from '../utils/calendarUtils'

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
        className="relative my-auto max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
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
export default function EditEventModal({ open, event, onClose, onSave }) {
  if (!open || !event) return null
  return <EditEventModalInner key={String(event.id)} event={event} onClose={onClose} onSave={onSave} />
}

export { EditEventModal }
