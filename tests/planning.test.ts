import { describe, expect, it } from "vitest";
import { defaultMealprepCalories } from "@/calculations/planning";
import { createMealSlots } from "@/calculations/meals";

describe("personal mealprep defaults", () => {
  it("uses the two mealprep allocations, including rounded redistribution", () => {
    expect(defaultMealprepCalories(createMealSlots(2000))).toBe(600);
    expect(defaultMealprepCalories(createMealSlots(1845))).toBe(554);
  });
  it("preserves the relationship when meal slots are renamed", () => {
    const meals = createMealSlots(2000).map((meal) => ({
      ...meal,
      name: "Anders genoemd",
    }));
    meals[2].calories = 450;
    meals[4].calories = 550;
    expect(defaultMealprepCalories(meals)).toBe(500);
  });
  it("uses a positive remaining slot and falls back only without a target", () => {
    const meals = createMealSlots(2000);
    meals[2].calories = 0;
    meals[4].calories = 720;
    expect(defaultMealprepCalories(meals)).toBe(720);
    expect(defaultMealprepCalories([])).toBe(600);
  });
  it("respects supported recipe target bounds", () => {
    const meals = createMealSlots(2000);
    meals[2].calories = meals[4].calories = 2500;
    expect(defaultMealprepCalories(meals)).toBe(2000);
    meals[2].calories = meals[4].calories = 50;
    expect(defaultMealprepCalories(meals)).toBe(100);
  });
});
