// Rotatielogica: 4 weken van elk 3 gerechten, week 5 = week 1.
// Het standaard-weekmenu verdeelt de 3 gerechten over 7 dagen:
// ma+di gerecht 1, wo+do gerecht 2, vr+za+zo gerecht 3 (batch-koken).

import { wekenTussen } from './week.js'

const DAG_PATROON = { ma: 0, di: 0, wo: 1, do: 1, vr: 2, za: 2, zo: 2 }

export function rotatieWeekNummer(weekKey, startKey) {
  const n = wekenTussen(startKey, weekKey)
  return ((n % 4) + 4) % 4 + 1
}

export function gerechtenVanRotatieWeek(gerechten, rotatieNr) {
  return gerechten.filter((g) => g.rotatie_week === rotatieNr)
}

export function standaardWeekmenu(weekKey, gerechten, rotatieNr) {
  const drie = gerechtenVanRotatieWeek(gerechten, rotatieNr)
  return Object.entries(DAG_PATROON).map(([dag, i]) => ({
    jaar_week: weekKey,
    dag,
    gerecht_id: drie[i] ? drie[i].id : null,
    porties: 1,
  }))
}

// Boodschappenlijst = vaste lijst + weekaanvulling uit het weekmenu.
// Ingrediënten van hetzelfde gerecht tellen per geplande dag × porties mee;
// gelijke ingrediënten (zelfde naam + eenheid) worden samengevoegd.
export function bouwBoodschappenlijst(weekKey, weekmenu, gerechten, vasteLijst) {
  const items = []
  for (const v of vasteLijst) {
    items.push({ jaar_week: weekKey, ...v, vast: true, afgevinkt: false })
  }
  const perGerecht = new Map()
  for (const r of weekmenu) {
    if (r.gerecht_id) {
      const porties = r.porties || 1
      perGerecht.set(r.gerecht_id, (perGerecht.get(r.gerecht_id) || 0) + porties)
    }
  }
  const samengevoegd = new Map()
  for (const [gerechtId, porties] of perGerecht) {
    const gerecht = gerechten.find((g) => g.id === gerechtId)
    if (!gerecht) continue
    for (const ing of gerecht.ingredienten || []) {
      const sleutel = `${ing.naam}|${ing.eenheid}`
      const bestaand = samengevoegd.get(sleutel)
      if (bestaand) bestaand.hoeveelheid += ing.hoeveelheid * porties
      else samengevoegd.set(sleutel, {
        jaar_week: weekKey,
        naam: ing.naam,
        hoeveelheid: ing.hoeveelheid * porties,
        eenheid: ing.eenheid,
        categorie: ing.categorie,
        vast: false,
        afgevinkt: false,
      })
    }
  }
  return items.concat([...samengevoegd.values()])
}
