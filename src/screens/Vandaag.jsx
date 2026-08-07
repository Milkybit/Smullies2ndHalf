import React, { useReducer } from 'react'
import { SPORTEN, PLUS_BLOKKEN, ZATERDAGSE_TAFEL } from '../domein.js'
import { dagCode, datumKey, jaarWeekKey } from '../logic/week.js'
import {
  getSessies, saveSessie, verwijderSessie,
  getWeekmenu, getGerecht, getRotatieWeek, getStandaarddag,
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
  const dinerRij = menu.find((r) => r.dag === dag) || {}
  const diner = getGerecht(dinerRij.gerecht_id)
  const rotatieNr = getRotatieWeek(weekKey)
  const standaarddag = getStandaarddag().filter((m) => m.items.length > 0)

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
          blokkenVandaag.map((sport) => {
            const blok = PLUS_BLOKKEN[sport.plus]
            return (
              <div key={sport.code} style={{ marginBottom: '0.5rem' }}>
                <strong>{sport.naam}</strong> → {blok.label} · +{blok.kcal} kcal
                <p className="klein zacht" style={{ margin: 0 }}>{blok.items.join(' · ')}</p>
                <p className="klein zacht" style={{ margin: 0, fontStyle: 'italic' }}>{blok.timing}</p>
              </div>
            )
          })
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
            <p className="klein" style={{ margin: '0 0 0.3rem' }}>
              ±{diner.kcal} kcal · basis: {diner.basis} · {diner.smaak}
              {dinerRij.porties > 1 ? ` · ${dinerRij.porties} porties` : ''}
            </p>
            <p className="klein zacht" style={{ margin: 0 }}>{diner.porties_tekst}</p>
          </>
        ) : dag === 'za' ? (
          <p className="zacht" style={{ margin: 0 }}>{ZATERDAGSE_TAFEL} 🎉</p>
        ) : (
          <p className="zacht" style={{ margin: 0 }}>Geen diner gepland.</p>
        )}
      </div>

      <div className="kaart">
        <div className="kaart-titel">Standaarddag</div>
        {standaarddag.map((m) => (
          <p key={m.moment} className="klein" style={{ margin: '0 0 0.3rem' }}>
            <strong>{m.moment === 'snack_1600' ? 'Snack 16:00' : m.moment[0].toUpperCase() + m.moment.slice(1)}</strong>
            <span className="zacht"> · ±{m.kcal_totaal} kcal · {m.items.map((i) =>
              i.hoeveelheid != null ? `${i.hoeveelheid} ${i.eenheid} ${i.naam}` : i.naam
            ).join(' · ')}</span>
          </p>
        ))}
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
