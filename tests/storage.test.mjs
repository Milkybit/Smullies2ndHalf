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

test('init zaait 12 gerechten, 3 per rotatieweek', () => {
  const gerechten = storage.getGerechten()
  assert.equal(gerechten.length, 12)
  for (const w of [1, 2, 3, 4]) {
    assert.equal(gerechten.filter((g) => g.rotatie_week === w).length, 3)
  }
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
  assert.equal(menu.length, 7)
  const ids = new Set(menu.map((r) => r.gerecht_id))
  assert.equal(ids.size, 3)
  // tweede aanroep: zelfde menu, niet opnieuw gegenereerd
  assert.deepEqual(storage.getWeekmenu(WEEK), menu)
})

test('weekmenu: gerecht kiezen en porties ophogen werkt door in de lijst', () => {
  const menu = storage.getWeekmenu(WEEK)
  assert.ok(menu.every((r) => r.porties === 1))

  // donderdag een ander gerecht (uit rotatieweek 3) en 3 porties
  storage.zetWeekmenuGerecht(WEEK, 'do', 'd10')
  storage.zetWeekmenuPorties(WEEK, 'do', 3)
  const aangepast = storage.getWeekmenu(WEEK)
  const donderdag = aangepast.find((r) => r.dag === 'do')
  assert.equal(donderdag.gerecht_id, 'd10')
  assert.equal(donderdag.porties, 3)

  // d10 (kipsaté): 200 g kipfilet × 3 porties in de lijst
  const lijst = storage.maakBoodschappen(WEEK)
  const kip = lijst.find((b) => b.naam === 'Kipfilet' && !b.vast)
  assert.ok(kip.hoeveelheid >= 600)

  // dag op '— geen —' zetten haalt het gerecht eruit
  storage.zetWeekmenuGerecht(WEEK, 'do', null)
  assert.equal(storage.getWeekmenu(WEEK).find((r) => r.dag === 'do').gerecht_id, null)

  // herstel zet de rotatie terug
  const hersteld = storage.herstelWeekmenu(WEEK)
  assert.equal(hersteld.length, 7)
  assert.ok(hersteld.every((r) => r.porties === 1))
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
  assert.equal(storage.getGerechten().length, 12)
})

test('doelen: opslaan en teruglezen', () => {
  storage.saveDoel({ domein: 'voeding', omschrijving: '−200 kcal correctie' })
  const doelen = storage.getDoelen()
  assert.equal(doelen.length, 1)
  assert.equal(doelen[0].status, 'actief')
})
