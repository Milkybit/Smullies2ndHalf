import React, { useReducer, useState } from 'react'
import { MAALTIJDEN } from '../domein.js'
import { jaarWeekKey } from '../logic/week.js'
import {
  getGerechten, getGerecht, getRotatieWeek, getWeekmenu,
  zetWeekmenuGerecht, zetWeekmenuPorties, herstelWeekmenu,
  getBoodschappen, maakBoodschappen, toggleBoodschap,
} from '../storage.js'

export default function Eten() {
  const [, ververs] = useReducer((n) => n + 1, 0)
  const [maaltijd, setMaaltijd] = useState('diner')
  const weekKey = jaarWeekKey(new Date())
  const rotatieNr = getRotatieWeek(weekKey)
  const menu = getWeekmenu(weekKey)
  const gerechten = getGerechten()

  const keuzes = gerechten.filter((g) => g.soort === maaltijd)
  const maaltijdRijen = menu.filter((r) => r.maaltijd === maaltijd)

  // Elke menuwijziging rekent direct door in een al gemaakte lijst
  // (vinkjes blijven staan).
  function wijzigMenu(wijziging) {
    wijziging()
    if (getBoodschappen(weekKey).length > 0) maakBoodschappen(weekKey)
    ververs()
  }

  // Gepland deze week, over alle maaltijden heen, voor de gerechtkaarten.
  const gepland = new Map()
  for (const rij of menu) {
    if (!rij.gerecht_id) continue
    if (!gepland.has(rij.gerecht_id)) gepland.set(rij.gerecht_id, [])
    gepland.get(rij.gerecht_id).push(rij)
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
        Rotatieweek {rotatieNr} — stel het menu samen; de lijst rekent mee.
      </p>

      <div className="kaart">
        <div className="kaart-titel">Weekmenu — gerecht en porties per dag</div>
        <div className="maaltijd-tabs">
          {MAALTIJDEN.map(({ code, label }) => (
            <button
              key={code}
              className={'knop' + (maaltijd === code ? ' primair' : '')}
              onClick={() => setMaaltijd(code)}
            >
              {label}
            </button>
          ))}
        </div>
        {maaltijdRijen.map((rij) => (
          <div key={rij.dag} className="menurij">
            <span className="anker-dag">{rij.dag}</span>
            <select
              value={rij.gerecht_id || ''}
              onChange={(e) => wijzigMenu(() => zetWeekmenuGerecht(weekKey, rij.dag, maaltijd, e.target.value || null))}
            >
              <option value="">— geen —</option>
              {keuzes.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.rotatie_week ? `W${g.rotatie_week} · ` : ''}{g.naam}
                </option>
              ))}
            </select>
            <div className="stepper">
              <button
                className="knop"
                disabled={!rij.gerecht_id || rij.porties <= 1}
                onClick={() => wijzigMenu(() => zetWeekmenuPorties(weekKey, rij.dag, maaltijd, rij.porties - 1))}
              >−</button>
              <span>{rij.gerecht_id ? rij.porties : '·'}</span>
              <button
                className="knop"
                disabled={!rij.gerecht_id || rij.porties >= 9}
                onClick={() => wijzigMenu(() => zetWeekmenuPorties(weekKey, rij.dag, maaltijd, rij.porties + 1))}
              >+</button>
            </div>
          </div>
        ))}
        {maaltijd === 'diner' && (
          <button
            className="knop"
            style={{ width: '100%', marginTop: '0.5rem' }}
            onClick={() => wijzigMenu(() => herstelWeekmenu(weekKey))}
          >
            Herstel rotatievoorstel (week {rotatieNr})
          </button>
        )}
      </div>

      {[...gepland.entries()].map(([id, rijen]) => {
        const g = getGerecht(id)
        if (!g) return null
        const porties = rijen.reduce((som, r) => som + r.porties, 0)
        const label = MAALTIJDEN.find((m) => m.code === g.soort)?.label || g.soort
        return (
          <div className="kaart" key={id}>
            <div className="kaart-titel">
              {label} · {rijen.map((r) => r.dag).join(' · ')} · {porties} {porties === 1 ? 'portie' : 'porties'}
            </div>
            <h2>{g.naam}</h2>
            <p className="klein zacht">{g.porties_tekst}</p>
            <p className="klein" style={{ margin: 0 }}>
              ±{g.kcal} kcal per portie{g.basis ? ` · basis: ${g.basis}` : ''}{g.smaak ? ` · smaak: ${g.smaak}` : ''}
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
