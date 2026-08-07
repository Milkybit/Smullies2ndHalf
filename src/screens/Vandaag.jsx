import React, { useReducer } from 'react'
import { SPORTEN, PLUS_BLOKKEN, MAALTIJDEN } from '../domein.js'
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
  const rustVandaag = sessiesVandaag.find((s) => s.anker === 'rust')
  const sportVandaag = sessiesVandaag.some((s) => s.anker !== 'rust')
  const droog = getDrogeDagen().includes(vandaag)

  const menu = getWeekmenu(weekKey)
  const menuVandaag = MAALTIJDEN.map(({ code, label }) => {
    const rij = menu.find((r) => r.dag === dag && r.maaltijd === code) || {}
    return { code, label, gerecht: getGerecht(rij.gerecht_id), porties: rij.porties || 1 }
  }).filter((m) => m.gerecht)
  const rotatieNr = getRotatieWeek(weekKey)

  // Kracht A tikt door: niet → vol → mini → niet; de rest is aan/uit.
  // Een sport kiezen haalt een eerder gezette rustdag weg.
  function tikSport(code) {
    if (rustVandaag) verwijderSessie(vandaag, 'rust')
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
        <div className="knoppenrij">
          <button
            className={'knop' + (extraVandaag ? ' gedaan' : '')}
            onClick={() => {
              if (extraVandaag) {
                verwijderSessie(vandaag, 'extra')
              } else {
                if (rustVandaag) verwijderSessie(vandaag, 'rust')
                saveSessie({ datum: vandaag, anker: 'extra' })
              }
              ververs()
            }}
          >
            {extraVandaag ? 'Extra sessie ✓' : 'Extra sessie'}
          </button>
          <button
            className={'knop' + (rustVandaag ? ' gedaan' : '')}
            disabled={sportVandaag && !rustVandaag}
            onClick={() => {
              if (rustVandaag) verwijderSessie(vandaag, 'rust')
              else saveSessie({ datum: vandaag, anker: 'rust' })
              ververs()
            }}
          >
            {rustVandaag ? 'Rustdag ✓' : 'Vandaag rustdag'}
          </button>
        </div>
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
        <div className="kaart-titel">Eten vandaag · rotatieweek {rotatieNr}</div>
        {menuVandaag.length > 0 ? (
          menuVandaag.map(({ code, label, gerecht, porties }) => (
            <div key={code} style={{ marginBottom: '0.5rem' }}>
              <span className="klein zacht">{label}</span>
              <div><strong>{gerecht.naam}</strong></div>
              <p className="klein zacht" style={{ margin: 0 }}>
                ±{gerecht.kcal} kcal per portie
                {gerecht.basis ? ` · basis: ${gerecht.basis}` : ''}
                {porties > 1 ? ` · ${porties} porties` : ''}
              </p>
            </div>
          ))
        ) : (
          <p className="zacht" style={{ margin: 0 }}>
            Nog niets gepland — stel het weekmenu samen op het Eten-tabblad.
          </p>
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
