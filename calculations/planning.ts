import type { MealSlot } from "@/domain/types";

/** The two mealprep slots keep stable IDs even when the user renames them. */
export function defaultMealprepCalories(meals: MealSlot[]): number {
  const planned = meals.filter(
    (meal) => ["meal-3", "meal-5"].includes(meal.id) && meal.calories > 0,
  );
  if (!planned.length) return 600;
  const average =
    planned.reduce((sum, meal) => sum + meal.calories, 0) / planned.length;
  return Math.min(2000, Math.max(100, Math.round(average)));
}
