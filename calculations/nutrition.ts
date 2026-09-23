import type {
  IngredientCatalog,
  Nutrition,
  RecipeIngredient,
} from "@/domain/types";
export const emptyNutrition = (): Nutrition => ({
  kcal: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
});
export function ingredientNutrition(
  per100g: Nutrition,
  grams: number,
): Nutrition {
  if (!Number.isFinite(grams) || grams < 0)
    throw new Error("Ingrediëntgewicht moet 0 g of meer zijn.");
  return {
    kcal: (per100g.kcal * grams) / 100,
    protein: (per100g.protein * grams) / 100,
    carbs: (per100g.carbs * grams) / 100,
    fat: (per100g.fat * grams) / 100,
    fiber: (per100g.fiber * grams) / 100,
  };
}
export function recipeNutrition(
  ingredients: RecipeIngredient[],
  catalog: IngredientCatalog,
): Nutrition {
  return ingredients.reduce((total, row) => {
    const ingredient = catalog[row.ingredientId];
    if (!ingredient)
      throw new Error(`Onbekend ingrediënt: ${row.ingredientId}`);
    const value = ingredientNutrition(ingredient.nutritionPer100g, row.grams);
    for (const key of Object.keys(total) as (keyof Nutrition)[])
      total[key] += value[key];
    return total;
  }, emptyNutrition());
}
