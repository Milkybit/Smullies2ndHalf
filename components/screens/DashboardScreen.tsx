"use client";
import Link from "next/link";
import { usePlanner } from "../store";
import { batchSummary } from "@/calculations/batch";
import { number } from "@/services/format";
import { Card, Icon, PageTitle, Stat } from "../ui";

export function DashboardScreen() {
  const { state, batch, targets } = usePlanner();
  if (!targets) return null;
  const summary = batchSummary(batch, state.mealprepsPerDay);
  const mealTotal = state.meals.reduce((sum, meal) => sum + meal.calories, 0);
  return (
    <>
      <PageTitle
        eyebrow="OVERZICHT"
        title="Een goed plan voor goed eten."
        description="Je persoonlijke doelen, dagindeling en volgende kookdag op één plek."
        action={
          <Link className="button primary" href="/batch">
            <Icon name="plus" />
            Batch samenstellen
          </Link>
        }
      />
      <div className="dashboard-top">
        <section className="goal-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">JOUW DAGDOEL</div>
              <h2>Voeding die bij je past</h2>
            </div>
            <Icon name="flame" size={26} />
          </div>
          <div className="goal-main">
            <div>
              <div className="goal-number">
                {number(targets.calories)}
                <span>kcal / dag</span>
              </div>
              <p>
                Een persoonlijk startpunt.
                <br />
                Aanpasbaar wanneer jij dat wilt.
              </p>
              <Link href="/profile">
                Bekijk je berekening <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div
              className="macro-ring"
              role="img"
              aria-label={`${number(targets.protein)} gram eiwit, ${number(targets.carbs)} gram koolhydraten en ${number(targets.fat)} gram vet`}
              style={{
                background: `conic-gradient(#c3d6b2 0 ${((targets.protein * 4) / Math.max(1, targets.macroCalories)) * 100}%, #f2c57c 0 ${((targets.protein * 4 + targets.carbs * 4) / Math.max(1, targets.macroCalories)) * 100}%, #8aa99e 0 100%)`,
              }}
            >
              <div>
                <Icon name="ingredients" size={30} />
                <span>jouw balans</span>
              </div>
            </div>
          </div>
          <div className="goal-macros">
            <div>
              <i className="protein-dot" />
              <span>Eiwit</span>
              <strong>
                {number(targets.protein)} <small>g</small>
              </strong>
            </div>
            <div>
              <i className="carbs-dot" />
              <span>Koolhydraten</span>
              <strong>
                {number(targets.carbs)} <small>g</small>
              </strong>
            </div>
            <div>
              <i className="fat-dot" />
              <span>Vet</span>
              <strong>
                {number(targets.fat)} <small>g</small>
              </strong>
            </div>
          </div>
        </section>
        <Card className="next-step">
          <div className="eyebrow">VAN PLAN NAAR VRIEZER</div>
          <h2>
            Eén kookdag.
            <br />
            Heel veel rust.
          </h2>
          <p>
            Stel je batch samen, haal alles in huis en kook met een duidelijk
            stappenplan.
          </p>
          <ol className="workflow-list">
            <li>
              <b>1</b>
              <Link href="/recipes">
                Kies je recepten <Icon name="arrow" size={16} />
              </Link>
            </li>
            <li>
              <b>2</b>
              <Link href="/shopping">
                Verzamel je boodschappen <Icon name="arrow" size={16} />
              </Link>
            </li>
            <li>
              <b>3</b>
              <Link href="/cooking">
                Aan de slag in de keuken <Icon name="arrow" size={16} />
              </Link>
            </li>
          </ol>
        </Card>
      </div>
      <div className="stats-grid four">
        <Stat
          label="Maaltijden in je batch"
          value={number(summary.meals)}
          unit="porties"
          icon="batch"
          hint={`${state.batch.length} verschillende recepten`}
        />
        <Stat
          label="Vooruit gepland"
          value={number(summary.days, 1)}
          unit="dagen"
          icon="meals"
          hint={`${state.mealprepsPerDay} mealpreps per dag`}
        />
        <Stat
          label="Gemiddeld per maaltijd"
          value={number(summary.averageCalories)}
          unit="kcal"
          icon="flame"
          hint={
            summary.meals
              ? "Berekend uit jouw ingrediënten"
              : "Stel je eerste batch samen"
          }
        />
        <Stat
          label="Gemiddeld eiwit"
          value={number(summary.averageProtein)}
          unit="g"
          icon="ingredients"
          hint="Per mealprep-portie"
        />
      </div>
      <div className="dashboard-bottom">
        <Card>
          <div className="section-heading">
            <div>
              <div className="eyebrow">DAGELIJKSE STRUCTUUR</div>
              <h2>Jouw eetmomenten</h2>
            </div>
            <Link className="text-link" href="/meals">
              Bewerken ↗
            </Link>
          </div>
          <div className="meal-chart">
            {state.meals.map((meal, index) => (
              <div className="meal-chart-row" key={meal.id}>
                <span className="meal-order">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong>{meal.name}</strong>
                <div className="bar-track">
                  <div
                    style={{
                      width: `${Math.min(100, (meal.calories / Math.max(1, targets.calories)) * 100 * 2.5)}%`,
                    }}
                  />
                </div>
                <span>
                  {number(meal.calories)} <small>kcal</small>
                </span>
              </div>
            ))}
          </div>
          <div className="card-total">
            <span>Totaal ingepland</span>
            <strong>
              {number(mealTotal)} / {number(targets.calories)} kcal
            </strong>
          </div>
          {Math.abs(mealTotal - targets.calories) > 1 && (
            <p className="error small">
              Je eetmomenten wijken{" "}
              {number(Math.abs(mealTotal - targets.calories))} kcal af van je
              dagdoel.
            </p>
          )}
        </Card>
        <Card>
          <div className="section-heading">
            <div>
              <div className="eyebrow">KLAAR VOOR JE KOOKDAG</div>
              <h2>Je actieve batch</h2>
            </div>
            <span className="badge">{summary.meals} porties</span>
          </div>
          {batch.length ? (
            <div className="mini-recipes">
              {batch.slice(0, 4).map((item, index) => (
                <Link href={`/recipes/${item.recipeId}`} key={item.recipeId}>
                  <span className={`recipe-number tone-${index % 4}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <strong>{item.recipe.nameNl}</strong>
                    <small>
                      {item.servings} porties ·{" "}
                      {number(item.scaled.nutrition.kcal)} kcal
                    </small>
                  </span>
                  <Icon name="arrow" size={16} />
                </Link>
              ))}
              {batch.length > 4 && (
                <p className="muted small">
                  En nog {batch.length - 4} recepten in je batch.
                </p>
              )}
            </div>
          ) : (
            <div className="batch-empty">
              <Icon name="snow" size={35} />
              <h3>Je vriezerplan begint hier</h3>
              <p>Kies uit 30 recepten die ook na het opwarmen goed smaken.</p>
            </div>
          )}
          <Link href="/batch" className="button secondary full-width">
            {batch.length
              ? "Bekijk de hele batch"
              : "Stel je eerste batch samen"}
            <Icon name="arrow" />
          </Link>
        </Card>
      </div>
    </>
  );
}
