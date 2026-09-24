import type { Profile, TargetOverrides } from "./types";
import { ACTIVITY_FACTORS } from "./constants";
export function inRange(
  value: unknown,
  min: number,
  max: number,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}
export function profileErrors(profile: Profile): string[] {
  const errors: string[] = [];
  if (!inRange(profile.age, 16, 100) || !Number.isInteger(profile.age))
    errors.push("Vul een leeftijd van 16 t/m 100 jaar in.");
  if (!inRange(profile.heightCm, 100, 250))
    errors.push("Lengte moet tussen 100 en 250 cm liggen.");
  if (!inRange(profile.weightKg, 30, 300))
    errors.push("Gewicht moet tussen 30 en 300 kg liggen.");
  if (
    profile.bodyFatPercentage !== undefined &&
    !inRange(profile.bodyFatPercentage, 3, 70)
  )
    errors.push("Vetpercentage moet tussen 3 en 70% liggen.");
  if (!["male", "female"].includes(profile.sex))
    errors.push("Kies een geslacht voor de BMR-formule.");
  if (!Object.hasOwn(ACTIVITY_FACTORS, profile.activity))
    errors.push("Kies een activiteitsniveau.");
  if (
    !inRange(profile.workoutsPerWeek, 0, 21) ||
    !Number.isInteger(profile.workoutsPerWeek)
  )
    errors.push("Vul 0 t/m 21 trainingen per week in.");
  if (!["loss", "maintenance", "gain"].includes(profile.goal))
    errors.push("Kies een doel.");
  if (!inRange(profile.weeklyWeightLossKg, 0.05, 2))
    errors.push("Gewichtsverlies moet tussen 0,05 en 2 kg per week liggen.");
  if (!inRange(profile.surplusCalories, 0, 2000))
    errors.push("Het overschot moet tussen 0 en 2.000 kcal liggen.");
  return errors;
}
export function overrideErrors(overrides: TargetOverrides): string[] {
  const errors: string[] = [];
  if (
    overrides.calories !== undefined &&
    !inRange(overrides.calories, 500, 10000)
  )
    errors.push(
      "Een handmatig caloriedoel moet tussen 500 en 10.000 kcal liggen.",
    );
  for (const key of ["protein", "fat", "carbs"] as const) {
    if (overrides[key] !== undefined && !inRange(overrides[key], 0, 1500))
      errors.push("Macrodoelen moeten tussen 0 en 1.500 g liggen.");
  }
  return errors;
}
export function assertValid(errors: string[]): void {
  if (errors.length) throw new Error(errors.join(" "));
}
