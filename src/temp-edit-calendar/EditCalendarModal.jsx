import { useMemo, useState } from 'react'
import { ChevronDown, ClipboardCopy, FileUp, Plus, RotateCcw, Trash2, X } from 'lucide-react'
import { FACULTIES } from '../data/calendarData'
import { GUEST_CATEGORIES, GUEST_CATEGORY_KEYS, PMB_STEPS } from '../data/guestCalendar'
import { cn } from '../utils/calendarUtils'
import { formatRange, hasDate, isISO } from '../utils/guestDates'

const inputCls =
  'h-9 w-full rounded-lg border border-line bg-white px-3 text-sm focus:border-zinc-900 focus:outline-none disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-500'
const labelCls = 'mb-1 block text-xs font-medium text-zinc-600 dark:text-slate-400'

const newId = () => `tmp-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

const blankEvent = () => ({
  id: newId(),
  category: 'akademik',
  title: '',
  start: null,
  end: null,
  time: '',
  location: '',
  note: '',
  faculty: 'Semua Fakultas',
  verified: true,
})

/* Rapikan sebelum disimpan: tanggal tidak valid → null, akhir < awal → sama dengan awal. */
function normalize(ev) {
  const start = isISO(ev.start) ? ev.start : null
  let end = start && isISO(ev.end) ? ev.end : start
  if (start && end < start) end = start
  const out = { ...ev, title: (ev.title || '').trim() || 'Agenda tanpa judul', start, end }
  // Kolom PMB bersifat opsional: kosongkan bila tidak dipakai.
  if (!out.intake) delete out.intake
  if (!out.step) {
    delete out.step
    delete out.wave
  }
  if (out.step !== 'tes' || !Number(out.wave)) delete out.wave
  else out.wave = Number(out.wave)
  return out
}

export default function EditCalendarModal({ events, isCustom, onSave, onReset, onClose, onDisable }) {
  const [draft, setDraft] = useState(() => events.map((e) => ({ ...e })))
  const [openId, setOpenId] = useState(null)
  const [query, setQuery] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [message, setMessage] = useState('')

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? draft.filter((e) => e.title.toLowerCase().includes(q)) : draft
  }, [draft, query])

  const update = (id, patch) => setDraft((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  const remove = (id) => setDraft((prev) => prev.filter((e) => e.id !== id))

  const add = () => {
    const ev = blankEvent()
    setDraft((prev) => [ev, ...prev])
    setOpenId(ev.id)
    setQuery('')
  }

  const copyJson = async () => {
    const text = JSON.stringify(draft.map(normalize), null, 2)
    try {
      await navigator.clipboard.writeText(text)
      setMessage('JSON disalin. Tempel menggantikan isi array GUEST_EVENTS di src/data/guestCalendar.js.')
    } catch {
      setImportOpen(true)
      setImportText(text)
      setMessage('Gagal menyalin otomatis — salin manual dari kotak di bawah.')
    }
  }

  const importJson = () => {
    try {
      const parsed = JSON.parse(importText)
      if (!Array.isArray(parsed)) throw new Error('Harus berupa array')
      const cleaned = parsed
        .filter((e) => e && typeof e === 'object' && e.title)
        .map((e) => ({
          ...blankEvent(),
          ...e,
          id: e.id || newId(),
          category: GUEST_CATEGORIES[e.category] ? e.category : 'akademik',
        }))
      setDraft(cleaned)
      setImportOpen(false)
      setImportText('')
      setMessage(`${cleaned.length} agenda diimpor ke draf. Klik "Simpan" untuk menerapkan.`)
    } catch (err) {
      setMessage(`Impor gagal: ${err.message}`)
    }
  }

  const save = () => {
    onSave(draft.map(normalize))
    onClose()
  }

  const reset = () => {
    if (!window.confirm('Kembalikan semua agenda ke data bawaan (src/data/guestCalendar.js)? Hasil edit lokal akan dihapus.')) return
    onReset()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-0 backdrop-blur-xs sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit Kalender (sementara)"
        className="flex h-dvh w-full max-w-3xl flex-col overflow-hidden bg-white shadow-xl dark:bg-slate-900 sm:h-[90dvh] sm:rounded-2xl sm:border sm:border-line dark:sm:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4 dark:border-slate-800">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight">
              Edit Kalender
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                Sementara
              </span>
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-slate-400">
              Perubahan hanya tersimpan di browser ini. Agar berlaku untuk semua pengunjung, klik{' '}
              <strong>Salin JSON</strong> lalu tempel ke <code>src/data/guestCalendar.js</code>.
              {isCustom && ' Saat ini memakai draf lokal.'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="icon-btn shrink-0 cursor-pointer" aria-label="Tutup">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3 dark:border-slate-800">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari agenda..."
            className="h-8 min-w-0 flex-1 rounded-md border border-line bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-slate-800 dark:bg-slate-950 dark:focus:ring-white/10"
          />
          <button type="button" onClick={add} className="toolbtn">
            <Plus className="size-3.5" /> Tambah
          </button>
          <button type="button" onClick={copyJson} className="toolbtn">
            <ClipboardCopy className="size-3.5" /> Salin JSON
          </button>
          <button type="button" onClick={() => setImportOpen((v) => !v)} className="toolbtn">
            <FileUp className="size-3.5" /> Impor
          </button>
        </div>

        {(message || importOpen) && (
          <div className="flex flex-col gap-2 border-b border-line bg-zinc-50 px-5 py-3 text-xs dark:border-slate-800 dark:bg-slate-950/50">
            {message && <p className="text-zinc-600 dark:text-slate-300">{message}</p>}
            {importOpen && (
              <>
                <textarea
                  rows={6}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Tempel array JSON agenda di sini..."
                  className="w-full rounded-lg border border-line bg-white p-2.5 font-mono text-[11px] focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
                />
                <div>
                  <button type="button" onClick={importJson} className="toolbtn">Terapkan impor ke draf</button>
                </div>
              </>
            )}
          </div>
        )}

        <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto dark:divide-slate-800">
          {shown.length === 0 && <li className="p-5 text-sm text-zinc-500">Tidak ada agenda.</li>}
          {shown.map((ev) => {
            const open = openId === ev.id
            return (
              <li key={ev.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : ev.id)}
                  aria-expanded={open}
                  className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left hover:bg-zinc-50 dark:hover:bg-slate-800/40"
                >
                  <span className={cn('size-2 shrink-0 rounded-full', GUEST_CATEGORIES[ev.category]?.dot)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{ev.title || '(tanpa judul)'}</span>
                    <span className="block text-xs text-zinc-500 dark:text-slate-400">
                      {hasDate(ev) ? formatRange(ev.start, isISO(ev.end) ? ev.end : ev.start) : 'Belum diumumkan'}
                      {ev.step === 'tes' && ev.wave ? ` · Gel. ${ev.wave}` : ''}
                    </span>
                  </span>
                  <ChevronDown className={cn('size-4 shrink-0 text-zinc-400 transition', open && 'rotate-180')} />
                </button>

                {open && (
                  <div className="grid gap-3 bg-zinc-50/60 px-5 pb-5 pt-2 dark:bg-slate-950/30 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Judul</label>
                      <input className={inputCls} value={ev.title} onChange={(e) => update(ev.id, { title: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Kategori</label>
                      <select className={inputCls} value={ev.category} onChange={(e) => update(ev.id, { category: e.target.value })}>
                        {GUEST_CATEGORY_KEYS.map((k) => (
                          <option key={k} value={k}>{GUEST_CATEGORIES[k].label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Target fakultas</label>
                      <select className={inputCls} value={ev.faculty || 'Semua Fakultas'} onChange={(e) => update(ev.id, { faculty: e.target.value })}>
                        {FACULTIES.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-3 sm:col-span-2 sm:grid-cols-[1fr_1fr_88px]">
                      <div>
                        <label className={labelCls}>Tahap PMB (opsional)</label>
                        <select className={inputCls} value={ev.step || ''} onChange={(e) => update(ev.id, { step: e.target.value })}>
                          <option value="">— bukan PMB —</option>
                          {PMB_STEPS.map((st) => (
                            <option key={st.key} value={st.key}>{st.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Periode penerimaan</label>
                        <input className={inputCls} value={ev.intake || ''} placeholder="Semester I 2027/2028" onChange={(e) => update(ev.id, { intake: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelCls}>Gelombang</label>
                        <input type="number" min={1} className={inputCls} disabled={ev.step !== 'tes'} value={ev.wave || ''} onChange={(e) => update(ev.id, { wave: e.target.value })} />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-slate-300 sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={!isISO(ev.start)}
                        onChange={(e) => update(ev.id, e.target.checked ? { start: null, end: null } : { start: todayStr(), end: todayStr() })}
                      />
                      Tanggal belum diumumkan
                    </label>
                    <div>
                      <label className={labelCls}>Tanggal mulai</label>
                      <input
                        type="date"
                        className={inputCls}
                        disabled={!isISO(ev.start)}
                        value={isISO(ev.start) ? ev.start : ''}
                        onChange={(e) => update(ev.id, { start: e.target.value || null, end: isISO(ev.end) && ev.end >= e.target.value ? ev.end : e.target.value || null })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Tanggal selesai</label>
                      <input
                        type="date"
                        className={inputCls}
                        disabled={!isISO(ev.start)}
                        min={isISO(ev.start) ? ev.start : undefined}
                        value={isISO(ev.end) ? ev.end : isISO(ev.start) ? ev.start : ''}
                        onChange={(e) => update(ev.id, { end: e.target.value || ev.start })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Waktu</label>
                      <input className={inputCls} value={ev.time || ''} placeholder="08.00 WITA" onChange={(e) => update(ev.id, { time: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>Lokasi / platform</label>
                      <input className={inputCls} value={ev.location || ''} onChange={(e) => update(ev.id, { location: e.target.value })} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Keterangan</label>
                      <textarea rows={2} className="w-full rounded-lg border border-line bg-white p-3 text-sm focus:border-zinc-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950" value={ev.note || ''} onChange={(e) => update(ev.id, { note: e.target.value })} />
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:col-span-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-slate-300">
                        <input type="checkbox" checked={Boolean(ev.verified)} onChange={(e) => update(ev.id, { verified: e.target.checked })} />
                        Sudah dicocokkan dengan kalender resmi
                      </label>
                      <button
                        type="button"
                        onClick={() => remove(ev.id)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="size-3.5" /> Hapus agenda
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3 dark:border-slate-800">
          <div className="flex items-center gap-1">
            <button type="button" onClick={reset} className="toolbtn">
              <RotateCcw className="size-3.5" /> Reset ke data bawaan
            </button>
            <button type="button" onClick={onDisable} className="toolbtn" title="Sembunyikan tombol Edit Kalender di browser ini">
              Matikan mode edit
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="toolbtn">Batal</button>
            <button
              type="button"
              onClick={save}
              className="inline-flex h-8 cursor-pointer items-center rounded-md bg-zinc-900 px-4 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
