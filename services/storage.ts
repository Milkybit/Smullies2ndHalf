import type { AppState, Profile, TargetOverrides } from "@/domain/types";
import {
  assertValid,
  inRange,
  overrideErrors,
  profileErrors,
} from "@/domain/validation";
import { ingredients } from "@/data/ingredients";
import { recipes } from "@/data/recipes";
import { withChickenCut } from "@/data/prep-components";
import { kitchenItems } from "@/data/kitchen";

/** Keeps the pre-PrepPartner name so existing browser data still loads. */
export const STORAGE_KEY = "mealprep-planner:v1";
export const MAX_BACKUP_BYTES = 2_000_000;
export interface StorageRepository {
  load(): AppState;
  save(state: AppState): void;
  reset(): void;
}
export function initialState(): AppState {
  return {
    version: 1,
    profile: null,
    overrides: {},
    meals: [],
    ingredientOverrides: {},
    batch: [],
    mealprepsPerDay: 2,
    shoppingChecks: {},
    equipment: { burners: 4, ovens: 1, maxServingsPerPot: 6 },
    cookedYields: {},
    completedTasks: {},
    candidateRecipeIds: [],
    componentYields: {},
    cookingPlanVersion: 2,
    kitchenChecks: {},
  };
}
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const fail = (): never => {
  throw new Error(
    "Dit bestand bevat geen geldige PrepPartner-back-up (versie 1). Je huidige gegevens zijn behouden.",
  );
};
const safeKey = (key: string) =>
  key.length < 180 && !["__proto__", "constructor", "prototype"].includes(key);

/** Validate every imported field before replacement. No unchecked spreading of input. */
export function parseBackup(text: string): AppState {
  if (text.length > MAX_BACKUP_BYTES)
    throw new Error("De back-up is te groot (maximaal 2 MB).");
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error(
      "Dit is geen geldig JSON-bestand. Je huidige gegevens zijn behouden.",
    );
  }
  if (
    !record(raw) ||
    raw.version !== 1 ||
    !record(raw.overrides) ||
    !Array.isArray(raw.meals) ||
    !record(raw.ingredientOverrides) ||
    !Array.isArray(raw.batch) ||
    !record(raw.shoppingChecks) ||
    !record(raw.equipment) ||
    !record(raw.cookedYields) ||
    !record(raw.completedTasks)
  )
    return fail();
  const state = initialState();
  if (raw.profile !== null) {
    if (!record(raw.profile)) return fail();
    const p = raw.profile;
    if (
      typeof p.age !== "number" ||
      typeof p.heightCm !== "number" ||
      typeof p.weightKg !== "number" ||
      typeof p.workoutsPerWeek !== "number" ||
      typeof p.weeklyWeightLossKg !== "number" ||
      typeof p.surplusCalories !== "number" ||
      typeof p.sex !== "string" ||
      typeof p.activity !== "string" ||
      typeof p.goal !== "string" ||
      (p.bodyFatPercentage !== undefined &&
        typeof p.bodyFatPercentage !== "number")
    )
      return fail();
    const profile = p as unknown as Profile;
    assertValid(profileErrors(profile));
    state.profile = {
      age: profile.age,
      sex: profile.sex,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      bodyFatPercentage: profile.bodyFatPercentage,
      activity: profile.activity,
      workoutsPerWeek: profile.workoutsPerWeek,
      goal: profile.goal,
      weeklyWeightLossKg: profile.weeklyWeightLossKg,
      surplusCalories: profile.surplusCalories,
    };
  }
  for (const key of ["calories", "protein", "fat", "carbs"] as const) {
    if (raw.overrides[key] !== undefined) {
      if (typeof raw.overrides[key] !== "number") return fail();
      state.overrides[key] = raw.overrides[key];
    }
  }
  assertValid(overrideErrors(state.overrides as TargetOverrides));
  if (raw.meals.length > 30) return fail();
  const mealIds = new Set<string>();
  for (const row of raw.meals) {
    if (
      !record(row) ||
      typeof row.id !== "string" ||
      !safeKey(row.id) ||
      mealIds.has(row.id) ||
      typeof row.name !== "string" ||
      !row.name.trim() ||
      row.name.length > 80 ||
      !inRange(row.calories, 0, 10000) ||
      typeof row.locked !== "boolean"
    )
      return fail();
    mealIds.add(row.id);
    state.meals.push({
      id: row.id,
      name: row.name,
      calories: row.calories,
      locked: row.locked,
    });
  }
  for (const [id, value] of Object.entries(raw.ingredientOverrides)) {
    if (
      !ingredients.some((item) => item.id === id) ||
      !record(value) ||
      !record(value.nutritionPer100g)
    )
      return fail();
    const n = value.nutritionPer100g;
    if (
      !inRange(n.kcal, 0, 1000) ||
      !inRange(n.protein, 0, 100) ||
      !inRange(n.carbs, 0, 100) ||
      !inRange(n.fat, 0, 100) ||
      !inRange(n.fiber, 0, 100) ||
      (value.defaultPackageSize !== undefined &&
        !inRange(value.defaultPackageSize, 1, 100000))
    )
      return fail();
    state.ingredientOverrides[id] = {
      nutritionPer100g: {
        kcal: n.kcal,
        protein: n.protein,
        carbs: n.carbs,
        fat: n.fat,
        fiber: n.fiber,
      },
      defaultPackageSize: value.defaultPackageSize,
    };
  }
  const recipeIds = new Set<string>();
  if (raw.batch.length > recipes.length) return fail();
  for (const row of raw.batch) {
    if (
      !record(row) ||
      typeof row.recipeId !== "string" ||
      !recipes.some((recipe) => recipe.id === row.recipeId) ||
      recipeIds.has(row.recipeId) ||
      !inRange(row.servings, 1, 100) ||
      !Number.isInteger(row.servings) ||
      !inRange(row.targetCalories, 100, 2000) ||
      !inRange(row.minimumProtein, 0, 200) ||
      (row.chickenCut !== undefined &&
        !["chicken-thigh", "chicken-breast"].includes(String(row.chickenCut)))
    )
      return fail();
    recipeIds.add(row.recipeId);
    state.batch.push({
      recipeId: row.recipeId,
      servings: row.servings,
      targetCalories: row.targetCalories,
      minimumProtein: row.minimumProtein,
      ...(row.chickenCut
        ? { chickenCut: row.chickenCut as "chicken-thigh" | "chicken-breast" }
        : {}),
    });
  }
  if (
    !inRange(raw.mealprepsPerDay, 1, 10) ||
    !Number.isInteger(raw.mealprepsPerDay)
  )
    return fail();
  state.mealprepsPerDay = raw.mealprepsPerDay;
  const e = raw.equipment;
  if (
    !inRange(e.burners, 1, 8) ||
    !Number.isInteger(e.burners) ||
    !inRange(e.ovens, 0, 4) ||
    !Number.isInteger(e.ovens) ||
    !inRange(e.maxServingsPerPot, 1, 20) ||
    !Number.isInteger(e.maxServingsPerPot)
  )
    return fail();
  state.equipment = {
    burners: e.burners,
    ovens: e.ovens,
    maxServingsPerPot: e.maxServingsPerPot,
  };
  for (const key of ["maxProteinGrams", "maxDryCarbGrams"] as const) {
    if (e[key] !== undefined) {
      if (
        !inRange(
          e[key],
          key === "maxProteinGrams" ? 300 : 100,
          key === "maxProteinGrams" ? 5000 : 3000,
        )
      )
        return fail();
      state.equipment[key] = e[key];
    }
  }
  if (raw.candidateRecipeIds !== undefined) {
    if (
      !Array.isArray(raw.candidateRecipeIds) ||
      raw.candidateRecipeIds.length > recipes.length ||
      raw.candidateRecipeIds.some(
        (id) => typeof id !== "string" || !recipes.some((r) => r.id === id),
      )
    )
      return fail();
    state.candidateRecipeIds = [...new Set(raw.candidateRecipeIds as string[])];
  }
  if (raw.componentYields !== undefined) {
    if (
      !record(raw.componentYields) ||
      Object.keys(raw.componentYields).length > 2000
    )
      return fail();
    const knownIds = new Set(
      recipes.flatMap((r) =>
        [
          r,
          withChickenCut(r, "chicken-thigh"),
          withChickenCut(r, "chicken-breast"),
        ].flatMap((variant) =>
          variant.componentRefs.map((ref) => ref.component.id),
        ),
      ),
    );
    for (const [id, value] of Object.entries(raw.componentYields)) {
      const lot = /^lot-component-[1-9][0-9]*-(.+)-[1-9][0-9]*$/.exec(id);
      const mixedLot = /^lot-cook-(.+)-[1-9][0-9]*$/.exec(id);
      if (
        !safeKey(id) ||
        (!knownIds.has(id) &&
          !(lot && knownIds.has(lot[1])) &&
          !(mixedLot && knownIds.has(`mixed-${mixedLot[1]}`))) ||
        !record(value) ||
        typeof value.signature !== "string" ||
        value.signature.length > 20000 ||
        !inRange(value.cookedGrams, 1, 5000000)
      )
        return fail();
      state.componentYields![id] = {
        signature: value.signature,
        cookedGrams: value.cookedGrams,
      };
    }
  }
  for (const [id, value] of Object.entries(raw.shoppingChecks)) {
    if (
      !ingredients.some((item) => item.id === id) ||
      typeof value !== "string" ||
      value.length > 150
    )
      return fail();
    state.shoppingChecks[id] = value;
  }
  for (const [id, value] of Object.entries(raw.cookedYields)) {
    if (
      !ingredients.some((item) => item.id === id) ||
      !record(value) ||
      !inRange(value.dryGrams, 0.1, 1000000) ||
      !inRange(value.cookedGrams, 1, 5000000)
    )
      return fail();
    state.cookedYields[id] = {
      dryGrams: value.dryGrams,
      cookedGrams: value.cookedGrams,
    };
  }
  if (Object.keys(raw.completedTasks).length > 10000) return fail();
  if (raw.cookingPlanVersion !== undefined && raw.cookingPlanVersion !== 2)
    return fail();
  for (const [id, value] of Object.entries(raw.completedTasks)) {
    if (!safeKey(id) || typeof value !== "boolean") return fail();
    // Recipe-first checklist IDs must not mark different component tasks done.
    if (raw.cookingPlanVersion === 2) state.completedTasks[id] = value;
  }
  // Optional: backups made before the kitchen list have no kitchenChecks.
  if (raw.kitchenChecks !== undefined) {
    if (
      !record(raw.kitchenChecks) ||
      Object.keys(raw.kitchenChecks).length > 1000
    )
      return fail();
    for (const [id, value] of Object.entries(raw.kitchenChecks)) {
      if (!safeKey(id) || typeof value !== "boolean") return fail();
      // Items removed from the list in a later version are dropped, not rejected.
      if (kitchenItems.some((item) => item.id === id))
        state.kitchenChecks[id] = value;
    }
  }
  return state;
}
export function browserRepository(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
): StorageRepository {
  return {
    load() {
      const value = storage.getItem(STORAGE_KEY);
      return value ? parseBackup(value) : initialState();
    },
    save(state) {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    reset() {
      storage.removeItem(STORAGE_KEY);
    },
  };
}
