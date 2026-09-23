import type { ShoppingItem } from "@/domain/types";
import { CATEGORY_LABELS, WEIGHT_LABELS } from "@/domain/constants";
import { number, weight } from "./format";
export function shoppingText(items: ShoppingItem[]): string {
  const sections = Object.entries(CATEGORY_LABELS).map(([category, label]) => {
    const rows = items.filter((item) => item.ingredient.category === category);
    if (!rows.length) return "";
    return `${label}\n${rows.map((item) => `□ ${item.ingredient.nameNl}: ${weight(item.grams)} (${WEIGHT_LABELS[item.ingredient.weightBasis]})${item.packages ? ` — ${number(item.packages)} × ${weight(item.ingredient.defaultPackageSize!)}` : ""}`).join("\n")}`;
  });
  return `MealPrep Planner — boodschappen\nGewichten zijn rauw, droog of uitgelekt.\n\n${sections.filter(Boolean).join("\n\n")}\n`;
}
