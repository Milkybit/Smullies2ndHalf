import React, { useReducer } from 'react'
import { jaarWeekKey } from '../logic/week.js'
import {
  getGerechten, getGerecht, getRotatieWeek, getWeekmenu,
  zetWeekmenuGerecht, zetWeekmenuPorties, herstelWeekmenu,
  getBoodschappen, maakBoodschappen, toggleBoodschap,
} from '../storage.js'

export default function Eten() {
  const [, ververs] = useReducer((n) => n + 1, 0)
  const weekKey = jaarWeekKey(new Date())
  const rotatieNr = getRotatieWeek(weekKey)
  const menu = getWeekmenu(weekKey)
  const gerechten = getGerechten()

  // Elke menuwijziging rekent direct door in een al gemaakte lijst
  // (vinkjes blijven staan).
  function wijzigMenu(wijziging) {
    wijziging()
    if (getBoodschappen(weekKey).length > 0) maakBoodschappen(weekKey)
    ververs()
  }

  // De gerechten die deze week op het menu staan, met totaal porties.
  const opHetMenu = new Map()
  for (const rij of menu) {
    if (!rij.gerecht_id) continue
    opHetMenu.set(rij.gerecht_id, (opHetMenu.get(rij.gerecht_id) || 0) + rij.porties)
  }

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
        Rotatieweek {rotatieNr} — pas het menu gerust aan; de lijst rekent mee.
      </p>

      <div className="kaart">
        <div className="kaart-titel">Weekmenu — kies per dag gerecht en porties</div>
        {menu.map((rij) => (
          <div key={rij.dag} className="menurij">
            <span className="anker-dag">{rij.dag}</span>
            <select
              value={rij.gerecht_id || ''}
              onChange={(e) => wijzigMenu(() => zetWeekmenuGerecht(weekKey, rij.dag, e.target.value || null))}
            >
              <option value="">— geen —</option>
              {gerechten.map((g) => (
                <option key={g.id} value={g.id}>
                  W{g.rotatie_week} · {g.naam}
                </option>
              ))}
            </select>
            <div className="stepper">
              <button
                className="knop"
                disabled={!rij.gerecht_id || rij.porties <= 1}
                onClick={() => wijzigMenu(() => zetWeekmenuPorties(weekKey, rij.dag, rij.porties - 1))}
              >−</button>
              <span>{rij.gerecht_id ? rij.porties : '·'}</span>
              <button
                className="knop"
                disabled={!rij.gerecht_id || rij.porties >= 9}
                onClick={() => wijzigMenu(() => zetWeekmenuPorties(weekKey, rij.dag, rij.porties + 1))}
              >+</button>
            </div>
          </div>
        ))}
        <button
          className="knop"
          style={{ width: '100%', marginTop: '0.5rem' }}
          onClick={() => wijzigMenu(() => herstelWeekmenu(weekKey))}
        >
          Herstel rotatievoorstel (week {rotatieNr})
        </button>
      </div>

      {[...opHetMenu.entries()].map(([id, porties]) => {
        const g = getGerecht(id)
        if (!g) return null
        const dagen = menu.filter((r) => r.gerecht_id === id).map((r) => r.dag)
        return (
          <div className="kaart" key={id}>
            <div className="kaart-titel">
              {dagen.join(' · ')} · {porties} {porties === 1 ? 'portie' : 'porties'}
            </div>
            <h2>{g.naam}</h2>
            <p className="klein zacht">{g.porties_tekst}</p>
            <p className="klein" style={{ margin: 0 }}>
              ±{g.kcal} kcal per portie · basis: {g.basis} · smaak: {g.smaak}
            </p>
          </div>
        )
      })}

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
              Vaste lijst + ingrediënten × porties, rekent mee met het menu ·
              {' '}{klaar}/{lijst.length} afgevinkt
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
