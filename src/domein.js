// Domeinregels van Doel1 — deze constanten zijn de uitvoering van het plan,
// geen interpretatie ervan. Niet aanpassen zonder het plan erbij.

// Sportweek = 5 ankers. Plus-blokken horen bij ankers:
// S op ma/vr, M op di/wo, L op za — alleen zichtbaar op de dag van dat anker.
export const ANKERS = [
  { dag: 'ma', naam: 'Kracht A', plus: 'S' },
  { dag: 'di', naam: 'Kickboksen', plus: 'M' },
  { dag: 'wo', naam: 'Tennis', plus: 'M' },
  { dag: 'vr', naam: 'Kracht B', plus: 'S' },
  { dag: 'za', naam: 'Racefiets', plus: 'L' },
]

export const ANKER_DAGEN = ANKERS.map((a) => a.dag)

// Invulling van de plus-blokken is een startpunt (uit het plan over te nemen).
export const PLUS_BLOKKEN = {
  S: { label: 'Plus-blok S', kcal: 150, omschrijving: 'bijv. schaaltje kwark met fruit' },
  M: { label: 'Plus-blok M', kcal: 250, omschrijving: 'bijv. volkoren boterham met pindakaas en een banaan' },
  L: { label: 'Plus-blok L', kcal: 400, omschrijving: 'bijv. extra portie basis bij het diner + hersteldrank' },
}

// De ene toegestane zin bij een gemiste week. Geen rood, geen vonnis.
export const GEMISTE_WEEK_ZIN =
  'Vorige week niet binnen — data, geen vonnis. Deze week telt gewoon opnieuw.'

export const DAG_NAMEN = {
  ma: 'maandag', di: 'dinsdag', wo: 'woensdag', do: 'donderdag',
  vr: 'vrijdag', za: 'zaterdag', zo: 'zondag',
}
