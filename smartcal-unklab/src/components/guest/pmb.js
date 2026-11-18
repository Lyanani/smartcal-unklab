import { compareEvents, endOf, formatRange, getStatus, hasDate } from '../../utils/guestDates'

const STEP_KEYS = ['pendaftaran', 'tes', 'orientasi', 'kuliah']
const ADMISSION = ['pendaftaran', 'tes', 'orientasi']

/* Pilih satu agenda wakil dari daftar: yang sedang berlangsung, lalu yang paling dekat,
   lalu yang terakhir selesai, lalu yang belum bertanggal. */
export function pickRepresentative(list, today) {
  if (!list?.length) return null
  const dated = list.filter(hasDate)
  const ongoing = dated.find((e) => e.start <= today && endOf(e) >= today)
  if (ongoing) return ongoing
  const upcoming = dated.filter((e) => e.start > today).sort(compareEvents)[0]
  if (upcoming) return upcoming
  if (dated.length) return [...dated].sort(compareEvents).at(-1)
  return list[0]
}

/* Kelompokkan agenda PMB per periode penerimaan (intake).
   Periode dianggap selesai bila seluruh tahap penerimaan (pendaftaran, tes,
   orientasi) sudah lewat dan tidak ada yang belum bertanggal. Tahap
   'kuliah' hanya informasi tambahan. */
export function buildIntakes(events, today) {
  const map = new Map()
  events
    .filter((e) => e.intake && STEP_KEYS.includes(e.step))
    .forEach((e) => {
      if (!map.has(e.intake)) {
        map.set(e.intake, {
          key: e.intake,
          intake: e.intake,
          steps: { pendaftaran: [], tes: [], orientasi: [], kuliah: [] },
        })
      }
      map.get(e.intake).steps[e.step].push(e)
    })

  const intakes = [...map.values()]
  intakes.forEach((it) => {
    STEP_KEYS.forEach((k) => it.steps[k].sort(compareEvents))
    const admission = ADMISSION.flatMap((k) => it.steps[k])
    const all = STEP_KEYS.flatMap((k) => it.steps[k])
    const basis = admission.length ? admission : all
    it.admission = admission
    it.done = basis.length > 0 && basis.every((e) => hasDate(e) && endOf(e) < today)
    it.running = admission.some((e) => hasDate(e) && e.start <= today && endOf(e) >= today)
    it.nextDate =
      admission
        .filter((e) => hasDate(e) && endOf(e) >= today)
        .map((e) => e.start)
        .sort()[0] || '9999-12-31'
    const regStart = it.steps.pendaftaran.find(hasDate)?.start
    const firstStart = all.filter(hasDate).map((e) => e.start).sort()[0]
    it.sortKey = regStart || firstStart || '9999-12-31'
  })
  intakes.sort((a, b) => a.sortKey.localeCompare(b.sortKey))

  const active = intakes.filter((it) => !it.done)
  const focus =
    active.find((it) => it.running) ||
    [...active].sort((a, b) => a.nextDate.localeCompare(b.nextDate))[0] ||
    null
  intakes.forEach((it) => {
    it.focus = focus?.key === it.key
  })
  return { intakes, focus }
}

/* Kalimat status pendaftaran untuk hero. */
export function registrationHeadline(intakes, today) {
  const reg = intakes
    .flatMap((it) => it.steps.pendaftaran.map((ev) => ({ it, ev })))
    .filter((x) => hasDate(x.ev))

  const open = reg.find((x) => x.ev.start <= today && endOf(x.ev) >= today)
  if (open) {
    const st = getStatus(open.ev, today)
    return {
      tone: 'emerald',
      title: `Pendaftaran Kuliah ${open.it.intake} sedang dibuka`,
      detail: `${formatRange(open.ev.start, open.ev.end)} · ${st.label}`,
    }
  }
  const next = reg.filter((x) => x.ev.start > today).sort((a, b) => a.ev.start.localeCompare(b.ev.start))[0]
  if (next) {
    const st = getStatus(next.ev, today)
    return {
      tone: 'sky',
      title: `Pendaftaran Kuliah ${next.it.intake} dibuka ${st.label === 'Besok' ? 'besok' : `dalam ${st.days} hari`}`,
      detail: formatRange(next.ev.start, next.ev.end),
    }
  }
  return {
    tone: 'muted',
    title: 'Jadwal pendaftaran berikutnya belum diumumkan',
    detail: 'Pantau kalender akademik resmi untuk pembaruan.',
  }
}
