import type {
  MealSlot,
  Profile,
  TargetOverrides,
  WorkedStep,
} from "@/domain/types";
import {
  ACTIVITY_FACTORS,
  ACTIVITY_LABELS,
  FAT_ENERGY_FRACTION,
  KATCH_MCARDLE,
  KCAL_PER_GRAM,
  KCAL_PER_KG,
  MAX_DEFICIT_FRACTION,
  MIFFLIN_ST_JEOR,
  PROTEIN_PER_KG_BODY_WEIGHT,
  PROTEIN_PER_KG_LEAN_MASS,
} from "@/domain/constants";
import {
  calculateTargets,
  leanBodyMass,
  weightLossDeficit,
} from "@/calculations/energy";
import {
  defaultMealprepCalories,
  plannedMealprepSlots,
} from "@/calculations/planning";
import { number, signed } from "./format";

const kcal = (value: number) => `${number(value)} kcal`;
const grams = (value: number) => `${number(value)} g`;
const OWN = "zelf ingesteld";

/** The user's own numbers behind each target. Results come from calculateTargets;
 * expressions use the same constants, so the explanation cannot drift from the maths. */
export function workedTargets(
  profile: Profile,
  overrides: TargetOverrides = {},
) {
  const targets = calculateTargets(profile, overrides);
  const lean =
    profile.bodyFatPercentage !== undefined
      ? leanBodyMass(profile.weightKg, profile.bodyFatPercentage)
      : undefined;
  const energy: WorkedStep[] =
    lean !== undefined
      ? [
          {
            label: "Vetvrije massa",
            expression: `${number(profile.weightKg, 1)} kg × (100% − ${number(profile.bodyFatPercentage!, 1)}%)`,
            result: `${number(lean, 1)} kg`,
          },
          {
            label: "Rustverbruik (Katch–McArdle)",
            expression: `${number(KATCH_MCARDLE.base)} + ${number(KATCH_MCARDLE.perKgLeanMass, 1)} × ${number(lean, 1)} kg`,
            result: kcal(targets.bmr),
          },
        ]
      : [
          {
            label: "Rustverbruik (Mifflin–St Jeor)",
            expression: `${number(MIFFLIN_ST_JEOR.perKg)} × ${number(profile.weightKg, 1)} kg + ${number(MIFFLIN_ST_JEOR.perCm, 2)} × ${number(profile.heightCm, 1)} cm − ${number(MIFFLIN_ST_JEOR.perYear)} × ${profile.age} jaar ${signed(MIFFLIN_ST_JEOR[profile.sex])}`,
            result: kcal(targets.bmr),
          },
        ];
  energy.push({
    label: "Verbruik per dag",
    expression: `${number(targets.bmr, 1)} × ${number(ACTIVITY_FACTORS[profile.activity], 3)} (${ACTIVITY_LABELS[profile.activity]})`,
    result: kcal(targets.tdee),
  });

  const goal: WorkedStep[] = [];
  if (profile.goal === "loss") {
    const deficit = weightLossDeficit(profile.weeklyWeightLossKg, targets.tdee);
    goal.push(
      {
        label: "Gevraagd tekort",
        expression: `${number(profile.weeklyWeightLossKg, 2)} kg × ${number(KCAL_PER_KG)} ÷ 7`,
        result: `${kcal(deficit.requested)} per dag`,
      },
      {
        label: "Grens",
        expression: `${number(MAX_DEFICIT_FRACTION * 100)}% × ${kcal(targets.tdee)}`,
        result: kcal(targets.tdee * MAX_DEFICIT_FRACTION),
      },
      {
        label: "Advies",
        expression: `${number(targets.tdee)} − ${number(deficit.recommended)}${deficit.capped ? " (begrensd tekort)" : ""}`,
        result: kcal(targets.recommendedCalories),
      },
    );
  } else
    goal.push({
      label: "Advies",
      expression:
        profile.goal === "gain"
          ? `${number(targets.tdee)} + ${number(profile.surplusCalories)} overschot`
          : "gelijk aan je verbruik",
      result: kcal(targets.recommendedCalories),
    });
  if (overrides.calories !== undefined)
    goal.push({
      label: "Jouw caloriedoel",
      expression: OWN,
      result: kcal(targets.calories),
    });

  const macros: WorkedStep[] = [
    {
      label: "Eiwit",
      expression:
        overrides.protein !== undefined
          ? OWN
          : lean !== undefined
            ? `${number(PROTEIN_PER_KG_LEAN_MASS, 1)} g × ${number(lean, 1)} kg vetvrije massa`
            : `${number(PROTEIN_PER_KG_BODY_WEIGHT, 1)} g × ${number(profile.weightKg, 1)} kg`,
      result: grams(targets.protein),
    },
    {
      label: "Vet",
      expression:
        overrides.fat !== undefined
          ? OWN
          : `${number(FAT_ENERGY_FRACTION * 100)}% × ${kcal(targets.calories)} ÷ ${KCAL_PER_GRAM.fat}`,
      result: grams(targets.fat),
    },
    {
      label: "Koolhydraten",
      expression:
        overrides.carbs !== undefined
          ? OWN
          : `(${number(targets.calories)} − ${number(targets.protein)} × ${KCAL_PER_GRAM.protein} − ${number(targets.fat)} × ${KCAL_PER_GRAM.fat}) ÷ ${KCAL_PER_GRAM.carbs}`,
      result: grams(targets.carbs),
    },
  ];
  return { energy, goal, macros };
}

/** How new recipes get their default calorie target. */
export function workedMealprep(meals: MealSlot[]): WorkedStep[] {
  const planned = plannedMealprepSlots(meals);
  if (!planned.length) return [];
  const names = planned.map((meal) => `${meal.name} (${kcal(meal.calories)})`);
  return [
    {
      label: "Startdoel nieuwe recepten",
      expression:
        names.length > 1 ? `gemiddelde van ${names.join(" en ")}` : names[0],
      result: kcal(defaultMealprepCalories(meals)),
    },
  ];
}
