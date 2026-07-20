#!/usr/bin/env python3
"""
Bouwt recipes.json uit een ingredientendatabase.

Waarom een generator en niet handmatig JSON: macro's staan hier één keer,
per ingredient. Een recept verwijst er alleen naar. Corrigeer je een waarde
tegen NEVO, dan werkt dat overal door en kun je niet twee verschillende
waarden voor kipfilet hebben.

Draaien:  python tools/build_recipes.py
Uitvoer:  assets/recipes.json
"""

import json
from pathlib import Path
from itertools import product

# ---------------------------------------------------------------------------
# Ingredienten: per 100 g -> (schap, kcal, eiwit, koolhydraat, vet, vezel)
#
# LET OP: representatieve waarden, niet geverifieerd. Controleer tegen NEVO
# (RIVM) of de verpakking voordat je erop stuurt.
# ---------------------------------------------------------------------------

ING = {
    # zuivel
    "kwark-mager":      ("Zuivel", 57, 10.5, 3.9, 0.2, 0),
    "skyr":             ("Zuivel", 63, 11.0, 4.0, 0.2, 0),
    "huttenkase":       ("Zuivel", 95, 12.0, 3.0, 4.0, 0),
    "cottage-cheese":   ("Zuivel", 97, 12.0, 3.0, 4.0, 0),
    "yoghurt-mager":    ("Zuivel", 42, 4.3, 5.5, 0.1, 0),
    "griekse-yoghurt":  ("Zuivel", 57, 9.0, 4.0, 0.5, 0),
    "ei":               ("Zuivel", 143, 12.6, 0.7, 9.5, 0),
    "eiwit-vloeibaar":  ("Zuivel", 48, 11.0, 0.7, 0.2, 0),
    "kaas-30plus":      ("Zuivel", 300, 27.0, 0, 21.0, 0),
    "feta":             ("Zuivel", 215, 14.0, 1.5, 17.0, 0),
    "roomkaas-mager":   ("Zuivel", 110, 10.0, 4.0, 6.0, 0),
    "eiwitpoeder":      ("Zuivel", 375, 80.0, 6.0, 4.0, 0),
    # vlees
    "kipfilet":         ("Vlees", 106, 22.5, 0, 1.8, 0),
    "kipfilet-gaar":    ("Vlees", 110, 23.0, 0, 2.0, 0),
    "kipshoarma":       ("Vlees", 130, 20.0, 1.5, 5.0, 0),
    "kipgehakt":        ("Vlees", 125, 20.0, 0.5, 5.0, 0),
    "kalkoenfilet":     ("Vlees", 104, 23.0, 0, 1.0, 0),
    "rundertartaar":    ("Vlees", 130, 21.0, 0, 5.0, 0),
    "rundergehakt-mager": ("Vlees", 148, 21.0, 0, 7.0, 0),
    "biefstuk":         ("Vlees", 143, 22.0, 0, 6.0, 0),
    # vis
    "zalmfilet":        ("Vis", 208, 20.0, 0, 13.0, 0),
    "kabeljauw":        ("Vis", 82, 18.0, 0, 0.7, 0),
    "tonijnsteak":      ("Vis", 108, 23.5, 0, 1.0, 0),
    "tonijn-water":     ("Conserven", 103, 24.0, 0, 0.8, 0),
    "garnalen":         ("Vis", 85, 18.0, 0.5, 1.0, 0),
    # vegetarisch
    "tempeh":           ("Vegetarisch", 190, 19.0, 8.0, 9.0, 6.0),
    "tofu-gemarineerd": ("Vegetarisch", 145, 16.0, 3.0, 8.0, 1.0),
    "edamame":          ("Diepvries", 122, 11.0, 8.0, 5.0, 5.0),
    # peulvruchten en conserven
    "rode-linzen":      ("Peulvruchten", 341, 25.0, 48.0, 1.1, 11.0),
    "kikkererwten":     ("Conserven", 119, 7.0, 15.0, 2.6, 6.0),
    "zwarte-bonen":     ("Conserven", 114, 7.5, 14.0, 0.6, 6.5),
    "kidneybonen":      ("Conserven", 110, 7.0, 13.5, 0.5, 6.0),
    "tomatensaus":      ("Conserven", 35, 1.5, 5.5, 0.5, 1.5),
    "tomatenblokjes":   ("Conserven", 24, 1.2, 3.5, 0.2, 1.3),
    "kokosmelk-light":  ("Wereldkeuken", 73, 0.8, 2.0, 7.0, 0),
    # zetmeel (de flexibele component)
    "havermout":        ("Ontbijt", 375, 13.0, 58.0, 7.0, 10.0),
    "volkorenbrood":    ("Brood", 236, 9.0, 38.0, 3.0, 7.0),
    "wrap-volkoren":    ("Brood", 290, 9.0, 48.0, 6.0, 6.0),
    "crackers-volkoren": ("Brood", 380, 11.0, 65.0, 6.0, 9.0),
    "pasta-volkoren":   ("Pasta en rijst", 348, 13.0, 62.0, 2.5, 8.0),
    "noedels-volkoren": ("Pasta en rijst", 348, 13.0, 62.0, 2.5, 8.0),
    "zilvervliesrijst": ("Pasta en rijst", 353, 8.0, 72.0, 2.8, 3.5),
    "basmati":          ("Pasta en rijst", 349, 7.5, 78.0, 0.6, 1.4),
    "couscous":         ("Pasta en rijst", 358, 12.0, 72.0, 0.6, 5.0),
    "bulgur":           ("Pasta en rijst", 342, 12.0, 63.0, 1.3, 12.0),
    "quinoa":           ("Pasta en rijst", 368, 14.0, 58.0, 6.0, 7.0),
    "krieltjes":        ("Groente", 87, 2.0, 17.0, 0.6, 2.0),
    "aardappel":        ("Groente", 82, 2.0, 16.0, 0.3, 2.2),
    "zoete-aardappel":  ("Groente", 86, 1.6, 18.0, 0.1, 3.0),
    # groente
    "broccoli":         ("Groente", 34, 2.8, 3.2, 0.4, 2.6),
    "spinazie":         ("Groente", 23, 2.9, 1.4, 0.4, 2.2),
    "courgette":        ("Groente", 17, 1.2, 2.0, 0.3, 1.1),
    "paprika":          ("Groente", 28, 1.0, 4.5, 0.3, 1.8),
    "sperziebonen":     ("Groente", 31, 1.8, 3.4, 0.2, 2.9),
    "haricots-verts":   ("Groente", 31, 1.8, 3.4, 0.2, 3.0),
    "wokgroente":       ("Groente", 30, 2.0, 3.5, 0.3, 2.5),
    "bloemkool":        ("Groente", 25, 2.0, 2.3, 0.3, 2.5),
    "witlof":           ("Groente", 17, 1.0, 2.0, 0.1, 1.5),
    "asperges":         ("Groente", 20, 2.2, 2.0, 0.2, 2.1),
    "champignons":      ("Groente", 22, 3.1, 1.0, 0.3, 1.0),
    "tomaat":           ("Groente", 18, 0.9, 2.7, 0.2, 1.2),
    "komkommer":        ("Groente", 12, 0.6, 1.8, 0.1, 0.7),
    "ijsbergsla":       ("Groente", 14, 0.9, 1.7, 0.2, 1.2),
    "rucola":           ("Groente", 25, 2.6, 2.1, 0.7, 1.6),
    "rode-ui":          ("Groente", 34, 1.1, 6.0, 0.2, 1.7),
    "wortel":           ("Groente", 36, 0.8, 6.5, 0.2, 2.8),
    "mais":             ("Conserven", 86, 3.2, 15.0, 1.2, 2.7),
    # fruit
    "appel":            ("Fruit", 54, 0.3, 12.0, 0.2, 2.2),
    "banaan":           ("Fruit", 89, 1.1, 20.0, 0.3, 2.6),
    "blauwe-bessen":    ("Diepvries", 45, 0.6, 8.5, 0.3, 3.0),
    # noten, olie, overig
    "amandelen":        ("Noten", 600, 21.0, 5.0, 50.0, 11.0),
    "walnoten":         ("Noten", 690, 15.0, 7.0, 65.0, 6.0),
    "pindakaas":        ("Noten", 620, 25.0, 12.0, 50.0, 6.0),
    "olijfolie":        ("Olie", 899, 0, 0, 99.9, 0),
    "sojasaus":         ("Wereldkeuken", 60, 6.0, 5.0, 0.1, 0),
    "currypasta":       ("Wereldkeuken", 120, 3.0, 12.0, 6.0, 3.0),
    "tzatziki-mager":   ("Zuivel", 60, 5.0, 4.0, 2.5, 0.3),
}

NAMES = {
    "kwark-mager": "Magere kwark", "skyr": "Skyr naturel",
    "huttenkase": "Hüttenkäse", "cottage-cheese": "Cottage cheese",
    "yoghurt-mager": "Magere yoghurt", "griekse-yoghurt": "Griekse yoghurt 0%",
    "ei": "Eieren", "eiwit-vloeibaar": "Vloeibaar eiwit",
    "kaas-30plus": "Belegen kaas 30+", "feta": "Feta",
    "roomkaas-mager": "Magere roomkaas", "eiwitpoeder": "Eiwitpoeder",
    "kipfilet": "Kipfilet", "kipfilet-gaar": "Kipfilet (gaar)",
    "kipshoarma": "Kipshoarma", "kipgehakt": "Mager kipgehakt",
    "kalkoenfilet": "Kalkoenfilet", "rundertartaar": "Rundertartaar",
    "rundergehakt-mager": "Mager rundergehakt", "biefstuk": "Biefstuk",
    "zalmfilet": "Zalmfilet", "kabeljauw": "Kabeljauwfilet",
    "tonijnsteak": "Tonijnsteak", "tonijn-water": "Tonijn op water",
    "garnalen": "Garnalen", "tempeh": "Tempeh",
    "tofu-gemarineerd": "Gemarineerde tofu", "edamame": "Edamame",
    "rode-linzen": "Rode linzen (droog)", "kikkererwten": "Kikkererwten",
    "zwarte-bonen": "Zwarte bonen", "kidneybonen": "Kidneybonen",
    "tomatensaus": "Tomatensaus", "tomatenblokjes": "Tomatenblokjes",
    "kokosmelk-light": "Kokosmelk light", "havermout": "Havermout",
    "volkorenbrood": "Volkorenbrood", "wrap-volkoren": "Volkoren wraps",
    "crackers-volkoren": "Volkoren crackers",
    "pasta-volkoren": "Volkoren pasta (droog)",
    "noedels-volkoren": "Volkoren noedels (droog)",
    "zilvervliesrijst": "Zilvervliesrijst (droog)",
    "basmati": "Basmatirijst (droog)", "couscous": "Couscous (droog)",
    "bulgur": "Bulgur (droog)", "quinoa": "Quinoa (droog)",
    "krieltjes": "Krieltjes", "aardappel": "Aardappelen",
    "zoete-aardappel": "Zoete aardappel", "broccoli": "Broccoli",
    "spinazie": "Verse spinazie", "courgette": "Courgette",
    "paprika": "Paprika", "sperziebonen": "Sperziebonen",
    "haricots-verts": "Haricots verts", "wokgroente": "Wokgroente",
    "bloemkool": "Bloemkool", "witlof": "Witlof", "asperges": "Groene asperges",
    "champignons": "Champignons", "tomaat": "Tomaat",
    "komkommer": "Komkommer", "ijsbergsla": "IJsbergsla", "rucola": "Rucola",
    "rode-ui": "Rode ui", "wortel": "Wortel", "mais": "Mais",
    "appel": "Appel", "banaan": "Banaan",
    "blauwe-bessen": "Blauwe bessen (diepvries)", "amandelen": "Amandelen",
    "walnoten": "Walnoten", "pindakaas": "Pindakaas 100%",
    "olijfolie": "Olijfolie", "sojasaus": "Sojasaus",
    "currypasta": "Rode currypasta", "tzatziki-mager": "Magere tzatziki",
}

# ---------------------------------------------------------------------------
# Recepten: (id, naam, slot, minuten, tags, vast[(ingredient, gram)],
#            flexibel(ingredient, standaardgram) of None, bereiding)
#
# Vast   = eiwitanker + groente. Bepaalt verzadiging en eiwit.
# Flexibel = zetmeel. De enige energieknop waarmee de dag op target komt.
# ---------------------------------------------------------------------------

RECIPES = [
    # ---------------- ontbijt (4) ----------------
    ("b1", "Kwark met havermout en bessen", "breakfast", 5, ["snel"],
     [("kwark-mager", 300), ("blauwe-bessen", 100), ("amandelen", 10)],
     ("havermout", 50),
     "Kwark in een kom, havermout erdoor, bessen en amandelen erop. Kaneel naar smaak."),

    ("b2", "Omelet met spinazie en champignons", "breakfast", 12, [],
     [("ei", 165), ("eiwit-vloeibaar", 150), ("spinazie", 200), ("champignons", 100),
      ("tomaat", 150)],
     ("volkorenbrood", 70),
     "Champignons bakken, spinazie laten slinken, eieren en eiwit erover. Brood ernaast."),

    ("b3", "Skyr-bowl met banaan en pindakaas", "breakfast", 4, ["snel"],
     [("skyr", 300), ("banaan", 100), ("pindakaas", 15), ("blauwe-bessen", 100)],
     ("havermout", 45),
     "Alles mengen. Havermout erdoor voor structuur, of laat hem een nacht weken."),

    ("b4", "Volkoren met ei en kipfilet", "breakfast", 8, ["snel"],
     [("ei", 110), ("kipfilet-gaar", 80), ("huttenkase", 80), ("tomaat", 150),
      ("spinazie", 200), ("appel", 120)],
     ("volkorenbrood", 70),
     "Eieren koken of bakken, brood beleggen met kip, hüttenkäse en tomaat."),

    # ---------------- lunch (5) ----------------
    ("l1", "Volkoren met kip en hüttenkäse", "lunch", 6, ["snel", "meeneem"],
     [("kipfilet-gaar", 120), ("huttenkase", 125), ("tomaat", 100),
      ("komkommer", 100), ("rucola", 25), ("kikkererwten", 120)],
     ("volkorenbrood", 70),
     "Beleg het brood met kip, hüttenkäse, tomaat, komkommer en rucola."),

    ("l2", "Tonijnsalade met kikkererwten", "lunch", 8, ["snel", "meeneem"],
     [("tonijn-water", 150), ("paprika", 150), ("rode-ui", 40),
      ("rucola", 40), ("olijfolie", 10), ("mais", 80)],
     ("kikkererwten", 150),
     "Alles mengen, dressing van olijfolie en citroen erover."),

    ("l3", "Linzensoep met volkorenbrood", "lunch", 25, ["meeneem"],
     [("rode-linzen", 90), ("wortel", 100), ("tomatenblokjes", 200),
      ("griekse-yoghurt", 100), ("kipfilet-gaar", 100)],
     ("volkorenbrood", 70),
     "Linzen met wortel en tomaat 20 min koken, pureren. Yoghurt erdoor, brood ernaast."),

    ("l4", "Wrap met zalm en roomkaas", "lunch", 7, ["snel", "meeneem", "vis"],
     [("zalmfilet", 120), ("roomkaas-mager", 60), ("komkommer", 100),
      ("rucola", 40), ("rode-ui", 30), ("edamame", 100)],
     ("wrap-volkoren", 80),
     "Roomkaas op de wrap, zalm en groente erop, oprollen."),

    ("l5", "Couscoussalade met feta en kikkererwten", "lunch", 12, ["meeneem"],
     [("kikkererwten", 200), ("feta", 50), ("paprika", 100),
      ("komkommer", 100), ("olijfolie", 8), ("tofu-gemarineerd", 150)],
     ("couscous", 50),
     "Couscous wellen, laten afkoelen, alles mengen met citroen en peterselie."),

    # ---------------- diner (20) ----------------
    ("d01", "Kipfilet met broccoli en zoete aardappel", "dinner", 28, [],
     [("kipfilet", 210), ("broccoli", 300), ("olijfolie", 10)],
     ("zoete-aardappel", 250),
     "Zoete aardappel in blokjes, 25 min in de oven op 200 °C. Kip bakken, broccoli stomen."),

    ("d02", "Zalm met couscous en geroerbakte groente", "dinner", 22, ["vis"],
     [("zalmfilet", 170), ("courgette", 200), ("paprika", 150), ("rucola", 30),
      ("kikkererwten", 120)],
     ("couscous", 55),
     "Couscous wellen, zalm 4 min per kant, groente roerbakken."),

    ("d03", "Tartaar met krieltjes en sperziebonen", "dinner", 25, ["high-carb"],
     [("rundertartaar", 210), ("sperziebonen", 300), ("kwark-mager", 80)],
     ("krieltjes", 280),
     "Krieltjes in de oven, tartaar kort bakken, bonen koken. Kruidensaus van kwark."),

    ("d04", "Linzencurry met garnalen", "dinner", 28, ["vis"],
     [("rode-linzen", 90), ("garnalen", 170), ("kokosmelk-light", 100),
      ("spinazie", 200), ("currypasta", 20)],
     ("basmati", 50),
     "Linzen 15 min koken, kokosmelk en currypasta erbij, garnalen en spinazie laatste 4 min."),

    ("d05", "Kipshoarma in volkoren wraps", "dinner", 18, ["snel"],
     [("kipshoarma", 220), ("ijsbergsla", 100), ("tomaat", 100),
      ("paprika", 150), ("yoghurt-mager", 100), ("kidneybonen", 120)],
     ("wrap-volkoren", 120),
     "Shoarma bakken, wraps opwarmen, vullen met groente en knoflooksaus van yoghurt."),

    ("d06", "Tempeh roerbak met noedels", "dinner", 20, ["vegetarisch"],
     [("tempeh", 170), ("wokgroente", 300), ("sojasaus", 20), ("olijfolie", 8),
      ("edamame", 120)],
     ("noedels-volkoren", 50),
     "Tempeh in blokjes bruin bakken, groente erbij, noedels koken en mengen."),

    ("d07", "Ovenschotel met kipgehakt", "dinner", 40, ["weekend"],
     [("kipgehakt", 210), ("courgette", 200), ("tomatensaus", 200),
      ("kaas-30plus", 30), ("champignons", 100), ("kidneybonen", 120)],
     ("pasta-volkoren", 55),
     "Pasta beetgaar koken, gehakt rullen, alles mengen, kaas erop, 20 min op 200 °C."),

    ("d08", "Kabeljauw met aardappel en spinazie", "dinner", 25, ["vis"],
     [("kabeljauw", 240), ("spinazie", 250), ("olijfolie", 12), ("rode-ui", 40),
      ("haricots-verts", 150)],
     ("aardappel", 300),
     "Aardappels koken, kabeljauw 10 min in de oven, spinazie met ui slinken."),

    ("d09", "Chili con carne", "dinner", 30, ["high-carb"],
     [("rundergehakt-mager", 180), ("kidneybonen", 250), ("tomatenblokjes", 200),
      ("paprika", 150), ("mais", 80)],
     ("zilvervliesrijst", 60),
     "Gehakt rullen, groente en bonen erbij, 20 min pruttelen. Rijst ernaast."),

    ("d10", "Kipsaté met rijst en komkommer", "dinner", 25, [],
     [("kipfilet", 200), ("pindakaas", 20), ("komkommer", 200), ("wortel", 100),
      ("edamame", 120)],
     ("zilvervliesrijst", 55),
     "Kip marineren en grillen, satésaus van pindakaas en sojasaus, komkommersalade erbij."),

    ("d11", "Griekse kip met bulgur en tzatziki", "dinner", 26, [],
     [("kipfilet", 200), ("tzatziki-mager", 100), ("tomaat", 150),
      ("komkommer", 100), ("feta", 30), ("kikkererwten", 130)],
     ("bulgur", 55),
     "Kip met oregano en citroen grillen, bulgur koken, salade van tomaat en komkommer."),

    ("d12", "Gehaktballen in tomatensaus met pasta", "dinner", 30, [],
     [("rundergehakt-mager", 190), ("tomatensaus", 250), ("courgette", 150),
      ("kaas-30plus", 25), ("kidneybonen", 150)],
     ("pasta-volkoren", 60),
     "Balletjes draaien en aanbraden, in saus 15 min laten trekken. Pasta erbij."),

    ("d13", "Pokébowl met zalm en edamame", "dinner", 20, ["vis", "snel"],
     [("zalmfilet", 160), ("edamame", 180), ("komkommer", 100),
      ("wortel", 100), ("sojasaus", 15), ("mais", 100)],
     ("zilvervliesrijst", 55),
     "Rijst koken en laten afkoelen, zalm in blokjes, alles in een kom schikken."),

    ("d14", "Kalkoenfilet met witlof en puree", "dinner", 30, [],
     [("kalkoenfilet", 210), ("witlof", 300), ("yoghurt-mager", 60),
      ("olijfolie", 10), ("haricots-verts", 150)],
     ("aardappel", 300),
     "Witlof stoven, kalkoen bakken, aardappels koken en stampen met yoghurt."),

    ("d15", "Kikkererwtencurry met bloemkool", "dinner", 28, ["vegetarisch"],
     [("kikkererwten", 250), ("bloemkool", 250), ("kokosmelk-light", 120),
      ("tomatenblokjes", 200), ("currypasta", 25), ("griekse-yoghurt", 100),
      ("tofu-gemarineerd", 200)],
     ("basmati", 55),
     "Currypasta bakken, groente en kikkererwten erbij, 20 min pruttelen. Yoghurt erover."),

    ("d16", "Biefstuk met gebakken aardappel en haricots verts", "dinner", 35, ["weekend"],
     [("biefstuk", 200), ("haricots-verts", 300), ("olijfolie", 12),
      ("champignons", 100)],
     ("aardappel", 300),
     "Aardappels voorkoken en bakken, biefstuk 3 min per kant, boontjes kort koken."),

    ("d17", "Tonijnsteak met quinoa en asperges", "dinner", 22, ["vis"],
     [("tonijnsteak", 200), ("asperges", 250), ("olijfolie", 10), ("rucola", 40),
      ("edamame", 100)],
     ("quinoa", 55),
     "Quinoa koken, tonijn 2 min per kant, asperges grillen."),

    ("d18", "Kip tikka met basmati en raita", "dinner", 28, [],
     [("kipfilet", 200), ("griekse-yoghurt", 120), ("paprika", 150),
      ("rode-ui", 60), ("currypasta", 20), ("kikkererwten", 150)],
     ("basmati", 55),
     "Kip in yoghurt en kruiden marineren, in de oven of pan garen. Raita van yoghurt en komkommer."),

    ("d19", "Mexicaanse bowl met kipgehakt en zwarte bonen", "dinner", 25, ["high-carb"],
     [("kipgehakt", 190), ("zwarte-bonen", 250), ("mais", 80),
      ("paprika", 120), ("ijsbergsla", 80)],
     ("zilvervliesrijst", 60),
     "Gehakt met paprikapoeder en komijn rullen, bonen en mais erbij. Rijst en sla eronder."),

    ("d20", "Tofu met zoete-aardappelfriet en salade", "dinner", 32, ["vegetarisch", "weekend"],
     [("tofu-gemarineerd", 260), ("ijsbergsla", 100), ("tomaat", 150),
      ("edamame", 180), ("olijfolie", 10), ("wortel", 120)],
     ("zoete-aardappel", 280),
     "Zoete aardappel in reepjes, 25 min oven op 210 °C. Tofu bruin bakken, salade erbij."),

    # ---------------- snack (5) ----------------
    ("s1", "Skyr met appel", "snack", 2, ["snel"],
     [("skyr", 300), ("appel", 150), ("amandelen", 15), ("blauwe-bessen", 100)], None,
     "Appel in stukjes door de skyr, amandelen erover."),

    ("s2", "Cottage cheese met walnoten", "snack", 2, ["snel"],
     [("cottage-cheese", 250), ("walnoten", 20), ("appel", 150),
      ("eiwitpoeder", 10), ("blauwe-bessen", 100)], None,
     "Walnoten grof hakken en erdoor. Tomaat ernaast."),

    ("s3", "Kwark met eiwitpoeder en banaan", "snack", 2, ["snel"],
     [("kwark-mager", 250), ("eiwitpoeder", 15), ("banaan", 100),
      ("blauwe-bessen", 100)], None,
     "Eiwitpoeder door de kwark kloppen, banaan erbij."),

    ("s4", "Griekse yoghurt met bessen en amandelen", "snack", 2, ["snel"],
     [("griekse-yoghurt", 250), ("blauwe-bessen", 125), ("amandelen", 15),
      ("eiwitpoeder", 20)], None,
     "Alles mengen."),

    ("s5", "Crackers met hüttenkäse en tomaat", "snack", 3, ["snel"],
     [("huttenkase", 250), ("tomaat", 100), ("rucola", 20), ("eiwitpoeder", 10),
      ("appel", 150)],
     ("crackers-volkoren", 30),
     "Crackers beleggen met hüttenkäse, tomaat en rucola."),
]

# ---------------------------------------------------------------------------


def portion(key: str, grams: float) -> dict:
    aisle, kcal, prot, carb, fat, fiber = ING[key]
    return {
        "ingredientID": key,
        "name": NAMES[key],
        "aisle": aisle,
        "grams": grams,
        "kcalPer100g": kcal,
        "proteinPer100g": prot,
        "carbPer100g": carb,
        "fatPer100g": fat,
        "fiberPer100g": fiber,
    }


def build() -> list[dict]:
    out = []
    for rid, name, slot, prep, tags, fixed, flex, instr in RECIPES:
        out.append({
            "id": rid,
            "name": name,
            "slot": slot,
            "prepMinutes": prep,
            "tags": tags,
            "fixed": [portion(k, g) for k, g in fixed],
            "flexible": portion(*flex) if flex else None,
            "instructions": instr,
        })
    return out


def macros(p: dict) -> tuple[float, float, float]:
    """kcal, eiwit, vezel voor een portie."""
    f = p["grams"] / 100
    return p["kcalPer100g"] * f, p["proteinPer100g"] * f, p["fiberPer100g"] * f


def solve_day(meals: list[dict], target_kcal: int) -> tuple[float, float, float]:
    """Zelfde schaling als MenuPlanner.solveDay in de app."""
    fixed_kcal = sum(macros(p)[0] for m in meals for p in m["fixed"])
    remaining = max(0.0, target_kcal - fixed_kcal)

    flex = [m for m in meals if m["flexible"]]
    default_total = sum(m["flexible"]["grams"] for m in flex)

    kcal = fixed_kcal
    prot = sum(macros(p)[1] for m in meals for p in m["fixed"])
    fib = sum(macros(p)[2] for m in meals for p in m["fixed"])

    if default_total > 0:
        for m in flex:
            fx = m["flexible"]
            share = fx["grams"] / default_total
            raw = (remaining * share) / (fx["kcalPer100g"] / 100)
            g = round(raw / 5) * 5
            kcal += fx["kcalPer100g"] * g / 100
            prot += fx["proteinPer100g"] * g / 100
            fib += fx["fiberPer100g"] * g / 100

    return kcal, prot, fib


def validate(recipes: list[dict], target_kcal: int,
             target_protein: int, min_fiber: int) -> None:
    """Elke mogelijke dagcombinatie moet eiwit en vezels halen.

    Dit wil je weten tijdens het bouwen, niet op een dinsdagavond.
    """
    by_slot = {s: [r for r in recipes if r["slot"] == s]
               for s in ("breakfast", "lunch", "dinner", "snack")}

    worst_p = (1e9, "")
    worst_f = (1e9, "")
    fails = 0
    total = 0

    for combo in product(by_slot["breakfast"], by_slot["lunch"],
                         by_slot["dinner"], by_slot["snack"]):
        total += 1
        kcal, prot, fib = solve_day(list(combo), target_kcal)
        tag = "+".join(c["id"] for c in combo)
        if prot < worst_p[0]:
            worst_p = (prot, tag)
        if fib < worst_f[0]:
            worst_f = (fib, tag)
        if prot < target_protein or fib < min_fiber:
            fails += 1

    print(f"  combinaties      : {total}")
    print(f"  laagste eiwit    : {worst_p[0]:.0f} g  ({worst_p[1]})  "
          f"target {target_protein} g")
    print(f"  laagste vezels   : {worst_f[0]:.0f} g  ({worst_f[1]})  "
          f"minimum {min_fiber} g")
    print(f"  combinaties onder target: {fails}")
    if fails:
        print("  -> verhoog de eiwitankers of vezelrijke groente in de "
              "genoemde recepten")


def build_webapp() -> None:
    """Bakt recipes.json in de HTML-template tot een enkel bestand.

    Uitvoer: dist/afval.html — dat ene bestand is de hele app.
    """
    root = Path(__file__).resolve().parent.parent
    tpl = root / "web" / "index.template.html"
    if not tpl.exists():
        return
    recipes = json.dumps(build(), ensure_ascii=False, separators=(",", ":"))
    html = tpl.read_text(encoding="utf-8").replace("__RECIPES__", recipes)
    out = root / "dist" / "afval.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")
    print(f"Webapp:     {out}  ({out.stat().st_size // 1024} KB)")
    # zelfde bestand als docs/index.html: GitHub Pages kan die map direct serveren
    pages = root / "docs" / "index.html"
    pages.parent.mkdir(parents=True, exist_ok=True)
    pages.write_text(html, encoding="utf-8")
    print(f"Pages:      {pages}")


if __name__ == "__main__":
    recipes = build()

    counts = {}
    for r in recipes:
        counts[r["slot"]] = counts.get(r["slot"], 0) + 1
    print("Bibliotheek:", ", ".join(f"{k}={v}" for k, v in sorted(counts.items())))

    out = Path(__file__).resolve().parent.parent / "assets" / "recipes.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(recipes, ensure_ascii=False, indent=1),
                   encoding="utf-8")
    print(f"Geschreven: {out}")

    print("\nValidatie bij 1900 kcal / 150 g eiwit / 30 g vezels:")
    validate(recipes, target_kcal=1900, target_protein=150, min_fiber=30)

    build_webapp()
