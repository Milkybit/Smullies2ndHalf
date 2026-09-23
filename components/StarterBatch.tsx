"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { recipes } from "@/data/recipes";
import { scaleRecipe } from "@/calculations/scaling";
import { defaultMealprepCalories } from "@/calculations/planning";
import { number } from "@/services/format";
import { usePlanner } from "./store";
import { RecipeVisual } from "./RecipeVisual";
import { Icon } from "./ui";

export const STARTER_RECIPE_IDS = [
  "teriyaki",
  "red-curry-chicken",
  "beef-ragu",
];
export function StarterBatch() {
  const { state, catalog, update } = usePlanner();
  const router = useRouter();
  const calories = defaultMealprepCalories(state.meals);
  const selected = STARTER_RECIPE_IDS.map(
    (id) => recipes.find((r) => r.id === id)!,
  );
  function start() {
    update((old) => ({
      ...old,
      batch: [
        ...old.batch,
        ...STARTER_RECIPE_IDS.filter(
          (id) => !old.batch.some((item) => item.recipeId === id),
        ).map((recipeId) => ({
          recipeId,
          servings: 6,
          targetCalories: defaultMealprepCalories(old.meals),
          minimumProtein: 50,
        })),
      ],
      completedTasks: {},
    }));
    router.push("/batch");
  }
  return (
    <section className="starter-section" aria-labelledby="starter-title">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Een lekkere plek om te beginnen</div>
          <h2 id="starter-title">Drie gerechten. Je eerste batch.</h2>
        </div>
        <Link className="text-link" href="/recipes">
          Alle 30 recepten <Icon name="arrow" size={16} />
        </Link>
      </div>
      <div className="starter-grid">
        {selected.map((recipe) => {
          const adjusted = scaleRecipe(recipe, catalog, calories, 50);
          return (
            <Link
              href={`/recipes/${recipe.id}`}
              className="starter-recipe"
              key={recipe.id}
            >
              <RecipeVisual recipe={recipe} />
              <div className="starter-recipe-copy">
                <div className="recipe-meta">
                  {recipe.cuisine} <span>·</span>{" "}
                  {recipe.prepMinutes + recipe.cookMinutes} min
                </div>
                <h3>{recipe.nameNl}</h3>
                <p>
                  {number(adjusted.nutrition.kcal)} kcal <span>·</span>{" "}
                  {number(adjusted.nutrition.protein)} g eiwit{" "}
                  <span> / portie</span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      {!state.batch.length && (
        <div className="starter-action">
          <p>
            <strong>18 maaltijden voor jouw eerste kookdag.</strong>
            <span>
              6 porties per recept · gericht op {number(calories)} kcal en
              minimaal 50 g eiwit. Alles is aanpasbaar.
            </span>
          </p>
          <button type="button" className="button primary" onClick={start}>
            Start met deze selectie <Icon name="arrow" size={17} />
          </button>
        </div>
      )}
    </section>
  );
}
