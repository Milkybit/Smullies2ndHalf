"use client";
import Link from "next/link";
import { usePlanner } from "../store";
import { batchSummary } from "@/calculations/batch";
import { number } from "@/services/format";
import { RecipeBrowser } from "../RecipeBrowser";
import { Card, Icon, Notice, NumberField, PageTitle, Stat } from "../ui";
import type { BatchItem } from "@/domain/types";

export function BatchScreen() {
  const { state, update, batch } = usePlanner();
  const summary = batchSummary(batch, state.mealprepsPerDay);
  function edit(recipeId: string, patch: Partial<BatchItem>) {
    update((old) => ({
      ...old,
      batch: old.batch.map((item) =>
        item.recipeId === recipeId ? { ...item, ...patch } : item,
      ),
      completedTasks: {},
    }));
  }
  return (
    <>
      <PageTitle
        eyebrow="VOORUIT KOKEN"
        title="Batch samenstellen"
        description="Kies je gerechten en porties. Alle hoeveelheden, boodschappen en kooktaken rekenen direct mee."
        action={
          batch.length > 0 && (
            <Link className="button primary" href="/shopping">
              Naar boodschappen
              <Icon name="arrow" />
            </Link>
          )
        }
      />
      <div className="stats-grid four">
        <Stat
          label="Totaal maaltijden"
          value={number(summary.meals)}
          unit="porties"
        />
        <Stat
          label="Vooruit gepland"
          value={number(summary.days, 1)}
          unit="dagen"
        />
        <Stat
          label="Gemiddeld per maaltijd"
          value={number(summary.averageCalories)}
          unit="kcal"
        />
        <Stat
          label="Gemiddeld eiwit"
          value={number(summary.averageProtein)}
          unit="g"
        />
      </div>
      <Card>
        <div className="section-heading">
          <div>
            <h2>Je geselecteerde recepten</h2>
            <p className="muted small">
              Batchtotaal: {number(summary.calories)} kcal. Doelen gelden per
              portie.
            </p>
          </div>
          <NumberField
            compact
            label="Mealpreps per dag"
            min={1}
            max={10}
            value={state.mealprepsPerDay}
            onCommit={(value) =>
              update((old) => ({ ...old, mealprepsPerDay: value }))
            }
          />
        </div>
        {!batch.length ? (
          <div className="inline-empty">
            Je batch is nog leeg. Voeg hieronder je eerste recept toe.
          </div>
        ) : (
          <div className="batch-rows">
            {batch.map((item) => (
              <div className="batch-row" key={item.recipeId}>
                <div className="batch-recipe-name">
                  <Link href={`/recipes/${item.recipeId}`}>
                    <h3>{item.recipe.nameNl}</h3>
                  </Link>
                  <p>
                    {number(item.scaled.nutrition.kcal)} kcal ·{" "}
                    {number(item.scaled.nutrition.protein)} g eiwit per portie
                  </p>
                  {item.scaled.warnings.length > 0 && (
                    <Notice tone="warning">
                      {item.scaled.warnings.join(" ")}
                    </Notice>
                  )}
                </div>
                <NumberField
                  compact
                  label={`Porties ${item.recipe.nameNl}`}
                  min={1}
                  max={100}
                  value={item.servings}
                  onCommit={(servings) => edit(item.recipeId, { servings })}
                />
                <NumberField
                  compact
                  label={`Kcal ${item.recipe.nameNl}`}
                  min={100}
                  max={2000}
                  value={item.targetCalories}
                  onCommit={(targetCalories) =>
                    edit(item.recipeId, { targetCalories })
                  }
                />
                <NumberField
                  compact
                  label={`Eiwit ${item.recipe.nameNl}`}
                  max={200}
                  value={item.minimumProtein}
                  onCommit={(minimumProtein) =>
                    edit(item.recipeId, { minimumProtein })
                  }
                />
                <button
                  className="remove-button"
                  aria-label={`Verwijder ${item.recipe.nameNl} uit batch`}
                  onClick={() =>
                    update((old) => ({
                      ...old,
                      batch: old.batch.filter(
                        (row) => row.recipeId !== item.recipeId,
                      ),
                      completedTasks: {},
                    }))
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
      <div className="section-title">
        <div className="eyebrow">VUL JE BATCH AAN</div>
        <h2>Wat komt er in je vriezer?</h2>
      </div>
      <RecipeBrowser compact />
    </>
  );
}
