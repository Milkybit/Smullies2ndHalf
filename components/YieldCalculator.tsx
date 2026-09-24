"use client";
import { useState } from "react";
import {
  aggregatePrepComponents,
  allocateComponentYield,
  productionYieldLots,
  type AggregatedComponent,
} from "@/calculations/components";
import { cookingPlan } from "@/calculations/cooking";
import { number, weight } from "@/services/format";
import { usePlanner } from "./store";
import { Card, Notice } from "./ui";
function ComponentYield({
  entry,
  storageKey,
  label,
}: {
  entry: AggregatedComponent;
  storageKey?: string;
  label?: string;
}) {
  const { state, update } = usePlanner();
  const id = storageKey ?? entry.component.id;
  const saved = state.componentYields?.[id];
  const legacyId =
    id === "basmati-rice" ? "rice" : id === "pasta" ? "pasta" : undefined;
  const legacy = legacyId ? state.cookedYields[legacyId] : undefined;
  const legacyValid =
    legacy && Math.abs(legacy.dryGrams - entry.inputGrams) < 0.01;
  const [text, setText] = useState(
    String(saved?.cookedGrams ?? (legacyValid ? legacy.cookedGrams : "")),
  );
  const [error, setError] = useState("");
  const stale = saved
    ? saved.signature !== entry.signature
    : legacy && !legacyValid;
  const cookedGrams =
    saved && !stale
      ? saved.cookedGrams
      : !saved && legacyValid
        ? legacy.cookedGrams
        : undefined;
  const results = cookedGrams ? allocateComponentYield(entry, cookedGrams) : [];
  return (
    <Card>
      <h3>{label ?? entry.component.nameNl}</h3>
      <p>
        {weight(entry.inputGrams)} vóór bereiding ·{" "}
        {entry.recipes.reduce((sum, r) => sum + r.servings, 0)} porties
      </p>
      <form
        className="yield-form"
        onSubmit={(event) => {
          event.preventDefault();
          const value = Number(text);
          if (!Number.isFinite(value) || value < 1 || value > 5000000) {
            setError("Vul een gewicht van 1 t/m 5.000.000 g in.");
            return;
          }
          setError("");
          update((old) => ({
            ...old,
            componentYields: {
              ...old.componentYields,
              [id]: { signature: entry.signature, cookedGrams: value },
            },
          }));
        }}
      >
        <div className="field">
          <label htmlFor={`yield-${id}`}>
            Werkelijke opbrengst {label ?? entry.component.nameNl} (g)
          </label>
          <input
            id={`yield-${id}`}
            type="number"
            min="1"
            max="5000000"
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <button className="button primary">Bereken verdeling</button>
      </form>
      {error && <Notice tone="warning">{error}</Notice>}
      {stale && (
        <Notice tone="warning">
          Samenstelling of verdeling is gewijzigd. Weeg deze component opnieuw.
        </Notice>
      )}
      {results.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Recept</th>
                <th>Vóór bereiding</th>
                <th>Na bereiding totaal</th>
                <th>{storageKey ? "Bijdrage per bakje" : "Per bakje"}</th>
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
            {storageKey
              ? "Deze bijdrage geldt voor deze deelronde. Tel de bijdragen van hetzelfde recept binnen de productieronde op. "
              : ""}
            Rond alleen bij het afwegen af en verdeel het laatste restje.
          </p>
        </div>
      )}
    </Card>
  );
}
export function YieldCalculator() {
  const { batch, state, catalog } = usePlanner();
  const [mode, setMode] = useState("rounds");
  const entries = aggregatePrepComponents(batch).filter(
    (entry) => entry.component.yieldTrackingSupported,
  );
  const lots = productionYieldLots(
    cookingPlan(batch, state.equipment, catalog),
    entries,
  );
  return (
    <div className="stack">
      <div className="field">
        <label htmlFor="yield-mode">Wat heb je gewogen?</label>
        <select
          id="yield-mode"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="rounds">Per kookronde · direct verdelen</option>
          <option value="whole">Hele component · alles samen gemengd</option>
        </select>
      </div>
      <Notice>
        Weeg zonder pan, bij vlees inclusief bewaarde sappen. Per ronde kun je
        direct verdelen en koelen. Gebruik ‘Hele component’ alleen als alle
        gekookte deelrondes fysiek zijn samengevoegd. De voedingsberekening
        blijft op rauw, droog of uitgelekt gewicht. Water verandert die
        berekening niet.
      </Notice>
      {mode === "rounds" ? (
        <>
          {entries
            .filter((e) =>
              ["sauce_base", "aromatic_base"].includes(e.component.type),
            )
            .map((entry) => (
              <ComponentYield key={entry.component.id} entry={entry} />
            ))}
          {lots.map((lot) => (
            <ComponentYield
              key={lot.key}
              storageKey={lot.key}
              label={lot.label}
              entry={lot.entry}
            />
          ))}
        </>
      ) : (
        entries.map((entry) => (
          <ComponentYield key={entry.component.id} entry={entry} />
        ))
      )}
      {!entries.length && (
        <p>Je batch bevat nog geen componenten om te wegen.</p>
      )}
    </div>
  );
}
