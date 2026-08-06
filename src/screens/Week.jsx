import React, { useReducer, useState } from 'react'
import { SPORTEN, GEMISTE_WEEK_ZIN } from '../domein.js'
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

  // Afvinken op weekniveau: aanzetten registreert een sessie op vandaag
  // (in de huidige week) of op de maandag van de bekeken week; uitzetten
  // haalt alle sessies van die sport in die week weg.
  function tikSport(code) {
    const rijen = status.perSport[code]
    if (rijen.length > 0) {
      if (code === 'ma' && !rijen[0].mini) {
        saveSessie({ datum: rijen[0].datum, anker: code, mini: true })
      } else {
        for (const rij of rijen) verwijderSessie(rij.datum, code)
      }
    } else {
      const datum = weekKey === huidigeKey ? datumKey(nu) : datumKey(dagen[0])
      saveSessie({ datum, anker: code, mini: false })
    }
    ververs()
  }

  const nogNodig = 5 - status.aantal
  const statusTekst = status.binnen ? 'alle 5 binnen — week binnen'
    : `${status.aantal} van 5 · nog ${nogNodig} te gaan`

  return (
    <div>
      <h1>Week</h1>

      <div className="weeknav">
        <button className="knop" onClick={() => setWeekKey(vorigeWeekKey(weekKey))}>←</button>
        <div style={{ textAlign: 'center' }}>
          <strong>{weekKey === huidigeKey ? 'Deze week' : `Week ${weekKey.split('-W')[1]}`}</strong>
          <div className="klein zacht">{weekDatumTekst(dagen[0], dagen[6])}</div>
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
        <p style={{ margin: 0 }}>{statusTekst}</p>
      </div>

      {SPORTEN.map((sport) => {
        const rijen = status.perSport[sport.code]
        const gedaan = rijen.length > 0
        const dagLabel = rijen
          .map((r) => dagCode(new Date(r.datum + 'T12:00:00')))
          .join(' · ')
        const miniLabel = sport.code === 'ma' && gedaan ? (rijen[0].mini ? 'mini' : 'vol') : ''
        return (
          <div
            key={sport.code}
            className={'anker-tegel' + (gedaan ? ' gedaan' : '')}
            onClick={() => tikSport(sport.code)}
          >
            <span className="vink">✓</span>
            <span>{sport.naam}</span>
            <span className="klein zacht" style={{ marginLeft: 'auto' }}>
              {[miniLabel, dagLabel].filter(Boolean).join(' · ')}
            </span>
          </div>
        )
      })}
      <p className="klein zacht" style={{ margin: '0.2rem 0 0.9rem' }}>
        Registreren doe je op Vandaag; hier kun je een week ook achteraf bijwerken.
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
