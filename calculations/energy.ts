import type { Profile, TargetOverrides } from "@/domain/types";
import {
  ACTIVITY_FACTORS,
  KCAL_PER_KG,
  MAX_DEFICIT_FRACTION,
} from "@/domain/constants";
import {
  assertValid,
  overrideErrors,
  profileErrors,
} from "@/domain/validation";

export function leanBodyMass(
  weightKg: number,
  bodyFatPercentage: number,
): number {
  return weightKg * (1 - bodyFatPercentage / 100);
}
export function calculateBmr(profile: Profile): number {
  assertValid(profileErrors(profile));
  if (profile.bodyFatPercentage !== undefined)
    return (
      370 + 21.6 * leanBodyMass(profile.weightKg, profile.bodyFatPercentage)
    );
  return (
    10 * profile.weightKg +
    6.25 * profile.heightCm -
    5 * profile.age +
    (profile.sex === "male" ? 5 : -161)
  );
}
export function calculateTdee(profile: Profile): number {
  return calculateBmr(profile) * ACTIVITY_FACTORS[profile.activity];
}
export function weightLossDeficit(weeklyKg: number, tdee: number) {
  const requested = (weeklyKg * KCAL_PER_KG) / 7;
  return {
    requested,
    recommended: Math.min(requested, tdee * MAX_DEFICIT_FRACTION),
    capped: requested > tdee * MAX_DEFICIT_FRACTION,
  };
}
export function calculateTargets(
  profile: Profile,
  overrides: TargetOverrides = {},
) {
  assertValid([...profileErrors(profile), ...overrideErrors(overrides)]);
  const bmr = calculateBmr(profile);
  const tdee = calculateTdee(profile);
  const deficit = weightLossDeficit(profile.weeklyWeightLossKg, tdee);
  const recommendedCalories = Math.round(
    tdee +
      (profile.goal === "loss"
        ? -deficit.recommended
        : profile.goal === "gain"
          ? profile.surplusCalories
          : 0),
  );
  const calories = overrides.calories ?? recommendedCalories;
  const protein =
    overrides.protein ??
    Math.round(
      profile.bodyFatPercentage !== undefined
        ? 2.2 * leanBodyMass(profile.weightKg, profile.bodyFatPercentage)
        : 1.6 * profile.weightKg,
    );
  const fat = overrides.fat ?? Math.round((calories * 0.3) / 9);
  const remaining = calories - protein * 4 - fat * 9;
  const carbs = overrides.carbs ?? Math.max(0, Math.round(remaining / 4));
  const macroCalories = protein * 4 + carbs * 4 + fat * 9;
  const warnings: string[] = [];
  if (profile.goal === "loss" && deficit.capped)
    warnings.push(
      "Het gevraagde tekort is groter dan 25% van je geschatte verbruik. Het automatische advies is begrensd op 25%; een handmatig doel blijft mogelijk.",
    );
  if (remaining < 0 || Math.abs(macroCalories - calories) > 20)
    warnings.push(
      "Je macrodoelen passen niet bij je caloriedoel. Pas calorieën of macro’s aan; negatieve koolhydraten worden op 0 gezet.",
    );
  if (
    tdee - calories > tdee * MAX_DEFICIT_FRACTION &&
    overrides.calories !== undefined
  )
    warnings.push(
      "Je handmatige doel geeft een tekort groter dan 25% van je geschatte verbruik.",
    );
  return {
    bmr,
    tdee,
    calories,
    recommendedCalories,
    protein,
    carbs,
    fat,
    macroCalories,
    energyBalance: calories - tdee,
    warnings,
    method:
      profile.bodyFatPercentage !== undefined
        ? "Katch–McArdle"
        : "Mifflin–St Jeor",
  };
}
