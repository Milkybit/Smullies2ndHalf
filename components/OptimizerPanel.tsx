"use client";
import { useState } from "react";
import Link from "next/link";
import { recipes } from "@/data/recipes";
import {
  optimizeRecipeBatch,
  type OptimizerInput,
  type OptimizationPreference,
} from "@/calculations/optimizer";
import { resolveBatch } from "@/calculations/batch";
import { aggregatePrepComponents } from "@/calculations/components";
import { number, weight } from "@/services/format";
import { usePlanner } from "./store";
import { BatchScores } from "./BatchScores";
import { Card, Notice, NumberField, WhyLink } from "./ui";

import { SCENARIO_CANDIDATES } from "@/data/optimizer-scenario";
type Result = ReturnType<typeof optimizeRecipeBatch>;
export function OptimizerPanel() {
  const { state, update, catalog } = usePlanner();
  const [form, setForm] = useState({
    totalMealTarget: 60,
    desiredRecipeCount: 10,
    servingsPerRecipe: 6,
    targetCalories: 600,
    minimumProtein: 50,
    requiredProteinDiversity: 2,
    requiredSauceDiversity: 3,
    requiredFlavourDiversity: 3,
  });
  const [mode, setMode] = useState<OptimizationPreference>("balanced");
  const [cut, setCut] = useState("original");
  const [asian, setAsian] = useState(false),
    [legumes, setLegumes] = useState(false);
  const [chickenMin, setChickenMin] = useState(0),
    [beefMin, setBeefMin] = useState(0);
  const [quality, setQuality] = useState(4);
  const [required, setRequired] = useState<string[]>([]),
    [favourites, setFavourites] = useState<string[]>([]),
    [excluded, setExcluded] = useState<string[]>([]);
  const [result, setResult] = useState<{
    data: Result;
    signature: string;
  } | null>(null);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [applied, setApplied] = useState(false);
  const candidates = state.candidateRecipeIds ?? [];
  const input: OptimizerInput = {
    ...form,
    candidateRecipeIds: candidates,
    optimizationPreference: mode,
    chickenCut:
      cut === "original"
        ? undefined
        : (cut as "chicken-thigh" | "chicken-breast"),
    requiredRecipeIds: required.filter((id) => candidates.includes(id)),
    favouriteRecipeIds: favourites.filter((id) => candidates.includes(id)),
    excludedIngredientIds: excluded,
    preferredAsian: asian,
    preferredLegumes: legumes,
    minimumRecipesByProtein: { chicken: chickenMin, beef: beefMin },
    minimumFreezerScore: quality,
    minimumMicrowaveScore: quality,
  };
  const signature = JSON.stringify({
    input,
    overrides: state.ingredientOverrides,
  });
  const current = result?.signature === signature ? result.data : null;
  const resolved = current ? resolveBatch(current.batch, recipes, catalog) : [];
  const components = aggregatePrepComponents(resolved);
  const candidateSet = (ids: string[]) =>
    update((old) => ({ ...old, candidateRecipeIds: ids }));
  function scenario() {
    setForm({
      totalMealTarget: 60,
      desiredRecipeCount: 10,
      servingsPerRecipe: 6,
      targetCalories: 600,
      minimumProtein: 50,
      requiredProteinDiversity: 2,
      requiredSauceDiversity: 3,
      requiredFlavourDiversity: 3,
    });
    candidateSet(SCENARIO_CANDIDATES);
    setMode("balanced");
    setCut("chicken-thigh");
    setAsian(true);
    setLegumes(true);
    setChickenMin(6);
    setBeefMin(2);
    setQuality(4);
    setRequired([]);
    setFavourites([]);
    setExcluded([]);
    setResult(null);
    setApplied(false);
  }
  function optimize() {
    setBusy(true);
    setError("");
    setApplied(false);
    // Allow the pending state to paint before this bounded, local calculation.
    setTimeout(() => {
      try {
        setResult({
          data: optimizeRecipeBatch(input, recipes, catalog),
          signature,
        });
      } catch (e) {
        setResult(null);
        setError(
          e instanceof Error ? e.message : "Optimaliseren is niet gelukt.",
        );
      } finally {
        setBusy(false);
      }
    }, 20);
  }
  return (
    <Card className="optimizer-panel">
      <div className="section-heading">
        <div>
          <div className="eyebrow">ÉÉN KEER VOORBEREIDEN</div>
          <h2>Optimaliseer mijn batch</h2>
          <p>
            Kies gerechten die je lekker vindt. Wij zoeken gedeelde bereidingen
            én verschillende smaken. <WhyLink section="optimizer" />
          </p>
        </div>
        <button className="button secondary" onClick={scenario}>
          Laad scenario 60 maaltijden
        </button>
      </div>
      <details className="candidate-selector">
        <summary>
          {candidates.length} kandidaat-recepten · kiezen en voorkeuren
        </summary>
        <p>
          Je kandidaten staan los van je huidige batch. Selecteer ze hier of in
          de receptenbibliotheek.
        </p>
        <div className="button-group">
          <button
            className="button secondary small-button"
            onClick={() => candidateSet(recipes.map((r) => r.id))}
          >
            Selecteer alle 30
          </button>
          <button
            className="button secondary small-button"
            onClick={() => candidateSet([])}
          >
            Wis kandidaten
          </button>
          <Link href="/recipes" className="text-link">
            Open bibliotheek →
          </Link>
        </div>
        <div className="candidate-grid">
          {recipes.map((r) => (
            <div className="candidate-row" key={r.id}>
              <label>
                <input
                  type="checkbox"
                  checked={candidates.includes(r.id)}
                  onChange={() =>
                    candidateSet(
                      candidates.includes(r.id)
                        ? candidates.filter((id) => id !== r.id)
                        : [...candidates, r.id],
                    )
                  }
                />
                {r.nameNl}
              </label>
              <select
                aria-label={`Voorkeur ${r.nameNl}`}
                disabled={!candidates.includes(r.id)}
                value={
                  required.includes(r.id)
                    ? "required"
                    : favourites.includes(r.id)
                      ? "favourite"
                      : "normal"
                }
                onChange={(e) => {
                  setRequired((ids) => [
                    ...ids.filter((id) => id !== r.id),
                    ...(e.target.value === "required" ? [r.id] : []),
                  ]);
                  setFavourites((ids) => [
                    ...ids.filter((id) => id !== r.id),
                    ...(e.target.value === "favourite" ? [r.id] : []),
                  ]);
                }}
              >
                <option value="normal">Kandidaat</option>
                <option value="favourite">Favoriet</option>
                <option value="required">Verplicht</option>
              </select>
            </div>
          ))}
        </div>
      </details>
      <div className="optimizer-fields">
        {(
          [
            { key: "totalMealTarget", label: "Totaal maaltijden", max: 3000 },
            {
              key: "desiredRecipeCount",
              label: "Verschillende recepten",
              max: 30,
            },
            { key: "servingsPerRecipe", label: "Porties per recept", max: 100 },
            { key: "targetCalories", label: "Kcal per maaltijd", max: 2000 },
            { key: "minimumProtein", label: "Minimaal eiwit (g)", max: 200 },
          ] as const
        ).map((field) => (
          <NumberField
            key={field.key}
            label={field.label}
            min={field.key === "targetCalories" ? 100 : 1}
            max={field.max}
            value={form[field.key]}
            onCommit={(value) =>
              setForm((old) => ({ ...old, [field.key]: value }))
            }
          />
        ))}
      </div>
      <div className="field">
        <label htmlFor="optimization-mode">Afweging</label>
        <select
          id="optimization-mode"
          value={mode}
          onChange={(e) => setMode(e.target.value as OptimizationPreference)}
        >
          <option value="maximum_efficiency">Maximale efficiëntie</option>
          <option value="balanced">Gebalanceerd</option>
          <option value="maximum_variety">Maximale variatie</option>
        </select>
      </div>
      <details>
        <summary>Voeding, voorkeuren en minimumvariatie</summary>
        <div className="optimizer-fields">
          <div className="field">
            <label htmlFor="chicken-cut">Kip gebruiken als</label>
            <select
              id="chicken-cut"
              value={cut}
              onChange={(e) => setCut(e.target.value)}
            >
              <option value="original">Volgens recept</option>
              <option value="chicken-thigh">Kippendij zonder vel</option>
              <option value="chicken-breast">Kipfilet</option>
            </select>
          </div>
          <NumberField
            label="Minimaal kiprecepten"
            value={chickenMin}
            min={0}
            max={30}
            onCommit={setChickenMin}
          />
          <NumberField
            label="Minimaal rundrecepten"
            value={beefMin}
            min={0}
            max={30}
            onCommit={setBeefMin}
          />
          <NumberField
            label="Minimaal eiwitbronnen"
            value={form.requiredProteinDiversity}
            min={0}
            max={6}
            onCommit={(value) =>
              setForm((old) => ({ ...old, requiredProteinDiversity: value }))
            }
          />
          <NumberField
            label="Minimaal sausfamilies"
            value={form.requiredSauceDiversity}
            min={0}
            max={10}
            onCommit={(value) =>
              setForm((old) => ({ ...old, requiredSauceDiversity: value }))
            }
          />
          <NumberField
            label="Minimaal smaakprofielen"
            value={form.requiredFlavourDiversity}
            min={0}
            max={30}
            onCommit={(value) =>
              setForm((old) => ({ ...old, requiredFlavourDiversity: value }))
            }
          />
          <NumberField
            label="Vriezer- en magnetronscore vanaf"
            value={quality}
            min={1}
            max={5}
            onCommit={setQuality}
          />
        </div>
        <div className="preference-checks">
          <label>
            <input
              type="checkbox"
              checked={asian}
              onChange={(e) => setAsian(e.target.checked)}
            />
            Voorkeur voor Aziatisch
          </label>
          <label>
            <input
              type="checkbox"
              checked={legumes}
              onChange={(e) => setLegumes(e.target.checked)}
            />
            Peulvruchten welkom
          </label>
        </div>
        <div className="field">
          <label htmlFor="excluded-ingredients">
            Ingrediënten uitsluiten (Ctrl/Cmd voor meerdere)
          </label>
          <select
            id="excluded-ingredients"
            multiple
            value={excluded}
            onChange={(e) =>
              setExcluded(Array.from(e.target.selectedOptions, (o) => o.value))
            }
          >
            {Object.values(catalog).map((i) => (
              <option key={i.id} value={i.id}>
                {i.nameNl}
              </option>
            ))}
          </select>
        </div>
        <p className="muted small">
          Kwaliteitsscores zijn receptinschattingen, geen gemeten resultaten.
          Voorkeuren: favoriet +12, Aziatisch +8, peulvruchten +4 en kwaliteit
          maximaal +2; gemiddeld over de batch.
        </p>
      </details>
      <button className="button primary" disabled={busy} onClick={optimize}>
        {busy ? "Combinaties vergelijken…" : "Optimaliseer"}
      </button>
      {error && <Notice tone="warning">{error}</Notice>}
      {result && !current && (
        <Notice>
          Je invoer of voedingswaarden zijn gewijzigd. Optimaliseer opnieuw om
          een actuele batch te krijgen.
        </Notice>
      )}
      {current && (
        <section className="optimizer-result" aria-live="polite">
          <div className="eyebrow">JOUW VOORGESTELDE BATCH</div>
          <h3>
            {current.batch.length} recepten ·{" "}
            {current.batch.reduce((sum, r) => sum + r.servings, 0)} maaltijden
          </h3>
          <BatchScores recipes={resolved.map((r) => r.recipe)} />
          <p className="muted small">{current.explanation}</p>
          <div className="component-highlights">
            {components
              .filter(
                (c) =>
                  c.recipes.length > 1 &&
                  ["protein", "carbohydrate", "sauce_base"].includes(
                    c.component.type,
                  ),
              )
              .map((c) => (
                <span key={c.component.id}>
                  <strong>{c.component.nameNl}</strong>
                  {c.recipes.length} recepten · {weight(c.inputGrams)}
                </span>
              ))}
          </div>
          <div className="optimized-recipes">
            {resolved.map((item) => (
              <details key={item.recipeId}>
                <summary>
                  <strong>{item.recipe.nameNl}</strong>
                  <span>
                    {item.servings} × {number(item.scaled.nutrition.kcal)} kcal
                    · {number(item.scaled.nutrition.protein, 1)} g eiwit
                  </span>
                </summary>
                <p>
                  {catalog[item.recipe.proteinIngredientId].nameNl}.{" "}
                  {current.reasons
                    .find((row) => row.recipeId === item.recipeId)
                    ?.reasons.join(" · ")}
                </p>
              </details>
            ))}
          </div>
          {current.rejected.length > 0 && (
            <details>
              <summary>
                {current.rejected.length} kandidaten uitgesloten
              </summary>
              <ul>
                {current.rejected.map((row) => (
                  <li key={row.recipeId}>
                    {recipes.find((r) => r.id === row.recipeId)?.nameNl}:{" "}
                    {row.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <button
            className="button primary"
            onClick={() => {
              update((old) => ({
                ...old,
                batch: current.batch,
                completedTasks: {},
              }));
              setApplied(true);
            }}
          >
            {state.batch.length
              ? "Gebruik voorstel en vervang huidige batch"
              : "Gebruik deze batch"}
          </button>
          {applied && (
            <Notice tone="success">
              Batch opgeslagen.{" "}
              <Link href="/combine">Bekijk Slim combineren →</Link>
            </Notice>
          )}
        </section>
      )}
    </Card>
  );
}
