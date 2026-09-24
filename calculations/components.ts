import type {
  CookingTask,
  IngredientCatalog,
  IngredientQuantity,
  PrepComponent,
  ResolvedBatchItem,
} from "@/domain/types";
import { withPrepComponents } from "@/data/prep-components";
import { shoppingList } from "./batch";
import { allocateCookedYield } from "./yield";

export interface AggregatedComponent {
  component: PrepComponent;
  ingredientQuantities: IngredientQuantity[];
  inputGrams: number;
  recipes: {
    recipeId: string;
    name: string;
    grams: number;
    servings: number;
  }[];
  signature: string;
}
/** Every gram belongs to one component; shopping still uses the original rows. */
export function aggregatePrepComponents(
  batch: ResolvedBatchItem[],
): AggregatedComponent[] {
  const result = new Map<string, AggregatedComponent>();
  for (const item of batch) {
    const composed = withPrepComponents({
      ...item.recipe,
      ingredients: item.scaled.ingredients,
    });
    for (const ref of composed.componentRefs) {
      const entry = result.get(ref.component.id) ?? {
        component: ref.component,
        ingredientQuantities: [],
        inputGrams: 0,
        recipes: [],
        signature: "",
      };
      let grams = 0;
      for (const row of ref.component.ingredientQuantities) {
        const amount = row.grams * ref.multiplier * item.servings;
        grams += amount;
        const existing = entry.ingredientQuantities.find(
          (r) => r.ingredientId === row.ingredientId,
        );
        if (existing) existing.grams += amount;
        else
          entry.ingredientQuantities.push({
            ingredientId: row.ingredientId,
            grams: amount,
          });
      }
      entry.inputGrams += grams;
      entry.recipes.push({
        recipeId: item.recipeId,
        name: item.recipe.nameNl,
        grams,
        servings: item.servings,
      });
      result.set(ref.component.id, entry);
    }
  }
  const order = [
    "sauce_base",
    "aromatic_base",
    "protein",
    "carbohydrate",
    "vegetable",
    "mixed_base",
    "finisher",
    "garnish",
  ];
  return [...result.values()]
    .map((entry) => ({ ...entry, signature: componentSignature(entry) }))
    .sort(
      (a, b) =>
        order.indexOf(a.component.type) - order.indexOf(b.component.type) ||
        a.component.id.localeCompare(b.component.id),
    );
}
export function componentSignature(
  entry: Omit<AggregatedComponent, "signature">,
): string {
  return JSON.stringify({
    version: 1,
    id: entry.component.id,
    inputs: [...entry.ingredientQuantities]
      .sort((a, b) => a.ingredientId.localeCompare(b.ingredientId))
      .map((r) => [r.ingredientId, +r.grams.toFixed(6)]),
    allocations: [...entry.recipes]
      .sort((a, b) => a.recipeId.localeCompare(b.recipeId))
      .map((r) => [r.recipeId, r.servings, +r.grams.toFixed(6)]),
  });
}
export function allocateComponentYield(
  component: AggregatedComponent,
  cookedGrams: number,
) {
  return allocateCookedYield(
    component.recipes.map((row) => ({ ...row, dryGrams: row.grams })),
    cookedGrams,
  );
}
/** A measured yield is usable immediately, without waiting for later waves. */
export function productionYieldLots(
  tasks: CookingTask[],
  components: AggregatedComponent[],
) {
  return tasks
    .filter((task) => task.componentAllocations && task.inputGrams)
    .map((task) => {
      const source = components.find(
        (c) => c.component.id === task.componentId,
      )!;
      const entry = {
        component: source.component,
        inputGrams: task.inputGrams!,
        ingredientQuantities: source.ingredientQuantities.map((row) => ({
          ...row,
          grams: (row.grams * task.inputGrams!) / source.inputGrams,
        })),
        recipes: task.componentAllocations!,
        signature: "",
      };
      entry.signature = componentSignature(entry);
      return { key: `lot-${task.id}`, label: task.title, entry };
    });
}
export function generatePrepList(
  batch: ResolvedBatchItem[],
  catalog: IngredientCatalog,
) {
  const components = aggregatePrepComponents(batch);
  return {
    chop: shoppingList(batch, catalog).filter(
      (row) =>
        row.ingredient.category === "vegetables" ||
        ["garlic", "ginger"].includes(row.ingredient.id),
    ),
    bulk: components.filter((row) =>
      ["protein", "carbohydrate", "mixed_base"].includes(row.component.type),
    ),
    bases: components.filter((row) =>
      ["sauce_base", "aromatic_base"].includes(row.component.type),
    ),
    finishers: components.filter((row) => row.component.type === "finisher"),
  };
}
