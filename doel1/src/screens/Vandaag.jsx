import React, { useReducer } from 'react'
import { ANKERS, PLUS_BLOKKEN, DAG_NAMEN } from '../domein.js'
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

  const anker = ANKERS.find((a) => a.dag === dag) || null
  const sessies = getSessies()
  const sessieVandaag = sessies.find((s) => s.datum === vandaag && s.anker === dag)
  const extraVandaag = sessies.find((s) => s.datum === vandaag && s.anker === 'extra')
  const droog = getDrogeDagen().includes(vandaag)

  const menu = getWeekmenu(weekKey)
  const diner = getGerecht((menu.find((r) => r.dag === dag) || {}).gerecht_id)
  const rotatieNr = getRotatieWeek(weekKey)

  function zetSessie(mini) {
    saveSessie({ datum: vandaag, anker: dag, mini })
    ververs()
  }

  function wisSessie() {
    verwijderSessie(vandaag, dag)
    ververs()
  }

  const datumTekst = nu.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div>
      <h1>Vandaag</h1>
      <p className="zacht" style={{ marginTop: '-0.3rem' }}>{datumTekst}</p>

      {anker ? (
        <div className="kaart">
          <div className="kaart-titel">Anker van vandaag</div>
          <h2>{anker.naam}</h2>
          {dag === 'ma' ? (
            <>
              <div className="knoppenrij">
                <button
                  className={'knop' + (sessieVandaag && !sessieVandaag.mini ? ' gedaan' : '')}
                  onClick={() => (sessieVandaag && !sessieVandaag.mini ? wisSessie() : zetSessie(false))}
                >
                  {sessieVandaag && !sessieVandaag.mini ? 'Vol ✓' : 'Vol'}
                </button>
                <button
                  className={'knop' + (sessieVandaag && sessieVandaag.mini ? ' gedaan' : '')}
                  onClick={() => (sessieVandaag && sessieVandaag.mini ? wisSessie() : zetSessie(true))}
                >
                  {sessieVandaag && sessieVandaag.mini ? 'Mini ✓' : 'Mini'}
                </button>
              </div>
              <p className="klein zacht" style={{ margin: '0.5rem 0 0' }}>Vol én mini tellen allebei.</p>
            </>
          ) : (
            <button
              className={'knop primair' + (sessieVandaag ? ' gedaan' : '')}
              style={{ width: '100%' }}
              onClick={() => (sessieVandaag ? wisSessie() : zetSessie(false))}
            >
              {sessieVandaag ? 'Gedaan ✓' : 'Gedaan'}
            </button>
          )}
        </div>
      ) : (
        <div className="kaart">
          <div className="kaart-titel">Geen anker vandaag</div>
          <p className="zacht" style={{ margin: 0 }}>Rustdag — {DAG_NAMEN[dag]}.</p>
          <button
            className={'knop' + (extraVandaag ? ' gedaan' : '')}
            style={{ marginTop: '0.6rem' }}
            onClick={() => {
              if (extraVandaag) verwijderSessie(vandaag, 'extra')
              else saveSessie({ datum: vandaag, anker: 'extra' })
              ververs()
            }}
          >
            {extraVandaag ? 'Extra sessie ✓' : 'Toch bewogen? Extra sessie'}
          </button>
        </div>
      )}

      {anker && (
        <div className="kaart">
          <div className="kaart-titel">{PLUS_BLOKKEN[anker.plus].label}</div>
          {sessieVandaag ? (
            <p style={{ margin: 0 }}>
              +{PLUS_BLOKKEN[anker.plus].kcal} kcal — {PLUS_BLOKKEN[anker.plus].omschrijving}
            </p>
          ) : (
            <p className="zacht" style={{ margin: 0 }}>
              Hoort bij de sessie van vandaag — geen sessie, geen blok.
            </p>
          )}
        </div>
      )}

      <div className="kaart">
        <div className="kaart-titel">Diner vandaag · rotatieweek {rotatieNr}</div>
        {diner ? (
          <>
            <h2>{diner.naam}</h2>
            <p className="klein zacht">{diner.porties_tekst}</p>
            <p className="klein" style={{ margin: 0 }}>±{diner.kcal} kcal · basis: {diner.basis}</p>
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
