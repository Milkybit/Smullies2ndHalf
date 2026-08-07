import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rotatieWeekNummer, standaardWeekmenu, bouwBoodschappenlijst } from '../src/logic/rotatie.js'
import { SEED_GERECHTEN, SEED_VASTE_BOODSCHAPPEN } from '../src/seed.js'

test('rotatie: week 5 = week 1, ook terug in de tijd', () => {
  const start = '2026-W32'
  assert.equal(rotatieWeekNummer('2026-W32', start), 1)
  assert.equal(rotatieWeekNummer('2026-W33', start), 2)
  assert.equal(rotatieWeekNummer('2026-W35', start), 4)
  assert.equal(rotatieWeekNummer('2026-W36', start), 1)
  assert.equal(rotatieWeekNummer('2026-W31', start), 4)
})

test('standaardweekmenu: 4 maaltijden × 7 dagen; diner uit de rotatie, rest leeg', () => {
  const menu = standaardWeekmenu('2026-W32', SEED_GERECHTEN, 2)
  assert.equal(menu.length, 28)
  const diners = menu.filter((r) => r.maaltijd === 'diner')
  assert.equal(diners.length, 7)
  const ids = [...new Set(diners.map((r) => r.gerecht_id))]
  assert.equal(ids.length, 3)
  for (const id of ids) {
    assert.equal(SEED_GERECHTEN.find((g) => g.id === id).rotatie_week, 2)
  }
  assert.ok(menu.filter((r) => r.maaltijd !== 'diner').every((r) => r.gerecht_id === null))
})

test('boodschappenlijst: vaste lijst + samengevoegde weekaanvulling', () => {
  const menu = standaardWeekmenu('2026-W32', SEED_GERECHTEN, 1)
  const lijst = bouwBoodschappenlijst('2026-W32', menu, SEED_GERECHTEN, SEED_VASTE_BOODSCHAPPEN)

  const vast = lijst.filter((b) => b.vast)
  assert.equal(vast.length, SEED_VASTE_BOODSCHAPPEN.length)

  // Kipfilet (d01, ma+di in het patroon): 210 g × 2 dagen = 420 g
  const kip = lijst.find((b) => b.naam === 'Kipfilet' && !b.vast)
  assert.equal(kip.hoeveelheid, 420)

  // geen dubbele niet-vaste items met dezelfde naam
  const namen = lijst.filter((b) => !b.vast).map((b) => b.naam)
  assert.equal(namen.length, new Set(namen).size)
})
