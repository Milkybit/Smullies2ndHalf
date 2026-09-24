"use client";
import { useState } from "react";
import { usePlanner } from "../store";
import { redistributeMeals } from "@/calculations/meals";
import { number } from "@/services/format";
import { Card, Icon, Notice, NumberField, PageTitle, WhyLink } from "../ui";
export function MealsScreen() {
  const { state, update, targets } = usePlanner();
  const [warning, setWarning] = useState("");
  if (!targets) return null;
  const total = state.meals.reduce((sum, meal) => sum + meal.calories, 0);
  function redistribute() {
    const result = redistributeMeals(state.meals, targets!.calories);
    setWarning(result.warning ?? "");
    if (!result.warning) update((old) => ({ ...old, meals: result.meals }));
  }
  return (
    <>
      <PageTitle
        eyebrow="JOUW RITME"
        title="Dagindeling"
        description="Geef ieder eetmoment ruimte. Zet vaste momenten op slot en verdeel de rest."
        action={
          <button className="button primary" onClick={redistribute}>
            Verdeel naar dagdoel
            <Icon name="arrow" />
          </button>
        }
      />
      <Card>
        <div className="allocation-summary">
          <div>
            <span className="muted">Ingepland / dagdoel</span>
            <h2>
              {number(total)} <small>/ {number(targets.calories)} kcal</small>
            </h2>
          </div>
          <span
            className={`badge ${Math.abs(total - targets.calories) < 1 ? "green" : "amber"}`}
          >
            {Math.abs(total - targets.calories) < 1
              ? "Verdeling klopt"
              : `${number(Math.abs(total - targets.calories))} kcal ${total > targets.calories ? "te veel" : "over"}`}
          </span>
        </div>
        <div
          className="allocation-bar"
          role="img"
          aria-label={`${number(total)} van ${number(targets.calories)} kcal verdeeld`}
        >
          {state.meals.map((meal, index) => (
            <div
              key={meal.id}
              className={`segment-${index % 6}`}
              style={{
                width: `${(meal.calories / Math.max(total, targets.calories, 1)) * 100}%`,
              }}
            />
          ))}
        </div>
        {warning && <Notice tone="warning">{warning}</Notice>}
        <div className="meal-editor">
          {state.meals.map((meal, index) => (
            <div className="meal-editor-row" key={meal.id}>
              <b className="meal-order">{String(index + 1).padStart(2, "0")}</b>
              <div className="field">
                <label htmlFor={`name-${meal.id}`}>Eetmoment {index + 1}</label>
                <input
                  id={`name-${meal.id}`}
                  value={meal.name}
                  maxLength={80}
                  onChange={(e) =>
                    update((old) => ({
                      ...old,
                      meals: old.meals.map((m) =>
                        m.id === meal.id
                          ? {
                              ...m,
                              name: e.target.value || `Eetmoment ${index + 1}`,
                            }
                          : m,
                      ),
                    }))
                  }
                />
              </div>
              <NumberField
                label={`Calorieën ${meal.name}`}
                value={meal.calories}
                unit="kcal"
                onCommit={(calories) =>
                  update((old) => ({
                    ...old,
                    meals: old.meals.map((m) =>
                      m.id === meal.id ? { ...m, calories } : m,
                    ),
                  }))
                }
              />
              <button
                className={`button lock-button ${meal.locked ? "selected" : "secondary"}`}
                aria-pressed={meal.locked}
                aria-label={`${meal.name} ${meal.locked ? "vrijmaken" : "vastzetten"}`}
                onClick={() =>
                  update((old) => ({
                    ...old,
                    meals: old.meals.map((m) =>
                      m.id === meal.id ? { ...m, locked: !m.locked } : m,
                    ),
                  }))
                }
              >
                <Icon name="lock" />
                {meal.locked ? "Vastgezet" : "Vrij"}
              </button>
            </div>
          ))}
        </div>
      </Card>
      <Notice>
        Bij herverdelen blijven vastgezette eetmomenten gelijk. De overige
        calorieën worden naar verhouding verdeeld. Je dagindeling bepaalt niet
        automatisch welke recepten in je batch zitten.{" "}
        <WhyLink section="meals" />
      </Notice>
    </>
  );
}
