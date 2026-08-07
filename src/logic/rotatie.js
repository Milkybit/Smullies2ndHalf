// Rotatielogica: 4 weken van elk 3 diners, week 5 = week 1.
// kook_factor 2 uit het plan: elk gerecht wordt dubbel gekookt en staat
// daarom standaard op 2 dagen (ma+di / wo+do / vr+zo). Zaterdag is de
// zaterdagse tafel: geen rotatiegerecht, geen boodschappen.
// Ontbijt en lunch staan standaard op de standaarddag-gerechten (o1/l1)
// en zijn per dag te wisselen naar een macro-gelijke variant.
// De snack 16:00 ligt vast en staat niet in het menu.

import { wekenTussen } from './week.js'

const DAG_PATROON = { ma: 0, di: 0, wo: 1, do: 1, vr: 2, za: null, zo: 2 }
const DAGEN = Object.keys(DAG_PATROON)

export const MAALTIJD_STANDAARD = { ontbijt: 'o1', lunch: 'l1' }

export function rotatieWeekNummer(weekKey, startKey) {
  const n = wekenTussen(startKey, weekKey)
  return ((n % 4) + 4) % 4 + 1
}

export function gerechtenVanRotatieWeek(gerechten, rotatieNr) {
  return gerechten.filter((g) => g.rotatie_week === rotatieNr)
}

export function standaardWeekmenu(weekKey, gerechten, rotatieNr) {
  const drie = gerechtenVanRotatieWeek(gerechten, rotatieNr)
  const rijen = []
  for (const [maaltijd, standaardId] of Object.entries(MAALTIJD_STANDAARD)) {
    for (const dag of DAGEN) {
      rijen.push({ jaar_week: weekKey, dag, maaltijd, gerecht_id: standaardId, porties: 1 })
    }
  }
  for (const dag of DAGEN) {
    const i = DAG_PATROON[dag]
    rijen.push({
      jaar_week: weekKey,
      dag,
      maaltijd: 'diner',
      gerecht_id: i !== null && drie[i] ? drie[i].id : null,
      porties: 1,
    })
  }
  return rijen
}

// Boodschappenlijst = vaste weeklijst + ingrediënten uit het weekmenu.
// Ingrediënten tellen per geplande dag × porties mee (kook_factor 2 volgt
// vanzelf uit een gerecht op 2 dagen); gelijke ingrediënten (zelfde naam +
// eenheid) worden samengevoegd. Ingrediënten zonder hoeveelheid ("naar
// smaak", voorraad-check) komen één keer op de lijst, ongeteld.
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
      const los = ing.hoeveelheid == null
      if (bestaand) {
        if (!los) bestaand.hoeveelheid += ing.hoeveelheid * porties
      } else {
        samengevoegd.set(sleutel, {
          jaar_week: weekKey,
          naam: ing.naam,
          hoeveelheid: los ? null : ing.hoeveelheid * porties,
          eenheid: ing.eenheid,
          categorie: ing.categorie,
          vast: false,
          afgevinkt: false,
        })
      }
    }
  }
  return items.concat([...samengevoegd.values()])
}
