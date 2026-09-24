# PrepPartner

De productrichting is **premium sport & voeding**: een persoonlijke planner met warme typografie, culinaire sfeerbeelden en een duidelijke route van recepten naar boodschappen en kookdag. De startselectie voegt op verzoek drie recepten met zes porties toe; nieuwe recepten nemen het caloriedoel van je mealprep-eetmomenten over. Bestaande gegevens blijven bewaard.

Zie [PRODUCT.md](PRODUCT.md) voor de commerciële productrichting en de stappen naar accounts en abonnementen. Deze versie bewaart gegevens nog lokaal. De drie gegenereerde receptbeelden en hun prompts staan in [public/images/README.md](public/images/README.md).

PrepPartner is een bruikbare, Nederlandstalige mealprep-planner voor één persoon. Bereken je energie- en macrodoelen, pas 30 vriesvriendelijke recepten aan, maak een batch en werk met één boodschappenlijst en een kookplanning. Persoonlijke gegevens blijven in je browser.

**Nieuw: component-first optimizer (fase 1B).** Selecteer kandidaten in Recepten, kies in Mijn batch bijvoorbeeld **60 maaltijden / 10 recepten / 6 porties** en druk op **Optimaliseer**. Vergelijk efficiëntie en variatie, pas het voorstel toe en open **Slim combineren → Voorbereidingslijst → Kookdag**. De knop **Laad scenario 60 maaltijden** vult de kippendij/Aziatisch-voorkeuren in. Zie [architectuur en gebruik](PHASE_1B.md) en [de praktische keukenreview](reports/kitchen-review.md).

Deze versie vervangt de eerdere Doel1-app volledig. De oude code blijft terug te vinden in de Git-geschiedenis. Er is geen Supabase, login, externe voedings-API, AI-API, analytics of cloudsynchronisatie.

## Requirements

- **Node.js 22 of hoger** (inclusief npm). Download de LTS-versie via [nodejs.org](https://nodejs.org/).
- **npm**. Controleer je installatie met `node --version` en `npm --version`.

## Installation

Download of clone de repository en open een terminal in de projectmap, waar `package.json` staat.

```sh
npm install
```

## Run development server

```sh
npm run dev
```

Open **http://localhost:3000**. Laat de terminal open tijdens het gebruik. Stop de server met `Ctrl+C`.

Op Windows: gebruik `npm.cmd` in plaats van `npm` als PowerShell een fout over execution policy geeft. Je hoeft daarvoor je beveiligingsinstellingen niet te veranderen.

## Tests en productie

```sh
npm test
npm run typecheck
npm run build
npm start
```

- `npm test`: draait alle Vitest-tests één keer. `npm run test:watch` houdt de tests actief tijdens ontwikkelen.
- `npm run typecheck`: controleert strict TypeScript.
- `npm run build`: maakt de productieversie en controleert ook TypeScript.
- `npm start`: start die gebouwde versie op http://localhost:3000. Draai eerst de build.
- Er is geen aparte linter geconfigureerd. De code gebruikt strict TypeScript en vermijdt `any`.

Next.js **16.3.5** en React **19.3.0** waren de stabiele npm-versies bij implementatie. `package-lock.json` legt alle exacte versies vast. Gebruik `npm ci` voor een reproduceerbare installatie, zoals in CI.

## Je eerste kookdag

1. Vul je profiel in. Er is geen vooraf ingevuld persoonlijk profiel.
2. Kies afvallen, onderhouden of spiermassa opbouwen. Pas desgewenst calorieën of macro’s aan.
3. Bewerk de zes eetmomenten. Bij 2.000 kcal starten ze op 400 / 130 / 600 / 120 / 600 / 150 kcal.
4. Bekijk **Recepten**. Open een recept, vul je doelen en porties in en klik **Pas recept aan**.
5. Voeg recepten aan **Batch samenstellen** toe. Tien recepten van zes porties geven 60 maaltijden, oftewel 30 dagen bij twee mealpreps per dag.
6. Kijk onder **Keukenspullen** wat je nodig hebt en vink af wat je al hebt. De spullen met ‘Basis’ zijn genoeg om te beginnen. Meet eerst je oven, spoelbak, koelkast, aanrecht en vriezer.
7. Open **Boodschappen**: afvinken, kopiëren, printen of als tekst downloaden.
8. Geef onder **Kookplan** je pitten, ovens en maximale porties per pan op.
9. Open tijdens het koken **Opbrengst invoeren**. Weeg eiwit, rijst/pasta en bases afzonderlijk. Meet per kookronde om meteen te verdelen; een hele-componentmeting geldt voor fysiek samengevoegde deelrondes.
10. Maak regelmatig een JSON-back-up via **Instellingen → Exporteer gegevens**.

Wil je weten hoe PrepPartner rekent en welke aannames erin zitten? Open **Zo werkt het**. Per onderwerp staat daar hoe het werkt, welke aannames er zijn (onderbouwd, vuistregel of eigen keuze, met bronnen), waarom het werkt en wanneer het niet klopt, met je eigen berekening erbij. Via ‘Waarom zo?’ op de schermen kom je direct bij het juiste stuk.

## Projectstructuur

```text
app/                    Next.js-routes, layout en responsieve styling
components/             Herbruikbare UI en schermcomponenten
  screens/              Afzonderlijke schermen, geen monolithische appcomponent
domain/                 TypeScript-modellen, grenzen en validatie
calculations/           Pure functies voor energie, macro’s, recepten en planning
data/ingredients.ts     Bewerkbare standaardvoedingswaarden en verpakkingen
data/recipes.ts         Alle 30 receptdefinities en bereidingsinstructies
data/kitchen.ts         Keukenspullen, meettips en wat je niet nodig hebt
data/explanations.ts    Uitleg voor ‘Zo werkt het’: aannames, bronnen en grenzen
services/               StorageRepository, importvalidatie en tekstexport
tests/                  Vitest-tests voor rekenregels en opslag
.github/workflows/      Tests, typecheck, build en GitHub Pages-deployment
public/sw.js            Alleen migratie: ruimt de oude Doel1-serviceworker op
```

## Hoe de berekeningen werken

Alle rekenlogica staat buiten React, in `calculations/`. Voor gebruikers staat dezelfde uitleg in de app onder **Zo werkt het**. Getallen en factoren staan in `domain/constants.ts`; de berekening en de uitleg lezen ze allebei daar, zodat ze niet uit elkaar lopen. `services/explanation.ts` schrijft de berekening uit met de eigen gegevens van de gebruiker. Verander je een rekenregel, controleer dan ook de tekst in `data/explanations.ts`.

- **BMR:** Katch–McArdle wanneer vetpercentage is ingevuld; anders Mifflin–St Jeor. TDEE = BMR × activiteitsfactor. Trainingen zitten in de gekozen factor en worden niet nogmaals toegevoegd.
- **Afvallen:** gewenst kg/week × 7.700 / 7. Automatische tekorten zijn begrensd op 25% van geschat TDEE. De app toont een waarschuwing als de wens daarboven ligt; handmatig overschrijven blijft mogelijk.
- **Onderhoud / opbouw:** TDEE, respectievelijk TDEE + instelbaar overschot (standaard 250 kcal).
- **Macro’s:** eiwit = 2,2 g/kg vetvrije massa of 1,6 g/kg lichaamsgewicht. Vet start op 30% van calorieën. Koolhydraten vullen de resterende energie in. Bij conflicterende handmatige macro’s worden negatieve koolhydraten op nul gezet en verschijnt een waarschuwing; je invoer wordt niet stiekem herschreven.
- **Dagindeling:** vastgezette eetmomenten blijven gelijk. De overige calorieën worden naar verhouding verdeeld, met afrondingscorrectie zodat het totaal klopt.
- **Voedingswaarden:** som van gramgewicht × voedingswaarde per 100 g. Rijst/pasta zijn **droog**, vlees is **rauw**, bonen en tonijn zijn **uitgelekt**. Interne berekeningen bewaren precisie; de UI rondt af voor leesbaarheid.
- **Slim schalen:** groente, saus en smaakmakers blijven op hun voorkeursgewicht. Een begrensde zoekstap varieert de primaire eiwitbron in stappen van 1 g; rijst/pasta wordt analytisch aangepast en olie kan maximaal 4 g rond de voorkeur corrigeren. Eiwit heeft prioriteit. Het doel is binnen ±20 kcal en minstens het gevraagde eiwit. Onhaalbare doelen geven een expliciete waarschuwing.
- **Basisrecepten:** de ingrediënten uit de seed worden eenmaal met de standaardcatalogus op circa 600 kcal / 50 g eiwit gekalibreerd. Er zijn geen opgeslagen macrototalen; wijzigingen aan productwaarden werken door in alle berekeningen. De seed wordt niet aangepast door gebruikerswijzigingen.
- **Boodschappen:** exacte gramgewichten worden per ingrediënt-ID opgeteld. Verpakkingen worden naar boven afgerond. Het vinkje is gekoppeld aan de benodigde hoeveelheid en vervalt bij een gewijzigde hoeveelheid.
- **Gekookte opbrengst:** gekookt totaal × droog aandeel van het recept ÷ aantal porties. Dit verandert de voedingswaarden niet. Een gewijzigde droge batchhoeveelheid maakt een oude meting ongeldig.
- **Kookplan:** componentproductie met afhankelijkheden, gewichtsgrenzen, vrije apparaatintervallen en gereserveerde aandacht voor één kok. Beginhandelingen, laatste afwerking en verdelen overlappen niet. Beperkte rondes voorkomen dat alle zestig maaltijden tegelijk warm staan. Tijden zijn nog niet in de keuken gekalibreerd.

## Recept toevoegen

Voeg in `data/recipes.ts` een `Seed` toe met een unieke Engelse `id`, Nederlandse naam, keuken, eiwitbron, groenten, saus, bereidingsmethode en eventueel peulvruchten. Gebruik bestaande ingrediënt-ID’s.

De helper maakt per-portie `RecipeIngredient`-regels met rol, minimum, maximum en voorkeursgewicht. De huidige schaalservice verwacht één variabele primaire eiwitbron, één variabele koolhydraatbron en hoogstens één variabel correctievet. Andere ingrediënten blijven gelijk. Voor wezenlijk andere recepten pas je de schaalservice en de tests aan.

`baseServings` is altijd 1; een batch vermenigvuldigt de aangepaste portie. Rijst kan door pasta worden vervangen via `starch: 'pasta'`. Nieuwe recepten krijgen automatisch een detailpagina bij de volgende build. Pas de test voor het aantal seedrecepten bewust aan wanneer de bibliotheek groeit.

## Ingrediënt toevoegen of aanpassen

Voor je eigen supermarktproduct gebruik je **Ingrediënten → Bewerk**. Vul de verpakking in gram in; voor blikproducten is dit het uitlekgewicht. Een leeg verpakkingsveld betekent onbekend.

Voor een nieuwe standaardgrondstof voeg je een regel toe in `data/ingredients.ts`: unieke ID, Nederlandse naam, categorie, kcal/eiwit/koolhydraten/vet/vezels per 100 g, gewichtssoort en optionele verpakking. Gebruik droge gewichten voor granen en linzen. Bouillonhoeveelheden zijn aangemaakte bouillon, niet het droge blokje. Voedingswaarden zijn representatieve schattingen; controleer je eigen etiket.

Alle vloeistoffen worden intern eveneens in gram gerekend. Waar een dichtheid bekend is, vermeldt de editor de gram/ml-factor. Zo worden milliliters niet ongemerkt als grammen olie behandeld.

## Lokale opslag en herstel

`services/storage.ts` definieert `StorageRepository`. De browserimplementatie gebruikt alleen de sleutel `mealprep-planner:v1`. Die sleutel houdt bewust de oude naam van vóór PrepPartner, zodat bestaande gegevens in je browser behouden blijven. React-schermen roepen deze repository aan via de centrale provider; zij gebruiken localStorage niet rechtstreeks.

Opgeslagen worden profiel, overrides, eetmomenten, ingrediëntaanpassingen, batchinstellingen, winkelvinkjes, apparatuur, gekookte opbrengsten, afgevinkte kooktaken en afgevinkte keukenspullen. Back-ups van vóór de lijst met keukenspullen blijven geldig. Macrototalen en boodschappen worden afgeleid en niet opgeslagen.

Fase 1B bewaart ook kandidaten, kipkeuze per batchrecept, gewichtsgrenzen en component-/rondemetingen. Oude v1-back-ups worden automatisch aangevuld. Alleen oude receptgerichte kookvinkjes vervallen, omdat het nieuwe kookplan andere taken bevat.

De JSON-back-up heeft een versie en wordt volledig gevalideerd, inclusief getalsgrenzen en bekende ID’s. Ongeldige of toekomstige versies worden geweigerd. Import vraagt bevestiging voordat bestaande gegevens worden vervangen. Opslagfouten worden zichtbaar gemeld. Bij beschadigde opgeslagen data wordt die inhoud niet automatisch overschreven door een lege startstatus.

**Reset:** open Instellingen → Reset applicatie en bevestig. Alleen deze app-sleutel wordt verwijderd. Oude Doel1-localStorage blijft onaangeroerd; er is geen automatische migratie van het oude, andere datamodel.

localStorage hoort bij één browser en webadres. `localhost:3000`, `127.0.0.1:3000` en GitHub Pages delen dus geen gegevens. Maak een export voordat je browserdata wist, een andere browser gebruikt of verhuist. Gebruik één actieve tab tegelijk.

## GitHub Pages

De workflow test en bouwt de volledige app. Voor de bestaande Pages-site zet CI `STATIC_EXPORT=true`; Next.js exporteert naar `out/` met `/Smullies2ndHalf` als basispad. De deployment draait alleen voor de standaardbranch of een handmatig gestarte run op die branch. Er zijn geen databasesleutels nodig.

Gewoon `npm run build` blijft een normale Next.js-build zodat `npm start` werkt. Gebruik de geëxporteerde `out/` alleen voor statische hosting, niet met `npm start`.

De kleine `public/sw.js` is een eenmalige overgang voor browsers die nog de oude Doel1-serviceworker hebben. Hij verwijdert alleen de oude `doel1-v1`-cache, schrijft geen persoonlijke gegevens en meldt zichzelf af. De nieuwe planner registreert geen serviceworker en heeft geen gegarandeerde offline-modus.

## Grenzen van deze MVP

- Voedingswaarden, energieverbruik en receptscores zijn schattingen; geen medische beoordeling of laboratoriumgegevens.
- Geen receptaanmaak in de UI; nieuwe recepten worden in de seed toegevoegd. Ingrediëntwaarden zijn wel in de UI bewerkbaar.
- De maaltijdindeling plant calorieën; het is geen logboek voor werkelijk gegeten eten en geen datumkalender voor ingevroren porties.
- De kookplanning is een praktische schatting. Pannen, werktempo, vriescapaciteit en actieve handelingen verschillen. Begin bij veel maaltijden met een kleinere proefbatch.
- Meet standaard per kookronde en verdeel direct. Gebruik een hele-componentmeting alleen als alle gekookte deelrondes fysiek gemengd zijn. Bewaar componenten tussendoor veilig gekoeld.
- De app bepaalt geen allergenen of dieetgeschiktheid. Controleer ingrediënten en productetiketten zelf.
- Geen accounts, cloudsynchronisatie, multi-tab-conflictresolutie, dark mode of volledige offline-PWA.
- Backup-import ondersteunt alleen versie 1. Voor een latere schemawijziging hoort een expliciete migratie te worden toegevoegd.

Praktische bewaarinstructies volgen het [Voedingscentrum: mealpreppen](https://www.voedingscentrum.nl/nl/service/vraag-en-antwoord/koken-en-bewaren/hoe-kan-ik-meal-preppen). Koel bereide gerechten snel in ondiepe porties en zet ze binnen 2 uur in koelkast of vriezer. Plan vriescapaciteit mee.

## Future phases

- Supabase/PostgreSQL achter de repository-interface
- Authentication en multi-user accounts
- Apple Health / HealthKit
- Apple Watch activity data
- Weight history
- TDEE calibration based on actual weight change
- Barcode scanning
- Supermarket product database
- Price tracking en cost per meal
- Automatic recipe recommendations
- Pantry stock
- Native iOS application

De eerstvolgende logische uitbreidingen zijn voorraadbeheer, eigen recepten, kosten per portie en kalibratie op gemeten gewichtstrend. Persoonlijke data hoeft daarvoor in deze fase nog niet naar de cloud.
