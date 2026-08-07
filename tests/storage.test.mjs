import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { versStorage } from './shim.mjs'
import * as storage from '../src/storage.js'

// 5 aug 2026 is een dinsdag; de week is 2026-W32.
const NU = new Date(2026, 7, 5)
const WEEK = '2026-W32'

beforeEach(() => {
  versStorage()
  storage.initStorage(NU)
})

test('init zaait alle gerechten: 12 diners in rotatie + ontbijt/lunch/snacks', () => {
  const gerechten = storage.getGerechten()
  assert.equal(gerechten.filter((g) => g.soort === 'diner').length, 12)
  for (const w of [1, 2, 3, 4]) {
    assert.equal(gerechten.filter((g) => g.rotatie_week === w).length, 3)
  }
  assert.ok(gerechten.filter((g) => g.soort === 'ontbijt').length >= 4)
  assert.ok(gerechten.filter((g) => g.soort === 'lunch').length >= 5)
  assert.ok(gerechten.filter((g) => g.soort === 'snack').length >= 5)
})

test('seed-versie: een oudere gerechtenlijst wordt bij init vervangen', () => {
  globalThis.localStorage.setItem('doel1.gerechten', JSON.stringify([{ id: 'oud' }]))
  const instellingen = JSON.parse(globalThis.localStorage.getItem('doel1.instellingen'))
  instellingen.seed_versie = 1
  globalThis.localStorage.setItem('doel1.instellingen', JSON.stringify(instellingen))
  storage.initStorage(NU)
  assert.ok(storage.getGerechten().length >= 26)
})

test('sessies: opslaan, driestand maandag, verwijderen, persistentie', () => {
  storage.saveSessie({ datum: '2026-08-03', anker: 'ma', mini: true })
  assert.deepEqual(storage.getSessies()[0].mini, true)

  // van mini naar vol: upsert op datum+anker, geen tweede rij
  storage.saveSessie({ datum: '2026-08-03', anker: 'ma', mini: false })
  assert.equal(storage.getSessies().length, 1)
  assert.equal(storage.getSessies()[0].mini, false)

  storage.verwijderSessie('2026-08-03', 'ma')
  assert.equal(storage.getSessies().length, 0)
})

test('metingen: upsert op datum en gesorteerd teruggeven', () => {
  storage.saveMeting({ datum: '2026-08-08', gewicht: 84.2, vet_pct: 24.1 })
  storage.saveMeting({ datum: '2026-08-01', gewicht: 84.6, vet_pct: 24.4 })
  storage.saveMeting({ datum: '2026-08-08', gewicht: 84.1, vet_pct: 24.0 })
  const metingen = storage.getMetingen()
  assert.equal(metingen.length, 2)
  assert.equal(metingen[0].datum, '2026-08-01')
  assert.equal(metingen[1].gewicht, 84.1)
})

test('weekmenu: wordt gegenereerd uit de rotatie en daarna bewaard', () => {
  const menu = storage.getWeekmenu(WEEK)
  assert.equal(menu.length, 28)
  const ids = new Set(menu.filter((r) => r.maaltijd === 'diner').map((r) => r.gerecht_id))
  assert.equal(ids.size, 3)
  // tweede aanroep: zelfde menu, niet opnieuw gegenereerd
  assert.deepEqual(storage.getWeekmenu(WEEK), menu)
})

test('weekmenu: gerecht kiezen en porties ophogen werkt door in de lijst', () => {
  const menu = storage.getWeekmenu(WEEK)
  assert.ok(menu.every((r) => r.porties === 1))

  // donderdag een ander diner (uit rotatieweek 3) en 3 porties
  storage.zetWeekmenuGerecht(WEEK, 'do', 'diner', 'd10')
  storage.zetWeekmenuPorties(WEEK, 'do', 'diner', 3)
  const donderdag = storage.getWeekmenu(WEEK)
    .find((r) => r.dag === 'do' && r.maaltijd === 'diner')
  assert.equal(donderdag.gerecht_id, 'd10')
  assert.equal(donderdag.porties, 3)

  // d10 (kipsaté): 200 g kipfilet × 3 porties in de lijst
  const lijst = storage.maakBoodschappen(WEEK)
  const kip = lijst.find((b) => b.naam === 'Kipfilet' && !b.vast)
  assert.ok(kip.hoeveelheid >= 600)

  // dag op '— geen —' zetten haalt het gerecht eruit
  storage.zetWeekmenuGerecht(WEEK, 'do', 'diner', null)
  assert.equal(
    storage.getWeekmenu(WEEK).find((r) => r.dag === 'do' && r.maaltijd === 'diner').gerecht_id,
    null
  )

  // herstel zet de rotatie terug
  const hersteld = storage.herstelWeekmenu(WEEK)
  assert.equal(hersteld.length, 28)
  assert.ok(hersteld.every((r) => r.porties === 1))
})

test('ontbijt/lunch/snack kiezen telt mee in de boodschappenlijst', () => {
  storage.getWeekmenu(WEEK)
  // elke dag hetzelfde ontbijt (b1: 300 g magere kwark per portie)
  for (const dag of ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']) {
    storage.zetWeekmenuGerecht(WEEK, dag, 'ontbijt', 'b1')
  }
  storage.zetWeekmenuGerecht(WEEK, 'ma', 'snack', 's1')
  const lijst = storage.maakBoodschappen(WEEK)
  const kwark = lijst.find((b) => b.naam === 'Magere kwark' && !b.vast)
  assert.equal(kwark.hoeveelheid, 7 * 300)
  assert.ok(lijst.some((b) => !b.vast && b.naam === 'Skyr naturel'))

  // herstel van de diner-rotatie laat het gekozen ontbijt staan
  storage.herstelWeekmenu(WEEK)
  const ontbijtMa = storage.getWeekmenu(WEEK)
    .find((r) => r.dag === 'ma' && r.maaltijd === 'ontbijt')
  assert.equal(ontbijtMa.gerecht_id, 'b1')
})

test('boodschappen: vaste lijst + weekaanvulling, vinkje blijft staan', () => {
  const lijst = storage.maakBoodschappen(WEEK)
  assert.ok(lijst.some((b) => b.vast))
  assert.ok(lijst.some((b) => !b.vast))
  const item = lijst.find((b) => !b.vast)
  storage.toggleBoodschap(item.id)
  assert.equal(storage.getBoodschappen(WEEK).find((b) => b.id === item.id).afgevinkt, true)
  // lijst opnieuw maken: vinkje van gelijknamig item blijft staan
  const opnieuw = storage.maakBoodschappen(WEEK)
  assert.equal(opnieuw.find((b) => b.naam === item.naam && !b.vast).afgevinkt, true)
})

test('droge dagen: één tik per dag, tweede tik haalt weg', () => {
  storage.toggleDroog('2026-08-04')
  storage.toggleDroog('2026-08-05')
  assert.deepEqual(storage.getDrogeDagen(), ['2026-08-04', '2026-08-05'])
  storage.toggleDroog('2026-08-05')
  assert.deepEqual(storage.getDrogeDagen(), ['2026-08-04'])
})

test('export en import: alle tabellen komen ongeschonden terug', () => {
  storage.saveSessie({ datum: '2026-08-03', anker: 'ma', mini: true })
  storage.saveMeting({ datum: '2026-08-01', gewicht: 84.6, vet_pct: 24.4 })
  storage.toggleDroog('2026-08-04')
  const kopie = storage.exportData()

  versStorage()
  storage.importData(kopie)
  assert.equal(storage.getSessies()[0].mini, true)
  assert.equal(storage.getMetingen()[0].gewicht, 84.6)
  assert.deepEqual(storage.getDrogeDagen(), ['2026-08-04'])
  assert.equal(storage.getGerechten().length, 26)
})

test('doelen: opslaan en teruglezen', () => {
  storage.saveDoel({ domein: 'voeding', omschrijving: '−200 kcal correctie' })
  const doelen = storage.getDoelen()
  assert.equal(doelen.length, 1)
  assert.equal(doelen[0].status, 'actief')
})
