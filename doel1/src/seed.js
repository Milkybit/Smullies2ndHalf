// Seed-data voor Doel1.
//
// De 12 rotatie-gerechten (3 per week, week 5 = week 1) komen uit de bestaande
// receptenbibliotheek van dit repo (assets/recipes.json) en zijn een
// startpunt: pas ze aan zodra het 4-wekenplan (PDF) definitief is.
// Veldnamen volgen het datamodel dat in fase 6 letterlijk naar
// supabase/schema.sql gaat — niet hernoemen.

export const SEED_GERECHTEN =
[
  {
    "id": "d01",
    "naam": "Kipfilet met broccoli en zoete aardappel",
    "anker": "kip",
    "kleur1": "groen",
    "kleur2": "oranje",
    "basis": "Zoete aardappel",
    "smaak": "puur",
    "porties_tekst": "210 g kipfilet · 300 g broccoli · 10 g olijfolie · 250 g zoete aardappel",
    "kcal": 630,
    "rotatie_week": 1,
    "ingredienten": [
      {
        "naam": "Kipfilet",
        "hoeveelheid": 210,
        "eenheid": "g",
        "categorie": "Vlees"
      },
      {
        "naam": "Broccoli",
        "hoeveelheid": 300,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Olijfolie",
        "hoeveelheid": 10,
        "eenheid": "g",
        "categorie": "Olie"
      },
      {
        "naam": "Zoete aardappel",
        "hoeveelheid": 250,
        "eenheid": "g",
        "categorie": "Groente"
      }
    ]
  },
  {
    "id": "d02",
    "naam": "Zalm met couscous en geroerbakte groente",
    "anker": "vis",
    "kleur1": "groen",
    "kleur2": "rood",
    "basis": "Couscous (droog)",
    "smaak": "mediterraan",
    "porties_tekst": "170 g zalmfilet · 200 g courgette · 150 g paprika · 30 g rucola · 120 g kikkererwten · 55 g couscous (droog)",
    "kcal": 777,
    "rotatie_week": 1,
    "ingredienten": [
      {
        "naam": "Zalmfilet",
        "hoeveelheid": 170,
        "eenheid": "g",
        "categorie": "Vis"
      },
      {
        "naam": "Courgette",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Paprika",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Rucola",
        "hoeveelheid": 30,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Kikkererwten",
        "hoeveelheid": 120,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Couscous (droog)",
        "hoeveelheid": 55,
        "eenheid": "g",
        "categorie": "Pasta en rijst"
      }
    ]
  },
  {
    "id": "d09",
    "naam": "Chili con carne",
    "anker": "rund",
    "kleur1": "rood",
    "kleur2": "geel",
    "basis": "Zilvervliesrijst (droog)",
    "smaak": "mexicaans",
    "porties_tekst": "180 g mager rundergehakt · 250 g kidneybonen · 200 g tomatenblokjes · 150 g paprika · 80 g mais · 60 g zilvervliesrijst (droog)",
    "kcal": 912,
    "rotatie_week": 1,
    "ingredienten": [
      {
        "naam": "Mager rundergehakt",
        "hoeveelheid": 180,
        "eenheid": "g",
        "categorie": "Vlees"
      },
      {
        "naam": "Kidneybonen",
        "hoeveelheid": 250,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Tomatenblokjes",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Paprika",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Mais",
        "hoeveelheid": 80,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Zilvervliesrijst (droog)",
        "hoeveelheid": 60,
        "eenheid": "g",
        "categorie": "Pasta en rijst"
      }
    ]
  },
  {
    "id": "d05",
    "naam": "Kipshoarma in volkoren wraps",
    "anker": "kip",
    "kleur1": "groen",
    "kleur2": "rood",
    "basis": "Volkoren wraps",
    "smaak": "oosters",
    "porties_tekst": "220 g kipshoarma · 100 g ijsbergsla · 100 g tomaat · 150 g paprika · 100 g magere yoghurt · 120 g kidneybonen · 120 g volkoren wraps",
    "kcal": 882,
    "rotatie_week": 2,
    "ingredienten": [
      {
        "naam": "Kipshoarma",
        "hoeveelheid": 220,
        "eenheid": "g",
        "categorie": "Vlees"
      },
      {
        "naam": "IJsbergsla",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Tomaat",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Paprika",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Magere yoghurt",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Kidneybonen",
        "hoeveelheid": 120,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Volkoren wraps",
        "hoeveelheid": 120,
        "eenheid": "g",
        "categorie": "Brood"
      }
    ]
  },
  {
    "id": "d08",
    "naam": "Kabeljauw met aardappel en spinazie",
    "anker": "vis",
    "kleur1": "groen",
    "kleur2": "wit",
    "basis": "Aardappelen",
    "smaak": "puur",
    "porties_tekst": "240 g kabeljauwfilet · 250 g verse spinazie · 12 g olijfolie · 40 g rode ui · 150 g haricots verts · 300 g aardappelen",
    "kcal": 668,
    "rotatie_week": 2,
    "ingredienten": [
      {
        "naam": "Kabeljauwfilet",
        "hoeveelheid": 240,
        "eenheid": "g",
        "categorie": "Vis"
      },
      {
        "naam": "Verse spinazie",
        "hoeveelheid": 250,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Olijfolie",
        "hoeveelheid": 12,
        "eenheid": "g",
        "categorie": "Olie"
      },
      {
        "naam": "Rode ui",
        "hoeveelheid": 40,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Haricots verts",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Aardappelen",
        "hoeveelheid": 300,
        "eenheid": "g",
        "categorie": "Groente"
      }
    ]
  },
  {
    "id": "d15",
    "naam": "Kikkererwtencurry met bloemkool",
    "anker": "vega",
    "kleur1": "wit",
    "kleur2": "rood",
    "basis": "Basmatirijst (droog)",
    "smaak": "indiaas",
    "porties_tekst": "250 g kikkererwten · 250 g bloemkool · 120 g kokosmelk light · 200 g tomatenblokjes · 25 g rode currypasta · 100 g griekse yoghurt 0% · 200 g gemarineerde tofu · 55 g basmatirijst (droog)",
    "kcal": 1065,
    "rotatie_week": 2,
    "ingredienten": [
      {
        "naam": "Kikkererwten",
        "hoeveelheid": 250,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Bloemkool",
        "hoeveelheid": 250,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Kokosmelk light",
        "hoeveelheid": 120,
        "eenheid": "g",
        "categorie": "Wereldkeuken"
      },
      {
        "naam": "Tomatenblokjes",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Rode currypasta",
        "hoeveelheid": 25,
        "eenheid": "g",
        "categorie": "Wereldkeuken"
      },
      {
        "naam": "Griekse yoghurt 0%",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Gemarineerde tofu",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "Vegetarisch"
      },
      {
        "naam": "Basmatirijst (droog)",
        "hoeveelheid": 55,
        "eenheid": "g",
        "categorie": "Pasta en rijst"
      }
    ]
  },
  {
    "id": "d10",
    "naam": "Kipsaté met rijst en komkommer",
    "anker": "kip",
    "kleur1": "groen",
    "kleur2": "oranje",
    "basis": "Zilvervliesrijst (droog)",
    "smaak": "indonesisch",
    "porties_tekst": "200 g kipfilet · 20 g pindakaas 100% · 200 g komkommer · 100 g wortel · 120 g edamame · 55 g zilvervliesrijst (droog)",
    "kcal": 737,
    "rotatie_week": 3,
    "ingredienten": [
      {
        "naam": "Kipfilet",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "Vlees"
      },
      {
        "naam": "Pindakaas 100%",
        "hoeveelheid": 20,
        "eenheid": "g",
        "categorie": "Noten"
      },
      {
        "naam": "Komkommer",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Wortel",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Edamame",
        "hoeveelheid": 120,
        "eenheid": "g",
        "categorie": "Diepvries"
      },
      {
        "naam": "Zilvervliesrijst (droog)",
        "hoeveelheid": 55,
        "eenheid": "g",
        "categorie": "Pasta en rijst"
      }
    ]
  },
  {
    "id": "d17",
    "naam": "Tonijnsteak met quinoa en asperges",
    "anker": "vis",
    "kleur1": "groen",
    "kleur2": "wit",
    "basis": "Quinoa (droog)",
    "smaak": "mediterraan",
    "porties_tekst": "200 g tonijnsteak · 250 g groene asperges · 10 g olijfolie · 40 g rucola · 100 g edamame · 55 g quinoa (droog)",
    "kcal": 690,
    "rotatie_week": 3,
    "ingredienten": [
      {
        "naam": "Tonijnsteak",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "Vis"
      },
      {
        "naam": "Groene asperges",
        "hoeveelheid": 250,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Olijfolie",
        "hoeveelheid": 10,
        "eenheid": "g",
        "categorie": "Olie"
      },
      {
        "naam": "Rucola",
        "hoeveelheid": 40,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Edamame",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Diepvries"
      },
      {
        "naam": "Quinoa (droog)",
        "hoeveelheid": 55,
        "eenheid": "g",
        "categorie": "Pasta en rijst"
      }
    ]
  },
  {
    "id": "d12",
    "naam": "Gehaktballen in tomatensaus met pasta",
    "anker": "rund",
    "kleur1": "rood",
    "kleur2": "groen",
    "basis": "Volkoren pasta (droog)",
    "smaak": "italiaans",
    "porties_tekst": "190 g mager rundergehakt · 250 g tomatensaus · 150 g courgette · 25 g belegen kaas 30+ · 150 g kidneybonen · 60 g volkoren pasta (droog)",
    "kcal": 843,
    "rotatie_week": 3,
    "ingredienten": [
      {
        "naam": "Mager rundergehakt",
        "hoeveelheid": 190,
        "eenheid": "g",
        "categorie": "Vlees"
      },
      {
        "naam": "Tomatensaus",
        "hoeveelheid": 250,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Courgette",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Belegen kaas 30+",
        "hoeveelheid": 25,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Kidneybonen",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Volkoren pasta (droog)",
        "hoeveelheid": 60,
        "eenheid": "g",
        "categorie": "Pasta en rijst"
      }
    ]
  },
  {
    "id": "d11",
    "naam": "Griekse kip met bulgur en tzatziki",
    "anker": "kip",
    "kleur1": "rood",
    "kleur2": "groen",
    "basis": "Bulgur (droog)",
    "smaak": "grieks",
    "porties_tekst": "200 g kipfilet · 100 g magere tzatziki · 150 g tomaat · 100 g komkommer · 30 g feta · 130 g kikkererwten · 55 g bulgur (droog)",
    "kcal": 718,
    "rotatie_week": 4,
    "ingredienten": [
      {
        "naam": "Kipfilet",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "Vlees"
      },
      {
        "naam": "Magere tzatziki",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Tomaat",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Komkommer",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Feta",
        "hoeveelheid": 30,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Kikkererwten",
        "hoeveelheid": 130,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Bulgur (droog)",
        "hoeveelheid": 55,
        "eenheid": "g",
        "categorie": "Pasta en rijst"
      }
    ]
  },
  {
    "id": "d13",
    "naam": "Pokébowl met zalm en edamame",
    "anker": "vis",
    "kleur1": "groen",
    "kleur2": "oranje",
    "basis": "Zilvervliesrijst (droog)",
    "smaak": "japans",
    "porties_tekst": "160 g zalmfilet · 180 g edamame · 100 g komkommer · 100 g wortel · 15 g sojasaus · 100 g mais · 55 g zilvervliesrijst (droog)",
    "kcal": 890,
    "rotatie_week": 4,
    "ingredienten": [
      {
        "naam": "Zalmfilet",
        "hoeveelheid": 160,
        "eenheid": "g",
        "categorie": "Vis"
      },
      {
        "naam": "Edamame",
        "hoeveelheid": 180,
        "eenheid": "g",
        "categorie": "Diepvries"
      },
      {
        "naam": "Komkommer",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Wortel",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Sojasaus",
        "hoeveelheid": 15,
        "eenheid": "g",
        "categorie": "Wereldkeuken"
      },
      {
        "naam": "Mais",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Zilvervliesrijst (droog)",
        "hoeveelheid": 55,
        "eenheid": "g",
        "categorie": "Pasta en rijst"
      }
    ]
  },
  {
    "id": "d07",
    "naam": "Ovenschotel met kipgehakt",
    "anker": "kip",
    "kleur1": "rood",
    "kleur2": "wit",
    "basis": "Volkoren pasta (droog)",
    "smaak": "italiaans",
    "porties_tekst": "210 g mager kipgehakt · 200 g courgette · 200 g tomatensaus · 30 g belegen kaas 30+ · 100 g champignons · 120 g kidneybonen · 55 g volkoren pasta (droog)",
    "kcal": 802,
    "rotatie_week": 4,
    "ingredienten": [
      {
        "naam": "Mager kipgehakt",
        "hoeveelheid": 210,
        "eenheid": "g",
        "categorie": "Vlees"
      },
      {
        "naam": "Courgette",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Tomatensaus",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Belegen kaas 30+",
        "hoeveelheid": 30,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Champignons",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Kidneybonen",
        "hoeveelheid": 120,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Volkoren pasta (droog)",
        "hoeveelheid": 55,
        "eenheid": "g",
        "categorie": "Pasta en rijst"
      }
    ]
  }
]

// Vaste boodschappenlijst (elke week hetzelfde, los van de rotatie).
// Ook dit is een startpunt — aanpassen mag gewoon hier.
export const SEED_VASTE_BOODSCHAPPEN = [
  { naam: 'Magere kwark', hoeveelheid: 1000, eenheid: 'g', categorie: 'Zuivel' },
  { naam: 'Magere yoghurt', hoeveelheid: 1000, eenheid: 'g', categorie: 'Zuivel' },
  { naam: 'Halfvolle melk', hoeveelheid: 1, eenheid: 'l', categorie: 'Zuivel' },
  { naam: 'Havermout', hoeveelheid: 500, eenheid: 'g', categorie: 'Ontbijtgranen' },
  { naam: 'Blauwe bessen (diepvries)', hoeveelheid: 400, eenheid: 'g', categorie: 'Diepvries' },
  { naam: 'Bananen', hoeveelheid: 7, eenheid: 'st', categorie: 'Fruit' },
  { naam: 'Appels', hoeveelheid: 5, eenheid: 'st', categorie: 'Fruit' },
  { naam: 'Volkoren brood', hoeveelheid: 1, eenheid: 'heel', categorie: 'Brood' },
  { naam: 'Eieren', hoeveelheid: 10, eenheid: 'st', categorie: 'Eieren' },
  { naam: 'Amandelen', hoeveelheid: 200, eenheid: 'g', categorie: 'Noten' },
  { naam: 'Pindakaas 100%', hoeveelheid: 1, eenheid: 'pot', categorie: 'Noten' },
]
