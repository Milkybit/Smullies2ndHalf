import type {
  Activity,
  Category,
  KitchenCategory,
  ProteinSource,
} from "./types";
export const ACTIVITY_FACTORS: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extreme: 1.9,
};
export const ACTIVITY_LABELS: Record<Activity, string> = {
  sedentary: "Zittend • weinig beweging",
  light: "Licht actief",
  moderate: "Gemiddeld actief",
  very_active: "Zeer actief",
  extreme: "Extreem actief • zwaar fysiek werk",
};
export const CATEGORY_LABELS: Record<Category, string> = {
  "meat-fish": "Vlees & vis",
  starches: "Rijst, pasta & aardappelen",
  vegetables: "Groente",
  legumes: "Blik & peulvruchten",
  sauces: "Sauzen",
  spices: "Kruiden & specerijen",
  dairy: "Zuivel",
  other: "Overig",
};
export const KITCHEN_CATEGORY_LABELS: Record<KitchenCategory, string> = {
  gastronorm: "Gastronormbakken (RVS)",
  cutting: "Snijden",
  measuring: "Meten & wegen",
  portioning: "Portioneren & verpakken",
  pans: "Pannen & bakplaten",
  cooling: "Afkoelen & opruimen",
};
export const PROTEIN_LABELS: Record<ProteinSource, string> = {
  chicken: "Kip",
  beef: "Rund",
  turkey: "Kalkoen",
  pork: "Varken",
  tuna: "Tonijn",
  vegetarian: "Vegetarisch",
};
export const WEIGHT_LABELS = {
  raw: "rauw",
  dry: "droog",
  drained: "uitgelekt",
  "as-sold": "zoals verkocht",
};
export const KCAL_PER_KG = 7700;
export const MAX_DEFICIT_FRACTION = 0.25;
export const KCAL_TOLERANCE = 20;
export const DEFAULT_MEAL_CALORIES = 600;
export const DEFAULT_MEAL_PROTEIN = 50;
export const DEFAULT_SERVINGS = 6;
export const MAX_SERVINGS = 100;
