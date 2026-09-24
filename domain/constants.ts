import type {
  Activity,
  Category,
  EvidenceLevel,
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
export const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
  evidence: "Onderbouwd",
  "rule-of-thumb": "Vuistregel",
  choice: "Keuze van PrepPartner",
};
export const EVIDENCE_DESCRIPTIONS: Record<EvidenceLevel, string> = {
  evidence: "Steunt op onderzoek of een officieel advies. De bron staat erbij.",
  "rule-of-thumb":
    "Een gangbare benadering die meestal goed genoeg is, maar niet voor jou gemeten.",
  choice:
    "Een ontwerpkeuze van deze app. Redelijk, maar geen norm; vaak kun je het zelf aanpassen.",
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
/** Mifflin–St Jeor: perKg × kg + perCm × cm − perYear × age + sex offset. */
export const MIFFLIN_ST_JEOR = {
  perKg: 10,
  perCm: 6.25,
  perYear: 5,
  male: 5,
  female: -161,
};
/** Katch–McArdle: base + perKgLeanMass × lean body mass. */
export const KATCH_MCARDLE = { base: 370, perKgLeanMass: 21.6 };
export const KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 };
export const PROTEIN_PER_KG_BODY_WEIGHT = 1.6;
export const PROTEIN_PER_KG_LEAN_MASS = 2.2;
export const FAT_ENERGY_FRACTION = 0.3;
export const DEFAULT_SURPLUS_CALORIES = 250;
/** Largest change to the correction fat when scaling, around its preferred amount. */
export const FAT_CORRECTION_GRAMS = 4;
/** Oven recipes cooked in a pan when no oven is available take this much longer. */
export const OVEN_FALLBACK_TIME_FACTOR = 1.2;
export const KCAL_PER_KG = 7700;
export const MAX_DEFICIT_FRACTION = 0.25;
export const KCAL_TOLERANCE = 20;
export const DEFAULT_MEAL_CALORIES = 600;
export const DEFAULT_MEAL_PROTEIN = 50;
export const DEFAULT_SERVINGS = 6;
export const MAX_SERVINGS = 100;
