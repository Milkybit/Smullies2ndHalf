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

test('init zaait de plangerechten: 12 diners + ontbijt- en lunchkeuzes', () => {
  const gerechten = storage.getGerechten()
  const diners = gerechten.filter((g) => g.soort === 'diner')
  assert.equal(diners.length, 12)
  for (const w of [1, 2, 3, 4]) {
    assert.equal(diners.filter((g) => g.rotatie_week === w).length, 3)
  }
  assert.ok(diners.every((g) => g.kook_factor === 2 && g.bereiding))
  // diners gekalibreerd op 690-755 kcal
  assert.ok(diners.every((g) => g.kcal >= 690 && g.kcal <= 755))
  // ontbijt ±590, lunch ±460 — alle keuzes macro-gelijk
  const ontbijt = gerechten.filter((g) => g.soort === 'ontbijt')
  const lunch = gerechten.filter((g) => g.soort === 'lunch')
  assert.ok(ontbijt.length >= 3 && ontbijt.every((g) => Math.abs(g.kcal - 590) <= 30))
  assert.ok(lunch.length >= 3 && lunch.every((g) => Math.abs(g.kcal - 460) <= 30))
})

test('standaarddag komt uit het plan', () => {
  const momenten = storage.getStandaarddag().map((m) => m.moment)
  assert.deepEqual(momenten, ['ontbijt', 'lunch', 'snack_1600', 'diner'])
})

test('seed-versie: een oudere gerechtenlijst wordt bij init vervangen', () => {
  globalThis.localStorage.setItem('doel1.gerechten', JSON.stringify([{ id: 'oud' }]))
  const instellingen = JSON.parse(globalThis.localStorage.getItem('doel1.instellingen'))
  instellingen.seed_versie = 2
  globalThis.localStorage.setItem('doel1.instellingen', JSON.stringify(instellingen))
  storage.initStorage(NU)
  assert.equal(storage.getGerechten().length, 18)
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

test('weekmenu: rotatie op 2 dagen per gerecht, zaterdag vrij, standaard ontbijt/lunch', () => {
  const menu = storage.getWeekmenu(WEEK)
  assert.equal(menu.length, 21)
  const diners = menu.filter((r) => r.maaltijd === 'diner')
  // zaterdagse tafel: geen gerecht op za
  assert.equal(diners.find((r) => r.dag === 'za').gerecht_id, null)
  // 3 gerechten, elk op precies 2 dagen (kook_factor 2)
  const telling = {}
  for (const r of diners) if (r.gerecht_id) telling[r.gerecht_id] = (telling[r.gerecht_id] || 0) + 1
  assert.equal(Object.keys(telling).length, 3)
  assert.ok(Object.values(telling).every((n) => n === 2))
  // ontbijt en lunch standaard op o1/l1
  assert.ok(menu.filter((r) => r.maaltijd === 'ontbijt').every((r) => r.gerecht_id === 'o1'))
  assert.ok(menu.filter((r) => r.maaltijd === 'lunch').every((r) => r.gerecht_id === 'l1'))
  // tweede aanroep: zelfde menu, niet opnieuw gegenereerd
  assert.deepEqual(storage.getWeekmenu(WEEK), menu)
})

test('ontbijtvariant kiezen: macro-gelijk en de lijst rekent mee', () => {
  storage.getWeekmenu(WEEK)
  // zaterdag de weekend-eiwitpannenkoeken in plaats van overnight oats
  storage.zetWeekmenuGerecht(WEEK, 'za', 'ontbijt', 'o2')
  const o1 = storage.getGerecht('o1')
  const o2 = storage.getGerecht('o2')
  assert.ok(Math.abs(o1.kcal - o2.kcal) <= 30) // macro-gelijk binnen marge
  const lijst = storage.maakBoodschappen(WEEK)
  // kwark: 6 dagen standaard × 250 g + pannenkoeken 125 g
  const kwark = lijst.find((b) => b.naam === 'magere kwark' && !b.vast)
  assert.equal(kwark.hoeveelheid, 6 * 250 + 125)
  // eieren van de pannenkoeken staan los van de vaste basislijst
  const eieren = lijst.find((b) => b.naam === 'eieren' && !b.vast)
  assert.equal(eieren.hoeveelheid, 2)
})

test('weekmenu: gerecht kiezen en porties ophogen werkt door in de lijst', () => {
  const menu = storage.getWeekmenu(WEEK)
  assert.ok(menu.every((r) => r.porties === 1))

  // donderdag een ander diner (g1, Kip-cashew uit week 1) en 3 porties
  storage.zetWeekmenuGerecht(WEEK, 'do', 'diner', 'g1')
  storage.zetWeekmenuPorties(WEEK, 'do', 'diner', 3)
  const donderdag = storage.getWeekmenu(WEEK)
    .find((r) => r.dag === 'do' && r.maaltijd === 'diner')
  assert.equal(donderdag.gerecht_id, 'g1')
  assert.equal(donderdag.porties, 3)

  // g1: 160 g kipfilet × 3 porties in de lijst (minimaal)
  const lijst = storage.maakBoodschappen(WEEK)
  const kip = lijst.find((b) => b.naam === 'kipfilet' && !b.vast)
  assert.ok(kip.hoeveelheid >= 480)

  // dag op '— geen —' zetten haalt het gerecht eruit
  storage.zetWeekmenuGerecht(WEEK, 'do', 'diner', null)
  assert.equal(
    storage.getWeekmenu(WEEK).find((r) => r.dag === 'do' && r.maaltijd === 'diner').gerecht_id,
    null
  )

  // herstel zet de rotatie terug (21 rijen: 3 maaltijden × 7 dagen)
  const hersteld = storage.herstelWeekmenu(WEEK)
  assert.equal(hersteld.length, 21)
  assert.ok(hersteld.every((r) => r.porties === 1))
})

test('kook_factor 2: standaardmenu telt elk ingrediënt dubbel; naar-smaak-items één keer', () => {
  storage.getWeekmenu(WEEK) // week = rotatieweek 1 (g1, g2, g3 elk op 2 dagen)
  const lijst = storage.maakBoodschappen(WEEK)
  // g1: 160 g kipfilet × 2 dagen = 320 g (alleen g1 bevat kipfilet in week 1)
  const kip = lijst.find((b) => b.naam === 'kipfilet' && !b.vast)
  assert.equal(kip.hoeveelheid, 320)
  // zilvervliesrijst: g1 65 + g2 50, elk ×2 = 230 g
  const rijst = lijst.find((b) => b.naam === 'zilvervliesrijst (droog)' && !b.vast)
  assert.equal(rijst.hoeveelheid, 230)
  // naar-smaak-item staat er één keer op, zonder hoeveelheid
  const soja = lijst.find((b) => b.naam === 'sojasaus, gember, knoflook')
  assert.equal(soja.hoeveelheid, null)
  // vaste weeklijst aanwezig
  assert.ok(lijst.some((b) => b.vast && b.naam === 'magere kwark'))
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
  assert.equal(storage.getGerechten().length, 18)
})

test('doelen: opslaan en teruglezen', () => {
  storage.saveDoel({ domein: 'voeding', omschrijving: '−200 kcal correctie' })
  const doelen = storage.getDoelen()
  assert.equal(doelen.length, 1)
  assert.equal(doelen[0].status, 'actief')
})
