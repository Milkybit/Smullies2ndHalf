import { describe, it, expect } from "vitest";
import { recipes } from "@/data/recipes";
import { buildCatalog } from "@/data/ingredients";
import { withChickenCut } from "@/data/prep-components";
import { SIXTY_MEAL_SCENARIO as scenario } from "@/data/optimizer-scenario";
import {
  calculateRecipeCompatibility,
  calculateBatchEfficiency,
  calculateBatchDiversity,
} from "@/calculations/compatibility";
import { optimizeRecipeBatch } from "@/calculations/optimizer";
import {
  aggregatePrepComponents,
  allocateComponentYield,
  generatePrepList,
  productionYieldLots,
} from "@/calculations/components";
import { resolveBatch, shoppingList } from "@/calculations/batch";
import { cookingPlan } from "@/calculations/cooking";
import { initialState, parseBackup } from "@/services/storage";
const catalog = buildCatalog();
const recipe = (id: string) => recipes.find((r) => r.id === id)!;
const result = optimizeRecipeBatch(scenario, recipes, catalog);
const batch = resolveBatch(result.batch, recipes, catalog);
describe("structured recipe compatibility", () => {
  it("compares preparation attributes, independent of names", () => {
    const a = withChickenCut(recipe("teriyaki"), "chicken-thigh"),
      b = withChickenCut(recipe("gochujang-chicken"), "chicken-thigh");
    const score = calculateRecipeCompatibility(a, b);
    expect(score.normalizedScore).toBeGreaterThan(
      calculateRecipeCompatibility(a, recipe("tuna-arrabbiata"))
        .normalizedScore,
    );
    expect(score).toEqual(
      calculateRecipeCompatibility({ ...a, nameNl: "renamed" }, b),
    );
    expect(score.sharedAttributes).toContain("Sausbasis");
    expect(score.differences).toContain("Smaakafwerking");
    expect(calculateRecipeCompatibility(a, b).normalizedScore).toBe(
      calculateRecipeCompatibility(b, a).normalizedScore,
    );
  });
  it("does not reward different cuts or methods as the same protein", () => {
    expect(
      calculateRecipeCompatibility(
        recipe("teriyaki"),
        recipe("gochujang-chicken"),
      ).sharedAttributes,
    ).not.toContain("Eiwitbereiding");
    expect(
      calculateRecipeCompatibility(
        recipe("turkey-chili"),
        recipe("turkey-meatballs"),
      ).sharedAttributes,
    ).not.toContain("Eiwitbereiding");
  });
  it("ignores pantry-only ingredient overlap", () => {
    const a = {
      ...recipe("teriyaki"),
      ingredientIds: ["salt", "water", "cumin", "black-pepper"],
    };
    expect(calculateRecipeCompatibility(a, a).sharedIngredients).toEqual([]);
  });
  it("reports whole-batch reuse and separate flavour diversity", () => {
    const matching = [
      recipe("teriyaki"),
      withChickenCut(recipe("honey-soy-chicken"), "chicken-thigh"),
    ];
    const unrelated = [recipe("teriyaki"), recipe("tuna-arrabbiata")];
    expect(calculateBatchEfficiency(matching).score).toBeGreaterThan(
      calculateBatchEfficiency(unrelated).score,
    );
    expect(calculateBatchDiversity(matching).score).toBeLessThan(
      calculateBatchDiversity(unrelated).score,
    );
    expect(calculateBatchEfficiency([]).score).toBe(0);
    expect(calculateBatchDiversity([]).score).toBe(0);
    expect(
      calculateBatchEfficiency(recipes).breakdown.reduce(
        (sum, r) => sum + r.weight,
        0,
      ),
    ).toBe(100);
  });
});
describe("deterministic constrained optimizer", () => {
  it("chooses 10 from 15 for 60 meals and meets every nutrition and preference constraint", () => {
    expect(scenario.candidateRecipeIds).toHaveLength(15);
    expect(batch).toHaveLength(10);
    expect(new Set(batch.map((r) => r.recipeId)).size).toBe(10);
    expect(batch.reduce((sum, r) => sum + r.servings, 0)).toBe(60);
    expect(
      batch.filter((r) => r.recipe.proteinSource === "chicken").length,
    ).toBeGreaterThanOrEqual(6);
    expect(
      batch.filter((r) => r.recipe.proteinSource === "beef").length,
    ).toBeGreaterThanOrEqual(2);
    expect(result.diversity.counts.proteins).toBeGreaterThanOrEqual(2);
    expect(result.diversity.counts.sauces).toBeGreaterThanOrEqual(3);
    expect(result.diversity.counts.flavours).toBeGreaterThanOrEqual(3);
    for (const item of batch) {
      expect(item.scaled.feasible).toBe(true);
      expect(item.scaled.nutrition.protein).toBeGreaterThanOrEqual(49.99999);
      expect(Math.abs(item.scaled.nutrition.kcal - 600)).toBeLessThanOrEqual(
        20,
      );
      if (item.recipe.proteinSource === "chicken")
        expect(item.recipe.proteinIngredientId).toBe("chicken-thigh");
    }
    expect(
      batch.some((r) =>
        r.recipe.ingredients.some((row) => row.role === "legume"),
      ),
    ).toBe(true);
  });
  it("is deterministic under candidate order changes and never mutates seeds", () => {
    const before = JSON.stringify(recipes);
    expect(
      optimizeRecipeBatch(
        {
          ...scenario,
          candidateRecipeIds: [...scenario.candidateRecipeIds].reverse(),
        },
        recipes,
        catalog,
      ),
    ).toEqual(result);
    expect(JSON.stringify(recipes)).toBe(before);
  });
  it("honours required and excluded recipes", () => {
    const r = optimizeRecipeBatch(
      {
        ...scenario,
        requiredRecipeIds: ["teriyaki"],
        excludedRecipeIds: ["tuna-cannellini"],
      },
      recipes,
      catalog,
    );
    expect(r.batch.some((row) => row.recipeId === "teriyaki")).toBe(true);
    expect(r.batch.some((row) => row.recipeId === "tuna-cannellini")).toBe(
      false,
    );
  });
  it("applies ingredient exclusions after the chicken substitution", () => {
    const r = optimizeRecipeBatch(
      {
        ...scenario,
        excludedIngredientIds: ["chicken-breast", "peanut-butter"],
      },
      recipes,
      catalog,
    );
    expect(
      resolveBatch(r.batch, recipes, catalog)
        .flatMap((r) => r.scaled.ingredients)
        .some((row) =>
          ["chicken-breast", "peanut-butter"].includes(row.ingredientId),
        ),
    ).toBe(false);
  });
  it("rejects inconsistent totals and impossible requirements without returning a partial plan", () => {
    expect(() =>
      optimizeRecipeBatch(
        { ...scenario, totalMealTarget: 61 },
        recipes,
        catalog,
      ),
    ).toThrow(/gelijk/);
    expect(() =>
      optimizeRecipeBatch(
        {
          ...scenario,
          requiredRecipeIds: ["teriyaki"],
          excludedRecipeIds: ["teriyaki"],
        },
        recipes,
        catalog,
      ),
    ).toThrow(/verplicht/);
    expect(() =>
      optimizeRecipeBatch(
        { ...scenario, requiredProteinDiversity: 6 },
        recipes,
        catalog,
      ),
    ).toThrow(/zoekmethode/);
    expect(() =>
      optimizeRecipeBatch(
        { ...scenario, targetCalories: 100, minimumProtein: 200 },
        recipes,
        catalog,
      ),
    ).toThrow(/geschikte/);
  });
  it("changes the trade-off with mode while still meeting hard constraints", () => {
    const efficient = optimizeRecipeBatch(
      { ...scenario, optimizationPreference: "maximum_efficiency" },
      recipes,
      catalog,
    );
    const varied = optimizeRecipeBatch(
      { ...scenario, optimizationPreference: "maximum_variety" },
      recipes,
      catalog,
    );
    expect(efficient.efficiency.score).toBeGreaterThanOrEqual(
      varied.efficiency.score,
    );
    expect(varied.diversity.score).toBeGreaterThanOrEqual(
      efficient.diversity.score,
    );
  });
  it("rechecks nutrition against ingredient overrides", () => {
    const changed = buildCatalog({
      "chicken-thigh": {
        nutritionPer100g: {
          ...catalog["chicken-thigh"].nutritionPer100g,
          protein: 0,
          kcal: 900,
        },
      },
    });
    expect(() => optimizeRecipeBatch(scenario, recipes, changed)).toThrow();
  });
});
describe("component quantities and yield", () => {
  for (const cut of [undefined, "chicken-thigh", "chicken-breast"] as const)
    it(`conserves every ingredient across all 30 recipes, cut ${cut}`, () => {
      const all = resolveBatch(
        recipes.map((r) => ({
          recipeId: r.id,
          servings: 6,
          targetCalories: 600,
          minimumProtein: 50,
          chickenCut: cut,
        })),
        recipes,
        catalog,
      );
      const sums = new Map<string, number>();
      for (const c of aggregatePrepComponents(all))
        for (const row of c.ingredientQuantities)
          sums.set(
            row.ingredientId,
            (sums.get(row.ingredientId) ?? 0) + row.grams,
          );
      const shopping = shoppingList(all, catalog);
      expect(sums.size).toBe(shopping.length);
      for (const row of shopping)
        expect(sums.get(row.ingredient.id)).toBeCloseTo(row.grams, 8);
    });
  it("mixes only an identical sauce ratio and leaves the rest in recipe finishers", () => {
    const two = resolveBatch(
      ["teriyaki", "gochujang-chicken"].map((recipeId) => ({
        recipeId,
        servings: 6,
        targetCalories: 600,
        minimumProtein: 50,
      })),
      recipes,
      catalog,
    );
    const components = aggregatePrepComponents(two),
      soy = components.find((c) => c.component.id === "soy-ginger-base")!;
    expect(soy.inputGrams).toBe(252);
    expect(
      soy.ingredientQuantities.find((r) => r.ingredientId === "soy-sauce")!
        .grams,
    ).toBe(120);
    expect(
      components
        .find((c) => c.component.id === "finish-teriyaki")!
        .ingredientQuantities.find((r) => r.ingredientId === "soy-sauce")!
        .grams,
    ).toBe(30);
  });
  it("allocates all measured output proportional to inputs and keeps calories unchanged", () => {
    const before = JSON.stringify(batch),
      protein = aggregatePrepComponents(batch).find(
        (c) => c.component.type === "protein",
      )!;
    const allocation = allocateComponentYield(protein, 4980);
    expect(allocation.reduce((sum, r) => sum + r.cookedShare, 0)).toBeCloseTo(
      4980,
    );
    expect(allocation[0].cookedPerServing).toBeCloseTo(
      (4980 * protein.recipes[0].grams) /
        protein.inputGrams /
        protein.recipes[0].servings,
    );
    expect(JSON.stringify(batch)).toBe(before);
    expect(() => allocateComponentYield(protein, NaN)).toThrow();
  });
  it("invalidates measured yield when allocation changes but the total weight stays equal", () => {
    const before = aggregatePrepComponents(batch).find(
      (c) => c.component.type === "sauce_base" && c.recipes.length > 1,
    )!;
    const modified = batch.map((r) => ({
      ...r,
      servings:
        r.recipeId === before.recipes[0].recipeId
          ? 5
          : r.recipeId === before.recipes[1].recipeId
            ? 7
            : r.servings,
    }));
    const after = aggregatePrepComponents(modified).find(
      (c) => c.component.id === before.component.id,
    )!;
    expect(after.inputGrams).toBeCloseTo(before.inputGrams);
    expect(after.signature).not.toBe(before.signature);
  });
  it("generates one chop total per ingredient without counting sauce garlic twice", () => {
    const prep = generatePrepList(batch, catalog),
      shopping = shoppingList(batch, catalog);
    expect(new Set(prep.chop.map((r) => r.ingredient.id)).size).toBe(
      prep.chop.length,
    );
    expect(
      prep.chop.find((r) => r.ingredient.id === "garlic")!.grams,
    ).toBeCloseTo(shopping.find((r) => r.ingredient.id === "garlic")!.grams);
    expect(prep.bases.length).toBeGreaterThan(1);
    expect(prep.bulk.some((c) => c.component.type === "carbohydrate")).toBe(
      true,
    );
  });
});
describe("component production schedule", () => {
  it("uses a free burner for a small chicken remainder instead of an extra oven round", () => {
    const tasks = cookingPlan(
      batch,
      { burners: 4, ovens: 1, maxServingsPerPot: 6 },
      catalog,
    );
    const overflow = tasks.filter(
      (t) =>
        t.id.startsWith("component-") &&
        t.componentId === "chicken-thigh-roast-basic" &&
        t.appliance === "burner",
    );
    expect(overflow.length).toBeGreaterThan(0);
    for (const t of overflow) expect(t.inputGrams).toBeLessThanOrEqual(750);
  });
  it("allows immediate per-round weighing without losing any protein or grain allocations", () => {
    const tasks = cookingPlan(
        batch,
        { burners: 4, ovens: 1, maxServingsPerPot: 6 },
        catalog,
      ),
      components = aggregatePrepComponents(batch);
    const lots = productionYieldLots(tasks, components);
    for (const source of components.filter((c) =>
      ["protein", "carbohydrate"].includes(c.component.type),
    )) {
      const parts = lots.filter(
        (l) => l.entry.component.id === source.component.id,
      );
      expect(parts.reduce((sum, p) => sum + p.entry.inputGrams, 0)).toBeCloseTo(
        source.inputGrams,
      );
      for (const allocation of source.recipes)
        expect(
          parts.reduce(
            (sum, p) =>
              sum +
              (p.entry.recipes.find((r) => r.recipeId === allocation.recipeId)
                ?.grams ?? 0),
            0,
          ),
        ).toBeCloseTo(allocation.grams);
    }
    const first = lots[0];
    const state = {
      ...initialState(),
      componentYields: {
        [first.key]: { signature: first.entry.signature, cookedGrams: 800 },
      },
    };
    expect(parseBackup(JSON.stringify(state)).componentYields).toEqual(
      state.componentYields,
    );
  });
  for (const burners of [1, 4])
    for (const ovens of [0, 1])
      it(`respects dependencies, ${burners} burners, ${ovens} ovens and one cook`, () => {
        const tasks = cookingPlan(
          batch,
          { burners, ovens, maxServingsPerPot: 6 },
          catalog,
        );
        expect(new Set(tasks.map((t) => t.id)).size).toBe(tasks.length);
        for (const task of tasks) {
          expect(Number.isFinite(task.endMinute)).toBe(true);
          for (const id of task.dependencies)
            expect(task.startMinute).toBeGreaterThanOrEqual(
              tasks.find((t) => t.id === id)!.endMinute,
            );
          if (task.appliance === "burner")
            expect(task.resource).toBeLessThanOrEqual(burners);
          if (task.appliance === "oven")
            expect(task.resource).toBeLessThanOrEqual(ovens);
          for (const other of tasks.filter((t) => t.id !== task.id)) {
            if (
              task.appliance !== "passive" &&
              task.appliance === other.appliance &&
              task.resource === other.resource
            )
              expect(
                (task.applianceReleaseMinute ?? task.endMinute) <=
                  other.startMinute ||
                  (other.applianceReleaseMinute ?? other.endMinute) <=
                    task.startMinute,
              ).toBe(true);
            for (const a of task.attentionWindows ?? [])
              for (const b of other.attentionWindows ?? [])
                expect(
                  task.startMinute + a.offset + a.minutes <=
                    other.startMinute + b.offset ||
                    other.startMinute + b.offset + b.minutes <=
                      task.startMinute + a.offset,
                ).toBe(true);
          }
        }
        expect(tasks.filter((t) => t.id.startsWith("base-")).length).toBe(
          generatePrepList(batch, catalog).bases.length,
        );
        expect(
          tasks.filter(
            (t) =>
              t.id.startsWith("component-") && t.componentId === "basmati-rice",
          ).length,
        ).toBeLessThan(10);
        for (const t of tasks.filter(
          (t) =>
            t.id.startsWith("component-") &&
            t.componentId?.includes("chicken-thigh"),
        ))
          expect(t.inputGrams).toBeLessThanOrEqual(ovens ? 1500 : 750);
      });
  it("delays rice until a long stew is ready and puts other dishes in another wave", () => {
    const two = resolveBatch(
      ["rendang", "teriyaki"].map((recipeId) => ({
        recipeId,
        servings: 6,
        targetCalories: 600,
        minimumProtein: 50,
      })),
      recipes,
      catalog,
    );
    const tasks = cookingPlan(
      two,
      { burners: 4, ovens: 1, maxServingsPerPot: 6 },
      catalog,
    );
    const stew = tasks.find((t) => t.id.startsWith("cook-rendang"))!;
    const rice = tasks.find(
      (t) => t.componentId === "basmati-rice" && t.group === stew.group,
    )!;
    expect(rice.startMinute).toBeGreaterThanOrEqual(stew.endMinute);
  });
  it("rejects invalid capacity without creating infinite or impossible schedules", () => {
    expect(() =>
      cookingPlan(
        batch,
        { burners: 0, ovens: 1, maxServingsPerPot: 6 },
        catalog,
      ),
    ).toThrow();
    expect(() =>
      cookingPlan(
        batch,
        { burners: 4, ovens: 1, maxServingsPerPot: 6, maxDryCarbGrams: NaN },
        catalog,
      ),
    ).toThrow();
  });
});
describe("backward-compatible persistence", () => {
  it("loads old v1 backups and preserves new candidates, cuts, capacities and yields", () => {
    const legacy = initialState();
    delete legacy.candidateRecipeIds;
    delete legacy.componentYields;
    delete legacy.cookingPlanVersion;
    legacy.completedTasks = { "cook-teriyaki-1": true };
    expect(parseBackup(JSON.stringify(legacy)).componentYields).toEqual({});
    expect(parseBackup(JSON.stringify(legacy)).completedTasks).toEqual({});
    const component = aggregatePrepComponents(batch)[0];
    const current = {
      ...initialState(),
      batch: result.batch,
      candidateRecipeIds: scenario.candidateRecipeIds,
      equipment: {
        burners: 4,
        ovens: 1,
        maxServingsPerPot: 6,
        maxProteinGrams: 1200,
        maxDryCarbGrams: 800,
      },
      componentYields: {
        [component.component.id]: {
          signature: component.signature,
          cookedGrams: 2000,
        },
      },
    };
    expect(parseBackup(JSON.stringify(current))).toEqual(current);
    expect(() =>
      parseBackup(
        JSON.stringify({
          ...current,
          componentYields: { unknown: { signature: "", cookedGrams: 2 } },
        }),
      ),
    ).toThrow();
  });
});
