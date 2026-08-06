import { test } from 'node:test'
import assert from 'node:assert/strict'
import { vierWekenEvaluatie, drogeReeks } from '../src/logic/evaluatie.js'

// Vijf zaterdagen: 4 juli t/m 1 aug 2026, weken 2026-W27 … W31.
const ZATERDAGEN = ['2026-07-04', '2026-07-11', '2026-07-18', '2026-07-25', '2026-08-01']

function metingen(gewichten) {
  return ZATERDAGEN.map((datum, i) => ({ datum, gewicht: gewichten[i], vet_pct: 24 }))
}

// Sessies die de week van de gegeven maandag binnen maken (alle 5 sporten).
function weekBinnen(maandag) {
  const [j, m, d] = maandag.split('-').map(Number)
  const dag = (n) => {
    const dt = new Date(j, m - 1, d + n)
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
  }
  return ['ma', 'di', 'wo', 'vr', 'za'].map((code, i) => (
    { datum: dag(i), anker: code, mini: false }
  ))
}

// Maandagen van de vier geëvalueerde weken (W28…W31).
const VIER_WEKEN_BINNEN = [
  ...weekBinnen('2026-07-06'), ...weekBinnen('2026-07-13'),
  ...weekBinnen('2026-07-20'), ...weekBinnen('2026-07-27'),
]

test('te weinig data: minder dan 5 metingen', () => {
  const uitkomst = vierWekenEvaluatie(metingen([85, 84.5, 84]).slice(0, 3), [])
  assert.equal(uitkomst.status, 'te-weinig-data')
  assert.equal(uitkomst.nodig, 2)
})

test('op koers: gemiddelde ≥ 0,4 kg per week → niets doen', () => {
  const uitkomst = vierWekenEvaluatie(metingen([86, 85.5, 85, 84.5, 84]), [])
  assert.equal(uitkomst.status, 'op-koers')
  assert.ok(Math.abs(uitkomst.gemiddelde - 0.5) < 1e-9)
})

test('suggestie: langzamer terwijl de weken binnen waren', () => {
  const uitkomst = vierWekenEvaluatie(metingen([85, 84.9, 84.8, 84.6, 84.4]), VIER_WEKEN_BINNEN)
  assert.equal(uitkomst.status, 'suggestie')
  assert.ok(uitkomst.gemiddelde < 0.4)
})

test('geen suggestie: langzamer maar weken niet binnen', () => {
  const uitkomst = vierWekenEvaluatie(metingen([85, 84.9, 84.8, 84.6, 84.4]), [])
  assert.equal(uitkomst.status, 'geen-suggestie')
})

test('droge reeks: telt aaneengesloten, vandaag-nog-niet breekt niet', () => {
  const vandaag = new Date(2026, 7, 5)
  assert.equal(drogeReeks([], vandaag), 0)
  assert.equal(drogeReeks(['2026-08-03', '2026-08-04', '2026-08-05'], vandaag), 3)
  // vandaag nog niet getikt: reeks t/m gisteren telt door
  assert.equal(drogeReeks(['2026-08-03', '2026-08-04'], vandaag), 2)
  // gat gisteren: reeks is gebroken
  assert.equal(drogeReeks(['2026-08-02', '2026-08-03'], vandaag), 0)
  assert.equal(drogeReeks(['2026-08-01', '2026-08-02', '2026-08-04', '2026-08-05'], vandaag), 2)
})
