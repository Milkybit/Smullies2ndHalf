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

test('standaardweekmenu: diners op 2 dagen (za vrij), ontbijt en lunch standaard', () => {
  const menu = standaardWeekmenu('2026-W32', SEED_GERECHTEN, 2)
  assert.equal(menu.length, 21)
  const diners = menu.filter((r) => r.maaltijd === 'diner')
  assert.equal(diners.find((r) => r.dag === 'za').gerecht_id, null)
  const ids = [...new Set(diners.filter((r) => r.gerecht_id).map((r) => r.gerecht_id))]
  assert.equal(ids.length, 3)
  for (const id of ids) {
    assert.equal(SEED_GERECHTEN.find((g) => g.id === id).rotatie_week, 2)
  }
  assert.ok(menu.filter((r) => r.maaltijd === 'ontbijt').every((r) => r.gerecht_id === 'o1'))
  assert.ok(menu.filter((r) => r.maaltijd === 'lunch').every((r) => r.gerecht_id === 'l1'))
})

test('boodschappenlijst: vaste weeklijst + rotatie × kook_factor, samengevoegd', () => {
  const menu = standaardWeekmenu('2026-W32', SEED_GERECHTEN, 1)
  const lijst = bouwBoodschappenlijst('2026-W32', menu, SEED_GERECHTEN, SEED_VASTE_BOODSCHAPPEN)

  const vast = lijst.filter((b) => b.vast)
  assert.equal(vast.length, SEED_VASTE_BOODSCHAPPEN.length)

  // kipfilet (g1, 160 g): op 2 dagen = 320 g
  const kip = lijst.find((b) => b.naam === 'kipfilet' && !b.vast)
  assert.equal(kip.hoeveelheid, 320)

  // olijfolie uit g1+g2+g3 (10+10+10 ml × 2 dagen) = 60 ml
  const olie = lijst.find((b) => b.naam === 'olijfolie' && !b.vast)
  assert.equal(olie.hoeveelheid, 60)

  // geen dubbele niet-vaste items met dezelfde naam+eenheid
  const sleutels = lijst.filter((b) => !b.vast).map((b) => `${b.naam}|${b.eenheid}`)
  assert.equal(sleutels.length, new Set(sleutels).size)
})
