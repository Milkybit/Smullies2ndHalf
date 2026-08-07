// Domeinregels van Doel1 — deze constanten zijn de uitvoering van het plan
// (plan/doel1-plan.json), geen interpretatie ervan.

// Sportweek = 5 sporten, vrij over de week te plannen: je registreert per dag
// welke sessie(s) je deed. Week binnen = alle 5 die week gedaan (besluit van
// de gebruiker, aug 2026 — vervangt de oudere maandag+2-regel uit het plan).
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
// geregistreerd. Geen sessie = geen blok. Inhoud rechtstreeks uit het plan;
// de vaste weeklijst dekt de boodschappen ervan.
export const PLUS_BLOKKEN = {
  S: {
    label: 'Plus-blok S', naam: 'kracht', kcal: 200,
    timing: 'direct na de sessie',
    items: ['250 g magere kwark', '1 mandarijn of kiwi'],
  },
  M: {
    label: 'Plus-blok M', naam: 'kickboks/tennis', kcal: 345,
    timing: 'banaan ±1 uur vooraf; de rest na afloop',
    items: ['1 banaan', '250 g magere kwark', '1 rijstwafel met pindakaas'],
  },
  L: {
    label: 'Plus-blok L', naam: 'lange rit', kcal: 710,
    timing: 'vooraf / onderweg / na — nooit op een lege tank',
    items: ['1 snee volkorenbrood met honing', '3 bananen', '1 krentenbol of gevulde bidon', '250 g magere kwark'],
  },
}

// Zaterdagse tafel: zaterdagavond vervalt het rotatiegerecht (vieren-budget);
// geen diner gepland en geen boodschappen voor het za-diner.
export const ZATERDAGSE_TAFEL = 'Zaterdagse tafel — vrij (vieren-budget)'

// De ene toegestane zin bij een gemiste week. Geen rood, geen vonnis.
export const GEMISTE_WEEK_ZIN =
  'Vorige week niet binnen — data, geen vonnis. Deze week telt gewoon opnieuw.'

export const DAG_NAMEN = {
  ma: 'maandag', di: 'dinsdag', wo: 'woensdag', do: 'donderdag',
  vr: 'vrijdag', za: 'zaterdag', zo: 'zondag',
}
