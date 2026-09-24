"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { recipes } from "@/data/recipes";
import { recipeNutrition } from "@/calculations/nutrition";
import { scaleRecipe } from "@/calculations/scaling";
import { defaultMealprepCalories } from "@/calculations/planning";
import { RecipeVisual } from "../RecipeVisual";
import { FamilyLabels, RecipeRelationships } from "../RecipeRelationships";
import { withChickenCut } from "@/data/prep-components";
import { PROTEIN_LABELS, WEIGHT_LABELS } from "@/domain/constants";
import { number, weight } from "@/services/format";
import { usePlanner } from "../store";
import {
  Card,
  Icon,
  Notice,
  NumberField,
  NutritionLine,
  PageTitle,
  WhyLink,
} from "../ui";

export function RecipeDetailScreen({ recipeId }: { recipeId: string }) {
  const { catalog, state, update } = usePlanner();
  const existing = state.batch.find((item) => item.recipeId === recipeId);
  const recipe = useMemo(
    () =>
      withChickenCut(
        recipes.find((r) => r.id === recipeId)!,
        existing?.chickenCut,
      ),
    [recipeId, existing?.chickenCut],
  );
  const defaultCalories = defaultMealprepCalories(state.meals);
  const [calories, setCalories] = useState(
    existing?.targetCalories ?? defaultCalories,
  );
  const [protein, setProtein] = useState(existing?.minimumProtein ?? 50);
  const [servings, setServings] = useState(existing?.servings ?? 6);
  const [applied, setApplied] = useState({
    calories: existing?.targetCalories ?? defaultCalories,
    protein: existing?.minimumProtein ?? 50,
  });
  const [saved, setSaved] = useState(false);
  const scaled = useMemo(
    () => scaleRecipe(recipe, catalog, applied.calories, applied.protein),
    [recipe, catalog, applied],
  );
  const base = recipeNutrition(recipe.ingredients, catalog);
  function saveBatch() {
    update((old) => ({
      ...old,
      batch: [
        ...old.batch.filter((item) => item.recipeId !== recipeId),
        {
          recipeId,
          servings,
          targetCalories: applied.calories,
          minimumProtein: applied.protein,
          ...(existing?.chickenCut ? { chickenCut: existing.chickenCut } : {}),
        },
      ],
      completedTasks: {},
    }));
    setSaved(true);
  }
  return (
    <>
      <Link href="/recipes" className="back-link">
        ← Alle recepten
      </Link>
      <PageTitle
        eyebrow={`${recipe.cuisine.toUpperCase()} · ${PROTEIN_LABELS[recipe.proteinSource].toUpperCase()}`}
        title={recipe.nameNl}
        description={recipe.description}
      />
      <RecipeVisual recipe={recipe} priority className="recipe-detail-photo" />
      <FamilyLabels recipe={recipe} />
      <div className="detail-badges">
        <span className="badge">
          <Icon name="snow" size={15} />
          Vriezer {recipe.freezerScore}/5
        </span>
        <span className="badge">Magnetron {recipe.microwaveScore}/5</span>
        <span className="badge">
          Batchgemak {recipe.batchEfficiencyScore}/5
        </span>
        <span className="badge">Voorbereiden {recipe.prepMinutes} min</span>
        <span className="badge">Koken {recipe.cookMinutes} min</span>
      </div>
      <div className="recipe-detail-grid">
        <div className="stack">
          <Card>
            <div className="section-heading">
              <h2>Ingrediënten</h2>
              <span className="badge">{servings} porties</span>
            </div>
            <p className="muted small">
              Gewichten zijn rauw, droog of uitgelekt. Afgerond voor
              leesbaarheid; berekeningen gebruiken de ongeronde hoeveelheid.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ingrediënt</th>
                    <th>Basis / portie</th>
                    <th>Aangepast / portie</th>
                    <th>Hele batch</th>
                  </tr>
                </thead>
                <tbody>
                  {scaled.ingredients.map((row) => {
                    const ingredient = catalog[row.ingredientId];
                    const before = recipe.ingredients.find(
                      (r) => r.ingredientId === row.ingredientId,
                    )!.grams;
                    return (
                      <tr key={row.ingredientId}>
                        <td>
                          <strong>{ingredient.nameNl}</strong>
                          <small>{WEIGHT_LABELS[ingredient.weightBasis]}</small>
                        </td>
                        <td>{number(before, 1)} g</td>
                        <td
                          className={
                            Math.abs(before - row.grams) > 0.5
                              ? "changed-quantity"
                              : ""
                          }
                        >
                          {number(row.grams, 1)} g
                        </td>
                        <td>
                          <strong>{weight(row.grams * servings)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <Card>
            <h2>Zo maak je het</h2>
            <ol className="instructions">
              {recipe.instructions.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
            <p className="muted small">
              Tijden gelden voor een gebruikelijke panportie. Kook grote batches
              in rondes; de kookplanner houdt rekening met je paninstelling.
            </p>
          </Card>
        </div>
        <div className="stack">
          <Card className="adjust-card">
            <div className="eyebrow">SLIM OP MAAT</div>
            <h2>Jouw portie, jouw doel</h2>
            <p>
              Groente en saus blijven op peil. Eiwit en rijst of pasta bewegen
              mee.
            </p>
            <NumberField
              label="Doelcalorieën"
              value={calories}
              min={100}
              max={2000}
              unit="kcal"
              onCommit={setCalories}
            />
            <NumberField
              label="Minimaal eiwit"
              value={protein}
              max={200}
              unit="g"
              onCommit={setProtein}
            />
            <NumberField
              label="Aantal porties"
              value={servings}
              min={1}
              max={100}
              onCommit={setServings}
            />
            <button
              className="button primary full-width"
              onClick={() => {
                setApplied({ calories, protein });
                setSaved(false);
              }}
            >
              Pas recept aan
              <Icon name="arrow" />
            </button>
            {(calories !== applied.calories || protein !== applied.protein) && (
              <p className="small error">
                Klik op ‘Pas recept aan’ om je nieuwe doelen door te rekenen.
              </p>
            )}
            <div className="nutrition-summary">
              <span className="eyebrow">AANGEPAST · PER PORTIE</span>
              <NutritionLine nutrition={scaled.nutrition} fiber />
            </div>
            <p className="muted small">
              Basisrecept: {number(base.kcal)} kcal · {number(base.protein)} g
              eiwit. Doel: {applied.calories} kcal / minimaal {applied.protein}{" "}
              g eiwit. <WhyLink section="scaling">Hoe we schalen</WhyLink>
            </p>
            {scaled.warnings.map((warning) => (
              <Notice key={warning} tone="warning">
                {warning}
              </Notice>
            ))}
            <button
              className="button secondary full-width"
              onClick={saveBatch}
              disabled={
                calories !== applied.calories || protein !== applied.protein
              }
            >
              <Icon name="batch" />
              {existing ? "Werk batch bij" : "Voeg toe aan batch"}
            </button>
            {saved && (
              <Notice tone="success">
                {servings} porties opgeslagen.{" "}
                <Link href="/batch">Bekijk je batch →</Link>
              </Notice>
            )}
          </Card>
          <Card className="freezer-tip">
            <Icon name="snow" />
            <h3>Gemaakt om vooruit te koken</h3>
            <p>
              Voldoende saus beschermt tegen uitdrogen. Groente blijft lekkerder
              als je die niet te lang gaart.
            </p>
            <a
              href="https://www.voedingscentrum.nl/nl/service/vraag-en-antwoord/koken-en-bewaren/hoe-kan-ik-meal-preppen"
              target="_blank"
              rel="noreferrer"
            >
              Bewaaradvies van het Voedingscentrum ↗
            </a>
          </Card>
          <RecipeRelationships recipe={recipe} />
        </div>
      </div>
    </>
  );
}
