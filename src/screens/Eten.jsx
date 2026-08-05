import React, { useReducer } from 'react'
import { jaarWeekKey } from '../logic/week.js'
import {
  getGerechten, getRotatieWeek, getWeekmenu,
  getBoodschappen, maakBoodschappen, toggleBoodschap,
} from '../storage.js'

export default function Eten() {
  const [, ververs] = useReducer((n) => n + 1, 0)
  const weekKey = jaarWeekKey(new Date())
  const rotatieNr = getRotatieWeek(weekKey)
  const menu = getWeekmenu(weekKey)

  const gerechten = getGerechten().filter((g) => g.rotatie_week === rotatieNr)
  const dagenPerGerecht = Object.fromEntries(
    gerechten.map((g) => [g.id, menu.filter((r) => r.gerecht_id === g.id).map((r) => r.dag)])
  )

  const lijst = getBoodschappen(weekKey)
  const perCategorie = new Map()
  for (const item of lijst) {
    if (!perCategorie.has(item.categorie)) perCategorie.set(item.categorie, [])
    perCategorie.get(item.categorie).push(item)
  }
  const klaar = lijst.filter((b) => b.afgevinkt).length

  return (
    <div>
      <h1>Eten</h1>
      <p className="zacht" style={{ marginTop: '-0.3rem' }}>
        Rotatieweek {rotatieNr} — het schema is de waarheid.
      </p>

      {gerechten.map((g) => (
        <div className="kaart" key={g.id}>
          <div className="kaart-titel">{(dagenPerGerecht[g.id] || []).join(' · ') || 'diner'}</div>
          <h2>{g.naam}</h2>
          <p className="klein zacht">{g.porties_tekst}</p>
          <p className="klein" style={{ margin: 0 }}>
            ±{g.kcal} kcal · basis: {g.basis} · smaak: {g.smaak}
          </p>
        </div>
      ))}

      <div className="kaart">
        <div className="kaart-titel">Boodschappen</div>
        <button
          className="knop primair"
          style={{ width: '100%' }}
          onClick={() => { maakBoodschappen(weekKey); ververs() }}
        >
          {lijst.length === 0 ? 'Boodschappenlijst maken' : 'Lijst opnieuw maken'}
        </button>
        {lijst.length > 0 && (
          <>
            <p className="klein zacht" style={{ margin: '0.6rem 0 0' }}>
              Vaste lijst + aanvulling voor rotatieweek {rotatieNr} · {klaar}/{lijst.length} afgevinkt
            </p>
            {[...perCategorie.entries()].map(([categorie, items]) => (
              <div key={categorie}>
                <div className="categorie-kop">{categorie}</div>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={'boodschap' + (item.afgevinkt ? ' af' : '')}
                    onClick={() => { toggleBoodschap(item.id); ververs() }}
                  >
                    <span className="vinkje">✓</span>
                    <span className="naam">{item.naam}</span>
                    <span className="hoeveelheid">{item.hoeveelheid} {item.eenheid}</span>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
