import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  jaarWeekKey, maandagVanKey, vorigeWeekKey, wekenTussen,
  weekStatus, berekenStreak, vorigeWeekGemist, sloten, dagCode,
} from '../src/logic/week.js'

test('ISO-weeknummers rond jaargrenzen', () => {
  assert.equal(jaarWeekKey(new Date(2026, 7, 5)), '2026-W32')
  assert.equal(jaarWeekKey(new Date(2026, 0, 1)), '2026-W01')
  assert.equal(jaarWeekKey(new Date(2027, 0, 1)), '2026-W53')
  assert.equal(jaarWeekKey(new Date(2027, 0, 4)), '2027-W01')
  assert.equal(maandagVanKey('2026-W32').getDate(), 3)
  assert.equal(vorigeWeekKey('2026-W01'), '2025-W52')
  assert.equal(wekenTussen('2026-W30', '2026-W32'), 2)
  assert.equal(dagCode(new Date(2026, 7, 5)), 'wo')
})

function sessie(datum, anker, mini = false) {
  return { datum, anker, mini }
}

// Alle 5 sporten in de week van de gegeven maandag, verdeeld over dagen.
function volleWeek(maandagDatum) {
  const [j, m, d] = maandagDatum.split('-').map(Number)
  const dag = (n) => {
    const dt = new Date(j, m - 1, d + n)
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
  }
  return [
    sessie(dag(0), 'ma'), sessie(dag(1), 'di'), sessie(dag(2), 'wo'),
    sessie(dag(4), 'vr'), sessie(dag(5), 'za'),
  ]
}

// Week 2026-W32: ma 3 aug … zo 9 aug.
test('week binnen = alle 5 sporten die week gedaan, op welke dag dan ook', () => {
  // alle 5 op zelfgekozen dagen (Kracht A op donderdag, twee op zaterdag) → binnen
  let s = [
    sessie('2026-08-06', 'ma'), sessie('2026-08-04', 'di'), sessie('2026-08-08', 'wo'),
    sessie('2026-08-08', 'vr'), sessie('2026-08-09', 'za'),
  ]
  assert.deepEqual(
    { aantal: weekStatus(s, '2026-W32').aantal, binnen: weekStatus(s, '2026-W32').binnen },
    { aantal: 5, binnen: true }
  )

  // Kracht A als mini telt ook
  s = [sessie('2026-08-06', 'ma', true), ...s.slice(1)]
  assert.equal(weekStatus(s, '2026-W32').binnen, true)

  // 4 van 5 → niet binnen; 'extra' vult het gat niet
  s = [
    sessie('2026-08-03', 'ma'), sessie('2026-08-04', 'di'), sessie('2026-08-05', 'wo'),
    sessie('2026-08-07', 'vr'), sessie('2026-08-08', 'extra'),
  ]
  assert.equal(weekStatus(s, '2026-W32').aantal, 4)
  assert.equal(weekStatus(s, '2026-W32').binnen, false)

  // dezelfde sport twee keer telt als één
  s = [sessie('2026-08-03', 'di'), sessie('2026-08-05', 'di')]
  assert.equal(weekStatus(s, '2026-W32').aantal, 1)

  // een geregistreerde rustdag telt niet mee als sport
  s = [sessie('2026-08-03', 'di'), sessie('2026-08-04', 'rust')]
  assert.equal(weekStatus(s, '2026-W32').aantal, 1)
})

test('streak telt aaneengesloten weken binnen', () => {
  // weken W29, W30, W31 binnen; vandaag in W32 (nog leeg) → streak 3
  const s = [...volleWeek('2026-07-13'), ...volleWeek('2026-07-20'), ...volleWeek('2026-07-27')]
  const vandaag = new Date(2026, 7, 5)
  assert.equal(berekenStreak(s, vandaag), 3)
  assert.equal(vorigeWeekGemist(s, vandaag), false)

  // huidige week ook binnen → 4, en dan zijn de banden verdiend
  const s2 = [...s, ...volleWeek('2026-08-03')]
  assert.equal(berekenStreak(s2, vandaag), 4)
  assert.equal(sloten(berekenStreak(s2, vandaag), vandaag).banden, true)
  // Tacx pas vanaf oktober
  assert.equal(sloten(4, new Date(2026, 7, 5)).tacx, false)
  assert.equal(sloten(4, new Date(2026, 9, 1)).tacx, true)
  assert.equal(sloten(3, new Date(2026, 9, 1)).tacx, false)
})

test('onvolledige week breekt de streak, en de gemiste week wordt gemeld', () => {
  // W29 en W30 binnen, W31 maar 1 sport, vandaag in W32
  const s = [...volleWeek('2026-07-13'), ...volleWeek('2026-07-20'), sessie('2026-07-28', 'di')]
  const vandaag = new Date(2026, 7, 5)
  assert.equal(berekenStreak(s, vandaag), 0)
  assert.equal(vorigeWeekGemist(s, vandaag), true)
})

test('nieuwe gebruiker zonder historie krijgt geen gemiste-week-melding', () => {
  assert.equal(vorigeWeekGemist([], new Date(2026, 7, 5)), false)
  // eerste sessies deze week: ook geen melding
  assert.equal(vorigeWeekGemist([sessie('2026-08-04', 'di')], new Date(2026, 7, 5)), false)
})
