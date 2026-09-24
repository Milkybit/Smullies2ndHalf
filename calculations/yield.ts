export interface DryAllocation {
  recipeId: string;
  name: string;
  dryGrams: number;
  servings: number;
}
export function allocateCookedYield(
  allocations: DryAllocation[],
  totalCookedGrams: number,
) {
  if (!Number.isFinite(totalCookedGrams) || totalCookedGrams <= 0)
    throw new Error("Vul een gekookt gewicht groter dan 0 g in.");
  if (
    allocations.some(
      (row) =>
        !Number.isFinite(row.dryGrams) ||
        row.dryGrams < 0 ||
        !Number.isInteger(row.servings) ||
        row.servings < 1,
    )
  )
    throw new Error("Ongeldige porties of droge hoeveelheden.");
  const totalDryGrams = allocations.reduce((sum, row) => sum + row.dryGrams, 0);
  if (totalDryGrams <= 0)
    throw new Error("Er is geen droog gewicht om te verdelen.");
  return allocations.map((row) => ({
    ...row,
    cookedShare: (totalCookedGrams * row.dryGrams) / totalDryGrams,
    cookedPerServing:
      (totalCookedGrams * row.dryGrams) / totalDryGrams / row.servings,
  }));
}
