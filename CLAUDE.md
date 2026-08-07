# Doel1 — opdracht voor Claude Code

## Project

Bouw een mobiel-eerst PWA ("Doel1") voor één gebruiker die zijn voedingsschema, sportweek en voortgang bijhoudt. Nederlandstalige UI. De domeinregels hieronder zijn heilig — de app is een uitvoering van een bestaand plan, geen interpretatie ervan.

## Stack & conventies

- Vite + React; geen database in v1 — alle data lokaal via een storage-abstractielaag: één module `src/storage.js` met een vaste interface (`getSessies`, `saveSessie`, `getMetingen`, `saveMeting`, `getWeekmenu`, `getBoodschappen`, `toggleBoodschap`, `getDrogeDagen`, `toggleDroog`, …) met daarachter een localStorage-implementatie. Alle schermen praten uitsluitend met deze interface — in fase 6 wordt er een Supabase-implementatie achter dezelfde interface geschoven, zonder dat de schermen veranderen.
- Gebruik in localStorage dezelfde veld- en tabelnamen als in het datamodel hieronder, zodat de latere migratie triviaal is.
- Geen login in v1 (één gebruiker, één apparaat). Geen andere dependencies zonder expliciete reden.
- Secrets (straks) alleen via `.env` in `.gitignore`.
- Stijl: achtergrond #F1F2EC, kaarten #FBFBF7, donkergroen #24382F, accent #C98A2D, lijnen #D9DCD1; koppen in Fraunces (Google Fonts), tekst in Karla. Rustig, geen schaduw-festival.
- PWA: manifest + icoon (vlam), zodat hij op een telefoon-beginscherm installeert.
- Deploy-doel: GitHub Pages (deze repo heet Smullies2ndHalf, dus `base: '/Smullies2ndHalf/'` in de Vite-config).
- Nieuwe ideeën buiten de v1-scope: noteren in `IDEAS.md`, niet bouwen.

## Domeinregels (niet onderhandelbaar)

1. Sportweek = 5 sporten: Kracht A · Kickboksen · Tennis · Kracht B · Racefiets — vrij over de week te plannen; per dag registreer je zelf welke sessie(s) je deed (meerdere op één dag kan). Kracht A kent drie standen: niet / vol / mini — vol én mini tellen allebei. (Aangepast op verzoek van de gebruiker, aug 2026; eerst vaste weekdag-ankers.)
2. Week binnen = alle 5 sporten die week gedaan. Streak = aantal aaneengesloten weken binnen.
3. Geen schaamte-UI, nooit. Een gemiste week toont exact één neutrale zin: "Vorige week niet binnen — data, geen vonnis. Deze week telt gewoon opnieuw." Geen rood, geen gebroken-streak-animaties.
4. Verdien-sloten: streak ≥4 → "banden verdiend"; maand ≥ oktober én streak ≥4 → "Tacx verdiend". Tot die tijd zichtbaar als slot.
5. Plus-blokken horen bij sporten (S bij Kracht A/B, M bij Kickboksen/Tennis, L bij Racefiets) en verschijnen alleen op de dag dat die sessie is geregistreerd. Geen sessie = geen blok. In de sessies-tabel blijven de anker-codes ('ma'…'za') de sport-id's, los van de weekdag.
6. De app telt géén calorieën per maaltijd. Het schema ís de waarheid: de app toont de standaarddag, het diner van vandaag (rotatie week 1-4) en het plus-blok. Geen invoervelden voor eten.
7. Meting alleen op zaterdag (gewicht + vet%); de grafiek toont de trend; de 4-weken-evaluatie geeft een súggestie (gemiddelde ≥0,4 kg/wk → niets doen; lager terwijl weken binnen waren → "overweeg −200 kcal, één knop") — de app beslist nooit zelf.
8. Droge-dagen-teller: één tik per dag, aaneengesloten reeks.

## Datamodel

Nu de vorm voor localStorage; in fase 6 letterlijk als `supabase/schema.sql`.

Tabellen (alle met `user_id uuid default auth.uid()` + RLS): `gerechten` (naam, soort check in ('ontbijt','lunch','diner','snack'), anker, kleur1, kleur2, basis, smaak, porties_tekst, kcal, rotatie_week 1-4 alleen bij diners), `weekmenu` (jaar_week, dag, maaltijd check in ('ontbijt','lunch','diner','snack') default 'diner', gerecht_id, porties int default 1), `boodschappen` (jaar_week, naam, hoeveelheid, eenheid, categorie, vast boolean, afgevinkt boolean), `sessies` (datum, anker check in ('ma','di','wo','vr','za','extra','rust'), mini boolean — 'rust' = bewust geregistreerde rustdag, telt niet mee voor de week), `metingen` (datum, gewicht, vet_pct), `droge_dagen` (datum), `doelen` (domein, omschrijving, meetlat, richtdatum, status).

Seed-data: de 12 rotatie-gerechten (3 per week, met porties en ±kcal) en de vaste boodschappenlijst — vraag de gebruiker om de PDF-inhoud van zijn 4-wekenplan als die niet is meegeleverd, of laat een seed-script met placeholders achter.

## Schermen (v1 — vier tabs)

1. Vandaag — keuzelijst van de 5 sporten om de sessie(s) van vandaag te registreren (Kracht A: vol/mini), de plus-blokken van vandaag, het diner van vandaag (uit de rotatie), knop "vandaag droog".
2. Week — vijf sport-tegels met weekstatus-regel ("X van 5 · nog Y te gaan"), achteraf bij te werken, streakteller met vlam, verdien-sloten, navigatie naar vorige weken.
3. Eten — weekmenu per dag én per maaltijd (ontbijt/lunch/diner/snack, tabs) zelf samen te stellen met porties-teller; diner-rotatie als voorstel met herstelknop die alleen diners reset; gerechtkaarten (porties + kcal), knop "boodschappenlijst maken" (vaste lijst + ingrediënten × porties van alle maaltijden, samengevoegd), afvinkbaar in de winkel, rekent live mee met menuwijzigingen. (Menu-keuze, porties en maaltijden toegevoegd op verzoek van de gebruiker, aug 2026.)
4. Voortgang — dashboard met donut-meters (vet% voorop, gewicht ernaast; doelen instelbaar, voortgang van eerste meting naar doel), zaterdagmeting invoeren, trendlijn (gewicht en vet%), droge-dagen-reeks, 4-weken-evaluatiekaart met de suggestieregel, export/import-reservekopie.

## Fasen & acceptatie

- Fase 1 — fundament: Vite-project, tab-navigatie, `src/storage.js` met localStorage-implementatie en de volledige interface, seed-bestand met de 12 rotatie-gerechten. Acceptatie: `npm run dev` draait, tabs werken, storage-interface heeft tests of een demo. **[gedaan]**
- Fase 2 — sport: Vandaag + Week met sessies, weeklogica, streak, sloten, maandag-driestand. Acceptatie: een week vullen levert de juiste status en streak op, incl. mini-maandag; data overleeft een herstart. **[gedaan]**
- Fase 3 — eten: rotatielogica (week 5 = week 1), gerechten tonen, boodschappenlijst-generatie (vaste lijst + weekaanvulling) en afvinken. Acceptatie: lijst klopt met de rotatieweek en onthoudt vinkjes. **[gedaan]**
- Fase 4 — voortgang: metingen, trendlijn, droge dagen, 4-weken-evaluatiekaart. Acceptatie: trend en suggestie kloppen met testdata. **[gedaan]**
- Fase 5 — afronding v1: PWA-manifest, GitHub Pages-deploy, korte README. Acceptatie: app installeert op een telefoon en werkt na herstart. **[gedaan]**
- Fase 6 — de database (later, op verzoek): Supabase-project, `schema.sql` met RLS (`auth.uid() = user_id`), e-mail-login, Supabase-implementatie achter de bestaande storage-interface, en een eenmalige "importeer lokale data"-knop die localStorage naar de database migreert. Acceptatie: zelfde app, nu synchroon over apparaten; lokale historie behouden. Supabase: gratis project op supabase.com (EU-regio; Settings → API: Project URL + anon key in een `.env`; gratis tier = 500 MB, pauzeert na 7 dagen zonder verkeer — op te lossen met één nachtelijke ping).

Werkwijze: per fase kleine commits, na elke fase stoppen en de gebruiker laten testen. Bij twijfel over een domeinregel: vragen, niet gokken.
