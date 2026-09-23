import type {
  BatchItem,
  IngredientCatalog,
  Recipe,
  ResolvedBatchItem,
  SharedComponent,
  ShoppingItem,
} from "@/domain/types";
import { scaleRecipe } from "./scaling";

export function resolveBatch(
  batch: BatchItem[],
  recipes: Recipe[],
  catalog: IngredientCatalog,
): ResolvedBatchItem[] {
  return batch.map((item) => {
    const recipe = recipes.find((r) => r.id === item.recipeId);
    if (!recipe) throw new Error("Dit recept bestaat niet meer.");
    if (
      !Number.isInteger(item.servings) ||
      item.servings < 1 ||
      item.servings > 100
    )
      throw new Error("Kies 1 t/m 100 porties.");
    return {
      ...item,
      recipe,
      scaled: scaleRecipe(
        recipe,
        catalog,
        item.targetCalories,
        item.minimumProtein,
      ),
    };
  });
}
export function batchSummary(
  batch: ResolvedBatchItem[],
  mealprepsPerDay: number,
) {
  const meals = batch.reduce((sum, item) => sum + item.servings, 0);
  const calories = batch.reduce(
    (sum, item) => sum + item.scaled.nutrition.kcal * item.servings,
    0,
  );
  const protein = batch.reduce(
    (sum, item) => sum + item.scaled.nutrition.protein * item.servings,
    0,
  );
  return {
    meals,
    calories,
    averageCalories: meals ? calories / meals : 0,
    averageProtein: meals ? protein / meals : 0,
    days: mealprepsPerDay > 0 ? meals / mealprepsPerDay : 0,
  };
}
export function shoppingList(
  batch: ResolvedBatchItem[],
  catalog: IngredientCatalog,
): ShoppingItem[] {
  const amounts = new Map<string, number>();
  for (const item of batch)
    for (const row of item.scaled.ingredients)
      amounts.set(
        row.ingredientId,
        (amounts.get(row.ingredientId) ?? 0) + row.grams * item.servings,
      );
  return [...amounts]
    .filter(([, grams]) => grams > 0)
    .map(([id, grams]) => {
      const ingredient = catalog[id];
      const size = ingredient.defaultPackageSize;
      return {
        ingredient,
        grams,
        packages:
          size && size > 0 ? Math.ceil((grams - 0.000001) / size) : undefined,
        signature: `${id}:${grams.toFixed(2)}`,
      };
    })
    .sort((a, b) =>
      a.ingredient.nameNl.localeCompare(b.ingredient.nameNl, "nl"),
    );
}
export function sharedComponents(
  batch: ResolvedBatchItem[],
): SharedComponent[] {
  const map = new Map<string, SharedComponent>();
  for (const item of batch)
    for (const row of item.scaled.ingredients) {
      const component = map.get(row.ingredientId) ?? {
        ingredientId: row.ingredientId,
        grams: 0,
        recipes: [],
      };
      component.grams += row.grams * item.servings;
      component.recipes.push({
        recipeId: item.recipeId,
        name: item.recipe.nameNl,
        grams: row.grams * item.servings,
        servings: item.servings,
      });
      map.set(row.ingredientId, component);
    }
  return [...map.values()]
    .filter((row) => row.recipes.length > 1)
    .sort((a, b) => b.grams - a.grams);
}
export function sharedAromatics(batch: ResolvedBatchItem[]): string[] {
  return batch
    .filter((item) =>
      ["soy-sauce", "garlic", "ginger"].every((id) =>
        item.scaled.ingredients.some((row) => row.ingredientId === id),
      ),
    )
    .map((item) => item.recipe.nameNl);
}
