// Storage-abstractielaag van Doel1.
//
// Alle schermen praten uitsluitend met deze module. Achter deze interface zit
// nu een localStorage-implementatie; in fase 6 komt hier een
// Supabase-implementatie achter dezelfde interface, zonder dat de schermen
// veranderen. Tabel- en veldnamen zijn identiek aan het datamodel
// (straks supabase/schema.sql) zodat de migratie triviaal is.

import { SEED_GERECHTEN, SEED_VASTE_BOODSCHAPPEN } from './seed.js'
import { jaarWeekKey } from './logic/week.js'
import { rotatieWeekNummer, standaardWeekmenu, bouwBoodschappenlijst } from './logic/rotatie.js'

const PREFIX = 'doel1.'

function lees(tabel, fallback) {
  const ruw = globalThis.localStorage.getItem(PREFIX + tabel)
  if (ruw === null) return fallback
  try {
    return JSON.parse(ruw)
  } catch {
    return fallback
  }
}

function schrijf(tabel, data) {
  globalThis.localStorage.setItem(PREFIX + tabel, JSON.stringify(data))
}

function nieuwId() {
  return globalThis.crypto && globalThis.crypto.randomUUID
    ? globalThis.crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2)
}

// ---- init ------------------------------------------------------------------

// Zaait gerechten en instellingen bij de eerste start. `nu` is injecteerbaar
// voor tests; standaard vandaag.
export function initStorage(nu = new Date()) {
  if (globalThis.localStorage.getItem(PREFIX + 'gerechten') === null) {
    schrijf('gerechten', SEED_GERECHTEN)
  }
  const instellingen = lees('instellingen', {})
  if (!instellingen.rotatie_start_jaar_week) {
    instellingen.rotatie_start_jaar_week = jaarWeekKey(nu)
    schrijf('instellingen', instellingen)
  }
}

export function getInstellingen() {
  return lees('instellingen', {})
}

export function zetInstelling(naam, waarde) {
  const instellingen = lees('instellingen', {})
  instellingen[naam] = waarde
  schrijf('instellingen', instellingen)
}

// ---- gerechten -------------------------------------------------------------

export function getGerechten() {
  return lees('gerechten', [])
}

export function getGerecht(id) {
  return getGerechten().find((g) => g.id === id) || null
}

// ---- sessies ---------------------------------------------------------------

export function getSessies() {
  return lees('sessies', [])
}

// Upsert op datum+anker. Voor maandag regelt `mini` de driestand:
// niet aanwezig = niet, mini=false = vol, mini=true = mini.
export function saveSessie({ datum, anker, mini = false }) {
  const sessies = getSessies()
  const bestaand = sessies.find((s) => s.datum === datum && s.anker === anker)
  if (bestaand) {
    bestaand.mini = mini
  } else {
    sessies.push({ id: nieuwId(), datum, anker, mini })
  }
  schrijf('sessies', sessies)
}

export function verwijderSessie(datum, anker) {
  schrijf('sessies', getSessies().filter((s) => !(s.datum === datum && s.anker === anker)))
}

// ---- metingen --------------------------------------------------------------

export function getMetingen() {
  return lees('metingen', []).slice().sort((a, b) => a.datum.localeCompare(b.datum))
}

// Upsert op datum (meting alleen op zaterdag — het scherm bewaakt dat).
export function saveMeting({ datum, gewicht, vet_pct }) {
  const metingen = lees('metingen', [])
  const bestaand = metingen.find((m) => m.datum === datum)
  if (bestaand) {
    bestaand.gewicht = gewicht
    bestaand.vet_pct = vet_pct
  } else {
    metingen.push({ id: nieuwId(), datum, gewicht, vet_pct })
  }
  schrijf('metingen', metingen)
}

// ---- weekmenu --------------------------------------------------------------

export function getRotatieWeek(weekKey) {
  const start = getInstellingen().rotatie_start_jaar_week || weekKey
  return rotatieWeekNummer(weekKey, start)
}

// Levert het weekmenu van een week; bestaat het nog niet, dan wordt het
// standaardmenu uit de rotatie gegenereerd en bewaard.
export function getWeekmenu(weekKey) {
  const alles = lees('weekmenu', [])
  let rijen = alles.filter((r) => r.jaar_week === weekKey)
  if (rijen.length === 0) {
    rijen = standaardWeekmenu(weekKey, getGerechten(), getRotatieWeek(weekKey))
    schrijf('weekmenu', alles.concat(rijen))
  }
  return rijen
}

// ---- boodschappen ----------------------------------------------------------

export function getBoodschappen(weekKey) {
  return lees('boodschappen', []).filter((b) => b.jaar_week === weekKey)
}

// Bouwt de lijst voor een week (vaste lijst + weekaanvulling). Bestaat er al
// een lijst, dan blijven de vinkjes van gelijknamige items staan.
export function maakBoodschappen(weekKey) {
  const alles = lees('boodschappen', [])
  const oud = alles.filter((b) => b.jaar_week === weekKey)
  const rest = alles.filter((b) => b.jaar_week !== weekKey)
  const nieuw = bouwBoodschappenlijst(
    weekKey, getWeekmenu(weekKey), getGerechten(), SEED_VASTE_BOODSCHAPPEN
  ).map((item) => {
    const eerder = oud.find((b) => b.naam === item.naam && b.vast === item.vast)
    return { id: eerder ? eerder.id : nieuwId(), ...item, afgevinkt: eerder ? eerder.afgevinkt : false }
  })
  schrijf('boodschappen', rest.concat(nieuw))
  return nieuw
}

export function toggleBoodschap(id) {
  const alles = lees('boodschappen', [])
  const item = alles.find((b) => b.id === id)
  if (item) {
    item.afgevinkt = !item.afgevinkt
    schrijf('boodschappen', alles)
  }
}

// ---- droge dagen -----------------------------------------------------------

export function getDrogeDagen() {
  return lees('droge_dagen', []).map((r) => r.datum).sort()
}

// Eén tik per dag: tik toevoegen, nog een tik haalt hem weg.
export function toggleDroog(datum) {
  const alles = lees('droge_dagen', [])
  const bestaand = alles.find((r) => r.datum === datum)
  schrijf('droge_dagen', bestaand
    ? alles.filter((r) => r.datum !== datum)
    : alles.concat({ datum }))
}

// ---- export / import -------------------------------------------------------

const TABELLEN = ['gerechten', 'weekmenu', 'boodschappen', 'sessies',
  'metingen', 'droge_dagen', 'doelen', 'instellingen']

// Reservekopie van alle data als één JSON-object (localStorage is geen back-up).
export function exportData() {
  const data = {}
  for (const tabel of TABELLEN) {
    const ruw = globalThis.localStorage.getItem(PREFIX + tabel)
    if (ruw !== null) data[tabel] = JSON.parse(ruw)
  }
  return data
}

export function importData(data) {
  for (const tabel of TABELLEN) {
    if (tabel in data) schrijf(tabel, data[tabel])
  }
}

// ---- doelen ----------------------------------------------------------------

export function getDoelen() {
  return lees('doelen', [])
}

export function saveDoel({ domein, omschrijving, meetlat = null, richtdatum = null, status = 'actief' }) {
  const doelen = lees('doelen', [])
  doelen.push({ id: nieuwId(), domein, omschrijving, meetlat, richtdatum, status })
  schrijf('doelen', doelen)
}
