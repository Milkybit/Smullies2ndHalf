"use client";
import Link from "next/link";
import {
  aggregatePrepComponents,
  generatePrepList,
  type AggregatedComponent,
} from "@/calculations/components";
import type { IngredientCatalog } from "@/domain/types";
import { number, weight } from "@/services/format";
import { usePlanner } from "../store";
import { Card, Empty, Notice, PageTitle } from "../ui";
import { BatchScores } from "../BatchScores";
function ComponentCard({
  entry,
  catalog,
}: {
  entry: AggregatedComponent;
  catalog: IngredientCatalog;
}) {
  return (
    <Card>
      <div className="eyebrow">
        {entry.component.type === "sauce_base"
          ? "NEUTRALE SAUSBASIS"
          : entry.component.type === "finisher"
            ? "EIGEN AFWERKING"
            : "BEREIDINGSCOMPONENT"}
      </div>
      <h2>{entry.component.nameNl}</h2>
      <p>
        <strong>{weight(entry.inputGrams)}</strong> · {entry.recipes.length}{" "}
        {entry.recipes.length === 1 ? "recept" : "recepten"}
      </p>
      <ul>
        {entry.ingredientQuantities.map((row) => (
          <li key={row.ingredientId}>
            {catalog[row.ingredientId].nameNl}: {weight(row.grams)}
          </li>
        ))}
      </ul>
      <details>
        <summary>Bereiding en verdeling</summary>
        <p>{entry.component.instructions.join(" ")}</p>
        <div className="prep-rows">
          {entry.recipes.map((row) => (
            <div key={row.recipeId}>
              <span>
                {row.name}
                <small>
                  {row.servings} porties ·{" "}
                  {number((100 * row.grams) / entry.inputGrams, 1)}%
                </small>
              </span>
              <strong>{weight(row.grams)}</strong>
            </div>
          ))}
        </div>
      </details>
    </Card>
  );
}
export function ComponentsScreen({ prepOnly = false }: { prepOnly?: boolean }) {
  const { batch, catalog } = usePlanner();
  const components = aggregatePrepComponents(batch),
    prep = generatePrepList(batch, catalog);
  return (
    <>
      <PageTitle
        eyebrow="COMPONENTEN EERST"
        title={prepOnly ? "Voorbereidingslijst" : "Slim combineren"}
        description={
          prepOnly
            ? "Alles wat je samen kunt wassen, snijden, afwegen en koken."
            : "Eén basis, meerdere smaken. Dit werk kun je delen tussen je gerechten."
        }
        action={
          <button className="button secondary" onClick={() => window.print()}>
            Print
          </button>
        }
      />
      <div className="button-group no-print">
        <Link
          className="button secondary"
          href={prepOnly ? "/combine" : "/prep"}
        >
          {prepOnly ? "Slim combineren" : "Voorbereidingslijst"}
        </Link>
        <Link className="button secondary" href="/shopping">
          Boodschappen
        </Link>
        <Link className="button primary" href="/cooking">
          Kookplan →
        </Link>
      </div>
      {!batch.length ? (
        <Empty title="Stel eerst je batch samen">
          <Link href="/batch">Naar de optimizer →</Link>
        </Empty>
      ) : prepOnly ? (
        <div className="stack prep-sections">
          <Card>
            <h2>01 · Samen wassen en snijden</h2>
            <p>
              Dit zijn de totale ingrediënten, ook wanneer ze later in een
              sausbasis terechtkomen. Koop of tel ze niet opnieuw.
            </p>
            <div className="prep-rows">
              {prep.chop.map((row) => (
                <div key={row.ingredient.id}>
                  <strong>{row.ingredient.nameNl}</strong>
                  <span>{weight(row.grams)}</span>
                </div>
              ))}
            </div>
          </Card>
          {[
            {
              title: "02 · Eiwit en koolhydraten in passende rondes",
              rows: prep.bulk,
            },
            { title: "03 · Neutrale bases mengen", rows: prep.bases },
            { title: "04 · Afwerkingen apart afwegen", rows: prep.finishers },
          ].map((group) => (
            <Card key={group.title}>
              <h2>{group.title}</h2>
              {group.rows.map((row) => (
                <details key={row.component.id}>
                  <summary>
                    {row.component.nameNl} · {weight(row.inputGrams)}
                  </summary>
                  <p>
                    {row.ingredientQuantities
                      .map(
                        (r) =>
                          `${weight(r.grams)} ${catalog[r.ingredientId].nameNl}`,
                      )
                      .join(" · ")}
                  </p>
                  <p>{row.component.instructions.join(" ")}</p>
                </details>
              ))}
            </Card>
          ))}
          <Notice>
            Haal gekoelde ingrediënten pas per productieronde uit de koelkast.
            Neutrale bases worden koud gemengd; de verhitting gebeurt bij de
            afwerking. Volg in het kookplan de hoeveelheid per ronde.
          </Notice>
        </div>
      ) : (
        <>
          <BatchScores recipes={batch.map((item) => item.recipe)} />
          <Notice>
            Alle hoeveelheden zijn vóór bereiding. Gedeelde bases hebben exact
            dezelfde mengverhouding. Extra saus en smaakmakers blijven in de
            afwerking.{" "}
            <Link href="/cooking">Weeg per kookronde en verdeel direct.</Link>
          </Notice>
          <div className="components-grid">
            {components
              .filter((entry) => entry.component.type !== "finisher")
              .map((entry) => (
                <ComponentCard
                  key={entry.component.id}
                  entry={entry}
                  catalog={catalog}
                />
              ))}
          </div>
          <details className="finisher-overview">
            <summary>
              {prep.finishers.length} eigen afwerkingen · smaakmakers per
              gerecht
            </summary>
            <div className="components-grid">
              {prep.finishers.map((entry) => (
                <ComponentCard
                  key={entry.component.id}
                  entry={entry}
                  catalog={catalog}
                />
              ))}
            </div>
          </details>
        </>
      )}
    </>
  );
}
