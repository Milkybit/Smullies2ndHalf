import React, { useReducer } from 'react'
import { SPORTEN, PLUS_BLOKKEN } from '../domein.js'
import { dagCode, datumKey, jaarWeekKey } from '../logic/week.js'
import {
  getSessies, saveSessie, verwijderSessie,
  getWeekmenu, getGerecht, getRotatieWeek,
  getDrogeDagen, toggleDroog,
} from '../storage.js'

export default function Vandaag() {
  const [, ververs] = useReducer((n) => n + 1, 0)
  const nu = new Date()
  const vandaag = datumKey(nu)
  const dag = dagCode(nu)
  const weekKey = jaarWeekKey(nu)

  const sessies = getSessies()
  const sessiesVandaag = sessies.filter((s) => s.datum === vandaag)
  const extraVandaag = sessiesVandaag.find((s) => s.anker === 'extra')
  const droog = getDrogeDagen().includes(vandaag)

  const menu = getWeekmenu(weekKey)
  const menuVandaag = menu.find((r) => r.dag === dag) || {}
  const diner = getGerecht(menuVandaag.gerecht_id)
  const rotatieNr = getRotatieWeek(weekKey)

  // Kracht A tikt door: niet → vol → mini → niet; de rest is aan/uit.
  function tikSport(code) {
    const sessie = sessiesVandaag.find((s) => s.anker === code)
    if (code === 'ma') {
      if (!sessie) saveSessie({ datum: vandaag, anker: code, mini: false })
      else if (!sessie.mini) saveSessie({ datum: vandaag, anker: code, mini: true })
      else verwijderSessie(vandaag, code)
    } else if (sessie) {
      verwijderSessie(vandaag, code)
    } else {
      saveSessie({ datum: vandaag, anker: code, mini: false })
    }
    ververs()
  }

  const blokkenVandaag = SPORTEN.filter((sport) =>
    sessiesVandaag.some((s) => s.anker === sport.code)
  )

  const datumTekst = nu.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div>
      <h1>Vandaag</h1>
      <p className="zacht" style={{ marginTop: '-0.3rem' }}>{datumTekst}</p>

      <div className="kaart">
        <div className="kaart-titel">Sessies van vandaag</div>
        {SPORTEN.map((sport) => {
          const sessie = sessiesVandaag.find((s) => s.anker === sport.code)
          const label = sport.code === 'ma' && sessie ? (sessie.mini ? 'mini' : 'vol') : ''
          return (
            <div
              key={sport.code}
              className={'anker-tegel' + (sessie ? ' gedaan' : '')}
              onClick={() => tikSport(sport.code)}
            >
              <span className="vink">✓</span>
              <span>{sport.naam}</span>
              {label && <span className="klein zacht" style={{ marginLeft: 'auto' }}>{label}</span>}
            </div>
          )
        })}
        <p className="klein zacht" style={{ margin: '0.3rem 0 0.5rem' }}>
          Tik op Kracht A wisselt: niet → vol → mini. Vol én mini tellen allebei.
        </p>
        <button
          className={'knop' + (extraVandaag ? ' gedaan' : '')}
          style={{ width: '100%' }}
          onClick={() => {
            if (extraVandaag) verwijderSessie(vandaag, 'extra')
            else saveSessie({ datum: vandaag, anker: 'extra' })
            ververs()
          }}
        >
          {extraVandaag ? 'Extra sessie ✓' : 'Iets anders bewogen? Extra sessie'}
        </button>
      </div>

      <div className="kaart">
        <div className="kaart-titel">Plus-blok</div>
        {blokkenVandaag.length > 0 ? (
          blokkenVandaag.map((sport) => (
            <p key={sport.code} style={{ margin: '0 0 0.3rem' }}>
              <strong>{sport.naam}</strong> → {PLUS_BLOKKEN[sport.plus].label}:
              +{PLUS_BLOKKEN[sport.plus].kcal} kcal — {PLUS_BLOKKEN[sport.plus].omschrijving}
            </p>
          ))
        ) : (
          <p className="zacht" style={{ margin: 0 }}>
            Hoort bij een sessie — geen sessie, geen blok.
          </p>
        )}
      </div>

      <div className="kaart">
        <div className="kaart-titel">Diner vandaag · rotatieweek {rotatieNr}</div>
        {diner ? (
          <>
            <h2>{diner.naam}</h2>
            <p className="klein zacht">{diner.porties_tekst}</p>
            <p className="klein" style={{ margin: 0 }}>
              ±{diner.kcal} kcal per portie · basis: {diner.basis}
              {menuVandaag.porties > 1 ? ` · ${menuVandaag.porties} porties` : ''}
            </p>
          </>
        ) : (
          <p className="zacht" style={{ margin: 0 }}>Geen diner gepland.</p>
        )}
      </div>

      <div className="kaart">
        <div className="kaart-titel">Droge dagen</div>
        <button
          className={'knop' + (droog ? ' gedaan' : ' accent')}
          style={{ width: '100%' }}
          onClick={() => { toggleDroog(vandaag); ververs() }}
        >
          {droog ? 'Vandaag droog ✓' : 'Vandaag droog'}
        </button>
      </div>
    </div>
  )
}
