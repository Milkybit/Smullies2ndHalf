import type {
  CookingGroup,
  ProteinSource,
  Recipe,
  RecipeDefinition,
  RecipeIngredient,
  Role,
} from "@/domain/types";
import { buildCatalog } from "./ingredients";
import { scaleRecipe } from "@/calculations/scaling";
import { withPrepComponents } from "./prep-components";
import {
  DEFAULT_MEAL_CALORIES,
  DEFAULT_MEAL_PROTEIN,
} from "@/domain/constants";

type Part = [id: string, grams: number, role: Role];
interface Seed {
  id: string;
  name: string;
  cuisine: string;
  source: ProteinSource;
  protein: string;
  group: CookingGroup;
  vegetables: [string, number][];
  sauce: Part[];
  flavour: string;
  method: string;
  starch?: string;
  legumes?: [string, number][];
  cook?: number;
  oven?: boolean;
}
const seeds: Seed[] = [
  {
    id: "teriyaki",
    name: "Teriyaki kippendij & broccoli",
    cuisine: "Japans",
    source: "chicken",
    protein: "chicken-thigh",
    group: "asian-rice",
    vegetables: [
      ["broccoli", 180],
      ["carrot", 40],
    ],
    sauce: [
      ["soy-sauce", 15, "sauce"],
      ["stock", 65, "sauce"],
      ["honey", 10, "sauce"],
      ["cornstarch", 4, "seasoning"],
    ],
    flavour:
      "Hartig, zachtzoet en gemberfris. Een sappige klassieker voor de vriezer.",
    method:
      "Bak de kippendij in porties rondom bruin. Meng sojasaus, honing en bouillon, voeg toe en laat 12–15 minuten zacht garen. Roer de maïzena met een scheut koud water los en bind de saus.",
  },
  {
    id: "gochujang-chicken",
    name: "Gochujang chicken",
    cuisine: "Koreaans",
    source: "chicken",
    protein: "chicken-breast",
    group: "asian-rice",
    vegetables: [
      ["broccoli", 130],
      ["pepper", 70],
    ],
    sauce: [
      ["gochujang", 18, "sauce"],
      ["soy-sauce", 10, "sauce"],
      ["stock", 70, "sauce"],
      ["honey", 7, "sauce"],
    ],
    flavour: "Pittige Koreaanse kip met een volle, lichtzoete saus.",
    method:
      "Bak de kip in blokjes kort aan. Roer gochujang, sojasaus, honing en bouillon door elkaar, schenk erbij en laat 10–12 minuten zacht garen.",
  },
  {
    id: "satay-lime",
    name: "Satay-lime chicken",
    cuisine: "Indonesisch",
    source: "chicken",
    protein: "chicken-breast",
    group: "asian-rice",
    vegetables: [
      ["green-beans", 160],
      ["carrot", 40],
    ],
    sauce: [
      ["peanut-butter", 16, "sauce"],
      ["stock", 80, "sauce"],
      ["soy-sauce", 10, "sauce"],
      ["lime", 12, "seasoning"],
    ],
    flavour: "Romige pindasaus met frisse limoen en knapperige sperziebonen.",
    method:
      "Bak de kip rondom bruin. Roer pindakaas, bouillon en sojasaus tot een gladde saus en laat de kip hierin 10–12 minuten garen. Voeg het limoensap als laatste toe.",
  },
  {
    id: "red-curry-chicken",
    name: "Thai red curry chicken",
    cuisine: "Thais",
    source: "chicken",
    protein: "chicken-breast",
    group: "curry",
    vegetables: [
      ["pepper", 100],
      ["courgette", 100],
    ],
    sauce: [
      ["coconut-milk", 90, "sauce"],
      ["stock", 40, "sauce"],
      ["red-curry", 15, "seasoning"],
    ],
    flavour: "Een zachte kokosbasis met rode curry, paprika en courgette.",
    method:
      "Fruit de currypasta 1 minuut in de olie. Voeg kip, kokosmelk en bouillon toe en laat 15 minuten zacht pruttelen. Laat de groente de laatste 6–8 minuten meegaren.",
  },
  {
    id: "green-curry-chicken",
    name: "Thai green curry chicken",
    cuisine: "Thais",
    source: "chicken",
    protein: "chicken-breast",
    group: "curry",
    vegetables: [
      ["green-beans", 130],
      ["courgette", 70],
    ],
    sauce: [
      ["coconut-milk", 90, "sauce"],
      ["stock", 40, "sauce"],
      ["green-curry", 15, "seasoning"],
    ],
    flavour: "Groene curry met sperziebonen, kokos en een frisse kruidigheid.",
    method:
      "Fruit de groene currypasta. Voeg kip, kokosmelk en bouillon toe en laat 15 minuten rustig garen. Voeg eerst de boontjes toe en pas de laatste 5 minuten de courgette.",
  },
  {
    id: "japanese-curry",
    name: "Japanese curry chicken",
    cuisine: "Japans",
    source: "chicken",
    protein: "chicken-breast",
    group: "curry",
    vegetables: [
      ["carrot", 100],
      ["onion", 60],
      ["broccoli", 50],
    ],
    sauce: [
      ["stock", 120, "sauce"],
      ["soy-sauce", 10, "sauce"],
      ["curry-powder", 5, "seasoning"],
      ["cornstarch", 5, "seasoning"],
    ],
    flavour: "Milde, gebonden kerrie met zoete wortel en ui.",
    method:
      "Bak ui en kip aan. Voeg kerrie, wortel en bouillon toe en laat 18 minuten stoven. Voeg broccoli de laatste 5 minuten toe. Bind de saus met in koud water opgeloste maïzena.",
  },
  {
    id: "lemongrass-chicken",
    name: "Vietnamese lemongrass chicken",
    cuisine: "Vietnamees",
    source: "chicken",
    protein: "chicken-breast",
    group: "stir-fry",
    vegetables: [
      ["cabbage", 140],
      ["carrot", 60],
    ],
    sauce: [
      ["soy-sauce", 15, "sauce"],
      ["stock", 80, "sauce"],
      ["lemongrass", 8, "seasoning"],
      ["lime", 10, "seasoning"],
    ],
    flavour: "Citroengras, gember en soja geven deze rijstmaaltijd veel smaak.",
    method:
      "Gebruik alleen het zachte binnenste van het citroengras en snijd heel fijn. Bak met de kip, voeg soja en bouillon toe en laat 10 minuten garen. Roerbak de kool kort apart; voeg limoensap aan de saus toe.",
  },
  {
    id: "black-pepper-chicken",
    name: "Chinese black-pepper chicken",
    cuisine: "Chinees",
    source: "chicken",
    protein: "chicken-breast",
    group: "stir-fry",
    vegetables: [
      ["pepper", 100],
      ["broccoli", 100],
    ],
    sauce: [
      ["soy-sauce", 15, "sauce"],
      ["stock", 80, "sauce"],
      ["black-pepper", 2, "seasoning"],
      ["cornstarch", 4, "seasoning"],
    ],
    flavour: "Peperig en hartig, met een glanzende saus en stevige groente.",
    method:
      "Bak kip in kleine porties op hoog vuur. Voeg zwarte peper, soja en bouillon toe. Laat 10 minuten doorgaren en bind met opgeloste maïzena. Roer de kort gebakken groente erdoor.",
  },
  {
    id: "honey-soy-chicken",
    name: "Honey-soy ginger chicken & edamame",
    cuisine: "Aziatisch",
    source: "chicken",
    protein: "chicken-breast",
    group: "asian-rice",
    vegetables: [
      ["broccoli", 160],
      ["carrot", 40],
    ],
    legumes: [["edamame", 60]],
    sauce: [
      ["honey", 12, "sauce"],
      ["soy-sauce", 15, "sauce"],
      ["stock", 70, "sauce"],
    ],
    flavour: "Gemberkip met honing-sojasaus en extra eiwit uit edamame.",
    method:
      "Bak de kip, voeg honing, soja en bouillon toe en laat 10–12 minuten sudderen. Voeg edamame de laatste 5 minuten toe. Kook broccoli en wortel kort beetgaar.",
  },
  {
    id: "tikka-masala",
    name: "Chicken tikka masala",
    cuisine: "Indiaas",
    source: "chicken",
    protein: "chicken-breast",
    group: "curry",
    vegetables: [
      ["pepper", 100],
      ["spinach", 100],
    ],
    sauce: [
      ["passata", 100, "sauce"],
      ["yogurt", 40, "sauce"],
      ["garam-masala", 5, "seasoning"],
    ],
    flavour: "Een kruidige tomatencurry met yoghurt en spinazie.",
    method:
      "Bak kip met garam masala. Voeg passata toe en laat 15 minuten zacht garen. Voeg paprika en spinazie toe. Neem de pan van het vuur en roer de yoghurt erdoor om schiften te beperken.",
  },
  {
    id: "korean-beef",
    name: "Korean beef bowl",
    cuisine: "Koreaans",
    source: "beef",
    protein: "beef-mince",
    group: "asian-rice",
    vegetables: [
      ["broccoli", 140],
      ["carrot", 60],
    ],
    sauce: [
      ["soy-sauce", 15, "sauce"],
      ["gochujang", 12, "sauce"],
      ["stock", 65, "sauce"],
      ["honey", 5, "sauce"],
    ],
    flavour: "Koreaans gekruid rundvlees met broccoli en een pittige saus.",
    method:
      "Bak het gehakt rul en volledig gaar. Voeg gochujang, soja, honing en bouillon toe. Laat 8 minuten zacht inkoken tot een sappige saus; voeg de kort gestoomde groente toe.",
  },
  {
    id: "thai-basil-beef",
    name: "Thai basil beef",
    cuisine: "Thais",
    source: "beef",
    protein: "beef-mince",
    group: "stir-fry",
    vegetables: [
      ["green-beans", 130],
      ["pepper", 70],
    ],
    sauce: [
      ["soy-sauce", 15, "sauce"],
      ["stock", 80, "sauce"],
      ["basil", 6, "seasoning"],
      ["chili", 1, "seasoning"],
    ],
    flavour: "Hartig rundvlees met basilicum, chili en sperziebonen.",
    method:
      "Bak het gehakt rul. Voeg boontjes, paprika, soja en bouillon toe en laat 10 minuten rustig garen. Scheur de basilicum en roer die er vlak voor het portioneren door.",
  },
  {
    id: "beef-black-bean",
    name: "Beef & black-bean stir-fry",
    cuisine: "Aziatisch",
    source: "beef",
    protein: "beef-mince",
    group: "stir-fry",
    vegetables: [
      ["pepper", 100],
      ["cabbage", 100],
    ],
    legumes: [["black-beans", 70]],
    sauce: [
      ["soy-sauce", 12, "sauce"],
      ["stock", 80, "sauce"],
    ],
    flavour: "Een voedzame roerbak met zwarte bonen, kool en paprika.",
    method:
      "Spoel de zwarte bonen af en laat uitlekken. Bak gehakt volledig gaar en voeg groente, soja en bouillon toe. Laat 8 minuten garen; warm de bonen de laatste 3 minuten mee.",
  },
  {
    id: "rendang",
    name: "Light beef rendang",
    cuisine: "Indonesisch",
    source: "beef",
    protein: "beef-stew",
    group: "curry",
    vegetables: [
      ["green-beans", 150],
      ["carrot", 50],
    ],
    sauce: [
      ["coconut-milk", 90, "sauce"],
      ["stock", 100, "sauce"],
      ["red-curry", 15, "seasoning"],
      ["lemongrass", 5, "seasoning"],
    ],
    flavour: "Langzaam gestoofd rundvlees in een lichte, kruidige kokossaus.",
    method:
      "Snijd het rundvlees in kleine blokken en bak bruin. Voeg currypasta, citroengras, kokosmelk en bouillon toe. Stoof afgedekt 2–2,5 uur op laag vuur tot mals; vul verdampt water aan. Gaar de groente apart kort beetgaar.",
    cook: 150,
  },
  {
    id: "beef-chili",
    name: "Beef chili",
    cuisine: "Mexicaans",
    source: "beef",
    protein: "beef-mince",
    group: "chili",
    vegetables: [
      ["pepper", 130],
      ["onion", 70],
    ],
    legumes: [["kidney-beans", 70]],
    sauce: [
      ["passata", 140, "sauce"],
      ["cumin", 3, "seasoning"],
      ["paprika-powder", 3, "seasoning"],
      ["chili", 1, "seasoning"],
    ],
    flavour: "Rijke chili met rundvlees, kidneybonen en gerookte paprika.",
    method:
      "Bak ui en gehakt. Voeg komijn, paprikapoeder, chili, paprika en passata toe. Laat 20 minuten zacht pruttelen en warm de afgespoelde kidneybonen de laatste 5 minuten mee.",
    cook: 30,
  },
  {
    id: "beef-lentil-chili",
    name: "Beef-lentil chili",
    cuisine: "Mexicaans",
    source: "beef",
    protein: "beef-mince",
    group: "chili",
    vegetables: [
      ["pepper", 130],
      ["onion", 70],
    ],
    legumes: [["lentils", 25]],
    sauce: [
      ["passata", 140, "sauce"],
      ["stock", 100, "sauce"],
      ["cumin", 3, "seasoning"],
      ["paprika-powder", 3, "seasoning"],
    ],
    flavour: "Een zachte chili met rode linzen die de saus mooi binden.",
    method:
      "Bak ui en gehakt. Voeg paprika, kruiden, passata, bouillon en afgespoelde droge linzen toe. Laat 25 minuten zacht koken tot de linzen gaar zijn. Voeg indien nodig water toe.",
    cook: 30,
  },
  {
    id: "beef-ragu",
    name: "Beef ragu pasta",
    cuisine: "Italiaans",
    source: "beef",
    protein: "beef-mince",
    group: "tomato-pasta",
    starch: "pasta",
    vegetables: [
      ["carrot", 70],
      ["courgette", 90],
      ["onion", 40],
    ],
    sauce: [
      ["passata", 160, "sauce"],
      ["tomato-paste", 10, "sauce"],
      ["oregano", 2, "seasoning"],
    ],
    flavour:
      "Volkoren pasta met een volle runder-tomatensaus en verborgen groente.",
    method:
      "Bak ui, wortel en gehakt. Bak tomatenpuree 1 minuut mee. Voeg courgette, passata en oregano toe en laat 25 minuten zacht sudderen.",
    cook: 30,
  },
  {
    id: "turkey-chili",
    name: "Turkey chili",
    cuisine: "Mexicaans",
    source: "turkey",
    protein: "turkey-mince",
    group: "chili",
    vegetables: [
      ["pepper", 130],
      ["onion", 70],
    ],
    legumes: [["kidney-beans", 70]],
    sauce: [
      ["passata", 140, "sauce"],
      ["cumin", 3, "seasoning"],
      ["paprika-powder", 3, "seasoning"],
    ],
    flavour: "Magere kalkoenchili met bonen en een royale tomatensaus.",
    method:
      "Bak ui en kalkoengehakt volledig gaar. Voeg paprika, kruiden en passata toe. Laat 20 minuten sudderen en verwarm de afgespoelde kidneybonen de laatste 5 minuten mee.",
    cook: 30,
  },
  {
    id: "turkey-meatballs",
    name: "Turkey meatballs arrabbiata",
    cuisine: "Italiaans",
    source: "turkey",
    protein: "turkey-mince",
    group: "oven",
    starch: "pasta",
    vegetables: [
      ["courgette", 120],
      ["pepper", 80],
    ],
    sauce: [
      ["passata", 170, "sauce"],
      ["oregano", 2, "seasoning"],
      ["chili", 1, "seasoning"],
    ],
    flavour: "Kalkoenballetjes uit de oven met pittige tomatensaus en pasta.",
    method:
      "Verwarm de oven voor op 200 °C. Meng kalkoengehakt met de helft van de knoflook en oregano; vorm kleine balletjes. Leg met de groente in een ovenschaal, voeg passata en chili toe en bak 25–30 minuten tot volledig gaar. Schep halverwege om.",
    cook: 30,
    oven: true,
  },
  {
    id: "turkey-keema",
    name: "Turkey keema",
    cuisine: "Indiaas",
    source: "turkey",
    protein: "turkey-mince",
    group: "curry",
    vegetables: [
      ["spinach", 130],
      ["carrot", 70],
    ],
    sauce: [
      ["passata", 100, "sauce"],
      ["stock", 50, "sauce"],
      ["garam-masala", 5, "seasoning"],
      ["cumin", 2, "seasoning"],
    ],
    flavour: "Kruidig kalkoengehakt met spinazie, gember en tomaat.",
    method:
      "Bak kalkoengehakt met gember, knoflook, komijn en garam masala. Voeg wortel, passata en bouillon toe. Laat 15 minuten garen en laat de spinazie de laatste minuten slinken.",
  },
  {
    id: "char-siu",
    name: "Char-siu style pork",
    cuisine: "Chinees",
    source: "pork",
    protein: "pork",
    group: "oven",
    vegetables: [
      ["cabbage", 150],
      ["carrot", 50],
    ],
    sauce: [
      ["soy-sauce", 18, "sauce"],
      ["honey", 14, "sauce"],
      ["stock", 70, "sauce"],
      ["gochujang", 8, "sauce"],
    ],
    flavour: "Varkenshaas met een zoete sojaglazuur, kool en rijst.",
    method:
      "Verwarm de oven voor op 200 °C. Meng soja, honing, gochujang en bouillon. Snijd de varkenshaas in dikke repen en leg met kool, wortel en saus in een ovenschaal. Bak circa 20–25 minuten tot gaar; keer halverwege en houd voldoende vocht in de schaal.",
    cook: 25,
    oven: true,
  },
  {
    id: "pork-red-curry",
    name: "Thai pork red curry",
    cuisine: "Thais",
    source: "pork",
    protein: "pork",
    group: "curry",
    vegetables: [
      ["green-beans", 120],
      ["pepper", 80],
    ],
    sauce: [
      ["coconut-milk", 90, "sauce"],
      ["stock", 50, "sauce"],
      ["red-curry", 15, "seasoning"],
    ],
    flavour: "Malse varkensreepjes met rode curry, kokos en boontjes.",
    method:
      "Fruit currypasta, voeg varkensreepjes toe en bak kort. Schenk kokosmelk en bouillon erbij, voeg groente toe en laat 12–15 minuten zacht garen.",
  },
  {
    id: "ginger-pork",
    name: "Ginger-soy pork & cabbage",
    cuisine: "Aziatisch",
    source: "pork",
    protein: "pork",
    group: "stir-fry",
    vegetables: [
      ["cabbage", 150],
      ["carrot", 50],
    ],
    sauce: [
      ["soy-sauce", 18, "sauce"],
      ["stock", 80, "sauce"],
      ["cornstarch", 4, "seasoning"],
    ],
    flavour: "Gember en soja met malse varkensreepjes en stevige kool.",
    method:
      "Bak varkensreepjes met gember en knoflook. Voeg kool, wortel, soja en bouillon toe en gaar 10–12 minuten. Bind de saus met maïzena die je eerst in koud water oplost.",
  },
  {
    id: "tuna-arrabbiata",
    name: "Tuna arrabbiata pasta",
    cuisine: "Italiaans",
    source: "tuna",
    protein: "tuna",
    group: "tomato-pasta",
    starch: "pasta",
    vegetables: [
      ["courgette", 130],
      ["pepper", 70],
    ],
    sauce: [
      ["passata", 160, "sauce"],
      ["chili", 1, "seasoning"],
      ["oregano", 2, "seasoning"],
    ],
    flavour: "Tonijnpasta met een pittige tomatensaus die sappig blijft.",
    method:
      "Fruit knoflook met chili. Voeg groente, passata en oregano toe en laat 12 minuten sudderen. Laat tonijn goed uitlekken en schep die pas de laatste 2 minuten door de saus.",
  },
  {
    id: "tuna-cannellini",
    name: "Tuna tomato & cannellini pasta",
    cuisine: "Italiaans",
    source: "tuna",
    protein: "tuna",
    group: "tomato-pasta",
    starch: "pasta",
    vegetables: [
      ["courgette", 130],
      ["onion", 70],
    ],
    legumes: [["cannellini", 70]],
    sauce: [
      ["passata", 160, "sauce"],
      ["oregano", 2, "seasoning"],
    ],
    flavour: "Romige witte bonen, tonijn en tomaat met volkoren pasta.",
    method:
      "Fruit ui en knoflook. Voeg courgette en passata toe en laat 12 minuten garen. Warm de afgespoelde bonen 5 minuten mee; voeg uitgelekte tonijn pas de laatste 2 minuten toe.",
  },
  {
    id: "chicken-chickpea",
    name: "Chicken & chickpea curry",
    cuisine: "Indiaas",
    source: "chicken",
    protein: "chicken-breast",
    group: "curry",
    vegetables: [
      ["spinach", 120],
      ["pepper", 80],
    ],
    legumes: [["chickpeas", 70]],
    sauce: [
      ["passata", 100, "sauce"],
      ["coconut-milk", 50, "sauce"],
      ["curry-powder", 5, "seasoning"],
    ],
    flavour: "Een milde curry met kip, kikkererwten en spinazie.",
    method:
      "Bak kip met kerrie, knoflook en gember. Voeg passata, kokosmelk en paprika toe en laat 15 minuten garen. Warm kikkererwten en spinazie de laatste 5 minuten mee.",
  },
  {
    id: "mexican-chicken",
    name: "Mexican chicken & black-bean bowl",
    cuisine: "Mexicaans",
    source: "chicken",
    protein: "chicken-breast",
    group: "mexican",
    vegetables: [
      ["pepper", 140],
      ["onion", 60],
    ],
    legumes: [["black-beans", 70]],
    sauce: [
      ["passata", 130, "sauce"],
      ["cumin", 3, "seasoning"],
      ["paprika-powder", 3, "seasoning"],
      ["lime", 10, "seasoning"],
    ],
    flavour: "Gerookte paprika, zwarte bonen en kip in een tomatenbasis.",
    method:
      "Bak kip en ui. Voeg komijn, paprikapoeder, paprika en passata toe en laat 15 minuten zacht garen. Warm de afgespoelde zwarte bonen mee en voeg limoensap als laatste toe.",
  },
  {
    id: "tempeh-satay",
    name: "Tempeh satay & edamame",
    cuisine: "Indonesisch",
    source: "vegetarian",
    protein: "tempeh",
    group: "asian-rice",
    vegetables: [
      ["broccoli", 150],
      ["carrot", 50],
    ],
    legumes: [["edamame", 100]],
    sauce: [
      ["peanut-butter", 12, "sauce"],
      ["stock", 90, "sauce"],
      ["soy-sauce", 12, "sauce"],
      ["lime", 10, "seasoning"],
    ],
    flavour: "Plantaardige saté met stevig gebakken tempeh en edamame.",
    method:
      "Snijd tempeh in kleine blokken en bak rondom goudbruin. Meng pindakaas, soja en bouillon, voeg toe en laat 8 minuten zacht sudderen. Warm edamame mee en maak af met limoen.",
  },
  {
    id: "gochujang-tofu",
    name: "Gochujang tofu & edamame",
    cuisine: "Koreaans",
    source: "vegetarian",
    protein: "tofu",
    group: "asian-rice",
    vegetables: [
      ["broccoli", 140],
      ["pepper", 60],
    ],
    legumes: [["edamame", 100]],
    sauce: [
      ["gochujang", 18, "sauce"],
      ["soy-sauce", 10, "sauce"],
      ["stock", 80, "sauce"],
    ],
    flavour: "Stevige tofu met een pittige Koreaanse saus en edamame.",
    method:
      "Laat tofu uitlekken, dep droog en snijd in blokken. Bak in een ruime pan goudbruin. Voeg gochujang, soja en bouillon toe en laat 8 minuten garen. Warm de edamame mee.",
  },
  {
    id: "chicken-dhal",
    name: "Red lentil chicken dhal",
    cuisine: "Indiaas",
    source: "chicken",
    protein: "chicken-breast",
    group: "curry",
    vegetables: [
      ["spinach", 130],
      ["carrot", 70],
    ],
    legumes: [["lentils", 30]],
    sauce: [
      ["passata", 90, "sauce"],
      ["stock", 130, "sauce"],
      ["coconut-milk", 40, "sauce"],
      ["curry-powder", 4, "seasoning"],
      ["cumin", 2, "seasoning"],
    ],
    flavour: "Zachte rode linzen met kip en spinazie in een romige dhal.",
    method:
      "Bak kip met knoflook, gember en kruiden. Voeg wortel, afgespoelde droge linzen, passata, bouillon en kokosmelk toe. Laat 25 minuten zacht koken; voeg water toe als het te dik wordt en laat de spinazie de laatste minuten slinken.",
    cook: 30,
  },
];

function row([ingredientId, grams, role]: Part): RecipeIngredient {
  const scalable = ["protein", "carbohydrate", "fat"].includes(role);
  const minGrams =
    role === "protein"
      ? ingredientId === "tofu"
        ? 140
        : 100
      : role === "carbohydrate"
        ? 15
        : role === "fat"
          ? 1
          : grams;
  const maxGrams =
    role === "protein"
      ? ingredientId === "tofu"
        ? 350
        : 300
      : role === "carbohydrate"
        ? 160
        : role === "fat"
          ? 8
          : grams;
  return {
    ingredientId,
    grams,
    displayUnit: "g",
    role,
    scalable,
    minGrams,
    maxGrams,
    preferredGrams: grams,
  };
}
const seedCatalog = buildCatalog();
export const recipes: Recipe[] = seeds.map((seed) => {
  const asian = [
    "Japans",
    "Koreaans",
    "Thais",
    "Vietnamees",
    "Chinees",
    "Aziatisch",
    "Indonesisch",
    "Indiaas",
  ].includes(seed.cuisine);
  const parts: Part[] = [
    [seed.protein, seed.protein === "tofu" ? 250 : 190, "protein"],
    [seed.starch ?? "rice", 55, "carbohydrate"],
    ...seed.vegetables.map(([id, grams]): Part => [id, grams, "vegetable"]),
    ...(seed.legumes ?? []).map(([id, grams]): Part => [id, grams, "legume"]),
    ...seed.sauce,
    ["garlic", 5, "seasoning"],
    ...(asian ? [["ginger", 6, "seasoning"] as Part] : []),
    ["oil", 4, "fat"],
  ];
  const recipe: RecipeDefinition = {
    id: seed.id,
    nameNl: seed.name,
    cuisine: seed.cuisine,
    description: seed.flavour,
    proteinSource: seed.source,
    baseServings: 1,
    ingredients: parts.map(row),
    freezerScore: 5,
    microwaveScore: seed.source === "tuna" ? 4 : 5,
    batchEfficiencyScore: seed.group === "stir-fry" ? 3 : 5,
    prepMinutes: 15,
    cookMinutes: seed.cook ?? 25,
    cookingGroup: seed.group,
    equipment: seed.oven
      ? ["oven"]
      : ["burner", seed.group === "stir-fry" ? "frying-pan" : "large-pot"],
    tags: [
      asian ? "Aziatisch" : seed.cuisine,
      seed.starch === "pasta" ? "Pasta" : "Rijst",
      ...(seed.group === "curry" ? ["Curry"] : []),
      ...(seed.legumes ? ["Bonen"] : []),
      ...(seed.source === "vegetarian" ? ["Vegetarisch"] : []),
    ],
    minimumSauceGrams: seed.sauce
      .filter((part) => part[2] === "sauce")
      .reduce((sum, part) => sum + part[1], 0),
    instructions: [
      "Weeg alle ingrediënten rauw, droog of uitgelekt zoals aangegeven. Snijd de groente en houd rauw vlees gescheiden. Gebruik de olie uit de ingrediëntenlijst voor het bakken.",
      seed.starch === "pasta"
        ? "Kook de pasta 1–2 minuten korter dan de verpakking aangeeft. Giet af; hij gaart verder bij het opwarmen."
        : "Kook de droge basmatirijst volgens de verpakking. Kook gedeelde rijst samen en weeg de totale gekookte opbrengst voor het verdelen.",
      seed.method,
      "Gaar groente kort beetgaar; vermijd overkoken. Controleer dat vlees volledig gaar is. Houd alle saus bij het gerecht; voeg zo nodig een beetje water toe tegen uitdrogen.",
      "Verdeel rijst of pasta en saus gelijkmatig over de bakjes. Laat snel afkoelen in ondiepe porties en zet binnen 2 uur afgedekt in koelkast of vriezer. Label met naam en bereidingsdatum.",
      "Ontdooi in de koelkast. Verwarm in de magnetron door en door, roer tussendoor en voeg zo nodig een scheut water toe. Bewaar koelkastporties maximaal 2 dagen; houd voor diepvriesmaaltijden ongeveer 3 maanden aan.",
    ],
  };
  // Calibrate base portions once against the default catalog; totals are always derived.
  const calibrated = scaleRecipe(
    recipe,
    seedCatalog,
    DEFAULT_MEAL_CALORIES,
    DEFAULT_MEAL_PROTEIN,
  );
  return withPrepComponents({
    ...recipe,
    ingredients: calibrated.ingredients.map((part) => ({
      ...part,
      preferredGrams: part.grams,
    })),
  });
});
