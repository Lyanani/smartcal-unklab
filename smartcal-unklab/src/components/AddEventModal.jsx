import { useState } from 'react'
import { X } from 'lucide-react'
import { CAMPUS_CATEGORY_KEYS, CATEGORIES, FACULTIES } from '../data/calendarData'

export default function AddEventModal({ open, onClose, onAdd }) {
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

export { AddEventModal }
