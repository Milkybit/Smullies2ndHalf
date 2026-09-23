import type { KitchenCategory, KitchenItem } from "@/domain/types";

// Equipment for one batch cooking day at home. `essential` marks the smallest
// set that makes a batch safe and accurate; the rest saves time or effort.
function item(
  id: string,
  category: KitchenCategory,
  nameNl: string,
  quantity: string,
  purpose: string,
  essential = false,
): KitchenItem {
  return { id, category, nameNl, quantity, purpose, essential };
}

export const kitchenItems: KitchenItem[] = [
  item(
    "gn-1-1-40",
    "gastronorm",
    "Gastronormbak GN 1/1, 40 mm diep",
    "2 stuks",
    "Gekookte rijst in een dunne laag uitspreiden en in ijswater snel afkoelen.",
    true,
  ),
  item(
    "gn-1-2-65",
    "gastronorm",
    "Gastronormbak GN 1/2, 65 mm diep (±4 liter)",
    "6 stuks",
    "Gesneden groente en gekruid vlees klaarzetten.",
  ),
  item(
    "gn-1-3-65",
    "gastronorm",
    "Gastronormbak GN 1/3, 65 mm diep",
    "2 stuks",
    "Kruidenmengsels, knoflook en gember.",
  ),
  item(
    "gn-1-2-lid",
    "gastronorm",
    "Deksel voor GN 1/2",
    "2 stuks",
    "Alleen voor wat een nacht in de koelkast blijft staan.",
  ),
  item(
    "cutting-boards",
    "cutting",
    "Snijplanken HDPE, 45 × 30 cm: rood, groen en wit",
    "Set van 3",
    "Rood voor rauw vlees, groen voor groente, wit voor gaar eten.",
    true,
  ),
  item(
    "honing-steel",
    "cutting",
    "Aanzetstaal",
    "1 stuk",
    "Houdt je mes scherp tijdens een lange snijsessie.",
  ),
  item(
    "thermometer",
    "measuring",
    "Digitale kernthermometer (instant-read)",
    "1 stuk",
    "Controleer of opgewarmde maaltijden in de kern minstens 75 °C halen en of gerechten snel afkoelen.",
    true,
  ),
  item(
    "scale",
    "measuring",
    "Keukenweegschaal tot 5 kg, per 1 g, met tarra",
    "1 stuk",
    "Alle hoeveelheden in PrepPartner zijn in gram.",
    true,
  ),
  item(
    "second-scale",
    "measuring",
    "Tweede weegschaal",
    "1 stuk",
    "Eén bij het portioneren, één bij het voorbereiden.",
  ),
  item(
    "timer",
    "measuring",
    "Timer met vier kanalen",
    "1 stuk",
    "Vier pitten en een oven tegelijk bijhouden lukt niet met één telefoontimer.",
  ),
  item(
    "meal-containers",
    "portioning",
    "Maaltijdbakjes 750 ml met deksel, geschikt voor vriezer en magnetron",
    "1 per portie + reserve",
    "Eén bakje per portie, plus een paar extra.",
    true,
  ),
  item(
    "tape-marker",
    "portioning",
    "Afplaktape en fijne permanent marker",
    "1 rol + 1 stift",
    "Naam en datum op elk bakje. Tape blijft in de vriezer beter zitten dan de meeste stickers.",
    true,
  ),
  item(
    "portion-scoop",
    "portioning",
    "Portioneerschep met hefboom, maat 8 (±120 ml)",
    "1 stuk",
    "Rijst in gelijke porties zonder elke keer te wegen.",
  ),
  item(
    "ladle",
    "portioning",
    "Soeplepel RVS, ±0,25 liter",
    "1 stuk",
    "Saus in gelijke porties over de bakjes verdelen.",
  ),
  item(
    "baking-paper",
    "portioning",
    "Bakpapier op rol, 30 cm breed",
    "1 rol",
    "Sneller dan losse vellen, en je bakplaten blijven schoon.",
  ),
  item(
    "pans",
    "pans",
    "Pannen van 24–28 cm, ±5 liter",
    "1 per pit",
    "Zo kunnen alle pitten tegelijk een gerecht koken.",
    true,
  ),
  item(
    "sauteuse",
    "pans",
    "Brede sauteuse 28 cm met deksel",
    "1 stuk",
    "Rul bakken én sudderen in één pan. Vaak de pan die nog ontbreekt.",
  ),
  item(
    "baking-trays",
    "pans",
    "Bakplaten",
    "2 stuks",
    "Twee platen tegelijk in de oven.",
  ),
  item(
    "mixing-bowls",
    "cooling",
    "RVS kommen, 1 groot en 2 middel",
    "3 stuks",
    "Eén als afvalkom voor snijresten midden op je werkplek; de andere voor marinades en mengsels.",
  ),
  item(
    "ice-bath-tub",
    "cooling",
    "Opbergbak of teil van 30–45 liter",
    "1 stuk",
    "IJsbad voor de platte bakken als je spoelbak bezet of te klein is.",
  ),
  item(
    "trolley",
    "cooling",
    "Rolwagen met drie niveaus",
    "1 stuk",
    "Extra koeloppervlak, en alle bakjes in één keer naar de vriezer.",
  ),
];

export const kitchenCategoryTips: Partial<Record<KitchenCategory, string>> = {
  gastronorm:
    "RVS geleidt warmte veel beter dan plastic. Rijst in een laag van 2 cm in een platte RVS-bak, met de bak in ijswater, is veel sneller koud dan in een pan. Neem niet bij elke bak een deksel: lege bakken passen in elkaar.",
  cutting:
    "Je snijdt in één sessie kilo’s vlees en groente. Vaste kleuren houden rauw vlees en gaar eten gescheiden.",
  portioning:
    "Weeg de eerste portie, stem je schep daarop af en controleer daarna elke vijfde portie.",
  pans: "Zes porties van één gerecht is ongeveer 2,5 liter. Je hebt dus geen grote ketel nodig, wel meerdere pannen van ±5 liter. Tel wat je hebt en vul alleen het gat aan.",
  cooling:
    "Neem op je kookdag drie zakken ijsblokjes mee, of leg de dag ervoor koelelementen in de vriezer.",
};

/** Measure these before buying: they decide which sizes fit your kitchen. */
export const kitchenMeasurements = [
  {
    title: "Binnenkant van je oven",
    text: "Een GN 1/1-bak is 53 cm breed. Is je oven van binnen smaller dan 55 cm? Neem dan per GN 1/1-bak twee GN 1/2-bakken van 40 mm diep.",
  },
  {
    title: "Je spoelbak",
    text: "Past een GN 1/1-bak (53 × 32,5 cm) plat in je spoelbak? Zo niet, gebruik een opbergbak of teil als ijsbad.",
  },
  {
    title: "Je koelkastplank",
    text: "Een GN 1/1-bak past er zelden in. GN 1/2 (32,5 × 26,5 cm) past vrijwel altijd.",
  },
  {
    title: "Vrij aanrecht",
    text: "Dertig bakjes met wat ruimte ertussen hebben ongeveer 1,2 m² nodig om af te koelen: zo’n 2 meter aanrecht. Heb je dat niet, dan is extra werkoppervlak zoals een rolwagen het belangrijkst.",
  },
  {
    title: "Je vriezer",
    text: "Zet een leeg bakje in een vriezerlade en tel hoeveel er per lade passen. Past je batch er niet in, plan dan minder porties.",
  },
];

export const kitchenNotNeeded = [
  "Vacuümmachine",
  "Sous-vide-stick",
  "Snelkoeler (blast chiller)",
  "Messenset",
  "Siliconen bakmatten",
  "GN 1/1-bakken voor in de koelkast",
];
