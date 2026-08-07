// Seed-data voor Doel1.
//
// De gerechten komen uit de receptenbibliotheek van de eerdere Afval-app
// (assets/recipes.json in de git-historie) en zijn een startpunt: pas ze aan
// zodra het 4-wekenplan (PDF) definitief is. De 12 diners vormen de rotatie
// (3 per week, week 5 = week 1); ontbijt, lunch en snacks kies je per dag in
// het weekmenu. Veldnamen volgen het datamodel dat in fase 6 letterlijk naar
// supabase/schema.sql gaat — niet hernoemen.

export const SEED_VERSIE = 2

export const SEED_GERECHTEN =
[
  {
    "id": "d01",
    "naam": "Kipfilet met broccoli en zoete aardappel",
    "soort": "diner",
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
    "soort": "diner",
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
    "soort": "diner",
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
    "soort": "diner",
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
    "soort": "diner",
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
    "soort": "diner",
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
    "soort": "diner",
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
    "soort": "diner",
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
    "soort": "diner",
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
    "soort": "diner",
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
    "soort": "diner",
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
    "soort": "diner",
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
  },
  {
    "id": "b1",
    "naam": "Kwark met havermout en bessen",
    "soort": "ontbijt",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": "Havermout",
    "smaak": null,
    "porties_tekst": "300 g magere kwark · 100 g blauwe bessen (diepvries) · 10 g amandelen · 50 g havermout",
    "kcal": 464,
    "rotatie_week": null,
    "ingredienten": [
      {
        "naam": "Magere kwark",
        "hoeveelheid": 300,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Blauwe bessen (diepvries)",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Diepvries"
      },
      {
        "naam": "Amandelen",
        "hoeveelheid": 10,
        "eenheid": "g",
        "categorie": "Noten"
      },
      {
        "naam": "Havermout",
        "hoeveelheid": 50,
        "eenheid": "g",
        "categorie": "Ontbijt"
      }
    ]
  },
  {
    "id": "b2",
    "naam": "Omelet met spinazie en champignons",
    "soort": "ontbijt",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": "Volkorenbrood",
    "smaak": null,
    "porties_tekst": "165 g eieren · 150 g vloeibaar eiwit · 200 g verse spinazie · 100 g champignons · 150 g tomaat · 70 g volkorenbrood",
    "kcal": 568,
    "rotatie_week": null,
    "ingredienten": [
      {
        "naam": "Eieren",
        "hoeveelheid": 165,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Vloeibaar eiwit",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Verse spinazie",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Champignons",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Tomaat",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Volkorenbrood",
        "hoeveelheid": 70,
        "eenheid": "g",
        "categorie": "Brood"
      }
    ]
  },
  {
    "id": "b3",
    "naam": "Skyr-bowl met banaan en pindakaas",
    "soort": "ontbijt",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": "Havermout",
    "smaak": null,
    "porties_tekst": "300 g skyr naturel · 100 g banaan · 15 g pindakaas 100% · 100 g blauwe bessen (diepvries) · 45 g havermout",
    "kcal": 585,
    "rotatie_week": null,
    "ingredienten": [
      {
        "naam": "Skyr naturel",
        "hoeveelheid": 300,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Banaan",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Fruit"
      },
      {
        "naam": "Pindakaas 100%",
        "hoeveelheid": 15,
        "eenheid": "g",
        "categorie": "Noten"
      },
      {
        "naam": "Blauwe bessen (diepvries)",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Diepvries"
      },
      {
        "naam": "Havermout",
        "hoeveelheid": 45,
        "eenheid": "g",
        "categorie": "Ontbijt"
      }
    ]
  },
  {
    "id": "b4",
    "naam": "Volkoren met ei en kipfilet",
    "soort": "ontbijt",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": "Volkorenbrood",
    "smaak": null,
    "porties_tekst": "110 g eieren · 80 g kipfilet (gaar) · 80 g hüttenkäse · 150 g tomaat · 200 g verse spinazie · 120 g appel · 70 g volkorenbrood",
    "kcal": 624,
    "rotatie_week": null,
    "ingredienten": [
      {
        "naam": "Eieren",
        "hoeveelheid": 110,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Kipfilet (gaar)",
        "hoeveelheid": 80,
        "eenheid": "g",
        "categorie": "Vlees"
      },
      {
        "naam": "Hüttenkäse",
        "hoeveelheid": 80,
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
        "naam": "Verse spinazie",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Appel",
        "hoeveelheid": 120,
        "eenheid": "g",
        "categorie": "Fruit"
      },
      {
        "naam": "Volkorenbrood",
        "hoeveelheid": 70,
        "eenheid": "g",
        "categorie": "Brood"
      }
    ]
  },
  {
    "id": "l1",
    "naam": "Volkoren met kip en hüttenkäse",
    "soort": "lunch",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": "Volkorenbrood",
    "smaak": null,
    "porties_tekst": "120 g kipfilet (gaar) · 125 g hüttenkäse · 100 g tomaat · 100 g komkommer · 25 g rucola · 120 g kikkererwten · 70 g volkorenbrood",
    "kcal": 595,
    "rotatie_week": null,
    "ingredienten": [
      {
        "naam": "Kipfilet (gaar)",
        "hoeveelheid": 120,
        "eenheid": "g",
        "categorie": "Vlees"
      },
      {
        "naam": "Hüttenkäse",
        "hoeveelheid": 125,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Tomaat",
        "hoeveelheid": 100,
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
        "naam": "Rucola",
        "hoeveelheid": 25,
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
        "naam": "Volkorenbrood",
        "hoeveelheid": 70,
        "eenheid": "g",
        "categorie": "Brood"
      }
    ]
  },
  {
    "id": "l2",
    "naam": "Tonijnsalade met kikkererwten",
    "soort": "lunch",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": "Kikkererwten",
    "smaak": null,
    "porties_tekst": "150 g tonijn op water · 150 g paprika · 40 g rode ui · 40 g rucola · 10 g olijfolie · 80 g mais · 150 g kikkererwten",
    "kcal": 557,
    "rotatie_week": null,
    "ingredienten": [
      {
        "naam": "Tonijn op water",
        "hoeveelheid": 150,
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
        "naam": "Rode ui",
        "hoeveelheid": 40,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Rucola",
        "hoeveelheid": 40,
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
        "naam": "Mais",
        "hoeveelheid": 80,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Kikkererwten",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "Conserven"
      }
    ]
  },
  {
    "id": "l3",
    "naam": "Linzensoep met volkorenbrood",
    "soort": "lunch",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": "Volkorenbrood",
    "smaak": null,
    "porties_tekst": "90 g rode linzen (droog) · 100 g wortel · 200 g tomatenblokjes · 100 g griekse yoghurt 0% · 100 g kipfilet (gaar) · 70 g volkorenbrood",
    "kcal": 723,
    "rotatie_week": null,
    "ingredienten": [
      {
        "naam": "Rode linzen (droog)",
        "hoeveelheid": 90,
        "eenheid": "g",
        "categorie": "Peulvruchten"
      },
      {
        "naam": "Wortel",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Tomatenblokjes",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Griekse yoghurt 0%",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Kipfilet (gaar)",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Vlees"
      },
      {
        "naam": "Volkorenbrood",
        "hoeveelheid": 70,
        "eenheid": "g",
        "categorie": "Brood"
      }
    ]
  },
  {
    "id": "l4",
    "naam": "Wrap met zalm en roomkaas",
    "soort": "lunch",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": "Volkoren wraps",
    "smaak": null,
    "porties_tekst": "120 g zalmfilet · 60 g magere roomkaas · 100 g komkommer · 40 g rucola · 30 g rode ui · 100 g edamame · 80 g volkoren wraps",
    "kcal": 702,
    "rotatie_week": null,
    "ingredienten": [
      {
        "naam": "Zalmfilet",
        "hoeveelheid": 120,
        "eenheid": "g",
        "categorie": "Vis"
      },
      {
        "naam": "Magere roomkaas",
        "hoeveelheid": 60,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Komkommer",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Rucola",
        "hoeveelheid": 40,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Rode ui",
        "hoeveelheid": 30,
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
        "naam": "Volkoren wraps",
        "hoeveelheid": 80,
        "eenheid": "g",
        "categorie": "Brood"
      }
    ]
  },
  {
    "id": "l5",
    "naam": "Couscoussalade met feta en kikkererwten",
    "soort": "lunch",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": "Couscous (droog)",
    "smaak": null,
    "porties_tekst": "200 g kikkererwten · 50 g feta · 100 g paprika · 100 g komkommer · 8 g olijfolie · 150 g gemarineerde tofu · 50 g couscous (droog)",
    "kcal": 854,
    "rotatie_week": null,
    "ingredienten": [
      {
        "naam": "Kikkererwten",
        "hoeveelheid": 200,
        "eenheid": "g",
        "categorie": "Conserven"
      },
      {
        "naam": "Feta",
        "hoeveelheid": 50,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Paprika",
        "hoeveelheid": 100,
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
        "naam": "Olijfolie",
        "hoeveelheid": 8,
        "eenheid": "g",
        "categorie": "Olie"
      },
      {
        "naam": "Gemarineerde tofu",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "Vegetarisch"
      },
      {
        "naam": "Couscous (droog)",
        "hoeveelheid": 50,
        "eenheid": "g",
        "categorie": "Pasta en rijst"
      }
    ]
  },
  {
    "id": "s1",
    "naam": "Skyr met appel",
    "soort": "snack",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "300 g skyr naturel · 150 g appel · 15 g amandelen · 100 g blauwe bessen (diepvries)",
    "kcal": 405,
    "rotatie_week": null,
    "ingredienten": [
      {
        "naam": "Skyr naturel",
        "hoeveelheid": 300,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Appel",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "Fruit"
      },
      {
        "naam": "Amandelen",
        "hoeveelheid": 15,
        "eenheid": "g",
        "categorie": "Noten"
      },
      {
        "naam": "Blauwe bessen (diepvries)",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Diepvries"
      }
    ]
  },
  {
    "id": "s2",
    "naam": "Cottage cheese met walnoten",
    "soort": "snack",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "250 g cottage cheese · 20 g walnoten · 150 g appel · 10 g eiwitpoeder · 100 g blauwe bessen (diepvries)",
    "kcal": 544,
    "rotatie_week": null,
    "ingredienten": [
      {
        "naam": "Cottage cheese",
        "hoeveelheid": 250,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Walnoten",
        "hoeveelheid": 20,
        "eenheid": "g",
        "categorie": "Noten"
      },
      {
        "naam": "Appel",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "Fruit"
      },
      {
        "naam": "Eiwitpoeder",
        "hoeveelheid": 10,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Blauwe bessen (diepvries)",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Diepvries"
      }
    ]
  },
  {
    "id": "s3",
    "naam": "Kwark met eiwitpoeder en banaan",
    "soort": "snack",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "250 g magere kwark · 15 g eiwitpoeder · 100 g banaan · 100 g blauwe bessen (diepvries)",
    "kcal": 333,
    "rotatie_week": null,
    "ingredienten": [
      {
        "naam": "Magere kwark",
        "hoeveelheid": 250,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Eiwitpoeder",
        "hoeveelheid": 15,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Banaan",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Fruit"
      },
      {
        "naam": "Blauwe bessen (diepvries)",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Diepvries"
      }
    ]
  },
  {
    "id": "s4",
    "naam": "Griekse yoghurt met bessen en amandelen",
    "soort": "snack",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": null,
    "smaak": null,
    "porties_tekst": "250 g griekse yoghurt 0% · 125 g blauwe bessen (diepvries) · 15 g amandelen · 20 g eiwitpoeder",
    "kcal": 364,
    "rotatie_week": null,
    "ingredienten": [
      {
        "naam": "Griekse yoghurt 0%",
        "hoeveelheid": 250,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Blauwe bessen (diepvries)",
        "hoeveelheid": 125,
        "eenheid": "g",
        "categorie": "Diepvries"
      },
      {
        "naam": "Amandelen",
        "hoeveelheid": 15,
        "eenheid": "g",
        "categorie": "Noten"
      },
      {
        "naam": "Eiwitpoeder",
        "hoeveelheid": 20,
        "eenheid": "g",
        "categorie": "Zuivel"
      }
    ]
  },
  {
    "id": "s5",
    "naam": "Crackers met hüttenkäse en tomaat",
    "soort": "snack",
    "anker": null,
    "kleur1": null,
    "kleur2": null,
    "basis": "Volkoren crackers",
    "smaak": null,
    "porties_tekst": "250 g hüttenkäse · 100 g tomaat · 20 g rucola · 10 g eiwitpoeder · 150 g appel · 30 g volkoren crackers",
    "kcal": 493,
    "rotatie_week": null,
    "ingredienten": [
      {
        "naam": "Hüttenkäse",
        "hoeveelheid": 250,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Tomaat",
        "hoeveelheid": 100,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Rucola",
        "hoeveelheid": 20,
        "eenheid": "g",
        "categorie": "Groente"
      },
      {
        "naam": "Eiwitpoeder",
        "hoeveelheid": 10,
        "eenheid": "g",
        "categorie": "Zuivel"
      },
      {
        "naam": "Appel",
        "hoeveelheid": 150,
        "eenheid": "g",
        "categorie": "Fruit"
      },
      {
        "naam": "Volkoren crackers",
        "hoeveelheid": 30,
        "eenheid": "g",
        "categorie": "Brood"
      }
    ]
  }
]

// Vaste boodschappenlijst (elke week hetzelfde, los van het menu).
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
