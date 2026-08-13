// 4-weken-evaluatie en droge-dagen-reeks.
//
// De evaluatie geeft een súggestie, de app beslist nooit zelf:
// - gemiddelde ≥ 0,4 kg/week → niets doen (op koers);
// - lager, terwijl de geëvalueerde weken binnen waren → "overweeg −200 kcal";
// - lager zonder dat de weken binnen waren → geen suggestie (eerst de week).
// Er zijn 5 zaterdagmetingen nodig (4 tussenliggende weken).

import { jaarWeekKey, weekStatus, datumKey } from './week.js'

export const EVALUATIE_DREMPEL = 0.4
export const AANTAL_METINGEN = 5

export function vierWekenEvaluatie(metingen, sessies) {
  if (metingen.length < AANTAL_METINGEN) {
    return { status: 'te-weinig-data', nodig: AANTAL_METINGEN - metingen.length }
  }
  const laatste = metingen.slice(-AANTAL_METINGEN)
  const intervallen = AANTAL_METINGEN - 1
  const gemiddelde = (laatste[0].gewicht - laatste[intervallen].gewicht) / intervallen

  if (gemiddelde >= EVALUATIE_DREMPEL) {
    return { status: 'op-koers', gemiddelde }
  }

  // De vier weken ná de eerste meting van het blok.
  const weken = laatste.slice(1).map((m) => jaarWeekKey(new Date(m.datum + 'T12:00:00')))
  const alleBinnen = weken.every((w) => weekStatus(sessies, w).binnen)
  return { status: alleBinnen ? 'suggestie' : 'geen-suggestie', gemiddelde }
}

// Vetmassa in kg = gewicht × vet% / 100. Zonder vet%-meting geen waarde.
export function vetmassa(meting) {
  if (!meting || meting.vet_pct == null || meting.gewicht == null) return null
  return meting.gewicht * meting.vet_pct / 100
}

// Vetvrije massa (spier, botten, water) — het deel dat je juist wilt houden.
export function vetvrijeMassa(meting) {
  const vet = vetmassa(meting)
  return vet == null ? null : meting.gewicht - vet
}

// Metingen mét vet%, op tijdsvolgorde; alleen die tellen mee voor vetmassa.
export function metVetPercentage(metingen) {
  return metingen.filter((m) => m.vet_pct != null)
}

// Aaneengesloten droge reeks, eindigend vandaag of gisteren
// (vandaag nog niet getikt breekt de reeks niet).
export function drogeReeks(dagen, vandaag) {
  const set = new Set(dagen)
  const d = new Date(vandaag.getFullYear(), vandaag.getMonth(), vandaag.getDate())
  if (!set.has(datumKey(d))) d.setDate(d.getDate() - 1)
  let reeks = 0
  while (set.has(datumKey(d))) {
    reeks += 1
    d.setDate(d.getDate() - 1)
  }
  return reeks
}
