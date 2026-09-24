import type {
  IngredientCatalog,
  RecipeDefinition,
  RecipeIngredient,
  ScaledRecipe,
} from "@/domain/types";
import { FAT_CORRECTION_GRAMS, KCAL_TOLERANCE } from "@/domain/constants";
import { recipeNutrition } from "./nutrition";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
/** Deterministic bounded search. Preserve vegetables, sauce and flavour first;
 * search protein, solve starch analytically, and use only a small fat correction.
 * Seed recipes have one main protein, one starch and one optional correction fat.
 * Other ingredients remain at their preferred amount. No seed data is mutated. */
export function scaleRecipe(
  recipe: RecipeDefinition,
  catalog: IngredientCatalog,
  targetCalories: number,
  minimumProtein: number,
): ScaledRecipe {
  if (
    !Number.isFinite(targetCalories) ||
    targetCalories < 100 ||
    targetCalories > 2000 ||
    !Number.isFinite(minimumProtein) ||
    minimumProtein < 0 ||
    minimumProtein > 200
  )
    throw new Error("Gebruik 100–2.000 kcal en 0–200 g eiwit per maaltijd.");
  const rows = recipe.ingredients.map((row) => ({
    ...row,
    grams: row.scalable
      ? clamp(row.preferredGrams, row.minGrams, row.maxGrams)
      : row.grams,
  }));
  const protein = rows.find((row) => row.role === "protein" && row.scalable);
  const carbohydrate = rows.find(
    (row) => row.role === "carbohydrate" && row.scalable,
  );
  const fat = rows.find((row) => row.role === "fat" && row.scalable);
  const variableIds = new Set(
    [protein, carbohydrate, fat]
      .filter(Boolean)
      .map((row) => row!.ingredientId),
  );
  const fixed = recipeNutrition(
    rows.filter((row) => !variableIds.has(row.ingredientId)),
    catalog,
  );
  const nutrient = (
    row: RecipeIngredient | undefined,
    key: "kcal" | "protein",
  ) => (row ? catalog[row.ingredientId].nutritionPer100g[key] / 100 : 0);
  const pKcal = nutrient(protein, "kcal"),
    pProtein = nutrient(protein, "protein");
  const cKcal = nutrient(carbohydrate, "kcal"),
    cProtein = nutrient(carbohydrate, "protein");
  const fKcal = nutrient(fat, "kcal"),
    fProtein = nutrient(fat, "protein");
  const pMin = protein?.minGrams ?? 0,
    pMax = protein?.maxGrams ?? 0;
  const cMin = carbohydrate?.minGrams ?? 0,
    cMax = carbohydrate?.maxGrams ?? 0;
  // Correction fat is never used as an unrestricted calorie lever.
  const fMin = fat
    ? Math.max(fat.minGrams, fat.preferredGrams - FAT_CORRECTION_GRAMS)
    : 0;
  const fMax = fat
    ? Math.min(fat.maxGrams, fat.preferredGrams + FAT_CORRECTION_GRAMS)
    : 0;
  const fPreferred = fat?.preferredGrams ?? 0;
  let bestScore = Infinity;
  let best = { p: pMin, c: cMin, f: fMin };
  const proteinAmounts = Array.from(
    { length: Math.floor(pMax - pMin) + 1 },
    (_, i) => pMin + i,
  );
  proteinAmounts.push(pMax);
  for (const p of proteinAmounts) {
    const energyWithoutCarbs = fixed.kcal + p * pKcal + fPreferred * fKcal;
    const proteinWithoutCarbs =
      fixed.protein + p * pProtein + fPreferred * fProtein;
    const wantedCarbs =
      cKcal > 0 ? (targetCalories - energyWithoutCarbs) / cKcal : cMin;
    const requiredCarbs =
      cProtein > 0
        ? (minimumProtein - proteinWithoutCarbs + 0.000001) / cProtein
        : cMin;
    const candidates = [
      wantedCarbs,
      requiredCarbs,
      Math.max(wantedCarbs, requiredCarbs),
      cMin,
      cMax,
      carbohydrate?.preferredGrams ?? 0,
    ];
    for (const value of candidates) {
      const c = clamp(value, cMin, cMax);
      const beforeFat = fixed.kcal + p * pKcal + c * cKcal;
      const f =
        fKcal > 0
          ? clamp((targetCalories - beforeFat) / fKcal, fMin, fMax)
          : fPreferred;
      const kcal = beforeFat + f * fKcal;
      const totalProtein =
        fixed.protein + p * pProtein + c * cProtein + f * fProtein;
      const shortage = Math.max(0, minimumProtein - totalProtein);
      const energyError = Math.abs(kcal - targetCalories);
      const preferenceCost =
        Math.abs(p - (protein?.preferredGrams ?? 0)) / 200 +
        Math.abs(c - (carbohydrate?.preferredGrams ?? 0)) / 100 +
        Math.abs(f - fPreferred) / 10;
      const score =
        shortage * 1000 +
        energyError * 5 +
        Math.max(0, totalProtein - minimumProtein) * 0.02 +
        preferenceCost * 0.1;
      if (score < bestScore) {
        bestScore = score;
        best = { p, c, f };
      }
    }
  }
  if (protein) protein.grams = best.p;
  if (carbohydrate) carbohydrate.grams = best.c;
  if (fat) fat.grams = best.f;
  const nutrition = recipeNutrition(rows, catalog);
  const warnings: string[] = [];
  if (Math.abs(nutrition.kcal - targetCalories) > KCAL_TOLERANCE)
    warnings.push(
      "Het caloriedoel is binnen de receptgrenzen niet haalbaar. Dit is de dichtstbijzijnde combinatie met prioriteit voor eiwit.",
    );
  if (nutrition.protein + 0.000001 < minimumProtein)
    warnings.push(
      "Het eiwitdoel is binnen de maximale ingrediënthoeveelheden niet haalbaar. Verlaag het doel of kies een ander recept.",
    );
  const sauceGrams = rows
    .filter((row) => row.role === "sauce")
    .reduce((sum, row) => sum + row.grams, 0);
  if (sauceGrams < recipe.minimumSauceGrams)
    warnings.push(
      "Dit recept bevat minder saus dan aanbevolen; controleer de receptgegevens.",
    );
  return {
    ingredients: rows,
    nutrition,
    warnings,
    feasible: warnings.length === 0,
  };
}
