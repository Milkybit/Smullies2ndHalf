// Seed-data voor Doel1 — gegenereerd uit het definitieve 4-wekenplan
// (plan/doel1-plan.json, incl. de variatie-aanvulling van aug 2026).
// Het plan is de waarheid: wijzig eerst het plan, genereer dan deze seed
// opnieuw met: python3 tools/gen-seed.py <versie> > src/seed.js
//
// Kernregels:
// - Diner: 4-weken-rotatie, kook_factor 2 (elk gerecht op 2 dagen),
//   zaterdagse tafel (za geen diner, geen boodschappen).
// - Ontbijt en lunch: standaard uit de standaarddag, per dag te wisselen
//   naar een macro-gelijke variant (ontbijt ±590 kcal, lunch ±460 kcal,
//   eiwit leidend). Keuzes vastgesteld door de gebruiker.
// - Snack 16:00 en plus-blokken liggen vast; de vaste basislijst dekt ze.

export const SEED_VERSIE = 8

export const SEED_GERECHTEN =
[
  {
    "id": "g1",
    "naam": "Kip-cashew roerbak",
    "soort": "diner",
    "anker": "kip",
    "kleur1": "paksoi",
    "kleur2": "paprika",
    "basis": "zilvervliesrijst",
    "smaak": "soja-gember-knoflook",
    "porties_tekst": "160 g kipfilet · 65 g zilvervliesrijst (droog) · 200 g paksoi · 100 g paprika · 20 g cashewnoten · 10 ml olijfolie · sojasaus, gember, knoflook naar smaak",
    "kcal": 700,
    "rotatie_week": 1,
    "kook_factor": 2,
    "bereiding": "Rijst koken. Kip roerbakken in de olie, paksoi en paprika erbij, afblussen met soja, gember en knoflook; cashews er op het laatst door.",
    "ingredienten": [
      {
        "naam": "kipfilet",
        "hoeveelheid": 160,
        "eenheid": "g",
        "categorie": "vlees-vis"
      },
      {
        "naam": "zilvervliesrijst (droog)",
        "hoeveelheid": 65,
        "eenheid": "g",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "paksoi",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "paprika",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "cashewnoten",
        "hoeveelheid": 20,
        "eenheid": "g",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "olijfolie",
        "hoeveelheid": 10,
        "eenheid": "ml",
        "categorie": "voorraad"
      },
      {
        "naam": "sojasaus, gember, knoflook",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "g2",
    "naam": "Chili con carne XL-groente",
    "soort": "diner",
    "anker": "mager rundergehakt",
    "kleur1": "paprika",
    "kleur2": "courgette/wortel",
    "basis": "bonen + rijst",
    "smaak": "chilikruiden",
    "porties_tekst": "150 g mager rundergehakt · 130 g bonen (blik, uitgelekt) · 100 g paprika · 100 g courgette · 100 g wortel · 200 g tomatenblokjes (blik) · 50 g zilvervliesrijst (droog) · 10 ml olijfolie · chilikruiden (zonder suiker) naar smaak",
    "kcal": 740,
    "rotatie_week": 1,
    "kook_factor": 2,
    "bereiding": "Gehakt rullen in de olie, fijngesneden groente en chilikruiden erbij, bonen en tomatenblokjes erdoor, laten pruttelen; rijst ernaast.",
    "ingredienten": [
      {
        "naam": "mager rundergehakt",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "vlees-vis"
      },
      {
        "naam": "bonen (blik, uitgelekt)",
        "hoeveelheid": 130,
        "eenheid": "g",
        "categorie": "voorraad"
      },
      {
        "naam": "paprika",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "courgette",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "wortel",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "tomatenblokjes (blik)",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "voorraad"
      },
      {
        "naam": "zilvervliesrijst (droog)",
        "hoeveelheid": 50,
        "eenheid": "g",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "olijfolie",
        "hoeveelheid": 10,
        "eenheid": "ml",
        "categorie": "voorraad"
      },
      {
        "naam": "chilikruiden (zonder suiker)",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "g3",
    "naam": "Zalm uit de oven",
    "soort": "diner",
    "anker": "zalm",
    "kleur1": "groene groente",
    "kleur2": "citroen",
    "basis": "krieltjes",
    "smaak": "citroen-dille",
    "porties_tekst": "150 g zalmfilet · 300 g krieltjes · 300 g groene groente (haricots/broccoli) · 10 ml olijfolie · citroen en dille naar smaak",
    "kcal": 690,
    "rotatie_week": 1,
    "kook_factor": 2,
    "bereiding": "Alles op een bakplaat met de olie; 25 min op 200 graden. Citroen en dille over de zalm.",
    "ingredienten": [
      {
        "naam": "zalmfilet",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "vlees-vis"
      },
      {
        "naam": "krieltjes",
        "hoeveelheid": 300,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "groene groente (haricots/broccoli)",
        "hoeveelheid": 300,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "olijfolie",
        "hoeveelheid": 10,
        "eenheid": "ml",
        "categorie": "voorraad"
      },
      {
        "naam": "citroen en dille",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "groente-fruit"
      }
    ]
  },
  {
    "id": "g4",
    "naam": "Harissa-kip traybake",
    "soort": "diner",
    "anker": "kipdij",
    "kleur1": "broccoli",
    "kleur2": "rode ui",
    "basis": "zoete aardappel",
    "smaak": "harissa-citroen",
    "porties_tekst": "180 g kipdijfilet · 300 g zoete aardappel · 250 g broccoli · 1 stuk rode ui · 10 ml olijfolie · harissa naar smaak",
    "kcal": 695,
    "rotatie_week": 2,
    "kook_factor": 2,
    "bereiding": "Alles op een bakplaat, harissa en olie erover; 30-35 min op 200 graden, halverwege keren.",
    "ingredienten": [
      {
        "naam": "kipdijfilet",
        "hoeveelheid": 180,
        "eenheid": "g",
        "categorie": "vlees-vis"
      },
      {
        "naam": "zoete aardappel",
        "hoeveelheid": 300,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "broccoli",
        "hoeveelheid": 250,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "rode ui",
        "hoeveelheid": 1,
        "eenheid": "stuk",
        "categorie": "groente-fruit"
      },
      {
        "naam": "harissa",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      },
      {
        "naam": "olijfolie",
        "hoeveelheid": 10,
        "eenheid": "ml",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "g5",
    "naam": "Linzen-dal met spinazie",
    "soort": "diner",
    "anker": "rode linzen",
    "kleur1": "spinazie",
    "kleur2": "tomaat",
    "basis": "linzen + rijst",
    "smaak": "kerrie-kokos",
    "porties_tekst": "90 g rode linzen (droog) · 100 ml kokosmelk light · 200 g verse spinazie · 100 g tomatenblokjes (blik) · 40 g zilvervliesrijst (droog) · 100 g griekse yoghurt · kerrie/garam masala naar smaak",
    "kcal": 690,
    "rotatie_week": 2,
    "kook_factor": 2,
    "bereiding": "Linzen met kerrie en tomaat zacht koken, kokosmelk erbij, spinazie laten slinken; rijst ernaast, klodder yoghurt erop.",
    "ingredienten": [
      {
        "naam": "rode linzen (droog)",
        "hoeveelheid": 90,
        "eenheid": "g",
        "categorie": "voorraad"
      },
      {
        "naam": "kokosmelk light",
        "hoeveelheid": 100,
        "eenheid": "ml",
        "categorie": "voorraad"
      },
      {
        "naam": "verse spinazie",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "tomatenblokjes (blik)",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "voorraad"
      },
      {
        "naam": "zilvervliesrijst (droog)",
        "hoeveelheid": 40,
        "eenheid": "g",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "griekse yoghurt",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "kerrie/garam masala",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "g6",
    "naam": "Gyros-bowls",
    "soort": "diner",
    "anker": "kip",
    "kleur1": "tomaat",
    "kleur2": "komkommer/ui",
    "basis": "couscous",
    "smaak": "gyroskruiden-tzatziki",
    "porties_tekst": "160 g kipfilet · 70 g couscous (droog) · 100 g griekse yoghurt · 150 g tomaat · 150 g komkommer · 0.5 stuk rode ui · 10 ml olijfolie · gyroskruiden naar smaak",
    "kcal": 720,
    "rotatie_week": 2,
    "kook_factor": 2,
    "bereiding": "Kipreepjes met gyroskruiden bakken in de olie; couscous wellen; tzatziki van yoghurt, geraspte komkommer en knoflook; alles in een bowl.",
    "ingredienten": [
      {
        "naam": "kipfilet",
        "hoeveelheid": 160,
        "eenheid": "g",
        "categorie": "vlees-vis"
      },
      {
        "naam": "couscous (droog)",
        "hoeveelheid": 70,
        "eenheid": "g",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "griekse yoghurt",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "tomaat",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "komkommer",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "rode ui",
        "hoeveelheid": 0.5,
        "eenheid": "stuk",
        "categorie": "groente-fruit"
      },
      {
        "naam": "gyroskruiden",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      },
      {
        "naam": "olijfolie",
        "hoeveelheid": 10,
        "eenheid": "ml",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "g7",
    "naam": "Kip-pesto ovenschotel",
    "soort": "diner",
    "anker": "kip",
    "kleur1": "roostergroente",
    "kleur2": "cherrytomaat",
    "basis": "couscous",
    "smaak": "groene pesto",
    "porties_tekst": "170 g kipfilet · 15 g groene pesto · 300 g roostergroente-mix · 100 g cherrytomaten · 70 g couscous (droog)",
    "kcal": 700,
    "rotatie_week": 3,
    "kook_factor": 2,
    "bereiding": "Kip met pesto en groente in een ovenschaal, 25 min op 200 graden; couscous eronder om de sappen te vangen.",
    "ingredienten": [
      {
        "naam": "kipfilet",
        "hoeveelheid": 170,
        "eenheid": "g",
        "categorie": "vlees-vis"
      },
      {
        "naam": "groene pesto",
        "hoeveelheid": 15,
        "eenheid": "g",
        "categorie": "voorraad"
      },
      {
        "naam": "roostergroente-mix",
        "hoeveelheid": 300,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "cherrytomaten",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "couscous (droog)",
        "hoeveelheid": 70,
        "eenheid": "g",
        "categorie": "koolhydraten-noten"
      }
    ]
  },
  {
    "id": "g8",
    "naam": "Gehakt-volkorenpasta",
    "soort": "diner",
    "anker": "mager rundergehakt",
    "kleur1": "courgette",
    "kleur2": "tomaat",
    "basis": "volkorenpasta",
    "smaak": "italiaanse kruiden-parmezaan",
    "porties_tekst": "150 g mager rundergehakt · 75 g volkorenpasta (droog) · 200 g courgette · 200 g tomatenblokjes (blik) · 20 g parmezaan · 10 ml olijfolie · italiaanse kruiden naar smaak",
    "kcal": 755,
    "rotatie_week": 3,
    "kook_factor": 2,
    "bereiding": "Gehakt rullen, courgette en tomatenblokjes erbij, saus laten pruttelen; door de pasta, parmezaan erover.",
    "ingredienten": [
      {
        "naam": "mager rundergehakt",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "vlees-vis"
      },
      {
        "naam": "volkorenpasta (droog)",
        "hoeveelheid": 75,
        "eenheid": "g",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "courgette",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "tomatenblokjes (blik)",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "voorraad"
      },
      {
        "naam": "parmezaan",
        "hoeveelheid": 20,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "olijfolie",
        "hoeveelheid": 10,
        "eenheid": "ml",
        "categorie": "voorraad"
      },
      {
        "naam": "italiaanse kruiden",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "g9",
    "naam": "Tonijn-bowl",
    "soort": "diner",
    "anker": "tonijn",
    "kleur1": "edamame",
    "kleur2": "komkommer",
    "basis": "zilvervliesrijst",
    "smaak": "sesam-soja",
    "porties_tekst": "65 g zilvervliesrijst (droog) · 1 blik tonijn op water (blik) · 50 g edamame · 0.5 stuk avocado · 150 g komkommer · sesamzaad + sojasaus naar smaak",
    "kcal": 690,
    "rotatie_week": 3,
    "kook_factor": 2,
    "bereiding": "Rijst koken (of restje gebruiken); alles in een bowl, sesam-sojadressing erover. Nul echt kookwerk.",
    "ingredienten": [
      {
        "naam": "zilvervliesrijst (droog)",
        "hoeveelheid": 65,
        "eenheid": "g",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "tonijn op water (blik)",
        "hoeveelheid": 1,
        "eenheid": "blik",
        "categorie": "vlees-vis"
      },
      {
        "naam": "edamame",
        "hoeveelheid": 50,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "avocado",
        "hoeveelheid": 0.5,
        "eenheid": "stuk",
        "categorie": "groente-fruit"
      },
      {
        "naam": "komkommer",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "sesamzaad + sojasaus",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "g10",
    "naam": "Courgette-feta frittata",
    "soort": "diner",
    "anker": "eieren",
    "kleur1": "courgette",
    "kleur2": "salade",
    "basis": "volkorenbrood",
    "smaak": "feta-munt",
    "porties_tekst": "4 stuks eieren · 150 g courgette · 40 g feta · 2 sneden volkorenbrood · 100 g gemengde salade · 5 ml olijfolie",
    "kcal": 700,
    "rotatie_week": 4,
    "kook_factor": 2,
    "bereiding": "Eieren loskloppen met geraspte courgette en feta, in de pan garen en onder de grill afmaken; brood en salade ernaast.",
    "ingredienten": [
      {
        "naam": "eieren",
        "hoeveelheid": 4,
        "eenheid": "stuks",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "courgette",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "feta",
        "hoeveelheid": 40,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "volkorenbrood",
        "hoeveelheid": 2,
        "eenheid": "sneden",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "gemengde salade",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "olijfolie",
        "hoeveelheid": 5,
        "eenheid": "ml",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "g11",
    "naam": "Kip klassiek",
    "soort": "diner",
    "anker": "kip",
    "kleur1": "broccoli",
    "kleur2": "citroen",
    "basis": "zilvervliesrijst",
    "smaak": "droge kruiden",
    "porties_tekst": "180 g kipfilet · 75 g zilvervliesrijst (droog) · 300 g broccoli · 15 ml olijfolie",
    "kcal": 700,
    "rotatie_week": 4,
    "kook_factor": 2,
    "bereiding": "Rijst en broccoli koken; kip royaal kruiden en bakken in de afgemeten olie (of oventechniek op 100 graden).",
    "ingredienten": [
      {
        "naam": "kipfilet",
        "hoeveelheid": 180,
        "eenheid": "g",
        "categorie": "vlees-vis"
      },
      {
        "naam": "zilvervliesrijst (droog)",
        "hoeveelheid": 75,
        "eenheid": "g",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "broccoli",
        "hoeveelheid": 300,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "olijfolie",
        "hoeveelheid": 15,
        "eenheid": "ml",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "g12",
    "naam": "Bavette met chimichurri",
    "soort": "diner",
    "anker": "bavette",
    "kleur1": "grilgroente",
    "kleur2": "verse kruiden",
    "basis": "zoete aardappel",
    "smaak": "chimichurri",
    "porties_tekst": "160 g bavette · 250 g zoete aardappel · 300 g grilgroente (paprika/courgette) · 1 bos verse peterselie + knoflook · 15 ml olijfolie · rode wijnazijn naar smaak",
    "kcal": 735,
    "rotatie_week": 4,
    "kook_factor": 2,
    "bereiding": "Zoete-aardappelpartjes in de oven; bavette kort en heet bakken, laten rusten; chimichurri van peterselie, knoflook, azijn en de olie.",
    "dag_suggestie": "zondag",
    "ingredienten": [
      {
        "naam": "bavette",
        "hoeveelheid": 160,
        "eenheid": "g",
        "categorie": "vlees-vis"
      },
      {
        "naam": "zoete aardappel",
        "hoeveelheid": 250,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "grilgroente (paprika/courgette)",
        "hoeveelheid": 300,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "verse peterselie + knoflook",
        "hoeveelheid": 1,
        "eenheid": "bos",
        "categorie": "groente-fruit"
      },
      {
        "naam": "olijfolie",
        "hoeveelheid": 15,
        "eenheid": "ml",
        "categorie": "voorraad"
      },
      {
        "naam": "rode wijnazijn",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "o1",
    "naam": "Standaard — kwark met havermout (overnight oats)",
    "soort": "ontbijt",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "250 g magere kwark · 40 g havermout · 10 g chiazaad · 25 g ongezouten noten · 100 g blauwe bessen (diepvries) · 7 g siroop · kaneel naar smaak",
    "kcal": 590,
    "rotatie_week": null,
    "kook_factor": 1,
    "bereiding": "OV-dag: avond ervoor klaarzetten als overnight oats",
    "ingredienten": [
      {
        "naam": "magere kwark",
        "hoeveelheid": 250,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "havermout",
        "hoeveelheid": 40,
        "eenheid": "g",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "chiazaad",
        "hoeveelheid": 10,
        "eenheid": "g",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "ongezouten noten",
        "hoeveelheid": 25,
        "eenheid": "g",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "blauwe bessen (diepvries)",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "siroop",
        "hoeveelheid": 7,
        "eenheid": "g",
        "categorie": "voorraad"
      },
      {
        "naam": "kaneel",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "l1",
    "naam": "Standaard — volkoren met kip of tonijn",
    "soort": "lunch",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "3 sneden volkorenbrood · 120 g gerookte kipfilet OF tonijn op water (blik) · 50 g huttenkase · komkommer en tomaat naar smaak",
    "kcal": 460,
    "rotatie_week": null,
    "kook_factor": 1,
    "bereiding": null,
    "ingredienten": [
      {
        "naam": "volkorenbrood",
        "hoeveelheid": 3,
        "eenheid": "sneden",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "gerookte kipfilet OF tonijn op water (blik)",
        "hoeveelheid": 120,
        "eenheid": "g",
        "categorie": "vlees-vis"
      },
      {
        "naam": "huttenkase",
        "hoeveelheid": 50,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "komkommer en tomaat",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "groente-fruit"
      }
    ]
  },
  {
    "id": "o2",
    "naam": "Weekend — eiwitpannenkoeken",
    "soort": "ontbijt",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "50 g havermout · 2 stuks eieren · 125 g magere kwark · 1 stuk banaan · 100 g blauwe bessen (diepvries) · 7 g honing · kaneel naar smaak",
    "kcal": 590,
    "rotatie_week": null,
    "kook_factor": 1,
    "bereiding": "≈ standaard, eiwit iets hoger (ei + kwark); even bakken, dus voor het weekend",
    "ingredienten": [
      {
        "naam": "havermout",
        "hoeveelheid": 50,
        "eenheid": "g",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "eieren",
        "hoeveelheid": 2,
        "eenheid": "stuks",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "magere kwark",
        "hoeveelheid": 125,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "banaan",
        "hoeveelheid": 1,
        "eenheid": "stuk",
        "categorie": "groente-fruit"
      },
      {
        "naam": "blauwe bessen (diepvries)",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "honing",
        "hoeveelheid": 7,
        "eenheid": "g",
        "categorie": "voorraad"
      },
      {
        "naam": "kaneel",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "o3",
    "naam": "Groente-omelet met volkoren",
    "soort": "ontbijt",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "3 stuks eieren · 100 g paprika · 100 g champignons · 2 sneden volkorenbrood · 50 g huttenkase · 10 ml olijfolie · peper, zout, bieslook naar smaak",
    "kcal": 590,
    "rotatie_week": null,
    "kook_factor": 1,
    "bereiding": "≈ standaard: ei-eiwit i.p.v. zuivel; de appel hoort bij de snack van 16:00, niet bij het ontbijt",
    "ingredienten": [
      {
        "naam": "eieren",
        "hoeveelheid": 3,
        "eenheid": "stuks",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "paprika",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "champignons",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "volkorenbrood",
        "hoeveelheid": 2,
        "eenheid": "sneden",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "huttenkase",
        "hoeveelheid": 50,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "olijfolie",
        "hoeveelheid": 10,
        "eenheid": "ml",
        "categorie": "voorraad"
      },
      {
        "naam": "peper, zout, bieslook",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "l2",
    "naam": "Tonijn-kikkererwtensalade",
    "soort": "lunch",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "1 blik tonijn op water (blik) · 150 g kikkererwten (blik, uitgelekt) · 1 snee volkorenbrood · 5 ml olijfolie · komkommer en tomaat naar smaak",
    "kcal": 455,
    "rotatie_week": null,
    "kook_factor": 1,
    "bereiding": "≈ standaard: vis-eiwit + peulvrucht-koolhydraat",
    "ingredienten": [
      {
        "naam": "tonijn op water (blik)",
        "hoeveelheid": 1,
        "eenheid": "blik",
        "categorie": "vlees-vis"
      },
      {
        "naam": "kikkererwten (blik, uitgelekt)",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "voorraad"
      },
      {
        "naam": "volkorenbrood",
        "hoeveelheid": 1,
        "eenheid": "snee",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "komkommer en tomaat",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "groente-fruit"
      },
      {
        "naam": "olijfolie",
        "hoeveelheid": 5,
        "eenheid": "ml",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "l3",
    "naam": "Wrap met gerookte kip",
    "soort": "lunch",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "1 stuk volkoren wrap · 120 g gerookte kipfilet · 50 g huttenkase · 1 stuk appel · komkommer en tomaat naar smaak",
    "kcal": 450,
    "rotatie_week": null,
    "kook_factor": 1,
    "bereiding": "≈ standaard: zelfde eiwitbron, wrap i.p.v. brood",
    "ingredienten": [
      {
        "naam": "volkoren wrap",
        "hoeveelheid": 1,
        "eenheid": "stuk",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "gerookte kipfilet",
        "hoeveelheid": 120,
        "eenheid": "g",
        "categorie": "vlees-vis"
      },
      {
        "naam": "huttenkase",
        "hoeveelheid": 50,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "komkommer en tomaat",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "groente-fruit"
      },
      {
        "naam": "appel",
        "hoeveelheid": 1,
        "eenheid": "stuk",
        "categorie": "groente-fruit"
      }
    ]
  },
  {
    "id": "l4",
    "naam": "Zoete kwark-lunchbowl",
    "soort": "lunch",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "300 g magere kwark · 30 g havermout · 1 stuk banaan · 10 g ongezouten noten · kaneel naar smaak",
    "kcal": 450,
    "rotatie_week": null,
    "kook_factor": 1,
    "bereiding": "±35 g eiwit — de hoogste van de lunches; nul bereiding, lepel erin",
    "ingredienten": [
      {
        "naam": "magere kwark",
        "hoeveelheid": 300,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "havermout",
        "hoeveelheid": 30,
        "eenheid": "g",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "banaan",
        "hoeveelheid": 1,
        "eenheid": "stuk",
        "categorie": "groente-fruit"
      },
      {
        "naam": "ongezouten noten",
        "hoeveelheid": 10,
        "eenheid": "g",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "kaneel",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "l5",
    "naam": "Eiersalade met yoghurt op volkoren",
    "soort": "lunch",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "2 stuks eieren · 50 g griekse yoghurt · 3 sneden volkorenbrood · 1 stuk tomaat · bieslook, peper, mosterd naar smaak",
    "kcal": 465,
    "rotatie_week": null,
    "kook_factor": 1,
    "bereiding": "±28 g eiwit — eiersalade op basis van griekse yoghurt i.p.v. mayonaise",
    "ingredienten": [
      {
        "naam": "eieren",
        "hoeveelheid": 2,
        "eenheid": "stuks",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "griekse yoghurt",
        "hoeveelheid": 50,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "volkorenbrood",
        "hoeveelheid": 3,
        "eenheid": "sneden",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "tomaat",
        "hoeveelheid": 1,
        "eenheid": "stuk",
        "categorie": "groente-fruit"
      },
      {
        "naam": "bieslook, peper, mosterd",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "l6",
    "naam": "Wrap met gerookte zalm",
    "soort": "lunch",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "1 stuk volkoren wrap · 100 g gerookte zalm · 50 g huttenkase · komkommer en rucola naar smaak · citroen en peper naar smaak",
    "kcal": 440,
    "rotatie_week": null,
    "kook_factor": 1,
    "bereiding": "±32 g eiwit — omega-3-optie; hüttenkäse als smeersel",
    "ingredienten": [
      {
        "naam": "volkoren wrap",
        "hoeveelheid": 1,
        "eenheid": "stuk",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "gerookte zalm",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "vlees-vis"
      },
      {
        "naam": "huttenkase",
        "hoeveelheid": 50,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "komkommer en rucola",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "groente-fruit"
      },
      {
        "naam": "citroen en peper",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "l7",
    "naam": "Linzensoep met volkoren (meal-prep)",
    "soort": "lunch",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "70 g rode linzen (droog) · 100 g tomatenblokjes (blik) · 100 g wortel · 1 snee volkorenbrood · 50 g huttenkase · bouillon, komijn, paprikapoeder naar smaak",
    "kcal": 435,
    "rotatie_week": null,
    "kook_factor": 1,
    "bereiding": "±27 g eiwit — grote pan vooruit te koken, 3-4 porties; plantaardige optie",
    "ingredienten": [
      {
        "naam": "rode linzen (droog)",
        "hoeveelheid": 70,
        "eenheid": "g",
        "categorie": "voorraad"
      },
      {
        "naam": "tomatenblokjes (blik)",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "voorraad"
      },
      {
        "naam": "wortel",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "volkorenbrood",
        "hoeveelheid": 1,
        "eenheid": "snee",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "huttenkase",
        "hoeveelheid": 50,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "bouillon, komijn, paprikapoeder",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "l8",
    "naam": "Tartaartje op volkoren",
    "soort": "lunch",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "100 g rundertartaartje · 3 sneden volkorenbrood · 0.5 stuk rode ui · 1 stuk tomaat · 5 ml olijfolie · mosterd, peper naar smaak",
    "kcal": 460,
    "rotatie_week": null,
    "kook_factor": 1,
    "bereiding": "±30 g eiwit — tartaartje kort bakken, gebakken ui erover",
    "ingredienten": [
      {
        "naam": "rundertartaartje",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "vlees-vis"
      },
      {
        "naam": "volkorenbrood",
        "hoeveelheid": 3,
        "eenheid": "sneden",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "rode ui",
        "hoeveelheid": 0.5,
        "eenheid": "stuk",
        "categorie": "groente-fruit"
      },
      {
        "naam": "tomaat",
        "hoeveelheid": 1,
        "eenheid": "stuk",
        "categorie": "groente-fruit"
      },
      {
        "naam": "olijfolie",
        "hoeveelheid": 5,
        "eenheid": "ml",
        "categorie": "voorraad"
      },
      {
        "naam": "mosterd, peper",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "l9",
    "naam": "Kip-caesar bowl",
    "soort": "lunch",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "120 g gerookte kipfilet · 1 stuk gekookt ei · 100 g gemengde salade · 10 g parmezaan · 50 g griekse yoghurt · 2 sneden volkorenbrood · citroen, peper, knoflook naar smaak",
    "kcal": 475,
    "rotatie_week": null,
    "kook_factor": 1,
    "bereiding": "±38 g eiwit — gerookte kip + ei; yoghurtdressing i.p.v. caesardressing",
    "ingredienten": [
      {
        "naam": "gerookte kipfilet",
        "hoeveelheid": 120,
        "eenheid": "g",
        "categorie": "vlees-vis"
      },
      {
        "naam": "gekookt ei",
        "hoeveelheid": 1,
        "eenheid": "stuk",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "gemengde salade",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "parmezaan",
        "hoeveelheid": 10,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "griekse yoghurt",
        "hoeveelheid": 50,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "volkorenbrood",
        "hoeveelheid": 2,
        "eenheid": "sneden",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "citroen, peper, knoflook",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  },
  {
    "id": "l10",
    "naam": "Gerookte makreel op volkoren",
    "soort": "lunch",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "80 g gerookte makreel · 2 sneden volkorenbrood · 50 g huttenkase · 100 g komkommer · citroen, peper naar smaak",
    "kcal": 470,
    "rotatie_week": null,
    "kook_factor": 1,
    "bereiding": "±25 g eiwit — vetter dan de rest maar vol omega-3; hüttenkäse eronder",
    "ingredienten": [
      {
        "naam": "gerookte makreel",
        "hoeveelheid": 80,
        "eenheid": "g",
        "categorie": "vlees-vis"
      },
      {
        "naam": "volkorenbrood",
        "hoeveelheid": 2,
        "eenheid": "sneden",
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "huttenkase",
        "hoeveelheid": 50,
        "eenheid": "g",
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "komkommer",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "groente-fruit"
      },
      {
        "naam": "citroen, peper",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "categorie": "voorraad"
      }
    ]
  }
]

// De standaarddag uit het plan (referentie + de vaste snack 16:00).
export const SEED_STANDAARDDAG =
[
  {
    "moment": "ontbijt",
    "kcal_totaal": 590,
    "items": [
      {
        "naam": "magere kwark",
        "hoeveelheid": 250,
        "eenheid": "g",
        "kcal": 155,
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "havermout",
        "hoeveelheid": 40,
        "eenheid": "g",
        "kcal": 150,
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "chiazaad",
        "hoeveelheid": 10,
        "eenheid": "g",
        "kcal": 55,
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "ongezouten noten",
        "hoeveelheid": 25,
        "eenheid": "g",
        "kcal": 155,
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "blauwe bessen (diepvries)",
        "hoeveelheid": 100,
        "eenheid": "g",
        "kcal": 55,
        "categorie": "groente-fruit"
      },
      {
        "naam": "siroop",
        "hoeveelheid": 7,
        "eenheid": "g",
        "kcal": 20,
        "categorie": "voorraad"
      },
      {
        "naam": "kaneel",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "kcal": 0,
        "categorie": "voorraad"
      }
    ],
    "notitie": "OV-dag: avond ervoor klaarzetten als overnight oats"
  },
  {
    "moment": "lunch",
    "kcal_totaal": 460,
    "items": [
      {
        "naam": "volkorenbrood",
        "hoeveelheid": 3,
        "eenheid": "sneden",
        "kcal": 260,
        "categorie": "koolhydraten-noten"
      },
      {
        "naam": "gerookte kipfilet OF tonijn op water (blik)",
        "hoeveelheid": 120,
        "eenheid": "g",
        "kcal": 130,
        "categorie": "vlees-vis"
      },
      {
        "naam": "huttenkase",
        "hoeveelheid": 50,
        "eenheid": "g",
        "kcal": 50,
        "categorie": "zuivel-eieren"
      },
      {
        "naam": "komkommer en tomaat",
        "hoeveelheid": null,
        "eenheid": "naar smaak",
        "kcal": 20,
        "categorie": "groente-fruit"
      }
    ]
  },
  {
    "moment": "snack_1600",
    "kcal_totaal": 160,
    "items": [
      {
        "naam": "appel",
        "hoeveelheid": 1,
        "eenheid": "stuk",
        "kcal": 80,
        "categorie": "groente-fruit"
      },
      {
        "naam": "gekookt ei",
        "hoeveelheid": 1,
        "eenheid": "stuk",
        "kcal": 80,
        "categorie": "zuivel-eieren"
      }
    ],
    "notitie": "tevens de tas-snack voor de terugreis"
  },
  {
    "moment": "diner",
    "kcal_totaal": 725,
    "items": [],
    "notitie": "het rotatiegerecht van vandaag (zie gerechten); alle gerechten gekalibreerd op 690-755 kcal"
  }
]

// Vaste basislijst: dekt plus-blokken, snack 16:00 en voorraad-checks.
// Ontbijt-, lunch- en diner-ingrediënten rekent de app uit het weekmenu.
export const SEED_VASTE_BOODSCHAPPEN =
[
  {
    "naam": "magere kwark",
    "hoeveelheid": 3,
    "eenheid": "bakken 500 g",
    "categorie": "zuivel-eieren"
  },
  {
    "naam": "eieren",
    "hoeveelheid": 10,
    "eenheid": "stuks",
    "categorie": "zuivel-eieren"
  },
  {
    "naam": "appels",
    "hoeveelheid": 7,
    "eenheid": "stuks",
    "categorie": "groente-fruit"
  },
  {
    "naam": "bananen",
    "hoeveelheid": 6,
    "eenheid": "stuks",
    "categorie": "groente-fruit"
  },
  {
    "naam": "mandarijnen of kiwi's",
    "hoeveelheid": 4,
    "eenheid": "stuks",
    "categorie": "groente-fruit"
  },
  {
    "naam": "komkommer",
    "hoeveelheid": 1,
    "eenheid": "stuk",
    "categorie": "groente-fruit"
  },
  {
    "naam": "tomaten",
    "hoeveelheid": 4,
    "eenheid": "stuks",
    "categorie": "groente-fruit"
  },
  {
    "naam": "rijstwafels",
    "hoeveelheid": 1,
    "eenheid": "rol",
    "categorie": "koolhydraten-noten"
  },
  {
    "naam": "krentenbollen",
    "hoeveelheid": 2,
    "eenheid": "stuks",
    "categorie": "koolhydraten-noten"
  },
  {
    "naam": "volkorenbrood (L-blok)",
    "hoeveelheid": 1,
    "eenheid": "snee",
    "categorie": "koolhydraten-noten"
  },
  {
    "naam": "pindakaas",
    "hoeveelheid": 1,
    "eenheid": "pot (voorraad-check)",
    "categorie": "voorraad"
  },
  {
    "naam": "olijfolie, honing, siroop, kaneel",
    "hoeveelheid": null,
    "eenheid": "voorraad-check",
    "categorie": "voorraad"
  }
]
