// Pure datum- en weeklogica: ISO-weken, weekstatus, streak en verdien-sloten.
// Domeinregels:
// - Week binnen = alle 5 sporten die week gedaan (Kracht A vol of mini telt).
// - Streak = aantal aaneengesloten weken binnen.
// - streak ≥4 → banden verdiend; maand ≥ oktober én streak ≥4 → Tacx verdiend.

import { SPORT_CODES } from '../domein.js'

const DAG_CODES = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']

export function dagCode(datum) {
  return DAG_CODES[datum.getDay()]
}

export function datumKey(datum) {
  const j = datum.getFullYear()
  const m = String(datum.getMonth() + 1).padStart(2, '0')
  const d = String(datum.getDate()).padStart(2, '0')
  return `${j}-${m}-${d}`
}

export function maandagVan(datum) {
  const d = new Date(datum.getFullYear(), datum.getMonth(), datum.getDate())
  const verschil = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - verschil)
  return d
}

// ISO-weeknummer: de week van 4 januari is week 1.
export function jaarWeekKey(datum) {
  const ma = maandagVan(datum)
  const do_ = new Date(ma)
  do_.setDate(ma.getDate() + 3)
  const jaar = do_.getFullYear()
  const eersteDo = new Date(jaar, 0, 4)
  const week = 1 + Math.round((maandagVan(do_) - maandagVan(eersteDo)) / (7 * 24 * 3600 * 1000))
  return `${jaar}-W${String(week).padStart(2, '0')}`
}

export function maandagVanKey(key) {
  const [jaar, week] = key.split('-W').map(Number)
  const eersteDo = new Date(jaar, 0, 4)
  const ma = maandagVan(eersteDo)
  ma.setDate(ma.getDate() + (week - 1) * 7)
  return ma
}

export function weekDagen(key) {
  const ma = maandagVanKey(key)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ma)
    d.setDate(ma.getDate() + i)
    return d
  })
}

export function vorigeWeekKey(key) {
  const ma = maandagVanKey(key)
  ma.setDate(ma.getDate() - 7)
  return jaarWeekKey(ma)
}

export function volgendeWeekKey(key) {
  const ma = maandagVanKey(key)
  ma.setDate(ma.getDate() + 7)
  return jaarWeekKey(ma)
}

export function wekenTussen(keyA, keyB) {
  return Math.round((maandagVanKey(keyB) - maandagVanKey(keyA)) / (7 * 24 * 3600 * 1000))
}

function sessiesVanWeek(sessies, weekKey) {
  return sessies.filter((s) => jaarWeekKey(new Date(s.datum + 'T12:00:00')) === weekKey)
}

// Per sport de sessies van die week; binnen zodra alle 5 sporten minstens
// één sessie hebben ('extra' telt niet mee). Kracht A vol of mini telt allebei.
export function weekStatus(sessies, weekKey) {
  const week = sessiesVanWeek(sessies, weekKey)
  const perSport = {}
  for (const code of SPORT_CODES) {
    perSport[code] = week.filter((s) => s.anker === code)
  }
  const aantal = SPORT_CODES.filter((code) => perSport[code].length > 0).length
  return { perSport, aantal, binnen: aantal === SPORT_CODES.length }
}

// Streak telt aaneengesloten weken binnen, eindigend bij deze week (als die
// al binnen is) of anders bij vorige week. De lopende week kan de streak dus
// nog niet breken — die telt pas als hij voorbij is.
export function berekenStreak(sessies, vandaag) {
  const huidige = jaarWeekKey(vandaag)
  let streak = 0
  let key = weekStatus(sessies, huidige).binnen ? huidige : vorigeWeekKey(huidige)
  while (weekStatus(sessies, key).binnen) {
    streak += 1
    key = vorigeWeekKey(key)
  }
  return streak
}

// De gemiste-week-zin verschijnt alleen als er vóór deze week al eens
// getraind is (anders is er niets "gemist") en vorige week niet binnen was.
export function vorigeWeekGemist(sessies, vandaag) {
  const vorige = vorigeWeekKey(jaarWeekKey(vandaag))
  const maandagDezeWeek = maandagVan(vandaag)
  const eerder = sessies.some((s) => new Date(s.datum + 'T12:00:00') < maandagDezeWeek)
  return eerder && !weekStatus(sessies, vorige).binnen
}

// Verdien-sloten. Tacx: maand ≥ oktober (of later dat kalenderjaar voorbij:
// eenmaal verdiend blijft verdiend — dat bewaren we via instellingen in storage).
export function sloten(streak, vandaag) {
  const banden = streak >= 4
  const tacx = banden && vandaag.getMonth() + 1 >= 10
  return { banden, tacx }
}
