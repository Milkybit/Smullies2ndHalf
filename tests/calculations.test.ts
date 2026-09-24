import { describe, it, expect } from "vitest";
import type { Profile } from "@/domain/types";
import {
  calculateBmr,
  calculateTdee,
  calculateTargets,
  leanBodyMass,
  weightLossDeficit,
} from "@/calculations/energy";
import { createMealSlots, redistributeMeals } from "@/calculations/meals";
import { ingredientNutrition, recipeNutrition } from "@/calculations/nutrition";
import { scaleRecipe } from "@/calculations/scaling";
import {
  batchSummary,
  resolveBatch,
  sharedComponents,
  shoppingList,
} from "@/calculations/batch";
import { allocateCookedYield } from "@/calculations/yield";
import { cookingPlan } from "@/calculations/cooking";
import { buildCatalog, ingredients } from "@/data/ingredients";
import { recipes } from "@/data/recipes";
const profile: Profile = {
  age: 30,
  sex: "male",
  heightCm: 180,
  weightKg: 80,
  activity: "moderate",
  workoutsPerWeek: 3,
  goal: "loss",
  weeklyWeightLossKg: 0.5,
  surplusCalories: 250,
};
const catalog = buildCatalog();
describe("energy formulas", () => {
  it("uses Mifflin for male and female profiles", () => {
    expect(calculateBmr(profile)).toBe(1780);
    expect(calculateBmr({ ...profile, sex: "female" })).toBe(1614);
  });
  it("uses Katch when fat percentage is supplied", () => {
    expect(leanBodyMass(80, 20)).toBe(64);
    expect(calculateBmr({ ...profile, bodyFatPercentage: 20 })).toBeCloseTo(
      1752.4,
    );
  });
  it("applies activity once, not once again for training count", () => {
    expect(calculateTdee(profile)).toBe(2759);
    expect(calculateTdee({ ...profile, workoutsPerWeek: 6 })).toBe(2759);
  });
  it("caps aggressive automatic deficits", () => {
    expect(weightLossDeficit(0.5, 2759).recommended).toBe(550);
    expect(weightLossDeficit(1, 2000)).toEqual({
      requested: 1100,
      recommended: 500,
      capped: true,
    });
  });
  it("uses maintenance and configurable surplus", () => {
    expect(calculateTargets({ ...profile, goal: "maintenance" }).calories).toBe(
      2759,
    );
    expect(calculateTargets({ ...profile, goal: "gain" }).calories).toBe(3009);
  });
  it("calculates protein, fat and remaining carbs", () => {
    const target = calculateTargets(profile, { calories: 2000 });
    expect(target.protein).toBe(128);
    expect(target.fat).toBe(67);
    expect(target.carbs).toBe(221);
    expect(
      calculateTargets({ ...profile, bodyFatPercentage: 20 }).protein,
    ).toBe(141);
  });
  it("retains manual overrides and warns on incompatible macros", () => {
    const target = calculateTargets(profile, {
      calories: 600,
      protein: 200,
      fat: 100,
    });
    expect(target.carbs).toBe(0);
    expect(target.protein).toBe(200);
    expect(target.warnings.length).toBeGreaterThan(0);
    expect(calculateTargets(profile, { carbs: 200 }).carbs).toBe(200);
  });
  it("rejects invalid profiles and non-finite values", () => {
    expect(() => calculateBmr({ ...profile, weightKg: NaN })).toThrow();
    expect(() => calculateTargets(profile, { calories: Infinity })).toThrow();
  });
});
describe("meal allocation", () => {
  it("initializes the requested six meals at 2000 kcal", () => {
    expect(createMealSlots(2000).map((m) => m.calories)).toEqual([
      400, 130, 600, 120, 600, 150,
    ]);
  });
  it("respects locks and preserves integer totals after rounding", () => {
    const meals = createMealSlots(2000);
    meals[0].locked = true;
    const result = redistributeMeals(meals, 2137);
    expect(result.meals[0].calories).toBe(400);
    expect(result.meals.reduce((s, m) => s + m.calories, 0)).toBe(2137);
  });
  it("handles all locked, impossible locks, and zero weights", () => {
    const meals = createMealSlots(2000).map((m) => ({ ...m, locked: true }));
    expect(redistributeMeals(meals, 2000).warning).toBeTruthy();
    expect(redistributeMeals(meals, 500).warning).toBeTruthy();
    const result = redistributeMeals(
      meals.map((m) => ({ ...m, locked: false, calories: 0 })),
      2000,
    );
    expect(result.meals.reduce((s, m) => s + m.calories, 0)).toBe(2000);
  });
});
describe("nutrition and smart scaling", () => {
  it("calculates dry rice nutrition without cooked weight", () => {
    expect(ingredientNutrition(catalog.rice.nutritionPer100g, 60).kcal).toBe(
      210,
    );
  });
  it("contains exactly the 30 complete recipes with valid stable IDs", () => {
    expect(recipes).toHaveLength(30);
    expect(new Set(recipes.map((r) => r.id)).size).toBe(30);
    expect(new Set(ingredients.map((i) => i.id)).size).toBe(ingredients.length);
  });
  for (const recipe of recipes) {
    it(`${recipe.id}: derives sensible base totals and meets 600/50 constraints`, () => {
      const before = JSON.stringify(recipe);
      const base = recipeNutrition(recipe.ingredients, catalog);
      expect(base.kcal).toBeGreaterThanOrEqual(580);
      expect(base.kcal).toBeLessThanOrEqual(620);
      const scaled = scaleRecipe(recipe, catalog, 600, 50);
      expect(scaled.feasible, scaled.warnings.join(" ")).toBe(true);
      expect(scaled.nutrition.protein).toBeGreaterThanOrEqual(49.99999);
      expect(Math.abs(scaled.nutrition.kcal - 600)).toBeLessThanOrEqual(20);
      const vegetables = scaled.ingredients
        .filter((r) => r.role === "vegetable")
        .reduce((sum, r) => sum + r.grams, 0);
      expect(vegetables).toBeGreaterThanOrEqual(150);
      expect(vegetables).toBeLessThanOrEqual(250);
      expect(
        scaled.ingredients
          .filter((r) => r.role === "sauce")
          .reduce((s, r) => s + r.grams, 0),
      ).toBeGreaterThanOrEqual(recipe.minimumSauceGrams);
      for (const row of scaled.ingredients) {
        expect(row.grams).toBeGreaterThanOrEqual(row.minGrams);
        expect(row.grams).toBeLessThanOrEqual(row.maxGrams);
      }
      expect(JSON.stringify(recipe)).toBe(before);
    });
  }
  it("preserves vegetables and sauce when reducing calories", () => {
    const recipe = recipes[0];
    const scaled = scaleRecipe(recipe, catalog, 450, 45);
    for (const row of recipe.ingredients.filter((r) =>
      ["vegetable", "sauce"].includes(r.role),
    ))
      expect(
        scaled.ingredients.find((r) => r.ingredientId === row.ingredientId)!
          .grams,
      ).toBe(row.grams);
  });
  it("warns on impossible targets while respecting limits", () => {
    const result = scaleRecipe(recipes[0], catalog, 100, 200);
    expect(result.feasible).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
  it("changes all derived nutrition when catalog values change without mutating defaults", () => {
    const edited = buildCatalog({
      rice: {
        nutritionPer100g: { ...catalog.rice.nutritionPer100g, kcal: 400 },
      },
    });
    expect(
      recipeNutrition(recipes[0].ingredients, edited).kcal,
    ).toBeGreaterThan(recipeNutrition(recipes[0].ingredients, catalog).kcal);
    expect(catalog.rice.nutritionPer100g.kcal).toBe(350);
  });
});
describe("batch and yield", () => {
  const batch = resolveBatch(
    recipes
      .slice(0, 10)
      .map((r) => ({
        recipeId: r.id,
        servings: 6,
        targetCalories: 600,
        minimumProtein: 50,
      })),
    recipes,
    catalog,
  );
  it("produces 60 meals and 30 days for 10 × 6", () => {
    const summary = batchSummary(batch, 2);
    expect(summary.meals).toBe(60);
    expect(summary.days).toBe(30);
    expect(summary.averageCalories).toBeCloseTo(600);
  });
  it("aggregates exact ingredients and rounds purchases up", () => {
    const list = shoppingList(batch, catalog);
    const rice = list.find((r) => r.ingredient.id === "rice")!;
    const expected = batch.reduce(
      (sum, item) =>
        sum +
        item.scaled.ingredients.find((r) => r.ingredientId === "rice")!.grams *
          item.servings,
      0,
    );
    expect(rice.grams).toBeCloseTo(expected);
    expect(rice.packages).toBe(Math.ceil(expected / 1000));
    expect(new Set(list.map((r) => r.ingredient.id)).size).toBe(list.length);
    expect(
      sharedComponents(batch).find((r) => r.ingredientId === "rice")!.recipes,
    ).toHaveLength(10);
  });
  it("conserves total cooked yield and divides by servings", () => {
    const rows = allocateCookedYield(
      [
        { recipeId: "a", name: "A", dryGrams: 900, servings: 6 },
        { recipeId: "b", name: "B", dryGrams: 930, servings: 6 },
      ],
      4850,
    );
    expect(rows.reduce((s, r) => s + r.cookedShare, 0)).toBeCloseTo(4850);
    expect(rows[0].cookedPerServing).toBeCloseTo((4850 * 900) / 1830 / 6);
  });
  it("rejects zero or invalid yield input", () => {
    expect(() => allocateCookedYield([], 4850)).toThrow();
    expect(() =>
      allocateCookedYield(
        [{ recipeId: "a", name: "A", dryGrams: 50, servings: 0 }],
        100,
      ),
    ).toThrow();
  });
  it("plans within appliance capacity and respects all dependencies", () => {
    const plan = cookingPlan(
      batch,
      { burners: 2, ovens: 1, maxServingsPerPot: 6 },
      catalog,
    );
    for (const task of plan) {
      for (const id of task.dependencies)
        expect(task.startMinute).toBeGreaterThanOrEqual(
          plan.find((t) => t.id === id)!.endMinute,
        );
      if (task.appliance === "passive") continue;
      for (const other of plan.filter(
        (t) =>
          t.id !== task.id &&
          t.appliance === task.appliance &&
          t.resource === task.resource,
      ))
        expect(
          task.endMinute <= other.startMinute ||
            other.endMinute <= task.startMinute,
        ).toBe(true);
    }
  });
  it("splits large recipes and falls back when no oven is available", () => {
    const large = resolveBatch(
      [
        {
          recipeId: "turkey-meatballs",
          servings: 13,
          targetCalories: 600,
          minimumProtein: 50,
        },
      ],
      recipes,
      catalog,
    );
    const plan = cookingPlan(
      large,
      { burners: 1, ovens: 0, maxServingsPerPot: 6 },
      catalog,
    );
    expect(plan.filter((t) => t.id.startsWith("cook-"))).toHaveLength(3);
    expect(plan.some((t) => t.appliance === "oven")).toBe(false);
  });
});
