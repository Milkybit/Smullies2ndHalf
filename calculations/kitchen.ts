import type { KitchenItem } from "@/domain/types";

/** Counts what is already in the kitchen, overall and for the essential items. */
export function kitchenProgress(
  items: KitchenItem[],
  checks: Record<string, boolean>,
) {
  const essential = items.filter((item) => item.essential);
  const owned = (rows: KitchenItem[]) =>
    rows.filter((item) => checks[item.id] === true).length;
  return {
    owned: owned(items),
    total: items.length,
    essentialOwned: owned(essential),
    essentialTotal: essential.length,
  };
}
