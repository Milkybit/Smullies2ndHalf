# Doel1

Mobiel-eerst PWA voor één gebruiker: voedingsschema, sportweek en voortgang.
Nederlandstalige UI. De app telt geen calorieën en velt geen oordelen —
het schema is de waarheid, de app voert het uit.

## Ontwikkelen

```bash
cd doel1
npm install
npm run dev     # ontwikkelserver
npm test        # node --test, geen extra dependencies
npm run build   # productie-build (base: /Smullies2ndHalf/)
npm run icons   # PWA-iconen opnieuw genereren
```

## Schermen

| Tab | Wat |
|---|---|
| Vandaag | Dag-anker met tik-knop (ma: vol/mini), plus-blok, diner uit de rotatie, droog-knop |
| Week | Vijf anker-tegels, weekstatus, streak met vlam, verdien-sloten, vorige weken |
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

De workflow `.github/workflows/doel1.yml` test, bouwt en publiceert naar
GitHub Pages. Eénmalig instellen: repo-Settings → Pages → Source:
**GitHub Actions**. De app staat daarna op
`https://<gebruikersnaam>.github.io/Smullies2ndHalf/` — open die URL in
Safari op iPhone en kies Deelknop → Zet op beginscherm.

Bij hosting onder een ander pad: `BASE_PATH=/ander-pad/ npm run build`.

## Nieuwe ideeën

Buiten de v1-scope: noteren in `IDEAS.md`, niet bouwen.
