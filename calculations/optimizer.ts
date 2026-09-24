import type {
  BatchItem,
  IngredientCatalog,
  ProteinSource,
  Recipe,
} from "@/domain/types";
import { withChickenCut } from "@/data/prep-components";
import { scaleRecipe } from "./scaling";
import {
  calculateBatchDiversity,
  calculateBatchEfficiency,
} from "./compatibility";

export type OptimizationPreference =
  | "maximum_efficiency"
  | "balanced"
  | "maximum_variety";
export interface OptimizerInput {
  candidateRecipeIds: string[];
  desiredRecipeCount: number;
  servingsPerRecipe: number;
  totalMealTarget: number;
  targetCalories: number;
  minimumProtein: number;
  requiredProteinDiversity: number;
  requiredFlavourDiversity: number;
  requiredSauceDiversity: number;
  excludedIngredientIds?: string[];
  excludedRecipeIds?: string[];
  favouriteRecipeIds?: string[];
  requiredRecipeIds?: string[];
  optimizationPreference: OptimizationPreference;
  chickenCut?: "chicken-thigh" | "chicken-breast";
  minimumRecipesByProtein?: Partial<Record<ProteinSource, number>>;
  preferredAsian?: boolean;
  preferredLegumes?: boolean;
  minimumFreezerScore?: number;
  minimumMicrowaveScore?: number;
}
export const OPTIMIZER_WEIGHTS = {
  modes: {
    maximum_efficiency: { efficiency: 0.8, diversity: 0.2 },
    balanced: { efficiency: 0.6, diversity: 0.4 },
    maximum_variety: { efficiency: 0.25, diversity: 0.75 },
  },
  favourite: 12,
  asian: 8,
  legumes: 4,
  quality: 2,
  constraintPenalty: 1000,
  epsilon: 0.000001,
  preparationPenalty: 0.05,
  passiveWorkFactor: 0.25,
};
export function estimateComponentWork(recipes: Recipe[]) {
  const components = new Map(
    recipes.flatMap((r) =>
      r.componentRefs.map((ref) => [ref.component.id, ref.component] as const),
    ),
  );
  return [...components.values()].reduce(
    (sum, c) =>
      sum +
      c.activeMinutes +
      c.passiveMinutes * OPTIMIZER_WEIGHTS.passiveWorkFactor,
    0,
  );
}
export function optimizeRecipeBatch(
  input: OptimizerInput,
  recipes: Recipe[],
  catalog: IngredientCatalog,
) {
  const n = input.desiredRecipeCount,
    servings = input.servingsPerRecipe;
  if (
    !Number.isInteger(n) ||
    n < 1 ||
    n > 30 ||
    !Number.isInteger(servings) ||
    servings < 1 ||
    servings > 100 ||
    input.totalMealTarget !== n * servings
  )
    throw new Error(
      "Het aantal maaltijden moet gelijk zijn aan recepten × porties (1–30 recepten, 1–100 porties).",
    );
  if (!Object.hasOwn(OPTIMIZER_WEIGHTS.modes, input.optimizationPreference))
    throw new Error("Kies een geldige optimalisatiemodus.");
  for (const quality of [
    input.minimumFreezerScore ?? 1,
    input.minimumMicrowaveScore ?? 1,
  ])
    if (!Number.isInteger(quality) || quality < 1 || quality > 5)
      throw new Error("Kwaliteitsscores moeten tussen 1 en 5 liggen.");
  if (input.excludedIngredientIds?.some((id) => !Object.hasOwn(catalog, id)))
    throw new Error("Onbekend uitgesloten ingrediënt.");
  for (const minimum of [
    input.requiredProteinDiversity,
    input.requiredFlavourDiversity,
    input.requiredSauceDiversity,
    ...Object.values(input.minimumRecipesByProtein ?? {}),
  ])
    if (!Number.isInteger(minimum) || minimum < 0 || minimum > n)
      throw new Error(
        "Een minimum moet tussen 0 en het aantal recepten liggen.",
      );
  const candidates = [...new Set(input.candidateRecipeIds)].sort();
  if (candidates.some((id) => !recipes.some((r) => r.id === id)))
    throw new Error("Onbekend kandidaatrecept.");
  const required = [...new Set(input.requiredRecipeIds ?? [])].sort();
  if (required.length > n || required.some((id) => !candidates.includes(id)))
    throw new Error(
      "Verplichte recepten moeten kandidaat zijn en binnen het gewenste aantal passen.",
    );
  const rejected: { recipeId: string; reason: string }[] = [];
  const eligible = candidates
    .map((id) =>
      withChickenCut(recipes.find((r) => r.id === id)!, input.chickenCut),
    )
    .filter((r) => {
      let reason = "";
      if (input.excludedRecipeIds?.includes(r.id))
        reason = "Recept uitgesloten";
      else if (
        r.ingredientIds.some((id) => input.excludedIngredientIds?.includes(id))
      )
        reason = "Uitgesloten ingrediënt";
      else if (
        r.freezerScore < (input.minimumFreezerScore ?? 1) ||
        r.microwaveScore < (input.minimumMicrowaveScore ?? 1)
      )
        reason = "Bewaar- of opwarmkwaliteit";
      else if (
        !scaleRecipe(r, catalog, input.targetCalories, input.minimumProtein)
          .feasible
      )
        reason = "Voedingsdoel niet haalbaar binnen receptgrenzen";
      if (reason) rejected.push({ recipeId: r.id, reason });
      return !reason;
    });
  if (required.some((id) => !eligible.some((r) => r.id === id)))
    throw new Error(
      "Een verplicht recept botst met je uitsluitingen, kwaliteitseisen of voedingsdoel.",
    );
  if (eligible.length < n)
    throw new Error(
      `Slechts ${eligible.length} geschikte recepten voor ${n} plaatsen. Verruim kandidaten of doelen.`,
    );
  const mode = OPTIMIZER_WEIGHTS.modes[input.optimizationPreference];
  const deficit = (rows: Recipe[]) => {
    const counts = calculateBatchDiversity(rows).counts;
    return (
      Math.max(0, input.requiredProteinDiversity - counts.proteins) +
      Math.max(0, input.requiredSauceDiversity - counts.sauces) +
      Math.max(0, input.requiredFlavourDiversity - counts.flavours) +
      Object.entries(input.minimumRecipesByProtein ?? {}).reduce(
        (sum, [source, min]) =>
          sum +
          Math.max(
            0,
            min - rows.filter((r) => r.proteinSource === source).length,
          ),
        0,
      )
    );
  };
  const preference = (r: Recipe) =>
    (input.favouriteRecipeIds?.includes(r.id)
      ? OPTIMIZER_WEIGHTS.favourite
      : 0) +
    (input.preferredAsian && r.batchTags.includes("asian")
      ? OPTIMIZER_WEIGHTS.asian
      : 0) +
    (input.preferredLegumes &&
    r.ingredients.some((row) => row.role === "legume")
      ? OPTIMIZER_WEIGHTS.legumes
      : 0) +
    (OPTIMIZER_WEIGHTS.quality * (r.freezerScore + r.microwaveScore)) / 10;
  const cache = new Map<string, number>();
  const key = (rows: Recipe[]) =>
    rows
      .map((r) => r.id)
      .sort()
      .join("|");
  const score = (rows: Recipe[]) => {
    const id = key(rows),
      found = cache.get(id);
    if (found !== undefined) return found;
    const value =
      calculateBatchEfficiency(rows).score * mode.efficiency +
      calculateBatchDiversity(rows).score * mode.diversity +
      rows.reduce((sum, r) => sum + preference(r), 0) / n -
      estimateComponentWork(rows) * OPTIMIZER_WEIGHTS.preparationPenalty -
      deficit(rows) * OPTIMIZER_WEIGHTS.constraintPenalty;
    cache.set(id, value);
    return value;
  };
  let best: Recipe[] = [],
    bestScore = -Infinity;
  const fixed = eligible.filter((r) => required.includes(r.id));
  for (const start of eligible) {
    let selection =
      fixed.includes(start) || fixed.length === n
        ? [...fixed]
        : [...fixed, start];
    while (selection.length < n) {
      const choices = eligible
        .filter((r) => !selection.includes(r))
        .map((r) => ({ r, score: score([...selection, r]) }))
        .sort((a, b) => b.score - a.score || a.r.id.localeCompare(b.r.id));
      selection.push(choices[0].r);
    }
    // Strictly increasing objective over a finite set; deterministic best-improving swaps.
    while (true) {
      let next = selection,
        nextScore = score(selection);
      for (const removed of selection.filter((r) => !required.includes(r.id)))
        for (const added of eligible.filter((r) => !selection.includes(r))) {
          const alternative = selection.map((r) => (r === removed ? added : r)),
            value = score(alternative);
          if (value > nextScore + OPTIMIZER_WEIGHTS.epsilon) {
            next = alternative;
            nextScore = value;
          }
        }
      if (next === selection) break;
      selection = next;
    }
    const value = score(selection);
    if (
      !deficit(selection) &&
      (value > bestScore + OPTIMIZER_WEIGHTS.epsilon ||
        (Math.abs(value - bestScore) <= OPTIMIZER_WEIGHTS.epsilon &&
          key(selection) < key(best)))
    ) {
      best = selection;
      bestScore = value;
    }
  }
  if (!best.length)
    throw new Error(
      "De zoekmethode vond geen batch die alle minimumvoorwaarden haalt. Verruim de kandidaten of verlaag de variatie-eisen.",
    );
  best.sort(
    (a, b) =>
      a.sauceFamily.localeCompare(b.sauceFamily) || a.id.localeCompare(b.id),
  );
  const batch: BatchItem[] = best.map((r) => ({
    recipeId: r.id,
    servings,
    targetCalories: input.targetCalories,
    minimumProtein: input.minimumProtein,
    ...(r.proteinSource === "chicken" && input.chickenCut
      ? { chickenCut: input.chickenCut }
      : {}),
  }));
  return {
    batch,
    efficiency: calculateBatchEfficiency(best),
    diversity: calculateBatchDiversity(best),
    rejected,
    reasons: best.map((r) => ({
      recipeId: r.id,
      reasons: [
        required.includes(r.id)
          ? "Verplicht gekozen"
          : "Past bij de combinatie",
        `${best.filter((other) => other.sauceFamily === r.sauceFamily).length} recepten uit deze sausfamilie`,
        `${best.filter((other) => other.proteinIngredientId === r.proteinIngredientId && other.proteinPrepMethod === r.proteinPrepMethod).length} recepten delen deze eiwitbereiding`,
        ...(input.favouriteRecipeIds?.includes(r.id) ? ["Favoriet"] : []),
        ...(r.batchTags.includes("asian") && input.preferredAsian
          ? ["Aziatische voorkeur"]
          : []),
      ],
    })),
    componentWork: estimateComponentWork(best),
    explanation: `Deterministische zoekmethode, geen garantie op het globale optimum. Afweging: ${mode.efficiency * 100}% efficiëntie en ${mode.diversity * 100}% variatie, plus voorkeuren. Minder bereidingswerk krijgt voorrang: per unieke component tellen actieve minuten + 25% van wachttijd mee (aftrek ${OPTIMIZER_WEIGHTS.preparationPenalty} punt per eenheid). Dit is een vergelijkingsmaat; de kookplanning berekent de tijd en capaciteitsrondes. Voedingsdoelen en minimumvoorwaarden zijn harde eisen.`,
  };
}
