# Afval — een enkel HTML-bestand

Geen build, geen Node, geen App Store, geen Apple Developer-account.
Een bestand van 66 KB dat je op je iPhone naar je beginscherm zet.

## Bouwen

```powershell
python tools/build_recipes.py
```

Dat doet twee dingen: het schrijft `assets/recipes.json` en bakt die recepten
in `web/index.template.html` tot **`dist/afval.html`** — dat ene bestand is de
hele app.

## Op je telefoon zetten

1. Maak een publieke repo op GitHub, zet `dist/afval.html` erin als `index.html`
2. Settings -> Pages -> deploy from branch `main`, map `/ (root)`
3. Open de URL in **Safari** op je iPhone (niet Chrome — daar werkt
   Beginscherm-installatie niet goed)
4. Deelknop -> Zet op beginscherm

Nu draait hij schermvullend, zonder adresbalk, met een eigen icoon.
Azure Static Web Apps werkt net zo goed als je liever daar zit.

## Geofencing via Shortcuts

De webapp kan geen achtergrondlocatie — Safari heeft daar simpelweg geen API
voor. Dat lost je op buiten de app:

Opdrachten -> Automatisering -> Nieuwe -> **Aankomst** -> kies je Albert Heijn
-> Direct uitvoeren -> actie **Open URL** -> `https://jouwnaam.github.io/afval/#lijst`

De `#lijst`-hash opent de app direct op je boodschappenlijst. Je krijgt dus een
melding met je lijst zodra je de winkel binnenloopt — precies de functie die je
wilde, zonder één regel native code. Herhaal per winkel.

## Wat erin zit

| Scherm | Wat |
|---|---|
| Meten | Dagtarget, gewichtscorridor, invoer, Omron naast meetlint |
| Menu | Weekplan van 7 dagen, geschaald op je target |
| Lijst | Boodschappen per schap, afvinkbaar |
| Training | Sessies loggen, blokvergelijking van 4 weken |

## Reservekopie — lees dit wel even

De app slaat alles op in `localStorage` op je telefoon. Dat is snel en werkt
offline, maar het is **geen back-up**: Safari kan opslag opruimen, en als je je
telefoon wist ben je alles kwijt.

Gebruik de exportknop op het Meten-scherm. Doe dat eens per maand en zet het
bestand in OneDrive. Het is twee tikken en het scheelt je een half jaar data.

## Startwaarden

| | |
|---|---|
| Target | 1.900 kcal |
| Eiwit | 150 g |
| Vet | 76 g |
| Koolhydraten | 150 g |
| Vezels | 35 g |
| Tempo | ~500 g/week (0,6 %) |
| 84,4 -> 75 kg | ~20 weken |

Behandel 1.900 als hypothese. Vanaf 14 dagen data vervangt de app de formule
door je eigen gemeten TDEE, en pas dan weet je wat je werkelijk verbruikt.

## Receptenbibliotheek

34 recepten: 4 ontbijten, 5 lunches, 20 diners, 5 snacks. Ingredienten staan
een keer in `ING` in `tools/build_recipes.py`, recepten verwijzen ernaar.
Corrigeer je een macrowaarde tegen NEVO (RIVM), dan werkt dat overal door.

De validatie controleert alle 2.000 dagcombinaties:

```
laagste eiwit  : 165 g   (target 150 g)
laagste vezels :  30 g   (minimum 30 g)
combinaties onder target: 0
```

> De macrowaarden zijn representatief maar **niet geverifieerd**. Controleer ze
> tegen NEVO of de verpakking — je kalibratie leunt op accurate inname.

## Drie ontwerpregels

**1. Trainingscalorieen gaan nooit terug in het caloriedoel.** De kalibratie
meet je totale verbruik al, training inbegrepen. Erbij optellen is dubbeltellen,
en schattingen voor krachttraining zitten er routinematig een factor 2 tot 3 naast.

**2. Geen correlatiecoefficient.** Twintig ruizige datapunten met ongemeten
confounders. De blokvergelijking van vier weken is robuuster en eerlijker.

**3. Geen verbodsmelding bij de supermarkt.** De Shortcut opent je lijst, niet
een waarschuwing. Verbodsframing bij de winkelingang werkt averechts.
