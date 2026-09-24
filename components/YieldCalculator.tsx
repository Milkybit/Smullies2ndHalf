"use client";
import { useState } from "react";
import type { ResolvedBatchItem } from "@/domain/types";
import { allocateCookedYield } from "@/calculations/yield";
import { number, weight } from "@/services/format";
import { usePlanner } from "./store";
import { Card, Notice } from "./ui";
function YieldComponent({
  ingredientId,
  batch,
}: {
  ingredientId: string;
  batch: ResolvedBatchItem[];
}) {
  const { state, update, catalog } = usePlanner();
  const allocations = batch.flatMap((item) => {
    const row = item.scaled.ingredients.find(
      (r) => r.ingredientId === ingredientId,
    );
    return row
      ? [
          {
            recipeId: item.recipeId,
            name: item.recipe.nameNl,
            dryGrams: row.grams * item.servings,
            servings: item.servings,
          },
        ]
      : [];
  });
  const dryGrams = allocations.reduce((sum, row) => sum + row.dryGrams, 0);
  const saved = state.cookedYields[ingredientId];
  const [text, setText] = useState(saved ? String(saved.cookedGrams) : "");
  const [error, setError] = useState("");
  if (!allocations.length) return null;
  const stale = saved && Math.abs(saved.dryGrams - dryGrams) > 0.01;
  const results =
    saved && !stale ? allocateCookedYield(allocations, saved.cookedGrams) : [];
  return (
    <Card>
      <div className="section-heading">
        <div>
          <h3>{catalog[ingredientId].nameNl}</h3>
          <p className="muted">
            {weight(dryGrams)} droog voor{" "}
            {allocations.reduce((sum, row) => sum + row.servings, 0)} porties
          </p>
        </div>
        <span className="badge">Voeding blijft op droog gewicht</span>
      </div>
      <form
        className="yield-form"
        onSubmit={(event) => {
          event.preventDefault();
          const cookedGrams = Number(text);
          if (
            !Number.isFinite(cookedGrams) ||
            cookedGrams <= 0 ||
            cookedGrams > 5000000
          ) {
            setError("Vul een gekookt gewicht van 1 t/m 5.000.000 g in.");
            return;
          }
          setError("");
          update((old) => ({
            ...old,
            cookedYields: {
              ...old.cookedYields,
              [ingredientId]: { dryGrams, cookedGrams },
            },
          }));
        }}
      >
        <div className="field">
          <label htmlFor={`yield-${ingredientId}`}>
            Totaal gekookt gewicht {catalog[ingredientId].nameNl} (g)
          </label>
          <input
            id={`yield-${ingredientId}`}
            type="number"
            min="1"
            max="5000000"
            step="1"
            required
            placeholder="Bijvoorbeeld 4.850"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <button className="button primary">Bereken verdeling</button>
      </form>
      {error && <Notice tone="warning">{error}</Notice>}
      {stale && (
        <Notice tone="warning">
          Je batch of ingrediënten zijn gewijzigd. Weeg de nieuwe totale
          opbrengst en bereken opnieuw.
        </Notice>
      )}
      {results.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Recept</th>
                <th>Droog totaal</th>
                <th>Gekookt totaal</th>
                <th>Per bakje</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.recipeId}>
                  <td>
                    {row.name}
                    <small>{row.servings} porties</small>
                  </td>
                  <td>{weight(row.dryGrams)}</td>
                  <td>{weight(row.cookedShare)}</td>
                  <td>
                    <strong>{number(row.cookedPerServing)} g</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted small">
            Afgerond op hele grammen; verdeel het laatste restje over de bakjes.
            Vul bij meerdere kookrondes de som van de gekookte gewichten in.
          </p>
        </div>
      )}
    </Card>
  );
}
export function YieldCalculator() {
  const { batch } = usePlanner();
  return (
    <div className="stack">
      <Notice>
        Weeg alleen de gekookte rijst of pasta, zonder pan, saus of groente. De
        verdeling volgt het aandeel droog gewicht van ieder recept. Calorieën
        veranderen hierdoor niet.
      </Notice>
      {["rice", "pasta"].map((id) => (
        <YieldComponent key={id} ingredientId={id} batch={batch} />
      ))}
      {!batch.some((item) =>
        item.scaled.ingredients.some((row) =>
          ["rice", "pasta"].includes(row.ingredientId),
        ),
      ) && <p>Je batch bevat nog geen rijst of pasta.</p>}
    </div>
  );
}
