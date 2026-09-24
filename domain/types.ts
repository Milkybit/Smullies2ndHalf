export type Sex = "male" | "female";
export type Activity =
  | "sedentary"
  | "light"
  | "moderate"
  | "very_active"
  | "extreme";
export type Goal = "loss" | "maintenance" | "gain";
export interface Profile {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  bodyFatPercentage?: number;
  activity: Activity;
  workoutsPerWeek: number;
  goal: Goal;
  weeklyWeightLossKg: number;
  surplusCalories: number;
}
export interface TargetOverrides {
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}
export interface Nutrition {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}
export type Category =
  | "meat-fish"
  | "starches"
  | "vegetables"
  | "legumes"
  | "sauces"
  | "spices"
  | "dairy"
  | "other";
export interface Ingredient {
  id: string;
  nameNl: string;
  category: Category;
  nutritionPer100g: Nutrition;
  weightBasis: "raw" | "dry" | "drained" | "as-sold";
  densityGramsPerMl?: number;
  defaultPurchaseUnit?: string;
  defaultPackageSize?: number;
  notes?: string;
}
export interface IngredientOverride {
  nutritionPer100g: Nutrition;
  defaultPackageSize?: number;
}
export type IngredientCatalog = Record<string, Ingredient>;
export type Role =
  | "protein"
  | "carbohydrate"
  | "vegetable"
  | "sauce"
  | "fat"
  | "seasoning"
  | "legume";
/** All quantities and bounds are per serving, in raw/dry/drained grams. */
export interface RecipeIngredient {
  ingredientId: string;
  grams: number;
  displayUnit: "g" | "ml";
  role: Role;
  scalable: boolean;
  minGrams: number;
  maxGrams: number;
  preferredGrams: number;
}
export type ProteinSource =
  | "chicken"
  | "beef"
  | "turkey"
  | "pork"
  | "tuna"
  | "vegetarian";
export type CookingGroup =
  | "asian-rice"
  | "curry"
  | "tomato-pasta"
  | "mexican"
  | "oven"
  | "chili"
  | "stir-fry";
export interface RecipeDefinition {
  id: string;
  nameNl: string;
  cuisine: string;
  description: string;
  proteinSource: ProteinSource;
  baseServings: 1;
  ingredients: RecipeIngredient[];
  instructions: string[];
  freezerScore: number;
  microwaveScore: number;
  batchEfficiencyScore: number;
  prepMinutes: number;
  cookMinutes: number;
  cookingGroup: CookingGroup;
  equipment: string[];
  tags: string[];
  minimumSauceGrams: number;
}
export type PrepComponentType =
  | "protein"
  | "carbohydrate"
  | "vegetable"
  | "aromatic_base"
  | "sauce_base"
  | "finisher"
  | "garnish"
  | "mixed_base";
export interface IngredientQuantity {
  ingredientId: string;
  grams: number;
}
export interface PrepComponent {
  id: string;
  nameNl: string;
  type: PrepComponentType;
  description: string;
  ingredientQuantities: IngredientQuantity[];
  instructions: string[];
  cookingMethod: "chop" | "mix" | "boil" | "roast" | "pan" | "drain" | "simmer";
  equipment: "burner" | "oven" | "no-heat";
  burnerCount: number;
  ovenSlots: number;
  activeMinutes: number;
  passiveMinutes: number;
  batchable: boolean;
  freezerSuitable: boolean;
  yieldTrackingSupported: boolean;
  tags: string[];
}
export interface ComponentRef {
  component: PrepComponent;
  multiplier: number;
}
export interface Recipe extends RecipeDefinition {
  componentRefs: ComponentRef[];
  proteinIngredientId: string;
  proteinPrepMethod: string;
  carbBase: string;
  sauceFamily: string;
  aromaticBase: string;
  vegetablePrepFamily: string;
  flavourProfile: string;
  batchTags: string[];
  ingredientIds: string[];
}
export interface MealSlot {
  id: string;
  name: string;
  calories: number;
  locked: boolean;
}
export interface BatchItem {
  recipeId: string;
  servings: number;
  targetCalories: number;
  minimumProtein: number;
  chickenCut?: "chicken-thigh" | "chicken-breast";
}
export type KitchenCategory =
  | "gastronorm"
  | "cutting"
  | "measuring"
  | "portioning"
  | "pans"
  | "cooling";
/** One piece of kitchen equipment for a batch cooking day. */
export interface KitchenItem {
  id: string;
  nameNl: string;
  quantity: string;
  purpose: string;
  category: KitchenCategory;
  essential: boolean;
}
/** How well an assumption is backed: research or official advice, a common approximation, or our own design choice. */
export type EvidenceLevel = "evidence" | "rule-of-thumb" | "choice";
export interface Source {
  label: string;
  url: string;
}
export interface Assumption {
  text: string;
  level: EvidenceLevel;
  sources?: Source[];
}
export interface ExplanationSection {
  id: string;
  title: string;
  how: string[];
  formulas?: string[];
  assumptions: Assumption[];
  why: string;
  limits: string[];
}
export interface WorkedStep {
  label: string;
  expression: string;
  result: string;
}
export interface Equipment {
  burners: number;
  ovens: number;
  maxServingsPerPot: number;
  maxProteinGrams?: number;
  maxDryCarbGrams?: number;
}
export interface AppState {
  version: 1;
  profile: Profile | null;
  overrides: TargetOverrides;
  meals: MealSlot[];
  ingredientOverrides: Record<string, IngredientOverride>;
  batch: BatchItem[];
  mealprepsPerDay: number;
  shoppingChecks: Record<string, string>;
  equipment: Equipment;
  cookedYields: Record<string, { dryGrams: number; cookedGrams: number }>;
  completedTasks: Record<string, boolean>;
  candidateRecipeIds?: string[];
  componentYields?: Record<string, { signature: string; cookedGrams: number }>;
  cookingPlanVersion?: 2;
  kitchenChecks: Record<string, boolean>;
}
export interface ScaledRecipe {
  ingredients: RecipeIngredient[];
  nutrition: Nutrition;
  warnings: string[];
  feasible: boolean;
}
export interface ResolvedBatchItem extends BatchItem {
  recipe: Recipe;
  scaled: ScaledRecipe;
}
export interface ShoppingItem {
  ingredient: Ingredient;
  grams: number;
  packages?: number;
  signature: string;
}
export interface SharedComponent {
  ingredientId: string;
  grams: number;
  recipes: {
    recipeId: string;
    name: string;
    grams: number;
    servings: number;
  }[];
}
export type Appliance = "worktop" | "burner" | "oven" | "passive";
export interface CookingTask {
  id: string;
  title: string;
  appliance: Appliance;
  durationMinutes: number;
  dependencies: string[];
  group: string;
  notes: string;
  startMinute: number;
  endMinute: number;
  resource: number;
  activeMinutes?: number;
  componentId?: string;
  inputGrams?: number;
  applianceReleaseMinute?: number;
  attentionWindows?: { offset: number; minutes: number }[];
  componentAllocations?: {
    recipeId: string;
    name: string;
    grams: number;
    servings: number;
  }[];
}
