"use client";
import { useState } from "react";
import Link from "next/link";
import { recipes } from "@/data/recipes";
import { PROTEIN_LABELS } from "@/domain/constants";
import { recipeNutrition } from "@/calculations/nutrition";
import { usePlanner } from "./store";
import { Icon, NutritionLine } from "./ui";

export function RecipeBrowser({ compact = false }: { compact?: boolean }) {
  const { catalog, state, update } = usePlanner();
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [tag, setTag] = useState("");
  const [score, setScore] = useState(1);
  const [sort, setSort] = useState("name");
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
          : a.nameNl.localeCompare(b.nameNl, "nl"),
    );
  function add(recipeId: string) {
    update((old) => ({
      ...old,
      batch: [
        ...old.batch,
        { recipeId, servings: 6, targetCalories: 600, minimumProtein: 50 },
      ],
      completedTasks: {},
    }));
  }
  return (
    <>
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
        {visible.map((recipe, index) => {
          const selected = state.batch.some(
            (item) => item.recipeId === recipe.id,
          );
          const nutrition = recipeNutrition(recipe.ingredients, catalog);
          return (
            <article className="recipe-card" key={recipe.id}>
              <div className={`recipe-card-top tone-${index % 4}`}>
                <span className="cuisine-label">{recipe.cuisine}</span>
                <Icon
                  name={
                    recipe.cookingGroup === "curry" ? "cooking" : "ingredients"
                  }
                  size={34}
                />
                <span className="freezer-label">
                  <Icon name="snow" size={14} />
                  {recipe.freezerScore}/5
                </span>
              </div>
              <div className="recipe-card-body">
                <div className="recipe-meta">
                  {PROTEIN_LABELS[recipe.proteinSource]}
                  <span>•</span>
                  {recipe.prepMinutes + recipe.cookMinutes} min
                </div>
                <h3>
                  <Link href={`/recipes/${recipe.id}`}>{recipe.nameNl}</Link>
                </h3>
                {!compact && <p>{recipe.description}</p>}
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
