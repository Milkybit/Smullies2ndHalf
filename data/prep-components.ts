import type {
  ComponentRef,
  IngredientQuantity,
  PrepComponent,
  Recipe,
  RecipeDefinition,
} from "@/domain/types";
import { buildCatalog } from "./ingredients";

const catalog = buildCatalog();
const quantities = (rows: [string, number][]): IngredientQuantity[] =>
  rows.map(([ingredientId, grams]) => ({ ingredientId, grams }));
function component(
  id: string,
  nameNl: string,
  type: PrepComponent["type"],
  rows: IngredientQuantity[],
  options: Partial<PrepComponent> = {},
): PrepComponent {
  return {
    id,
    nameNl,
    type,
    ingredientQuantities: rows,
    description: nameNl,
    instructions: [
      "Weeg af, label de verdeling per recept en bewaar gekoeld tot gebruik.",
    ],
    cookingMethod: "mix",
    equipment: "no-heat",
    burnerCount: 0,
    ovenSlots: 0,
    activeMinutes: 3,
    passiveMinutes: 0,
    batchable: true,
    freezerSuitable: true,
    yieldTrackingSupported: false,
    tags: [type],
    ...options,
  };
}
// Fixed ratios are essential: only this exact common core is mixed together.
// Extra soy, stock, coconut, tomato and seasoning remain in each recipe's finisher.
export const sauceBases: PrepComponent[] = [
  component(
    "soy-ginger-base",
    "Soja · knoflook · gember",
    "sauce_base",
    quantities([
      ["soy-sauce", 10],
      ["garlic", 5],
      ["ginger", 6],
    ]),
  ),
  component(
    "coconut-curry-base",
    "Kokos · knoflook · gember",
    "sauce_base",
    quantities([
      ["coconut-milk", 40],
      ["garlic", 5],
      ["ginger", 6],
    ]),
  ),
  component(
    "tomato-garlic-base",
    "Tomaat · knoflook",
    "sauce_base",
    quantities([
      ["passata", 80],
      ["garlic", 5],
    ]),
  ),
].map((base) => ({
  ...base,
  yieldTrackingSupported: true,
  instructions: [
    "Meng deze neutrale basis één keer, zonder de smaakmakers van de afzonderlijke gerechten. Roer goed en verdeel volgens de aangegeven gewichten. Bewaar gekoeld; deze basis is nog rauw en wordt bij het afmaken verhit.",
  ],
}));

// These recipes need their own cooking method: do not pre-cook stew meat,
// remove a glaze, or turn meatballs into shared loose mince.
const integratedMethods: Record<string, string> = {
  rendang: "stew",
  "turkey-meatballs": "meatballs",
  "char-siu": "glazed-roast",
};
const flavourProfiles: Record<string, string> = {
  teriyaki: "honey-soy",
  "honey-soy-chicken": "honey-soy",
  "gochujang-chicken": "gochujang",
  "gochujang-tofu": "gochujang",
  "satay-lime": "satay-lime",
  "tempeh-satay": "satay-lime",
  "red-curry-chicken": "red-curry",
  "pork-red-curry": "red-curry",
  "green-curry-chicken": "green-curry",
  "japanese-curry": "japanese-curry",
  "lemongrass-chicken": "lemongrass",
  "black-pepper-chicken": "black-pepper",
  "tikka-masala": "tikka",
  "korean-beef": "korean-soy",
  "thai-basil-beef": "thai-basil",
  "beef-black-bean": "ginger-soy",
  rendang: "rendang",
  "beef-chili": "smoky-chili",
  "beef-lentil-chili": "smoky-chili",
  "turkey-chili": "smoky-chili",
  "mexican-chicken": "smoky-chili",
  "beef-ragu": "ragu",
  "turkey-meatballs": "arrabbiata",
  "turkey-keema": "keema",
  "char-siu": "char-siu",
  "ginger-pork": "ginger-soy",
  "tuna-arrabbiata": "arrabbiata",
  "tuna-cannellini": "tomato-herbs",
  "chicken-chickpea": "mild-curry",
  "chicken-dhal": "dhal",
};

/** Partition, never duplicate, the actual recipe ingredients into reusable units.
 * Called again after scaling, so overrides and changed protein cuts stay correct. */
export function withPrepComponents(recipe: RecipeDefinition): Recipe {
  const left = new Map(
    recipe.ingredients.map((row) => [row.ingredientId, row.grams]),
  );
  const refs: ComponentRef[] = [];
  const take = (definition: PrepComponent, multiplier = 1) => {
    for (const row of definition.ingredientQuantities) {
      const remaining =
        (left.get(row.ingredientId) ?? 0) - row.grams * multiplier;
      if (remaining < -0.00001)
        throw new Error(`Te veel ${row.ingredientId} in ${definition.id}`);
      left.set(row.ingredientId, Math.max(0, remaining));
    }
    refs.push({ component: definition, multiplier });
  };
  const proteinId = recipe.ingredients.find(
    (row) => row.role === "protein",
  )!.ingredientId;
  const carbId = recipe.ingredients.find(
    (row) => row.role === "carbohydrate",
  )!.ingredientId;
  const integrated = integratedMethods[recipe.id];
  const proteinMethod =
    integrated ??
    (proteinId.startsWith("chicken-")
      ? "roast"
      : proteinId === "tuna"
        ? "drain"
        : "pan");
  const carb = component(
    carbId === "rice" ? "basmati-rice" : carbId,
    catalog[carbId].nameNl,
    "carbohydrate",
    quantities([[carbId, 100]]),
    {
      equipment: "burner",
      burnerCount: 1,
      cookingMethod: "boil",
      activeMinutes: 5,
      passiveMinutes: carbId === "pasta" ? 13 : 20,
      yieldTrackingSupported: true,
      instructions: [
        carbId === "pasta"
          ? "Kook in ruim water volgens de verpakking, 1–2 minuten korter voor later opwarmen. Giet af en weeg zonder pan."
          : "Kook volgens de verpakking. Weeg de totale gekookte rijst zonder pan. Verdeel naar droog aandeel; koel direct in ondiepe porties.",
      ],
    },
  );
  take(carb, left.get(carbId)! / 100);
  let sauceFamily = "recipe-specific";
  if (integrated) {
    const body = component(
      `mixed-${recipe.id}`,
      `${recipe.nameNl} · eigen bereiding`,
      "mixed_base",
      [...left]
        .filter(([, grams]) => grams > 0)
        .map(([ingredientId, grams]) => ({ ingredientId, grams })),
      {
        equipment: recipe.equipment.includes("oven") ? "oven" : "burner",
        ovenSlots: recipe.equipment.includes("oven") ? 1 : 0,
        burnerCount: recipe.equipment.includes("oven") ? 0 : 1,
        cookingMethod: recipe.equipment.includes("oven") ? "roast" : "simmer",
        activeMinutes: 12,
        passiveMinutes: Math.max(0, recipe.cookMinutes - 12),
        batchable: false,
        yieldTrackingSupported: true,
        instructions: [recipe.instructions[2]],
      },
    );
    take(body);
    sauceFamily = recipe.ingredients.some(
      (row) => row.ingredientId === "passata",
    )
      ? "tomato-special"
      : recipe.ingredients.some((row) => row.ingredientId === "coconut-milk")
        ? "coconut-special"
        : "soy-glaze";
  } else {
    const base = sauceBases.find((base) =>
      base.ingredientQuantities.every(
        (row) => (left.get(row.ingredientId) ?? 0) >= row.grams,
      ),
    );
    if (base) {
      take(base);
      sauceFamily = base.id;
    }
    const aromatics = ["garlic", "ginger"].filter(
      (id) => (left.get(id) ?? 0) > 0,
    );
    if (aromatics.length)
      take(
        component(
          `aromatics-${aromatics.join("-")}`,
          aromatics.map((id) => catalog[id].nameNl).join(" · "),
          "aromatic_base",
          aromatics.map((ingredientId) => ({
            ingredientId,
            grams: left.get(ingredientId)!,
          })),
          { cookingMethod: "chop" },
        ),
      );
    take(
      component(
        `${proteinId}-${proteinMethod}-basic`,
        `${catalog[proteinId].nameNl} · ${proteinMethod === "roast" ? "neutraal uit de oven" : proteinMethod === "drain" ? "uitgelekt" : "neutraal gebakken"}`,
        "protein",
        quantities([[proteinId, 100]]),
        {
          cookingMethod: proteinMethod as PrepComponent["cookingMethod"],
          equipment:
            proteinMethod === "roast"
              ? "oven"
              : proteinMethod === "drain"
                ? "no-heat"
                : "burner",
          burnerCount: proteinMethod === "pan" ? 1 : 0,
          ovenSlots: proteinMethod === "roast" ? 1 : 0,
          activeMinutes: proteinMethod === "pan" ? 12 : 5,
          passiveMinutes: proteinMethod === "roast" ? 25 : 0,
          yieldTrackingSupported: true,
          instructions: [
            proteinMethod === "roast"
              ? "Verwarm de oven voor op 200 °C. Verdeel stukjes kip in één laag over een schaal met bakpapier, zonder extra olie. Gaar volledig, controleer de dikste stukken en verleng zo nodig. Bewaar alle sappen. Voeg pas bij het afmaken de saus toe."
              : proteinMethod === "drain"
                ? "Laat tonijn uitlekken. Weeg het uitgelekte gewicht. Houd gekoeld en voeg pas de laatste 2 minuten aan de saus toe."
                : "Bak in passende rondes in een antiaanbakpan, zonder extra olie. Maak gehakt rul; snijd tofu, tempeh of varkensvlees in gelijke blokjes. Gaar volledig. Houd sappen bij het vlees en verdeel naar rauw aandeel.",
          ],
        },
      ),
      left.get(proteinId)! / 100,
    );
    for (const row of recipe.ingredients.filter(
      (row) => row.role === "vegetable",
    )) {
      take(
        component(
          `veg-${row.ingredientId}-chopped`,
          `${catalog[row.ingredientId].nameNl} · gewassen en gesneden`,
          "vegetable",
          quantities([[row.ingredientId, 100]]),
          {
            cookingMethod: "chop",
            instructions: [
              "Was en snijd in gelijke stukken. Bereid samen voor, houd gekoeld en verdeel rauw per recept. Gaar pas bij de afwerking; voeg spinazie op het einde toe.",
            ],
          },
        ),
        (left.get(row.ingredientId) ?? 0) / 100,
      );
    }
    const remaining = [...left]
      .filter(([, grams]) => grams > 0.000001)
      .map(([ingredientId, grams]) => ({ ingredientId, grams }));
    if (remaining.length)
      take(
        component(
          `finish-${recipe.id}`,
          `${recipe.nameNl} · afwerking`,
          "finisher",
          remaining,
          {
            batchable: false,
            equipment: "burner",
            burnerCount: 1,
            cookingMethod: "simmer",
            activeMinutes: 7,
            passiveMinutes: recipe.ingredients.some(
              (row) => row.ingredientId === "lentils",
            )
              ? 25
              : 12,
            instructions: [
              "Verhit de afgewogen olie; fruit de rauwe aromaten en eventuele currypasta kort. Voeg de toegewezen basis, overige saus en stevige groenten toe. Laat zacht garen; voeg water toe als het te dik wordt.",
              recipe.ingredients.some((row) => row.ingredientId === "lentils")
                ? "Spoel droge linzen, voeg bij het begin toe en laat minstens 25 minuten garen; controleer en verleng zo nodig. Voeg water toe bij opname."
                : "Warm uitgelekte peulvruchten de laatste 5 minuten mee.",
              "Voeg eventuele spinazie pas op het einde toe.",
              "Voeg het al gare eiwit pas de laatste minuten toe en verwarm door en door. Tonijn: laatste 2 minuten. Los eventuele maïzena eerst op in koud water; voeg toe en laat kort binden. Voeg limoen en basilicum op het einde toe. Gebruik geen extra olie buiten de ingrediëntenlijst.",
            ],
          },
        ),
      );
  }
  const vegetableIds = recipe.ingredients
    .filter((row) => row.role === "vegetable")
    .map((row) => row.ingredientId)
    .sort();
  const aromaticBase = ["onion", "garlic", "ginger"]
    .filter((id) => recipe.ingredients.some((row) => row.ingredientId === id))
    .join("-");
  return {
    ...recipe,
    componentRefs: refs,
    proteinIngredientId: proteinId,
    proteinPrepMethod: proteinMethod,
    carbBase: carbId,
    sauceFamily,
    aromaticBase,
    vegetablePrepFamily: vegetableIds.join("-"),
    flavourProfile: flavourProfiles[recipe.id] ?? recipe.id,
    ingredientIds: recipe.ingredients.map((row) => row.ingredientId).sort(),
    batchTags: [
      recipe.tags.includes("Aziatisch") ? "asian" : recipe.cuisine,
      `${carbId}-batch`,
      `${proteinId}-${proteinMethod}`,
      sauceFamily,
      aromaticBase,
    ],
  };
}

export function withChickenCut(
  recipe: Recipe,
  cut?: "chicken-thigh" | "chicken-breast",
): Recipe {
  if (
    !cut ||
    recipe.proteinSource !== "chicken" ||
    recipe.proteinIngredientId === cut
  )
    return recipe;
  return withPrepComponents({
    ...recipe,
    ingredients: recipe.ingredients.map((row) =>
      row.role === "protein" ? { ...row, ingredientId: cut } : row,
    ),
  });
}
