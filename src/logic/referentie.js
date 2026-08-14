// Referentiewaarden om je eigen cijfers te kunnen duiden. Dit zijn
// bevolkingsrichtlijnen, geen diagnose — de app oordeelt nooit, hij rekent
// alleen om zodat je weet waar je staat.
//
// Bronnen:
// - gezond gewicht: WHO-BMI-range 18,5-24,9 voor volwassenen.
// - gezond vetpercentage: leeftijds- en geslachtsgecorrigeerde tabellen
//   (Gallagher e.a., Am J Clin Nutr 2000), zoals ACE/ACSM die gebruiken.
//   Let op: een weegschaal met bio-impedantie zit er makkelijk enkele
//   procentpunten naast; de trend is betrouwbaarder dan de absolute waarde.

export const BMI_GEZOND_MIN = 18.5
export const BMI_GEZOND_MAX = 24.9

export function bmi(gewichtKg, lengteCm) {
  if (!gewichtKg || !lengteCm) return null
  const m = lengteCm / 100
  return gewichtKg / (m * m)
}

// Gewichtsband bij een gezonde BMI voor deze lengte.
export function gezondGewicht(lengteCm) {
  if (!lengteCm) return null
  const m = lengteCm / 100
  return { min: BMI_GEZOND_MIN * m * m, max: BMI_GEZOND_MAX * m * m }
}

// Gezond vetpercentage per leeftijdsgroep. Vet stijgt met de jaren; deze
// banden horen bij een gezonde BMI in dezelfde leeftijdsgroep.
const VET_BANDEN = {
  man: [
    { tot: 40, min: 8, max: 19 },
    { tot: 60, min: 11, max: 22 },
    { tot: 200, min: 13, max: 25 },
  ],
  vrouw: [
    { tot: 40, min: 21, max: 33 },
    { tot: 60, min: 23, max: 34 },
    { tot: 200, min: 24, max: 36 },
  ],
}

export function gezondVetPercentage(leeftijd, geslacht = 'man') {
  const banden = VET_BANDEN[geslacht] || VET_BANDEN.man
  const band = banden.find((b) => leeftijd < b.tot) || banden[banden.length - 1]
  return { min: band.min, max: band.max }
}

// Wat die percentages bij een gegeven gewicht in kilo's vet betekenen.
export function gezondeVetmassa(gewichtKg, leeftijd, geslacht = 'man') {
  if (!gewichtKg) return null
  const band = gezondVetPercentage(leeftijd, geslacht)
  return { min: gewichtKg * band.min / 100, max: gewichtKg * band.max / 100 }
}

// Bij welk gewicht kom je uit als je vetvrije massa gelijk blijft en je
// alleen vet verliest? Zo vertaalt een streefpercentage naar een streefgewicht.
export function gewichtBijVetPercentage(vetvrijeMassaKg, doelVetPct) {
  if (!vetvrijeMassaKg || doelVetPct == null || doelVetPct >= 100) return null
  return vetvrijeMassaKg / (1 - doelVetPct / 100)
}
