// Domeinregels van Doel1 — deze constanten zijn de uitvoering van het plan,
// geen interpretatie ervan. Niet aanpassen zonder het plan erbij.

// Sportweek = 5 sporten, vrij over de week te plannen: je registreert per dag
// welke sessie(s) je deed. Week binnen = alle 5 die week gedaan.
// De `code` is de waarde in de sessies-tabel (kolom `anker`); de codes komen
// nog uit het oude vaste-dagen-schema en blijven zo voor de datamigratie.
// Kracht A kent vol/mini — allebei tellen.
export const SPORTEN = [
  { code: 'ma', naam: 'Kracht A', plus: 'S' },
  { code: 'di', naam: 'Kickboksen', plus: 'M' },
  { code: 'wo', naam: 'Tennis', plus: 'M' },
  { code: 'vr', naam: 'Kracht B', plus: 'S' },
  { code: 'za', naam: 'Racefiets', plus: 'L' },
]

export const SPORT_CODES = SPORTEN.map((s) => s.code)

// Plus-blokken horen bij sporten (S bij Kracht A/B, M bij Kickboksen/Tennis,
// L bij Racefiets) en verschijnen alleen op de dag dat die sessie is
// geregistreerd. Geen sessie = geen blok. Invulling is een startpunt.
export const PLUS_BLOKKEN = {
  S: { label: 'Plus-blok S', kcal: 150, omschrijving: 'bijv. schaaltje kwark met fruit' },
  M: { label: 'Plus-blok M', kcal: 250, omschrijving: 'bijv. volkoren boterham met pindakaas en een banaan' },
  L: { label: 'Plus-blok L', kcal: 400, omschrijving: 'bijv. extra portie basis bij het diner + hersteldrank' },
}

// De ene toegestane zin bij een gemiste week. Geen rood, geen vonnis.
export const GEMISTE_WEEK_ZIN =
  'Vorige week niet binnen — data, geen vonnis. Deze week telt gewoon opnieuw.'

// Maaltijden van het weekmenu. Alleen het diner draait mee in de
// 4-weken-rotatie; ontbijt, lunch en snack kies je per dag.
export const MAALTIJDEN = [
  { code: 'ontbijt', label: 'Ontbijt' },
  { code: 'lunch', label: 'Lunch' },
  { code: 'diner', label: 'Diner' },
  { code: 'snack', label: 'Snack' },
]

export const DAG_NAMEN = {
  ma: 'maandag', di: 'dinsdag', wo: 'woensdag', do: 'donderdag',
  vr: 'vrijdag', za: 'zaterdag', zo: 'zondag',
}
