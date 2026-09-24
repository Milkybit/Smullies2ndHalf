import Link from "next/link";
import type { Recipe } from "@/domain/types";
import { recipes } from "@/data/recipes";
import { buildCatalog } from "@/data/ingredients";
import { sauceBases, withChickenCut } from "@/data/prep-components";
import { calculateRecipeCompatibility } from "@/calculations/compatibility";
import { Card } from "./ui";
const catalog = buildCatalog();
export function FamilyLabels({ recipe }: { recipe: Recipe }) {
  return (
    <div className="family-labels">
      {[
        catalog[recipe.proteinIngredientId].nameNl,
        catalog[recipe.carbBase].nameNl,
        sauceBases.find((base) => base.id === recipe.sauceFamily)?.nameNl ??
          recipe.cuisine,
      ].map((label) => (
        <span key={label}>{label}</span>
      ))}
    </div>
  );
}
export function RecipeRelationships({ recipe }: { recipe: Recipe }) {
  const cut =
    recipe.proteinIngredientId === "chicken-thigh" ||
    recipe.proteinIngredientId === "chicken-breast"
      ? recipe.proteinIngredientId
      : undefined;
  const matches = recipes
    .filter((r) => r.id !== recipe.id)
    .map((r) => withChickenCut(r, cut))
    .map((r) => ({ recipe: r, ...calculateRecipeCompatibility(recipe, r) }))
    .sort(
      (a, b) =>
        b.normalizedScore - a.normalizedScore ||
        a.recipe.id.localeCompare(b.recipe.id),
    )
    .slice(0, 4);
  return (
    <Card>
      <h2>Combineert goed met</h2>
      <p>
        Deze score meet gedeelde voorbereiding.{" "}
        {cut
          ? "Kiprecepten vergelijken we met dezelfde kipkeuze."
          : "Vergelijking met de standaardrecepten."}
      </p>
      {matches.map((match) => (
        <details key={match.recipe.id}>
          <summary>
            {match.recipe.nameNl} · {match.normalizedScore}%
          </summary>
          <p>{match.explanation}</p>
          <Link href={`/recipes/${match.recipe.id}`} className="text-link">
            Bekijk recept →
          </Link>
        </details>
      ))}
    </Card>
  );
}
