import React, { useReducer, useState } from 'react'
import SyncKaart from './SyncKaart.jsx'
import { dagCode, datumKey } from '../logic/week.js'
import { vierWekenEvaluatie, drogeReeks, EVALUATIE_DREMPEL } from '../logic/evaluatie.js'
import {
  getMetingen, saveMeting, getSessies,
  getDrogeDagen, getInstellingen, zetInstelling, saveDoel,
  exportData, importData,
} from '../storage.js'

function laatsteZaterdag(nu) {
  const d = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate())
  d.setDate(d.getDate() - ((d.getDay() + 1) % 7))
  return datumKey(d)
}

export default function Voortgang() {
  const [, ververs] = useReducer((n) => n + 1, 0)
  const nu = new Date()
  const [datum, setDatum] = useState(laatsteZaterdag(nu))
  const [gewicht, setGewicht] = useState('')
  const [vet, setVet] = useState('')

  const metingen = getMetingen()
  const sessies = getSessies()
  const reeks = drogeReeks(getDrogeDagen(), nu)
  const evaluatie = vierWekenEvaluatie(metingen, sessies)
  const correctie = getInstellingen().kcal_correctie || 0

  const isZaterdag = dagCode(new Date(datum + 'T12:00:00')) === 'za'
  const kanOpslaan = isZaterdag && gewicht !== ''

  // Dashboard: voortgang van eerste meting naar doel.
  const instellingen = getInstellingen()
  const doelGewicht = instellingen.doel_gewicht ?? null
  const doelVet = instellingen.doel_vet_pct ?? null
  const vetMetingen = metingen.filter((m) => m.vet_pct != null)
  const gewichtNu = metingen.length ? metingen[metingen.length - 1].gewicht : null
  const vetNu = vetMetingen.length ? vetMetingen[vetMetingen.length - 1].vet_pct : null

  function zetDoel(naam, waarde) {
    zetInstelling(naam, waarde === '' ? null : Number(waarde))
    ververs()
  }

  function bewaar() {
    saveMeting({
      datum,
      gewicht: Number(gewicht),
      vet_pct: vet === '' ? null : Number(vet),
    })
    setGewicht('')
    setVet('')
    ververs()
  }

  function pasCorrectieToe() {
    zetInstelling('kcal_correctie', correctie - 200)
    saveDoel({
      domein: 'voeding',
      omschrijving: '−200 kcal op het dagtotaal na 4-weken-evaluatie',
      meetlat: 'gemiddelde ≥ 0,4 kg/week in het volgende blok',
    })
    ververs()
  }

  return (
    <div>
      <h1>Voortgang</h1>

      <div className="kaart">
        <div className="kaart-titel">Dashboard</div>
        <div className="donuts">
          <Donut
            titel="Vet %"
            kleur="#C98A2D"
            huidig={vetNu}
            start={vetMetingen.length ? vetMetingen[0].vet_pct : null}
            doel={doelVet}
            eenheid="%"
          />
          <Donut
            titel="Gewicht"
            kleur="#24382F"
            huidig={gewichtNu}
            start={metingen.length ? metingen[0].gewicht : null}
            doel={doelGewicht}
            eenheid=" kg"
          />
        </div>
        <div className="doel-velden">
          <div>
            <label>Doel vet %</label>
            <input type="number" step="0.5" inputMode="decimal" value={doelVet ?? ''}
              onChange={(e) => zetDoel('doel_vet_pct', e.target.value)} />
          </div>
          <div>
            <label>Doel gewicht (kg)</label>
            <input type="number" step="0.5" inputMode="decimal" value={doelGewicht ?? ''}
              onChange={(e) => zetDoel('doel_gewicht', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="kaart">
        <div className="kaart-titel">Zaterdagmeting</div>
        <div className="veldenrij">
          <div>
            <label>Datum (zaterdag)</label>
            <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />
          </div>
        </div>
        <div className="veldenrij">
          <div>
            <label>Gewicht (kg)</label>
            <input type="number" step="0.1" inputMode="decimal" value={gewicht}
              onChange={(e) => setGewicht(e.target.value)} />
          </div>
          <div>
            <label>Vet %</label>
            <input type="number" step="0.1" inputMode="decimal" value={vet}
              onChange={(e) => setVet(e.target.value)} />
          </div>
        </div>
        {!isZaterdag && (
          <p className="klein zacht" style={{ margin: '0 0 0.5rem' }}>
            Meten doe je op zaterdag — kies een zaterdag.
          </p>
        )}
        <button className="knop primair" style={{ width: '100%' }} disabled={!kanOpslaan} onClick={bewaar}>
          Meting opslaan
        </button>
      </div>

      {metingen.length >= 2 && (
        <div className="kaart">
          <div className="kaart-titel">Trend — gewicht (kg)</div>
          <Trendlijn punten={metingen.map((m) => m.gewicht)} kleur="#C98A2D" />
          {metingen.some((m) => m.vet_pct != null) && (
            <>
              <div className="kaart-titel" style={{ marginTop: '0.8rem' }}>Trend — vet %</div>
              <Trendlijn punten={metingen.filter((m) => m.vet_pct != null).map((m) => m.vet_pct)} kleur="#24382F" />
            </>
          )}
        </div>
      )}

      <div className="kaart">
        <div className="kaart-titel">4-weken-evaluatie</div>
        {evaluatie.status === 'te-weinig-data' && (
          <p className="zacht" style={{ margin: 0 }}>
            Nog {evaluatie.nodig} {evaluatie.nodig === 1 ? 'zaterdagmeting' : 'zaterdagmetingen'} te
            gaan, dan verschijnt hier de eerste evaluatie.
          </p>
        )}
        {evaluatie.status === 'op-koers' && (
          <p style={{ margin: 0 }}>
            Gemiddeld −{evaluatie.gemiddelde.toFixed(1)} kg per week — op koers
            (richtlijn ≥ {EVALUATIE_DREMPEL} kg). Niets doen.
          </p>
        )}
        {evaluatie.status === 'suggestie' && (
          <>
            <p style={{ marginTop: 0 }}>
              Gemiddeld −{evaluatie.gemiddelde.toFixed(1)} kg per week terwijl de weken binnen
              waren. Overweeg −200 kcal.
            </p>
            <button className="knop accent" style={{ width: '100%' }} onClick={pasCorrectieToe}>
              Overweeg −200 kcal — toepassen
            </button>
          </>
        )}
        {evaluatie.status === 'geen-suggestie' && (
          <p className="zacht" style={{ margin: 0 }}>
            Gemiddeld −{evaluatie.gemiddelde.toFixed(1)} kg per week. Geen suggestie: eerst de
            weekstructuur, dan het schema.
          </p>
        )}
        {correctie !== 0 && (
          <p className="klein zacht" style={{ margin: '0.5rem 0 0' }}>
            Actieve correctie: {correctie} kcal per dag.
          </p>
        )}
      </div>

      <div className="kaart">
        <div className="kaart-titel">Droge dagen</div>
        <div className="streak">
          <span className="vlam">💧</span>
          <span className="getal">{reeks}</span>
          <span className="zacht">{reeks === 1 ? 'dag droog' : 'dagen droog'} aaneengesloten</span>
        </div>
      </div>

      <SyncKaart />

      <div className="kaart">
        <div className="kaart-titel">Reservekopie</div>
        <p className="klein zacht" style={{ marginTop: 0 }}>
          Alles staat lokaal op dit apparaat. Exporteer af en toe een kopie.
        </p>
        <div className="knoppenrij">
          <button className="knop" onClick={downloadExport}>Exporteren</button>
          <label className="knop" style={{ textAlign: 'center' }}>
            Importeren
            <input type="file" accept="application/json" style={{ display: 'none' }}
              onChange={(e) => leesImport(e, ververs)} />
          </label>
        </div>
      </div>
    </div>
  )
}

function downloadExport() {
  const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `doel1-backup-${datumKey(new Date())}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

function leesImport(event, klaar) {
  const bestand = event.target.files[0]
  if (!bestand) return
  bestand.text().then((tekst) => {
    importData(JSON.parse(tekst))
    klaar()
  })
}

// Donut-meter: voortgang van startwaarde (eerste meting) naar doel.
// Zonder doel of meting blijft de ring leeg met een korte uitleg.
function Donut({ titel, kleur, huidig, start, doel, eenheid }) {
  const R = 34
  const OMTREK = 2 * Math.PI * R
  const klaar = huidig != null && start != null && doel != null && start !== doel
  const aandeel = klaar ? Math.max(0, Math.min(1, (start - huidig) / (start - doel))) : 0
  const nog = klaar ? Math.max(0, huidig - doel) : null
  return (
    <div className="donut-blok">
      <svg width="96" height="96" viewBox="0 0 96 96" role="img"
        aria-label={`${titel}: ${huidig ?? 'geen meting'}, doel ${doel ?? 'niet gezet'}`}>
        <circle cx="48" cy="48" r={R} fill="none" stroke="#D9DCD1" strokeWidth="10" />
        {klaar && (
          <circle
            cx="48" cy="48" r={R} fill="none" stroke={kleur} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(aandeel * OMTREK).toFixed(1)} ${OMTREK.toFixed(1)}`}
            transform="rotate(-90 48 48)"
          />
        )}
        <text x="48" y="53" textAnchor="middle"
          style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fill: '#24382F' }}>
          {huidig != null ? `${huidig}${eenheid}` : '—'}
        </text>
      </svg>
      <div className="waarde">{titel}</div>
      <div className="sub">
        {klaar
          ? `${Math.round(aandeel * 100)}% · nog ${nog.toFixed(1)}${eenheid} naar ${doel}${eenheid}`
          : huidig == null ? 'nog geen meting' : 'zet een doel hieronder'}
      </div>
    </div>
  )
}

// Kleine SVG-trendlijn zonder dependencies: punten op tijdsvolgorde,
// met min/max-labels en een stip per meting.
function Trendlijn({ punten, kleur }) {
  const B = 300
  const H = 90
  const PAD = 8
  const min = Math.min(...punten)
  const max = Math.max(...punten)
  const bereik = max - min || 1
  const x = (i) => PAD + (i * (B - 2 * PAD)) / Math.max(1, punten.length - 1)
  const y = (w) => H - PAD - ((w - min) * (H - 2 * PAD)) / bereik
  const pad = punten.map((p, i) => `${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(' ')
  return (
    <div>
      <svg className="grafiek" viewBox={`0 0 ${B} ${H}`} role="img"
        aria-label={`Trend van ${punten.length} metingen, van ${punten[0]} naar ${punten[punten.length - 1]}`}>
        <polyline points={pad} fill="none" stroke={kleur} strokeWidth="2" />
        {punten.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p)} r="2.5" fill={kleur} />
        ))}
      </svg>
      <div className="klein zacht" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>eerste: {punten[0]}</span>
        <span>laatste: {punten[punten.length - 1]}</span>
      </div>
    </div>
  )
}
