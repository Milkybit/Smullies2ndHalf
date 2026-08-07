// Storage-abstractielaag van Doel1.
//
// Alle schermen praten uitsluitend met deze module. Achter deze interface zit
// nu een localStorage-implementatie; in fase 6 komt hier een
// Supabase-implementatie achter dezelfde interface, zonder dat de schermen
// veranderen. Tabel- en veldnamen zijn identiek aan het datamodel
// (straks supabase/schema.sql) zodat de migratie triviaal is.

import { SEED_GERECHTEN, SEED_VASTE_BOODSCHAPPEN, SEED_STANDAARDDAG, SEED_VERSIE } from './seed.js'
import { jaarWeekKey } from './logic/week.js'
import { rotatieWeekNummer, standaardWeekmenu, bouwBoodschappenlijst, MAALTIJD_STANDAARD } from './logic/rotatie.js'

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

// Zaait gerechten en instellingen bij de eerste start. Een nieuwe seed-versie
// (bijv. extra maaltijdsoorten) vervangt de gerechtenlijst — die is in de app
// zelf niet te bewerken, dus dat is veilig. `nu` is injecteerbaar voor tests.
export function initStorage(nu = new Date()) {
  const instellingen = lees('instellingen', {})
  if (instellingen.seed_versie !== SEED_VERSIE) {
    schrijf('gerechten', SEED_GERECHTEN)
    // Weekmenu en boodschappen kunnen naar vervallen gerecht-id's wijzen of
    // op 'geen' staan uit een oudere seed; ze vervallen mee, zodat
    // getWeekmenu het verse rotatievoorstel (en o1/l1) opnieuw genereert.
    // Sessies, metingen, droge dagen en doelen blijven onaangeroerd.
    globalThis.localStorage.removeItem(PREFIX + 'weekmenu')
    globalThis.localStorage.removeItem(PREFIX + 'boodschappen')
    instellingen.seed_versie = SEED_VERSIE
  }
  if (!instellingen.rotatie_start_jaar_week) {
    instellingen.rotatie_start_jaar_week = jaarWeekKey(nu)
  }
  schrijf('instellingen', instellingen)
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

// De standaarddag komt rechtstreeks uit het plan en is niet bewerkbaar.
export function getStandaarddag() {
  return SEED_STANDAARDDAG
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

// Levert het weekmenu (ontbijt, lunch, diner per dag); bestaat het nog
// niet, dan wordt het standaardmenu gegenereerd en bewaard: diners uit de
// rotatie (kook_factor 2 → elk gerecht op 2 dagen; za = zaterdagse tafel,
// leeg), ontbijt en lunch op de standaarddag-gerechten. Oudere rijen worden
// genormaliseerd; onbekende gerecht-id's (van eerdere seeds) vallen terug
// op de standaard.
export function getWeekmenu(weekKey) {
  const alles = lees('weekmenu', [])
  const bekend = new Set(getGerechten().map((g) => g.id))
  let rijen = alles.filter((r) =>
    r.jaar_week === weekKey && ['ontbijt', 'lunch', 'diner'].includes(r.maaltijd || 'diner')
  )
  if (rijen.length === 0) {
    rijen = standaardWeekmenu(weekKey, getGerechten(), getRotatieWeek(weekKey))
    schrijf('weekmenu', alles.concat(rijen))
    return rijen
  }
  let gewijzigd = false
  for (const rij of rijen) {
    if (!rij.maaltijd) { rij.maaltijd = 'diner'; gewijzigd = true }
    if (!rij.porties) { rij.porties = 1; gewijzigd = true }
    if (rij.gerecht_id && !bekend.has(rij.gerecht_id)) {
      rij.gerecht_id = MAALTIJD_STANDAARD[rij.maaltijd] || null
      gewijzigd = true
    }
  }
  for (const maaltijd of ['ontbijt', 'lunch', 'diner']) {
    for (const dag of ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']) {
      if (!rijen.some((r) => r.dag === dag && r.maaltijd === maaltijd)) {
        const nieuw = {
          jaar_week: weekKey, dag, maaltijd,
          gerecht_id: MAALTIJD_STANDAARD[maaltijd] || null,
          porties: 1,
        }
        rijen.push(nieuw)
        alles.push(nieuw)
        gewijzigd = true
      }
    }
  }
  if (gewijzigd) schrijf('weekmenu', alles)
  return rijen
}

function wijzigWeekmenu(weekKey, dag, maaltijd, wijziging) {
  getWeekmenu(weekKey) // garandeert dat de rijen bestaan
  const alles = lees('weekmenu', [])
  const rij = alles.find((r) =>
    r.jaar_week === weekKey && r.dag === dag && (r.maaltijd || 'diner') === maaltijd
  )
  Object.assign(rij, wijziging)
  schrijf('weekmenu', alles)
}

// Zelf een gerecht kiezen voor een dag en maaltijd (null = niets gepland).
export function zetWeekmenuGerecht(weekKey, dag, maaltijd, gerechtId) {
  wijzigWeekmenu(weekKey, dag, maaltijd, { gerecht_id: gerechtId })
}

// Porties ophogen of verlagen (1–9), voor een exacte lijst.
export function zetWeekmenuPorties(weekKey, dag, maaltijd, porties) {
  wijzigWeekmenu(weekKey, dag, maaltijd, { porties: Math.max(1, Math.min(9, porties)) })
}

// Terug naar het rotatievoorstel voor deze week. Alleen de diners worden
// gereset; gekozen ontbijt, lunch en snacks blijven staan.
export function herstelWeekmenu(weekKey) {
  const rest = lees('weekmenu', []).filter((r) =>
    !(r.jaar_week === weekKey && (r.maaltijd || 'diner') === 'diner')
  )
  const dinerRijen = standaardWeekmenu(weekKey, getGerechten(), getRotatieWeek(weekKey))
    .filter((r) => r.maaltijd === 'diner')
  schrijf('weekmenu', rest.concat(dinerRijen))
  return getWeekmenu(weekKey)
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
