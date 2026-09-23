import type { MealSlot } from "@/domain/types";
const DEFAULTS = [400, 130, 600, 120, 600, 150];
const NAMES = [
  "Ontbijt",
  "Snack 1",
  "Mealprep 1",
  "Eiwitshake",
  "Mealprep 2",
  "Snack 2",
];
export function createMealSlots(calories: number): MealSlot[] {
  return redistributeMeals(
    DEFAULTS.map((value, i) => ({
      id: `meal-${i + 1}`,
      name: NAMES[i],
      calories: value,
      locked: false,
    })),
    calories,
  ).meals;
}
export function redistributeMeals(
  meals: MealSlot[],
  target: number,
): { meals: MealSlot[]; warning?: string } {
  if (
    !Number.isFinite(target) ||
    target < 0 ||
    meals.some((m) => !Number.isFinite(m.calories) || m.calories < 0)
  )
    return { meals, warning: "Gebruik geldige, positieve calorieaantallen." };
  const locked = meals
    .filter((m) => m.locked)
    .reduce((sum, m) => sum + m.calories, 0);
  const unlocked = meals.filter((m) => !m.locked);
  if (locked > target)
    return {
      meals,
      warning:
        "De vastgezette eetmomenten zijn samen hoger dan je dagdoel. Maak eerst een moment vrij.",
    };
  if (!unlocked.length)
    return {
      meals,
      warning: "Alle eetmomenten staan vast. Maak minstens één moment vrij.",
    };
  const remaining = Math.round(target - locked);
  const weight = unlocked.reduce((sum, m) => sum + m.calories, 0);
  const fractions = unlocked.map((m) => {
    const exact =
      remaining * (weight ? m.calories / weight : 1 / unlocked.length);
    return { id: m.id, value: Math.floor(exact), remainder: exact % 1 };
  });
  let leftover = remaining - fractions.reduce((sum, f) => sum + f.value, 0);
  for (const item of [...fractions].sort((a, b) => b.remainder - a.remainder)) {
    if (leftover-- > 0) item.value++;
  }
  return {
    meals: meals.map((m) => ({
      ...m,
      calories: fractions.find((f) => f.id === m.id)?.value ?? m.calories,
    })),
  };
}
