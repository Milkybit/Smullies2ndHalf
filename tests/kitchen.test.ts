import { describe, it, expect } from "vitest";
import { kitchenProgress } from "@/calculations/kitchen";
import { kitchenCategoryTips, kitchenItems } from "@/data/kitchen";
import { KITCHEN_CATEGORY_LABELS } from "@/domain/constants";

describe("kitchen equipment list", () => {
  it("has unique ids and a labelled category for every item", () => {
    const ids = kitchenItems.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of kitchenItems) {
      expect(KITCHEN_CATEGORY_LABELS[item.category]).toBeTruthy();
      expect(item.nameNl.trim().length).toBeGreaterThan(0);
      expect(item.purpose.trim().length).toBeGreaterThan(0);
    }
    for (const category of Object.keys(kitchenCategoryTips))
      expect(Object.keys(KITCHEN_CATEGORY_LABELS)).toContain(category);
  });
  it("counts owned items overall and for the essentials", () => {
    const empty = kitchenProgress(kitchenItems, {});
    expect(empty.owned).toBe(0);
    expect(empty.total).toBe(kitchenItems.length);
    expect(empty.essentialOwned).toBe(0);
    expect(empty.essentialTotal).toBeGreaterThan(0);
    expect(empty.essentialTotal).toBeLessThan(kitchenItems.length);

    const essential = kitchenItems.find((item) => item.essential)!;
    const extra = kitchenItems.find((item) => !item.essential)!;
    const progress = kitchenProgress(kitchenItems, {
      [essential.id]: true,
      [extra.id]: true,
      unknown: true,
    });
    expect(progress.owned).toBe(2);
    expect(progress.essentialOwned).toBe(1);
    expect(
      kitchenProgress(kitchenItems, { [essential.id]: false }).owned,
    ).toBe(0);
  });
});
