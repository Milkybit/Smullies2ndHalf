import type { Recipe } from "@/domain/types";

export const PANTRY_IDS = new Set([
  "salt",
  "pepper-black",
  "black-pepper",
  "water",
  "stock",
  "oil",
  "sesame-oil",
  "cumin",
  "paprika-powder",
  "chili",
  "oregano",
  "curry-powder",
  "garam-masala",
  "cornstarch",
]);
export const majorIngredientIds = (recipe: Recipe) =>
  recipe.ingredientIds.filter((id) => !PANTRY_IDS.has(id));
export const COMPATIBILITY_WEIGHTS = {
  sauce: 5,
  aromatic: 4,
  protein: 4,
  carb: 3,
  vegetable: 2,
  group: 2,
  tags: 3,
  ingredients: 2,
};
export function calculateRecipeCompatibility(a: Recipe, b: Recipe) {
  const sharedAttributes: string[] = [],
    differences: string[] = [];
  let totalScore = 0;
  const add = (same: boolean, weight: number, label: string) => {
    if (same) {
      totalScore += weight;
      sharedAttributes.push(label);
    } else differences.push(label);
  };
  add(
    a.sauceFamily === b.sauceFamily && a.sauceFamily !== "recipe-specific",
    COMPATIBILITY_WEIGHTS.sauce,
    "Sausbasis",
  );
  add(
    !!a.aromaticBase && a.aromaticBase === b.aromaticBase,
    COMPATIBILITY_WEIGHTS.aromatic,
    "Aromaten snijden",
  );
  add(
    a.proteinIngredientId === b.proteinIngredientId &&
      a.proteinPrepMethod === b.proteinPrepMethod,
    COMPATIBILITY_WEIGHTS.protein,
    "Eiwitbereiding",
  );
  add(
    a.carbBase === b.carbBase,
    COMPATIBILITY_WEIGHTS.carb,
    "Rijst of pasta koken",
  );
  add(
    a.vegetablePrepFamily === b.vegetablePrepFamily,
    COMPATIBILITY_WEIGHTS.vegetable,
    "Groentemix voorbereiden",
  );
  add(
    a.cookingGroup === b.cookingGroup,
    COMPATIBILITY_WEIGHTS.group,
    "Kookgroep",
  );
  const sharedTags = [...new Set(a.batchTags)].filter((tag) =>
    b.batchTags.includes(tag),
  );
  totalScore += Math.min(COMPATIBILITY_WEIGHTS.tags, sharedTags.length);
  const idsA = new Set(majorIngredientIds(a)),
    idsB = new Set(majorIngredientIds(b));
  const sharedIngredients = [...idsA].filter((id) => idsB.has(id));
  const union = new Set([...idsA, ...idsB]).size;
  totalScore += union
    ? (COMPATIBILITY_WEIGHTS.ingredients * sharedIngredients.length) / union
    : 0;
  if (a.flavourProfile !== b.flavourProfile) differences.push("Smaakafwerking");
  const maxPossibleScore = Object.values(COMPATIBILITY_WEIGHTS).reduce(
    (a, b) => a + b,
    0,
  );
  const normalizedScore = Math.round((100 * totalScore) / maxPossibleScore);
  return {
    totalScore,
    maxPossibleScore,
    normalizedScore,
    sharedAttributes,
    sharedIngredients,
    differences,
    explanation: `${sharedAttributes.join(", ") || "Geen gedeelde bereidingsstappen"}. ${sharedIngredients.length} belangrijke ingrediënten gedeeld. Andere onderdelen: ${differences.join(", ") || "geen"}.`,
  };
}
export const EFFICIENCY_WEIGHTS = {
  sauce: 22,
  aromatics: 12,
  protein: 20,
  carbohydrate: 16,
  vegetables: 12,
  appliances: 6,
  ingredients: 12,
};
const unique = (values: string[]) => new Set(values).size;
const reuse = (values: string[], recipes: number) =>
  recipes < 2 || !values.length
    ? 0
    : Math.max(
        0,
        (values.length - unique(values)) /
          (values.length - values.length / recipes),
      );
export function calculateBatchEfficiency(recipes: Recipe[]) {
  const n = recipes.length;
  const categories = [
    {
      key: "sauce",
      label: "Sausbasis hergebruiken",
      values: recipes.map((r) =>
        r.sauceFamily === "recipe-specific" ? r.id : r.sauceFamily,
      ),
    },
    {
      key: "aromatics",
      label: "Aromaten samen voorbereiden",
      values: recipes.map((r) => r.aromaticBase || r.id),
    },
    {
      key: "protein",
      label: "Eiwitbereiding delen",
      values: recipes.map(
        (r) => `${r.proteinIngredientId}-${r.proteinPrepMethod}`,
      ),
    },
    {
      key: "carbohydrate",
      label: "Rijst en pasta samen koken",
      values: recipes.map((r) => r.carbBase),
    },
    {
      key: "vegetables",
      label: "Groente samen snijden",
      values: recipes.flatMap((r) =>
        r.ingredients
          .filter((row) => row.role === "vegetable")
          .map((row) => row.ingredientId),
      ),
    },
    {
      key: "appliances",
      label: "Bereidingsmethode herhalen",
      values: recipes.map((r) => r.proteinPrepMethod),
    },
    {
      key: "ingredients",
      label: "Belangrijke ingrediënten delen",
      values: recipes.flatMap(majorIngredientIds),
    },
  ] as const;
  const breakdown = categories.map((c) => ({
    label: c.label,
    weight: EFFICIENCY_WEIGHTS[c.key],
    score: Math.round(100 * reuse(c.values, n)),
    unique: unique(c.values),
    uses: c.values.length,
  }));
  return {
    score: Math.round(
      breakdown.reduce((sum, c) => sum + (c.score * c.weight) / 100, 0),
    ),
    breakdown,
    uniqueIngredients: unique(recipes.flatMap((r) => r.ingredientIds)),
    uniqueMajorIngredients: unique(recipes.flatMap(majorIngredientIds)),
    separateIngredientUses: recipes.flatMap(majorIngredientIds).length,
    uniqueSauceBases: categories[0].values.length
      ? unique(categories[0].values)
      : 0,
    uniqueCarbohydratePreparations: unique(recipes.map((r) => r.carbBase)),
    uniqueProteinPreparations: unique(categories[2].values),
    cookingGroups: unique(recipes.map((r) => r.cookingGroup)),
  };
}
export const DIVERSITY_TARGETS = {
  proteins: 3,
  sauces: 4,
  flavours: 6,
  carbs: 2,
  vegetables: 7,
};
export function calculateBatchDiversity(recipes: Recipe[]) {
  const counts = {
    proteins: unique(recipes.map((r) => r.proteinSource)),
    sauces: unique(recipes.map((r) => r.sauceFamily)),
    flavours: unique(recipes.map((r) => r.flavourProfile)),
    carbs: unique(recipes.map((r) => r.carbBase)),
    vegetables: unique(
      recipes.flatMap((r) =>
        r.ingredients
          .filter((row) => row.role === "vegetable")
          .map((row) => row.ingredientId),
      ),
    ),
  };
  const labels = {
    proteins: "Eiwitbronnen",
    sauces: "Sausfamilies",
    flavours: "Smaakprofielen",
    carbs: "Koolhydraatbases",
    vegetables: "Groentesoorten",
  };
  const breakdown = (Object.keys(counts) as (keyof typeof counts)[]).map(
    (key) => ({
      label: labels[key],
      count: counts[key],
      target: DIVERSITY_TARGETS[key],
      score: Math.round(
        100 * Math.min(1, counts[key] / DIVERSITY_TARGETS[key]),
      ),
    }),
  );
  return {
    score: Math.round(
      breakdown.reduce((sum, row) => sum + row.score, 0) / breakdown.length,
    ),
    counts,
    breakdown,
  };
}
