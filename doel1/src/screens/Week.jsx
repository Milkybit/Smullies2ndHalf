import React, { useReducer, useState } from 'react'
import { ANKERS, GEMISTE_WEEK_ZIN } from '../domein.js'
import {
  jaarWeekKey, weekDagen, dagCode, datumKey,
  vorigeWeekKey, volgendeWeekKey,
  weekStatus, berekenStreak, vorigeWeekGemist, sloten,
} from '../logic/week.js'
import {
  getSessies, saveSessie, verwijderSessie,
  getInstellingen, zetInstelling,
} from '../storage.js'

export default function Week() {
  const [, ververs] = useReducer((n) => n + 1, 0)
  const nu = new Date()
  const huidigeKey = jaarWeekKey(nu)
  const [weekKey, setWeekKey] = useState(huidigeKey)

  const sessies = getSessies()
  const status = weekStatus(sessies, weekKey)
  const streak = berekenStreak(sessies, nu)
  const gemist = vorigeWeekGemist(sessies, nu)

  // Eenmaal verdiend blijft verdiend — dat leggen we vast in instellingen.
  const nuVerdiend = sloten(streak, nu)
  const instellingen = getInstellingen()
  if (nuVerdiend.banden && !instellingen.banden_verdiend) zetInstelling('banden_verdiend', true)
  if (nuVerdiend.tacx && !instellingen.tacx_verdiend) zetInstelling('tacx_verdiend', true)
  const banden = nuVerdiend.banden || !!instellingen.banden_verdiend
  const tacx = nuVerdiend.tacx || !!instellingen.tacx_verdiend

  const dagen = weekDagen(weekKey)
  const dagDatum = Object.fromEntries(dagen.map((d) => [dagCode(d), datumKey(d)]))

  function tikAnker(dag) {
    const datum = dagDatum[dag]
    const bestaand = sessies.find((s) => s.datum === datum && s.anker === dag)
    if (dag === 'ma') {
      // driestand: niet → vol → mini → niet
      if (!bestaand) saveSessie({ datum, anker: dag, mini: false })
      else if (!bestaand.mini) saveSessie({ datum, anker: dag, mini: true })
      else verwijderSessie(datum, dag)
    } else if (bestaand) {
      verwijderSessie(datum, dag)
    } else {
      saveSessie({ datum, anker: dag, mini: false })
    }
    ververs()
  }

  const nogNodig = Math.max(0, 2 - status.andereAnkers)
  const maandagTekst = status.maandag === 'niet' ? 'maandag nog open'
    : status.maandag === 'mini' ? 'maandag staat (mini)' : 'maandag staat'
  const ankersTekst = status.binnen ? 'week binnen'
    : nogNodig > 0 ? `nog ${nogNodig} van 2` : '2 van 2 binnen'

  const maTekst = dagDatum.ma && weekDatumTekst(dagen[0], dagen[6])

  return (
    <div>
      <h1>Week</h1>

      <div className="weeknav">
        <button className="knop" onClick={() => setWeekKey(vorigeWeekKey(weekKey))}>←</button>
        <div style={{ textAlign: 'center' }}>
          <strong>{weekKey === huidigeKey ? 'Deze week' : `Week ${weekKey.split('-W')[1]}`}</strong>
          <div className="klein zacht">{maTekst}</div>
        </div>
        <button
          className="knop"
          disabled={weekKey === huidigeKey}
          onClick={() => setWeekKey(volgendeWeekKey(weekKey))}
        >→</button>
      </div>

      {gemist && weekKey === huidigeKey && (
        <div className="kaart zacht klein">{GEMISTE_WEEK_ZIN}</div>
      )}

      <div className="kaart">
        <div className="kaart-titel">Weekstatus</div>
        <p style={{ margin: 0 }}>{maandagTekst} · {ankersTekst}</p>
      </div>

      {ANKERS.map((a) => {
        const datum = dagDatum[a.dag]
        const sessie = sessies.find((s) => s.datum === datum && s.anker === a.dag)
        const label = a.dag === 'ma' && sessie ? (sessie.mini ? 'mini' : 'vol') : ''
        return (
          <div
            key={a.dag}
            className={'anker-tegel' + (sessie ? ' gedaan' : '')}
            onClick={() => tikAnker(a.dag)}
          >
            <span className="vink">✓</span>
            <span className="anker-dag">{a.dag}</span>
            <span>{a.naam}</span>
            {label && <span className="klein zacht" style={{ marginLeft: 'auto' }}>{label}</span>}
          </div>
        )
      })}
      <p className="klein zacht" style={{ margin: '0.2rem 0 0.9rem' }}>
        Tik op maandag wisselt: niet → vol → mini.
      </p>

      <div className="kaart">
        <div className="kaart-titel">Streak</div>
        <div className="streak">
          <span className="vlam">🔥</span>
          <span className="getal">{streak}</span>
          <span className="zacht">{streak === 1 ? 'week binnen' : 'weken binnen'}</span>
        </div>
      </div>

      <div className="kaart">
        <div className="kaart-titel">Verdien-sloten</div>
        <div className={'slot' + (banden ? ' verdiend' : '')}>
          <span>{banden ? '🏆' : '🔒'}</span>
          <span>Banden</span>
          <span className="status">{banden ? 'verdiend' : 'bij streak 4'}</span>
        </div>
        <div className={'slot' + (tacx ? ' verdiend' : '')}>
          <span>{tacx ? '🏆' : '🔒'}</span>
          <span>Tacx</span>
          <span className="status">{tacx ? 'verdiend' : 'vanaf oktober, bij streak 4'}</span>
        </div>
      </div>
    </div>
  )
}

function weekDatumTekst(ma, zo) {
  const opties = { day: 'numeric', month: 'short' }
  return `${ma.toLocaleDateString('nl-NL', opties)} – ${zo.toLocaleDateString('nl-NL', opties)}`
}
