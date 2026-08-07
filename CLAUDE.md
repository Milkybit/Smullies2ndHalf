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
5. Plus-blokken horen bij sporten (S bij Kracht A/B 200 kcal, M bij Kickboksen/Tennis 345 kcal, L bij Racefiets 710 kcal; inhoud en timing in plan/doel1-plan.json) en verschijnen alleen op de dag dat die sessie is geregistreerd. Geen sessie = geen blok. In de sessies-tabel blijven de anker-codes ('ma'…'za') de sport-id's, los van de weekdag.
6. De app telt géén calorieën per maaltijd. Het schema ís de waarheid: ontbijt en lunch staan standaard op de standaarddag en zijn per dag te wisselen naar een macro-gelijke variant (ontbijt ±590 kcal, lunch ±460 kcal — variatie-aanvulling aug 2026); de snack 16:00 is standaard de eiwitshake met fruit naar keuze (appel/banaan/peer/mandarijn-kiwi, macro-neutraal); appel+ei blijft als klassieke optie (aanvulling aug 2026); het diner rouleert (week 1-4). Geen invoervelden voor eten. Kook_factor 2: elk rotatiegerecht staat standaard op 2 dagen (1× koken = 2× eten). Zaterdagse tafel: zaterdagavond geen rotatiegerecht en geen boodschappen (vieren-budget). Het definitieve plan staat in plan/doel1-plan.json — dat bestand is de bron; de seed volgt het plan.
7. Meting alleen op zaterdag (gewicht + vet%); de grafiek toont de trend; de 4-weken-evaluatie geeft een súggestie (gemiddelde ≥0,4 kg/wk → niets doen; lager terwijl weken binnen waren → "overweeg −200 kcal, één knop") — de app beslist nooit zelf.
8. Droge-dagen-teller: één tik per dag, aaneengesloten reeks.

## Datamodel

Nu de vorm voor localStorage; in fase 6 letterlijk als `supabase/schema.sql`.

Tabellen (alle met `user_id uuid default auth.uid()` + RLS): `gerechten` (naam, soort, anker, kleur1, kleur2, basis, smaak, porties_tekst, kcal, rotatie_week 1-4, kook_factor int default 2, bereiding), `weekmenu` (jaar_week, dag, maaltijd default 'diner', gerecht_id, porties int default 1), `boodschappen` (jaar_week, naam, hoeveelheid, eenheid, categorie, vast boolean, afgevinkt boolean), `sessies` (datum, anker check in ('ma','di','wo','vr','za','extra','rust'), mini boolean — 'rust' = bewust geregistreerde rustdag, telt niet mee voor de week), `metingen` (datum, gewicht, vet_pct), `droge_dagen` (datum), `doelen` (domein, omschrijving, meetlat, richtdatum, status).

Seed-data: het definitieve 4-wekenplan is aangeleverd (aug 2026) en staat in `plan/doel1-plan.json`: 12 rotatie-gerechten (3 per week, 690-755 kcal, kook_factor 2, formule anker/kleur/basis/smaak + bereiding), de standaarddag, de plus-blok-inhoud en de vaste weeklijst. `src/seed.js` wordt uit dat plan gegenereerd; wijzig eerst het plan.

## Schermen (v1 — vier tabs)

1. Vandaag — keuzelijst van de 5 sporten om de sessie(s) van vandaag te registreren (Kracht A: vol/mini), de plus-blokken van vandaag, het diner van vandaag (uit de rotatie), knop "vandaag droog".
2. Week — vijf sport-tegels met weekstatus-regel ("X van 5 · nog Y te gaan"), achteraf bij te werken, streakteller met vlam, verdien-sloten, navigatie naar vorige weken.
3. Eten — weekmenu met tabs Ontbijt/Lunch/Diner/Snack: per dag te kiezen met porties-teller. Ontbijt en lunch: standaard (o1/l1 uit de standaarddag) plus macro-gelijke varianten; diner: de 12 rotatiegerechten (voorstel: elk gerecht op 2 dagen, za vrij; herstelknop reset alleen diners). Gerechtkaarten met formule + bereiding, knop "boodschappenlijst maken" (vaste basislijst voor plus-blokken/snack/voorraad + ontbijt-, lunch- en diner-ingrediënten × porties, samengevoegd; "naar smaak"-items één keer ongeteld), afvinkbaar in de winkel, rekent live mee met menuwijzigingen.
4. Voortgang — dashboard met donut-meters (vet% voorop, gewicht ernaast; doelen instelbaar, voortgang van eerste meting naar doel), zaterdagmeting invoeren, trendlijn (gewicht en vet%), droge-dagen-reeks, 4-weken-evaluatiekaart met de suggestieregel, export/import-reservekopie.

## Fasen & acceptatie

- Fase 1 — fundament: Vite-project, tab-navigatie, `src/storage.js` met localStorage-implementatie en de volledige interface, seed-bestand met de 12 rotatie-gerechten. Acceptatie: `npm run dev` draait, tabs werken, storage-interface heeft tests of een demo. **[gedaan]**
- Fase 2 — sport: Vandaag + Week met sessies, weeklogica, streak, sloten, maandag-driestand. Acceptatie: een week vullen levert de juiste status en streak op, incl. mini-maandag; data overleeft een herstart. **[gedaan]**
- Fase 3 — eten: rotatielogica (week 5 = week 1), gerechten tonen, boodschappenlijst-generatie (vaste lijst + weekaanvulling) en afvinken. Acceptatie: lijst klopt met de rotatieweek en onthoudt vinkjes. **[gedaan]**
- Fase 4 — voortgang: metingen, trendlijn, droge dagen, 4-weken-evaluatiekaart. Acceptatie: trend en suggestie kloppen met testdata. **[gedaan]**
- Fase 5 — afronding v1: PWA-manifest, GitHub Pages-deploy, korte README. Acceptatie: app installeert op een telefoon en werkt na herstart. **[gedaan]**
- Fase 6 — de database: Supabase-project, `supabase/schema.sql` met RLS (`auth.uid() = user_id`), e-mail+wachtwoord-login, local-first sync-laag (`src/sync.js`) achter de bestaande storage-interface (localStorage blijft de waarheid voor de schermen; wijzigingen pushen debounced, cloud-stand komt binnen bij openen/terugkeren), en de eenmalige "importeer lokale data"-knop. Gerechten syncen niet (seed-gedreven); `seed_versie` blijft lokaal. Acceptatie: zelfde app, nu synchroon over apparaten; lokale historie behouden. **[code gedaan, aug 2026 — gebruiker maakt het Supabase-project (EU), draait schema.sql en zet VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY als Actions-secrets; zie README]** Gratis tier = 500 MB, pauzeert na 7 dagen zonder verkeer — op te lossen met één nachtelijke ping.

Werkwijze: per fase kleine commits, na elke fase stoppen en de gebruiker laten testen. Bij twijfel over een domeinregel: vragen, niet gokken.
