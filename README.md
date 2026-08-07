# Doel1

Mobiel-eerst PWA voor één gebruiker: voedingsschema, sportweek en voortgang.
Nederlandstalige UI. De app telt geen calorieën en velt geen oordelen —
het schema is de waarheid, de app voert het uit.

## Ontwikkelen

```bash
npm install
npm run dev     # ontwikkelserver
npm test        # node --test, geen extra dependencies
npm run build   # productie-build (base: /Smullies2ndHalf/)
npm run icons   # PWA-iconen opnieuw genereren
```

## Schermen

| Tab | Wat |
|---|---|
| Vandaag | Sessies van vandaag kiezen uit de 5 sporten (Kracht A: vol/mini), plus-blok, diner uit de rotatie, droog-knop |
| Week | Vijf sport-tegels (week binnen = alle 5), weekstatus, streak met vlam, verdien-sloten, vorige weken |
| Eten | Rotatieweek (1–4, week 5 = week 1), boodschappenlijst maken en afvinken |
| Voortgang | Zaterdagmeting, trendlijnen, droge-dagen-reeks, 4-weken-evaluatie |

De domeinregels staan in `CLAUDE.md` en zijn niet onderhandelbaar; de
constanten ervan staan in `src/domein.js`.

## Data

Alles staat lokaal in localStorage, achter de vaste interface van
`src/storage.js`. Tabel- en veldnamen volgen het datamodel dat in fase 6
letterlijk naar `supabase/schema.sql` gaat — schermen praten uitsluitend
met `storage.js`, dus de Supabase-implementatie schuift er straks achter
zonder schermwijzigingen.

De 12 rotatie-gerechten en de vaste boodschappenlijst in `src/seed.js`
komen uit de receptenbibliotheek van dit repo (`assets/recipes.json`) en
zijn een startpunt: vervang ze door de inhoud van het 4-wekenplan (PDF)
zodra die definitief is. Ook de invulling van de plus-blokken
(`src/domein.js`) is een startpunt.

Twee interpretaties die vastgelegd zijn in code (aanpasbaar als het plan
anders zegt): de 4-weken-evaluatie rekent over 5 zaterdagmetingen en geeft
de −200 kcal-suggestie alleen als alle vier tussenliggende weken binnen
waren; het standaard-weekmenu verdeelt de 3 gerechten als ma+di / wo+do /
vr+za+zo.

## Deploy (GitHub Pages)

De workflow `.github/workflows/doel1.yml` test en bouwt op elke push van
de doel1-branch, en publiceert naar GitHub Pages zodra de wijzigingen op
de default branch staan (de github-pages-environment laat alleen die
branch deployen). De Pages-bron is al automatisch op GitHub Actions
gezet. De app staat na de merge op
`https://<gebruikersnaam>.github.io/Smullies2ndHalf/` — open die URL in
Safari op iPhone en kies Deelknop → Zet op beginscherm.

Bij hosting onder een ander pad: `BASE_PATH=/ander-pad/ npm run build`.

## Synchronisatie via Supabase (fase 6)

De app werkt local-first: alles blijft in localStorage (snel, offline) en
synchroniseert op de achtergrond met Supabase zodra dat is ingericht.
Eenmalige setup:

1. Gratis project op [supabase.com](https://supabase.com), regio EU.
2. SQL Editor → inhoud van `supabase/schema.sql` plakken → Run.
3. Authentication → Providers → Email: "Confirm email" mag uit (één gebruiker).
4. Settings → API: kopieer Project URL en anon key.
5. GitHub-repo → Settings → Secrets and variables → Actions → twee secrets:
   `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY` → daarna één keer
   opnieuw deployen (workflow draaien of een PR mergen).
6. In de app (Voortgang → Synchronisatie): registreren met e-mail en
   wachtwoord, inloggen, en één keer **"Importeer lokale data → cloud"**.
7. Op je andere apparaat: inloggen — de data komt vanzelf binnen.

De anon key is publiek bedoeld; Row Level Security zorgt dat alleen de
ingelogde gebruiker zijn eigen rijen kan lezen en schrijven. Let op de
gratis tier: het project pauzeert na 7 dagen zonder verkeer — dagelijks de
app openen is genoeg, of richt een nachtelijke ping in.

## Nieuwe ideeën

Buiten de v1-scope: noteren in `IDEAS.md`, niet bouwen.
