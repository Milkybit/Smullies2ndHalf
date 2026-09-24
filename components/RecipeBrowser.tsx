"use client";
import { useState } from "react";
import Link from "next/link";
import { recipes } from "@/data/recipes";
import { PROTEIN_LABELS } from "@/domain/constants";
import { recipeNutrition } from "@/calculations/nutrition";
import { defaultMealprepCalories } from "@/calculations/planning";
import { usePlanner } from "./store";
import { Icon, NutritionLine } from "./ui";
import { RecipeVisual } from "./RecipeVisual";
import { FamilyLabels } from "./RecipeRelationships";

export function RecipeBrowser({ compact = false }: { compact?: boolean }) {
  const { catalog, state, update } = usePlanner();
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [tag, setTag] = useState("");
  const [score, setScore] = useState(1);
  const [sort, setSort] = useState("featured");
  const featured = ["teriyaki", "red-curry-chicken", "beef-ragu"];
  const visible = recipes
    .filter(
      (recipe) =>
        recipe.nameNl.toLowerCase().includes(search.toLowerCase()) &&
        (!source || recipe.proteinSource === source) &&
        (!tag || recipe.tags.includes(tag)) &&
        recipe.freezerScore >= score,
    )
    .sort((a, b) =>
      sort === "freezer"
        ? b.freezerScore - a.freezerScore
        : sort === "microwave"
          ? b.microwaveScore - a.microwaveScore
          : sort === "featured"
            ? (featured.includes(a.id) ? featured.indexOf(a.id) : 100) -
              (featured.includes(b.id) ? featured.indexOf(b.id) : 100)
            : a.nameNl.localeCompare(b.nameNl, "nl"),
    );
  function add(recipeId: string) {
    update((old) => ({
      ...old,
      batch: [
        ...old.batch,
        ...(old.batch.some((item) => item.recipeId === recipeId)
          ? []
          : [
              {
                recipeId,
                servings: 6,
                targetCalories: defaultMealprepCalories(old.meals),
                minimumProtein: 50,
              },
            ]),
      ],
      completedTasks: {},
    }));
  }
  return (
    <>
      <div className="recipe-collections" aria-label="Snelle receptfilters">
        {["", "Aziatisch", "Curry", "Pasta", "Bonen"].map((value) => (
          <button
            type="button"
            key={value}
            aria-pressed={tag === value}
            onClick={() => setTag(value)}
          >
            {value || "Alle gerechten"}
          </button>
        ))}
      </div>
      <div className="recipe-filters">
        <div className="field search-field">
          <label htmlFor={`search-${compact}`}>Zoek een recept</label>
          <input
            id={`search-${compact}`}
            type="search"
            placeholder="Zoek op naam…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor={`protein-${compact}`}>Eiwitbron</label>
          <select
            id={`protein-${compact}`}
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="">Alle eiwitbronnen</option>
            {Object.entries(PROTEIN_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`tag-${compact}`}>Type gerecht</label>
          <select
            id={`tag-${compact}`}
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          >
            <option value="">Alle gerechten</option>
            {["Bonen", "Aziatisch", "Curry", "Pasta", "Rijst"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`score-${compact}`}>Vriesscore vanaf</label>
          <select
            id={`score-${compact}`}
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value} / 5
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`sort-${compact}`}>Sorteren</label>
          <select
            id={`sort-${compact}`}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="featured">Startselectie eerst</option>
            <option value="name">Naam A–Z</option>
            <option value="freezer">Vriesscore</option>
            <option value="microwave">Magnetronscore</option>
          </select>
        </div>
      </div>
      <div className="results-label">
        {visible.length} recepten <span>Voedingswaarden per basisportie</span>
      </div>
      <div className={`recipe-grid ${compact ? "compact-grid" : ""}`}>
        {visible.map((recipe) => {
          const selected = state.batch.some(
            (item) => item.recipeId === recipe.id,
          );
          const nutrition = recipeNutrition(recipe.ingredients, catalog);
          return (
            <article className="recipe-card" key={recipe.id}>
              <Link
                href={`/recipes/${recipe.id}`}
                tabIndex={-1}
                aria-hidden="true"
              >
                <RecipeVisual recipe={recipe} />
              </Link>
              <div className="recipe-card-body">
                <div className="recipe-meta">
                  {PROTEIN_LABELS[recipe.proteinSource]}
                  <span>•</span>
                  {recipe.prepMinutes + recipe.cookMinutes} min
                  <span>·</span> Vriezer {recipe.freezerScore}/5
                </div>
                <h3>
                  <Link href={`/recipes/${recipe.id}`}>{recipe.nameNl}</Link>
                </h3>
                {!compact && <p>{recipe.description}</p>}
                <FamilyLabels recipe={recipe} />
                <label className="candidate-toggle">
                  <input
                    type="checkbox"
                    aria-label={`Kandidaat ${recipe.nameNl}`}
                    checked={(state.candidateRecipeIds ?? []).includes(
                      recipe.id,
                    )}
                    onChange={() =>
                      update((old) => ({
                        ...old,
                        candidateRecipeIds: (
                          old.candidateRecipeIds ?? []
                        ).includes(recipe.id)
                          ? old.candidateRecipeIds!.filter(
                              (id) => id !== recipe.id,
                            )
                          : [...(old.candidateRecipeIds ?? []), recipe.id],
                      }))
                    }
                  />
                  Kandidaat voor optimizer
                </label>
                <NutritionLine nutrition={nutrition} />
                <div className="recipe-card-footer">
                  <Link className="text-link" href={`/recipes/${recipe.id}`}>
                    Bekijk recept ↗
                  </Link>
                  <button
                    className={`button small-button ${selected ? "selected" : "secondary"}`}
                    disabled={selected}
                    onClick={() => add(recipe.id)}
                    aria-label={
                      selected
                        ? `${recipe.nameNl} zit in je batch`
                        : `Voeg ${recipe.nameNl} toe aan batch`
                    }
                  >
                    <Icon name={selected ? "check" : "plus"} size={16} />
                    {selected ? "In batch" : "Batch"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!visible.length && (
        <div className="empty">
          <h3>Geen recepten gevonden</h3>
          <p>Gebruik een andere zoekterm of maak een filter leeg.</p>
          <button
            className="button secondary"
            onClick={() => {
              setSearch("");
              setSource("");
              setTag("");
              setScore(1);
            }}
          >
            Wis filters
          </button>
        </div>
      )}
    </>
  );
}
