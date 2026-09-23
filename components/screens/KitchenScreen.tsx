"use client";
import { useState } from "react";
import { usePlanner } from "../store";
import { batchSummary } from "@/calculations/batch";
import { kitchenProgress } from "@/calculations/kitchen";
import {
  kitchenCategoryTips,
  kitchenItems,
  kitchenMeasurements,
  kitchenNotNeeded,
} from "@/data/kitchen";
import { KITCHEN_CATEGORY_LABELS } from "@/domain/constants";
import type { KitchenCategory } from "@/domain/types";
import { Card, Icon, PageTitle } from "../ui";
export function KitchenScreen() {
  const { state, update, batch } = usePlanner();
  const [essentialOnly, setEssentialOnly] = useState(false);
  const progress = kitchenProgress(kitchenItems, state.kitchenChecks);
  const servings = batchSummary(batch, state.mealprepsPerDay).meals;
  const hints: Record<string, string> = {
    "meal-containers": servings
      ? `Je huidige batch telt ${servings} porties.`
      : "Tien recepten van zes porties zijn 60 bakjes.",
    pans: `Je hebt ${state.equipment.burners} pitten ingesteld bij Kookdag.`,
  };
  const visible = kitchenItems.filter(
    (item) => !essentialOnly || item.essential,
  );
  return (
    <>
      <PageTitle
        eyebrow="EENMALIG IN HUIS"
        title="Keukenspullen"
        description="Wat je nodig hebt voor een soepele kookdag. Vink af wat je al hebt; met de spullen onder ‘Basis’ kun je beginnen."
        action={
          <div className="button-group no-print">
            <button
              className="button secondary"
              onClick={() => window.print()}
            >
              Print
            </button>
          </div>
        }
      />
      <div className="shopping-progress no-print">
        <span>
          {progress.owned} van {progress.total} in huis · basis{" "}
          {progress.essentialOwned} van {progress.essentialTotal}
        </span>
        <progress
          value={progress.owned}
          max={progress.total}
          aria-label="Keukenspullen in huis"
        />
        <label className="kitchen-filter">
          <input
            type="checkbox"
            checked={essentialOnly}
            onChange={() => setEssentialOnly(!essentialOnly)}
          />
          Alleen de basis
        </label>
        <a className="text-link kitchen-measure-link" href="#meet-eerst">
          Eerst meten ↓
        </a>
      </div>
      <div className="shopping-layout">
        <div className="stack">
          {Object.entries(KITCHEN_CATEGORY_LABELS).map(([category, label]) => {
            const group = visible.filter((item) => item.category === category);
            const owned = group.filter(
              (item) => state.kitchenChecks[item.id],
            ).length;
            const tip = kitchenCategoryTips[category as KitchenCategory];
            return (
              group.length > 0 && (
                <Card key={category} className="shopping-category">
                  <div className="section-heading">
                    <h2>{label}</h2>
                    <span className="badge">
                      {owned} / {group.length}
                    </span>
                  </div>
                  {tip && <p className="kitchen-tip">{tip}</p>}
                  <div className="shopping-column-labels kitchen-columns">
                    <span>Benodigdheid</span>
                    <span>Aantal</span>
                  </div>
                  {group.map((item) => {
                    const done = !!state.kitchenChecks[item.id];
                    return (
                      <div
                        className={`shopping-row kitchen-row ${done ? "checked" : ""}`}
                        key={item.id}
                      >
                        <label>
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={() =>
                              update((old) => ({
                                ...old,
                                kitchenChecks: {
                                  ...old.kitchenChecks,
                                  [item.id]: !done,
                                },
                              }))
                            }
                          />
                          <span>
                            <strong>{item.nameNl}</strong>
                            {item.essential && (
                              <span className="badge green kitchen-badge">
                                Basis
                              </span>
                            )}
                            <small>{item.purpose}</small>
                            {hints[item.id] && <small>{hints[item.id]}</small>}
                          </span>
                        </label>
                        <span>{item.quantity}</span>
                      </div>
                    );
                  })}
                </Card>
              )
            );
          })}
        </div>
        <div className="stack">
          <Card className="combine-card">
            <Icon name="kitchen" size={28} />
            <h2 id="meet-eerst">Meet dit eerst</h2>
            <p>Zo weet je welke maten in jouw keuken passen.</p>
            {kitchenMeasurements.map((row) => (
              <div className="shared-item" key={row.title}>
                <strong>{row.title}</strong>
                <small>{row.text}</small>
              </div>
            ))}
          </Card>
          <Card>
            <h3>Niet nodig</h3>
            <ul className="kitchen-not-needed">
              {kitchenNotNeeded.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <p className="muted">
              Dit levert thuis weinig op. Een extra pan helpt meer.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
