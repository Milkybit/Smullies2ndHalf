import { describe, it, expect } from "vitest";
import type { Profile, TargetOverrides, WorkedStep } from "@/domain/types";
import { calculateTargets } from "@/calculations/energy";
import { createMealSlots } from "@/calculations/meals";
import { defaultMealprepCalories } from "@/calculations/planning";
import { explanationSections } from "@/data/explanations";
import { MAX_DEFICIT_FRACTION } from "@/domain/constants";
import { number } from "@/services/format";
import { workedMealprep, workedTargets } from "@/services/explanation";

const base: Profile = {
  age: 30,
  sex: "male",
  heightCm: 180,
  weightKg: 80,
  activity: "moderate",
  workoutsPerWeek: 3,
  goal: "loss",
  weeklyWeightLossKg: 0.5,
  surplusCalories: 250,
};
const cases: [Profile, TargetOverrides][] = [
  [base, {}],
  [{ ...base, weeklyWeightLossKg: 1.5 }, {}],
  [{ ...base, sex: "female", goal: "gain", activity: "light" }, {}],
  [{ ...base, goal: "maintenance", bodyFatPercentage: 18 }, {}],
  [base, { calories: 2100, protein: 170, fat: 60, carbs: 200 }],
];
const last = (steps: WorkedStep[]) => steps[steps.length - 1].result;
const byLabel = (steps: WorkedStep[], label: string) =>
  steps.find((step) => step.label === label)!.result;

describe("worked explanation of targets", () => {
  it("writes out the Mifflin formula with the user's own numbers", () => {
    const { energy } = workedTargets(base);
    expect(energy[0].expression).toBe(
      "10 × 80 kg + 6,25 × 180 cm − 5 × 30 jaar + 5",
    );
    expect(energy[0].result).toBe("1.780 kcal");
  });
  it("ends every step on the numbers the app actually uses", () => {
    for (const [profile, overrides] of cases) {
      const targets = calculateTargets(profile, overrides);
      const worked = workedTargets(profile, overrides);
      expect(last(worked.energy)).toBe(`${number(targets.tdee)} kcal`);
      expect(last(worked.goal)).toBe(`${number(targets.calories)} kcal`);
      expect(byLabel(worked.macros, "Eiwit")).toBe(
        `${number(targets.protein)} g`,
      );
      expect(byLabel(worked.macros, "Vet")).toBe(`${number(targets.fat)} g`);
      expect(byLabel(worked.macros, "Koolhydraten")).toBe(
        `${number(targets.carbs)} g`,
      );
    }
  });
  it("shows capped deficits and self-set targets", () => {
    const capped = workedTargets({ ...base, weeklyWeightLossKg: 1.5 });
    expect(byLabel(capped.goal, "Gevraagd tekort")).toContain("1.650");
    expect(capped.goal.at(-1)!.expression).toContain("begrensd");
    const own = workedTargets(base, { protein: 170 });
    expect(own.macros[0].expression).toBe("zelf ingesteld");
  });
  it("explains the default recipe target from the mealprep slots", () => {
    const meals = createMealSlots(2400);
    expect(workedMealprep(meals)[0].result).toBe(
      `${number(defaultMealprepCalories(meals))} kcal`,
    );
    expect(workedMealprep([])).toEqual([]);
  });
});

describe("background sections", () => {
  it("has unique anchors, including every worked-out section", () => {
    const ids = explanationSections.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ["energy", "goal", "macros", "meals"])
      expect(ids).toContain(id);
  });
  it("backs every evidence claim with a source", () => {
    for (const section of explanationSections) {
      expect(section.how.length).toBeGreaterThan(0);
      expect(section.assumptions.length).toBeGreaterThan(0);
      expect(section.limits.length).toBeGreaterThan(0);
      for (const assumption of section.assumptions) {
        if (assumption.level === "evidence")
          expect(assumption.sources?.length ?? 0).toBeGreaterThan(0);
        for (const source of assumption.sources ?? [])
          expect(source.url.startsWith("https://")).toBe(true);
      }
    }
  });
  it("reads its numbers from the calculation constants", () => {
    const goal = explanationSections.find((section) => section.id === "goal")!;
    expect(goal.how.join(" ")).toContain(`${MAX_DEFICIT_FRACTION * 100}%`);
  });
});
