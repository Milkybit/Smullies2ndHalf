import type { Profile, TargetOverrides } from "@/domain/types";
import {
  ACTIVITY_FACTORS,
  FAT_ENERGY_FRACTION,
  KATCH_MCARDLE,
  KCAL_PER_GRAM,
  KCAL_PER_KG,
  KCAL_TOLERANCE,
  MAX_DEFICIT_FRACTION,
  MIFFLIN_ST_JEOR,
  PROTEIN_PER_KG_BODY_WEIGHT,
  PROTEIN_PER_KG_LEAN_MASS,
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
      KATCH_MCARDLE.base +
      KATCH_MCARDLE.perKgLeanMass *
        leanBodyMass(profile.weightKg, profile.bodyFatPercentage)
    );
  return (
    MIFFLIN_ST_JEOR.perKg * profile.weightKg +
    MIFFLIN_ST_JEOR.perCm * profile.heightCm -
    MIFFLIN_ST_JEOR.perYear * profile.age +
    MIFFLIN_ST_JEOR[profile.sex]
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
        ? PROTEIN_PER_KG_LEAN_MASS *
            leanBodyMass(profile.weightKg, profile.bodyFatPercentage)
        : PROTEIN_PER_KG_BODY_WEIGHT * profile.weightKg,
    );
  const fat =
    overrides.fat ??
    Math.round((calories * FAT_ENERGY_FRACTION) / KCAL_PER_GRAM.fat);
  const remaining =
    calories - protein * KCAL_PER_GRAM.protein - fat * KCAL_PER_GRAM.fat;
  const carbs =
    overrides.carbs ?? Math.max(0, Math.round(remaining / KCAL_PER_GRAM.carbs));
  const macroCalories =
    protein * KCAL_PER_GRAM.protein +
    carbs * KCAL_PER_GRAM.carbs +
    fat * KCAL_PER_GRAM.fat;
  const warnings: string[] = [];
  const cap = `${MAX_DEFICIT_FRACTION * 100}%`;
  if (profile.goal === "loss" && deficit.capped)
    warnings.push(
      `Het gevraagde tekort is groter dan ${cap} van je geschatte verbruik. Het automatische advies is begrensd op ${cap}; een handmatig doel blijft mogelijk.`,
    );
  if (remaining < 0 || Math.abs(macroCalories - calories) > KCAL_TOLERANCE)
    warnings.push(
      "Je macrodoelen passen niet bij je caloriedoel. Pas calorieën of macro’s aan; negatieve koolhydraten worden op 0 gezet.",
    );
  if (
    tdee - calories > tdee * MAX_DEFICIT_FRACTION &&
    overrides.calories !== undefined
  )
    warnings.push(
      `Je handmatige doel geeft een tekort groter dan ${cap} van je geschatte verbruik.`,
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
