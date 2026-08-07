import json, sys
plan = json.load(open('/home/user/Smullies2ndHalf/plan/doel1-plan.json'))

def tekst(ings):
    met = [i for i in ings if i['hoeveelheid'] is not None]
    zonder = [i for i in ings if i['hoeveelheid'] is None]
    t = ' · '.join(f"{i['hoeveelheid']} {i['eenheid']} {i['naam']}" for i in met)
    if zonder:
        t += ' · ' + ' · '.join(f"{i['naam']} naar smaak" for i in zonder)
    return t

gerechten = []
for g in plan['gerechten']:
    gerechten.append({
        'id': f"g{g['id']}", 'naam': g['naam'], 'soort': 'diner',
        'anker': g['formule']['anker'],
        'kleur1': g['formule']['kleur'][0], 'kleur2': g['formule']['kleur'][1],
        'basis': g['formule']['basis'], 'smaak': g['formule']['smaak'],
        'porties_tekst': tekst(g['ingredienten']), 'kcal': g['kcal'],
        'rotatie_week': g['rotatie_week'], 'kook_factor': g.get('kook_factor', 2),
        'bereiding': g['bereiding'],
        **({'dag_suggestie': g['dag_suggestie']} if 'dag_suggestie' in g else {}),
        'ingredienten': g['ingredienten'],
    })

std = {m['moment']: m for m in plan['standaarddag']}
for mid, moment, naam in [('o1', 'ontbijt', 'Standaard — kwark met havermout (overnight oats)'),
                          ('l1', 'lunch', 'Standaard — volkoren met kip of tonijn')]:
    m = std[moment]
    ings = [{'naam': i['naam'], 'hoeveelheid': i['hoeveelheid'], 'eenheid': i['eenheid'], 'categorie': i['categorie']} for i in m['items']]
    gerechten.append({
        'id': mid, 'naam': naam, 'soort': moment,
        'anker': None, 'kleur1': None, 'kleur2': None, 'basis': None, 'smaak': None,
        'porties_tekst': tekst(ings), 'kcal': m['kcal_totaal'],
        'rotatie_week': None, 'kook_factor': 1,
        'bereiding': plan['aanvulling_variatie'].get('standaard_bereiding', {}).get(mid) or m.get('notitie'),
        'notitie': m.get('notitie'),
        'ingredienten': ings,
    })

av = plan['aanvulling_variatie']
for soort, lijst in [('ontbijt', av['ontbijt_varianten']), ('lunch', av['lunch_varianten']),
                     ('snack', av.get('snack_varianten', []))]:
    for v in lijst:
        gerechten.append({
            'id': v['id'], 'naam': v['naam'], 'soort': soort,
            'anker': None, 'kleur1': None, 'kleur2': None, 'basis': None, 'smaak': None,
            'porties_tekst': tekst(v['ingredienten']), 'kcal': v['kcal'],
            'rotatie_week': None, 'kook_factor': 1,
            'bereiding': v.get('bereiding') or v.get('macro_notitie'),
            'notitie': v.get('macro_notitie'),
            'ingredienten': v['ingredienten'],
        })

vaste = av['vaste_basislijst']  # incl. 'dekt': waarvoor het item op de lijst staat
versie = int(sys.argv[1])

print(f"""// Seed-data voor Doel1 — gegenereerd uit het definitieve 4-wekenplan
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

export const SEED_VERSIE = {versie}

export const SEED_GERECHTEN =
{json.dumps(gerechten, ensure_ascii=False, indent=2)}

// De standaarddag uit het plan (referentie + de vaste snack 16:00).
export const SEED_STANDAARDDAG =
{json.dumps(plan['standaarddag'], ensure_ascii=False, indent=2)}

// Vaste basislijst: dekt plus-blokken, snack 16:00 en voorraad-checks.
// Ontbijt-, lunch- en diner-ingrediënten rekent de app uit het weekmenu.
export const SEED_VASTE_BOODSCHAPPEN =
{json.dumps(vaste, ensure_ascii=False, indent=2)}""")
