"use client";
import Link from "next/link";
import { usePlanner } from "../store";
import { batchSummary } from "@/calculations/batch";
import { recipes } from "@/data/recipes";
import { number } from "@/services/format";
import { Card, Icon, Notice } from "../ui";
import { RecipeVisual } from "../RecipeVisual";
import { StarterBatch } from "../StarterBatch";
import { BatchJourney } from "../BatchJourney";

export function DashboardScreen() {
  const { state, batch, targets } = usePlanner();
  if (!targets) return null;
  const summary = batchSummary(batch, state.mealprepsPerDay);
  const mealTotal = state.meals.reduce((sum, meal) => sum + meal.calories, 0);
  const feature = recipes.find((recipe) => recipe.id === "teriyaki")!;
  return (
    <>
      <header className="overview-heading">
        <div>
          <div className="eyebrow">Eten voor jouw doelen</div>
          <h1>Jouw plan, goed voorbereid.</h1>
        </div>
        <Link className="text-link" href="/profile">
          Mijn voedingsdoelen <Icon name="arrow" size={16} />
        </Link>
      </header>
      <section className="editorial-hero" aria-labelledby="hero-title">
        <div className="editorial-copy">
          <span className="hero-overline">
            Persoonlijk gepland. Met smaak gemaakt.
          </span>
          <h2 id="hero-title">
            Goed eten.
            <br />
            <em>Ook op drukke dagen.</em>
          </h2>
          <p>
            {batch.length
              ? `${number(summary.meals)} maaltijden, ${batch.length} recepten en één overzichtelijk plan. Je volgende kookdag begint hier.`
              : "Van je voedingsdoel naar een vriezer vol lekkere maaltijden. Kies je gerechten; je porties, boodschappen en kookplan rekenen mee."}
          </p>
          <Link
            href={batch.length ? "/batch" : "/recipes"}
            className="button primary"
          >
            {batch.length ? "Verder met mijn batch" : "Ontdek jouw recepten"}
            <Icon name="arrow" size={18} />
          </Link>
          <span className="hero-footnote">
            30 recepten · persoonlijke porties · samen vooruit koken
          </span>
        </div>
        <Link
          href="/recipes/teriyaki"
          className="editorial-photo"
          aria-label="Bekijk Teriyaki kippendij & broccoli"
        >
          <RecipeVisual recipe={feature} priority />
          <div className="editorial-photo-label">
            <span>Op het menu</span>
            <strong>Teriyaki kippendij & broccoli</strong>
            <Icon name="arrow" size={19} />
          </div>
        </Link>
      </section>
      <BatchJourney active="batch" />
      <section
        className="daily-target-strip"
        aria-label="Jouw dagelijkse voedingsdoelen"
      >
        <div className="target-strip-intro">
          <span className="eyebrow">Afgestemd op jou</span>
          <h2>Je dagelijkse basis</h2>
          <Link href="/profile">Doelen aanpassen ↗</Link>
        </div>
        {[
          [targets.calories, "kcal", "Energie"],
          [targets.protein, "g", "Eiwit"],
          [targets.carbs, "g", "Koolhydraten"],
          [targets.fat, "g", "Vet"],
        ].map(([value, unit, label]) => (
          <div className="target-strip-value" key={String(label)}>
            <span>{label}</span>
            <strong>
              {number(Number(value))}
              <small>{unit}</small>
            </strong>
          </div>
        ))}
      </section>
      {batch.length > 0 ? (
        <section className="active-batch-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">Klaar voor de volgende stap</div>
              <h2>Je actieve batch</h2>
            </div>
            <Link className="text-link" href="/batch">
              Alle recepten <Icon name="arrow" size={16} />
            </Link>
          </div>
          <div className="active-batch-layout">
            <div className="active-recipe-list">
              {batch.slice(0, 4).map((item, index) => (
                <Link href={`/recipes/${item.recipeId}`} key={item.recipeId}>
                  <span className="active-recipe-index">0{index + 1}</span>
                  <span>
                    <strong>{item.recipe.nameNl}</strong>
                    <small>
                      {item.servings} porties ·{" "}
                      {number(item.scaled.nutrition.kcal)} kcal ·{" "}
                      {number(item.scaled.nutrition.protein)} g eiwit
                    </small>
                  </span>
                  <Icon name="arrow" size={17} />
                </Link>
              ))}
              {batch.length > 4 && (
                <Link href="/batch">
                  Nog {batch.length - 4} recepten bekijken →
                </Link>
              )}
            </div>
            <div className="batch-ready">
              <span>Jouw voorbereiding</span>
              <strong>
                {number(summary.meals)}
                <small>maaltijden</small>
              </strong>
              <p>
                {number(summary.days, 1)} dagen vooruit bij{" "}
                {state.mealprepsPerDay} maaltijden per dag.
              </p>
              <Link href="/shopping" className="button primary full-width">
                Bekijk boodschappen <Icon name="arrow" size={17} />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <StarterBatch />
      )}
      <Card className="daily-structure">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Een ritme dat bij je past</div>
            <h2>Zo ziet je dag eruit</h2>
          </div>
          <Link className="text-link" href="/meals">
            Dagindeling aanpassen <Icon name="arrow" size={16} />
          </Link>
        </div>
        <div className="daily-meal-grid">
          {state.meals.map((meal, index) => (
            <div key={meal.id}>
              <span className="meal-sequence">0{index + 1}</span>
              <strong>{meal.name}</strong>
              <span>
                {number(meal.calories)} <small>kcal</small>
              </span>
              <div className="daily-meal-track">
                <i
                  style={{
                    width: `${Math.min(100, (meal.calories / Math.max(1, targets.calories)) * 100 * 2.5)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        {Math.abs(mealTotal - targets.calories) > 1 && (
          <Notice tone="warning">
            Je dagindeling wijkt{" "}
            {number(Math.abs(mealTotal - targets.calories))} kcal af van je
            dagdoel. <Link href="/meals">Pas de verdeling aan.</Link>
          </Notice>
        )}
      </Card>
    </>
  );
}
