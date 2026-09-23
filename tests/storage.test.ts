import { describe, it, expect } from "vitest";
import {
  browserRepository,
  initialState,
  parseBackup,
  STORAGE_KEY,
} from "@/services/storage";
describe("local persistence and backups", () => {
  it("round trips data through the repository", () => {
    const map = new Map<string, string>();
    const repo = browserRepository({
      getItem: (key) => map.get(key) ?? null,
      setItem: (key, value) => {
        map.set(key, value);
      },
      removeItem: (key) => {
        map.delete(key);
      },
    });
    const state = initialState();
    state.batch = [
      {
        recipeId: "teriyaki",
        servings: 6,
        targetCalories: 600,
        minimumProtein: 50,
      },
    ];
    repo.save(state);
    expect(repo.load()).toEqual(state);
    expect(parseBackup(JSON.stringify(state))).toEqual(state);
    repo.reset();
    expect(map.has(STORAGE_KEY)).toBe(false);
  });
  it("rejects corrupt, future, or malformed backups", () => {
    expect(() => parseBackup("{")).toThrow();
    expect(() =>
      parseBackup(JSON.stringify({ ...initialState(), version: 2 })),
    ).toThrow();
    expect(() =>
      parseBackup(
        JSON.stringify({
          ...initialState(),
          batch: [{ recipeId: "unknown", servings: -1 }],
        }),
      ),
    ).toThrow();
    expect(() =>
      parseBackup(
        JSON.stringify({
          ...initialState(),
          equipment: { burners: 0, ovens: 1, maxServingsPerPot: 6 },
        }),
      ),
    ).toThrow();
  });
  it("rejects duplicate recipes and invalid nutrition overrides", () => {
    const row = {
      recipeId: "teriyaki",
      servings: 6,
      targetCalories: 600,
      minimumProtein: 50,
    };
    expect(() =>
      parseBackup(JSON.stringify({ ...initialState(), batch: [row, row] })),
    ).toThrow();
    expect(() =>
      parseBackup(
        JSON.stringify({
          ...initialState(),
          ingredientOverrides: { rice: { nutritionPer100g: { kcal: -1 } } },
        }),
      ),
    ).toThrow();
  });
  it("does not swallow storage write failures", () => {
    const repo = browserRepository({
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: () => {},
    });
    expect(() => repo.save(initialState())).toThrow("QuotaExceededError");
  });
});
