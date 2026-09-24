# Component-first mealprep

## Architectuur en componenten

`RecipeDefinition` behoudt de bestaande ingrediënten en schaalgrenzen. `Recipe` voegt compatibiliteitsvelden en `componentRefs` toe. Elke verwijzing bevat een herbruikbare `PrepComponent` met vaste samenstelling en vermenigvuldigingsfactor. De recepten worden niet op naam geïnterpreteerd; er is geen externe API.

`data/prep-components.ts` partitioneert alle 30 seeds. Na schalen wordt dezelfde partitionering op de werkelijke hoeveelheden uitgevoerd. Elk gram ingrediënt wordt precies één keer toegewezen. De boodschappenlijst blijft rechtstreeks uit geschaalde ingrediëntregels rekenen; tests vergelijken beide onafhankelijke routes voor alle recepten en beide kipkeuzes.

Vaste basisverhoudingen: soja/knoflook/gember = 10/5/6, kokos/knoflook/gember = 40/5/6 en passata/knoflook = 80/5. Extra soja, kokos, passata, bouillon en kruiden blijven in de eigen afwerking. De tomaatbasis bevat geen ui omdat niet alle betreffende recepten ui gebruiken. Ui wordt waar nodig gezamenlijk gesneden. Bases worden koud gemengd en bij afwerking verhit.

Kip wordt neutraal gegaard en daarna afgewerkt. Gehaktballetjes, rendang en char-siu behouden een eigen `mixed_base`; anders zou hun karakter/garing veranderen. Groentecomponenten delen wassen en snijden, niet automatisch de gaartijd. Rauw vlees, uitgelekte tonijn en droge granen behouden hun eigen gewichtsbasis.

## Deterministische zoekmethode

`calculateRecipeCompatibility` vergelijkt expliciete velden: gewichten 5/4/4/3/2/2 voor saus/aromaten/eiwit/koolhydraat/groente/kookgroep, maximaal 3 voor tags en 2 voor relevante ingrediëntoverlap. Voorraadkastkruiden, olie, bouillon, water, zout en zwarte peper tellen niet als belangrijke ingrediëntoverlap.

`calculateBatchEfficiency` weegt zeven categorieën van hergebruik. `calculateBatchDiversity` weegt vijf categorieën van variatie afzonderlijk. Beide geven een zichtbare opbouw. Scores zijn vergelijkingsindices, geen gemeten tijdwinst. Losse ingrediëntvermeldingen worden niet gepresenteerd als bespaarde unieke producten.

`optimizeRecipeBatch` filtert op uitsluitingen, voedingshaalbaarheid en kwaliteit. Verplichte recepten staan vast. Elke geschikte kandidaat is een start voor greedy selectie, gevolgd door strikt verbeterende één-op-één-wissels. Een cache voorkomt dubbel rekenwerk. Alleen een resultaat dat alle harde minima haalt wordt teruggegeven; bij falen volgt een uitleg, geen gedeeltelijke batch.

Modi wegen efficiëntie/variatie als 80/20, 60/40 en 25/75. Favoriet +12, Aziatisch +8, peulvruchten +4 en kwaliteit maximaal +2 worden gemiddeld over de batch. Voor werk wordt per unieke component actief + 25% passief geteld, met 0,05 punt aftrek per eenheid. Alle gewichten zijn benoemde constanten en de UI licht ze toe. Dit is een heuristiek, geen bewijs van het globale optimum. Apparatuur beïnvloedt de uiteindelijke kookplanning; de selectiestap gebruikt een eenvoudige werkmaat.

## Componentproductie en capaciteit

De afhankelijkheden zijn: mise en place → neutrale bases → eiwit-/graanrondes → eigen afwerking → portioneren → koelen → bewaren. Tien verschillende smaken houden hun eigen afwerking, maar delen de voorbereidende productie.

De scheduler zoekt vrije intervallen voor apparaten én één kok. Beginhandelingen, laatste afwerking en portioneren krijgen gereserveerde aandacht. Een pan blijft bezet tot het legen. Een kleine kiprest mag op een vrije pit wanneer dat eerder klaar is dan een extra ovenronde. Gewichten vullen eerst de beschikbare capaciteit.

Standaard: 4 pitten, 1 oven, 6 porties per afwerkingspan, 1.500 g eiwit per ovenronde, maximaal 750 g per bakpan en 1.000 g droog graan per pan. De UI laat oven-, graan- en portiecapaciteit aanpassen. Maximaal twee opeenvolgende productierondes zijn tegelijk in bewerking. Lange geïntegreerde bereidingen krijgen een eigen ronde; rijst wordt niet vóór een stoof van 150 minuten klaargezet.

De koelkast/vriezer wordt niet als koelinstallatie gemodelleerd. Tijden zijn schattingen, geen voedselveiligheidsmetingen of in een keuken gekalibreerde prestaties. Roeren en gaarheid controleren blijven nodig. Bewaarinstructies volgen het [Voedingscentrum](https://www.voedingscentrum.nl/nl/service/vraag-en-antwoord/koken-en-bewaren/hoe-kan-ik-meal-preppen.aspx).

## Opbrengst en lokale opslag

`aggregatePrepComponents` geeft ingrediënttotalen en receptallocaties. `allocateComponentYield` behoudt de som van het gemeten gewicht. Standaard wordt per kookronde gemeten zodat de eerste bakjes direct verdeeld kunnen worden. Bijdragen van deelrondes worden binnen dezelfde productieronde opgeteld. Een hele-componentmeting geldt alleen voor fysiek samengevoegde deelrondes.

Metingen bevatten een handtekening van grondstoffen, receptverdeling en porties. Een wijziging maakt de meting ongeldig, ook bij gelijk totaalgewicht. JSON-import valideert componenten en ronde-ID's. Oude v1-back-ups blijven werken, inclusief rijst-/pastametingen. Kandidaten, kipkeuze, capaciteit en nieuwe metingen worden lokaal bewaard. Alleen oude receptgerichte kookvinkjes worden gewist: ze horen niet bij de nieuwe taken.

## Gebruik en verificatie

Selecteer vijftien kandidaten in Recepten, open Mijn batch, voer 60/10/6 in en optimaliseer. Of laad het ingebouwde scenario: kippendij, minstens zes kip- en twee rundgerechten, Aziatisch en peulvruchten. Een voorstel vervangt je batch pas via **Gebruik voorstel en vervang huidige batch**.

Nieuwe routes: `/combine` en `/prep`. Receptpagina's tonen vier relaties met uitleg; bibliotheekkaarten tonen drie familielabels. Boodschappen vermeldt per ingrediënt het aantal gerechten.

Reproduceer het scenario met `node scripts/inspect-optimizer.mjs`. Zie [resultaat en planning](reports/optimizer-60-meals.md), [machineleesbare gegevens](reports/optimizer-60-meals.json) en [handmatige keukenreview](reports/kitchen-review.md).

Regressietests controleren bestaande voeding en overrides, alle 30 recepten, componentconservatie, sausverhoudingen, opbrengstverdeling, determinisme, harde beperkingen, opslagmigratie, capaciteit, aandacht en afhankelijkheden. De browsercontrole volgt kandidaten → optimaliseren → toepassen → componenten → boodschappen → voorbereiding → kookdag → opbrengst en herladen.

Verificatie op 24 september 2026: **97 tests geslaagd**, TypeScript zonder fouten en een geslaagde statische productiebuild met 45 routes. Hiervan zijn 27 tests toegevoegd voor componenten en optimalisatie. De recente PrepPartner-naam, Keukenspullen en Zo werkt het zijn behouden; de uitleg beschrijft ook de nieuwe optimizer en kookplanning.

De lokale browserproef bevestigde 15 kandidaten → 10 recepten × 6 porties, 80/100 efficiëntie en 95/100 variatie. De preview liet de bestaande batch staan tot toepassen. Boodschappen toonde 32 unieke regels; de kookdag 4 pitten, 1 oven en 10 u 32 min. Een ingevoerde kipopbrengst van 1.125 g voor een ronde met 1.500 g rauwe kip bleef na herladen staan, inclusief de receptverdeling. Bibliotheekselectie, receptrelaties en de mobiele batchflow zijn gecontroleerd; geen horizontale pagina-overloop of browserconsolefouten waargenomen. Dit is softwareverificatie, geen echte kook-, vries- of smaakproef.
