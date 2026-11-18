import { useCallback, useState } from 'react'

export const STORAGE_KEY = 'smartcal-temp-calendar-v1'
export const FLAG_KEY = 'smartcal-temp-edit-enabled'

const read = (key) => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
const write = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* localStorage bisa ditolak (mode privat); fitur tetap jalan untuk sesi ini */
  }
}

/* Mode edit aktif bila: mode dev (npm run dev), atau URL memuat ?edit=1
   (diingat di browser ini), dan dimatikan lewat ?edit=0. */
export function isEditEnabled() {
  try {
    const param = new URLSearchParams(window.location.search).get('edit')
    if (param === '1') write(FLAG_KEY, '1')
    if (param === '0') write(FLAG_KEY, null)
    if (param === '0') return false
  } catch {
    /* abaikan */
  }
  return Boolean(import.meta.env?.DEV) || read(FLAG_KEY) === '1'
}

export function disableEditMode() {
  write(FLAG_KEY, null)
}

function loadOverride() {
  const raw = read(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

/* Menyimpan hasil edit di localStorage (hanya di browser ini). */
export function useStoredEvents(base, enabled) {
  const [override, setOverride] = useState(() => (enabled ? loadOverride() : null))

  const save = useCallback((next) => {
    write(STORAGE_KEY, JSON.stringify(next))
    setOverride(next)
  }, [])

  const reset = useCallback(() => {
    write(STORAGE_KEY, null)
    setOverride(null)
  }, [])

  return {
    events: enabled && override ? override : base,
    isCustom: Boolean(enabled && override),
    save,
    reset,
  }
}
