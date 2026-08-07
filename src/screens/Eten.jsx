import React, { useReducer } from 'react'
import { ZATERDAGSE_TAFEL } from '../domein.js'
import { jaarWeekKey } from '../logic/week.js'
import {
  getGerechten, getGerecht, getRotatieWeek, getWeekmenu, getStandaarddag,
  zetWeekmenuGerecht, zetWeekmenuPorties, herstelWeekmenu,
  getBoodschappen, maakBoodschappen, toggleBoodschap,
} from '../storage.js'

const MOMENT_LABELS = { ontbijt: 'Ontbijt', lunch: 'Lunch', snack_1600: 'Snack 16:00', diner: 'Diner' }

export default function Eten() {
  const [, ververs] = useReducer((n) => n + 1, 0)
  const weekKey = jaarWeekKey(new Date())
  const rotatieNr = getRotatieWeek(weekKey)
  const menu = getWeekmenu(weekKey)
  const gerechten = getGerechten()
  const standaarddag = getStandaarddag()

  // Elke menuwijziging rekent direct door in een al gemaakte lijst
  // (vinkjes blijven staan).
  function wijzigMenu(wijziging) {
    wijziging()
    if (getBoodschappen(weekKey).length > 0) maakBoodschappen(weekKey)
    ververs()
  }

  // Geplande diners deze week, voor de gerechtkaarten.
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
        Rotatieweek {rotatieNr} — het schema is de waarheid.
      </p>

      <div className="kaart">
        <div className="kaart-titel">Standaarddag — elke dag hetzelfde</div>
        {standaarddag.filter((m) => m.items.length > 0).map((m) => (
          <div key={m.moment} style={{ marginBottom: '0.5rem' }}>
            <strong>{MOMENT_LABELS[m.moment] || m.moment}</strong>
            <span className="klein zacht"> · ±{m.kcal_totaal} kcal</span>
            <p className="klein zacht" style={{ margin: 0 }}>
              {m.items.map((i) => i.hoeveelheid != null
                ? `${i.hoeveelheid} ${i.eenheid} ${i.naam}`
                : `${i.naam} ${i.eenheid}`).join(' · ')}
            </p>
            {m.notitie && <p className="klein zacht" style={{ margin: 0, fontStyle: 'italic' }}>{m.notitie}</p>}
          </div>
        ))}
        <p className="klein zacht" style={{ margin: 0 }}>
          Diner: het rotatiegerecht van de dag (±690–755 kcal). De vaste
          weeklijst dekt de standaarddag en de plus-blokken.
        </p>
      </div>

      <div className="kaart">
        <div className="kaart-titel">Diners deze week — kook_factor 2: 1× koken = 2× eten</div>
        {menu.map((rij) => (
          <div key={rij.dag} className="menurij">
            <span className="anker-dag">{rij.dag}</span>
            <select
              value={rij.gerecht_id || ''}
              onChange={(e) => wijzigMenu(() => zetWeekmenuGerecht(weekKey, rij.dag, 'diner', e.target.value || null))}
            >
              <option value="">{rij.dag === 'za' ? `— ${ZATERDAGSE_TAFEL.toLowerCase()} —` : '— geen —'}</option>
              {gerechten.map((g) => (
                <option key={g.id} value={g.id}>W{g.rotatie_week} · {g.naam}</option>
              ))}
            </select>
            <div className="stepper">
              <button
                className="knop"
                disabled={!rij.gerecht_id || rij.porties <= 1}
                onClick={() => wijzigMenu(() => zetWeekmenuPorties(weekKey, rij.dag, 'diner', rij.porties - 1))}
              >−</button>
              <span>{rij.gerecht_id ? rij.porties : '·'}</span>
              <button
                className="knop"
                disabled={!rij.gerecht_id || rij.porties >= 9}
                onClick={() => wijzigMenu(() => zetWeekmenuPorties(weekKey, rij.dag, 'diner', rij.porties + 1))}
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

      {[...gepland.entries()].map(([id, rijen]) => {
        const g = getGerecht(id)
        if (!g) return null
        const porties = rijen.reduce((som, r) => som + r.porties, 0)
        return (
          <div className="kaart" key={id}>
            <div className="kaart-titel">
              {rijen.map((r) => r.dag).join(' · ')} · {porties} {porties === 1 ? 'portie' : 'porties'}
            </div>
            <h2>{g.naam}</h2>
            <p className="klein" style={{ margin: '0 0 0.3rem' }}>
              ±{g.kcal} kcal · {g.anker} · {g.kleur1} + {g.kleur2} · basis: {g.basis} · {g.smaak}
            </p>
            <p className="klein zacht">{g.porties_tekst}</p>
            {g.bereiding && <p className="klein zacht" style={{ margin: 0 }}>{g.bereiding}</p>}
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
              Vaste weeklijst + diner-ingrediënten × porties, rekent mee met
              het menu · {klaar}/{lijst.length} afgevinkt
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
                    <span className="hoeveelheid">
                      {item.hoeveelheid != null ? `${item.hoeveelheid} ${item.eenheid}` : item.eenheid}
                    </span>
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
