"use client";
import { useState } from "react";
import Link from "next/link";
import { usePlanner } from "../store";
import {
  shoppingList,
  sharedComponents,
  sharedAromatics,
} from "@/calculations/batch";
import { CATEGORY_LABELS, WEIGHT_LABELS } from "@/domain/constants";
import { downloadText, number, weight } from "@/services/format";
import { shoppingText } from "@/services/shopping";
import { Card, Empty, Icon, Notice, PageTitle, WhyLink } from "../ui";
import { BatchJourney } from "../BatchJourney";
export function ShoppingScreen() {
  const { batch, catalog, state, update } = usePlanner();
  const [message, setMessage] = useState("");
  const items = shoppingList(batch, catalog);
  const shared = sharedComponents(batch);
  const aromatics = sharedAromatics(batch);
  const checked = items.filter(
    (item) => state.shoppingChecks[item.ingredient.id] === item.signature,
  ).length;
  async function copy() {
    try {
      await navigator.clipboard.writeText(shoppingText(items));
      setMessage("Boodschappenlijst gekopieerd.");
    } catch {
      setMessage(
        "Kopiëren is niet toegestaan door je browser. Gebruik ‘Exporteer tekst’ of ‘Print’.",
      );
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="ALLES IN ÉÉN KEER"
        title="Boodschappen"
        description="Eén lijst voor je hele batch. Gelijke ingrediënten zijn al samengevoegd."
        action={
          !!items.length && (
            <div className="button-group no-print">
              <button
                className="button secondary"
                onClick={() => window.print()}
              >
                Print
              </button>
              <button className="button secondary" onClick={copy}>
                Kopieer lijst
              </button>
              <button
                className="button primary"
                onClick={() =>
                  downloadText(
                    shoppingText(items),
                    "preppartner-boodschappen.txt",
                  )
                }
              >
                Exporteer tekst
              </button>
            </div>
          )
        }
      />
      <BatchJourney active="shopping" />
      {message && <Notice>{message}</Notice>}
      {!items.length ? (
        <Empty title="Eerst een batch, dan je boodschappen">
          <p>Voeg recepten toe om een gezamenlijke lijst te maken.</p>
          <Link href="/batch" className="button primary">
            Batch samenstellen
          </Link>
        </Empty>
      ) : (
        <>
          <div className="shopping-progress no-print">
            <span>
              {checked} van {items.length} ingrediënten afgevinkt
            </span>
            <progress
              value={checked}
              max={items.length}
              aria-label="Boodschappen verzameld"
            />
            <Link className="text-link" href="/cooking">
              Naar je kookplan →
            </Link>
          </div>
          <p className="muted small">
            Rijst en pasta zijn droog; vlees is rauw; bonen en tonijn zijn
            uitgelekt. Een gewijzigde hoeveelheid maakt het vinkje automatisch
            ongeldig. <WhyLink section="nutrition" />
          </p>
          <div className="shopping-layout">
            <div className="stack">
              {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
                const group = items.filter(
                  (item) => item.ingredient.category === category,
                );
                return (
                  group.length > 0 && (
                    <Card key={category} className="shopping-category">
                      <div className="section-heading">
                        <h2>{label}</h2>
                        <span className="badge">{group.length}</span>
                      </div>
                      <div className="shopping-column-labels">
                        <span>Ingrediënt</span>
                        <span>Exact nodig</span>
                        <span>Praktisch inkopen</span>
                      </div>
                      {group.map((item) => {
                        const done =
                          state.shoppingChecks[item.ingredient.id] ===
                          item.signature;
                        return (
                          <div
                            className={`shopping-row ${done ? "checked" : ""}`}
                            key={item.ingredient.id}
                          >
                            <label>
                              <input
                                type="checkbox"
                                checked={done}
                                onChange={() =>
                                  update((old) => ({
                                    ...old,
                                    shoppingChecks: {
                                      ...old.shoppingChecks,
                                      [item.ingredient.id]: done
                                        ? ""
                                        : item.signature,
                                    },
                                  }))
                                }
                              />
                              <span>
                                <strong>{item.ingredient.nameNl}</strong>
                                <small>
                                  {WEIGHT_LABELS[item.ingredient.weightBasis]}
                                  {item.ingredient.notes &&
                                    ` · ${item.ingredient.notes}`}
                                </small>
                              </span>
                            </label>
                            <span>{weight(item.grams)}</span>
                            <span>
                              {item.packages ? (
                                <>
                                  <strong>
                                    {number(item.packages)} ×{" "}
                                    {weight(
                                      item.ingredient.defaultPackageSize!,
                                    )}
                                  </strong>
                                  <small>verpakking</small>
                                </>
                              ) : (
                                <small>Los afwegen</small>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </Card>
                  )
                );
              })}
            </div>
            <div className="stack no-print">
              <Card className="combine-card">
                <Icon name="ingredients" size={28} />
                <h2>Slim combineren</h2>
                <p>Een beetje voorbereiding scheelt heel veel dubbel werk.</p>
                {shared.slice(0, 12).map((component) => (
                  <div className="shared-item" key={component.ingredientId}>
                    <strong>{catalog[component.ingredientId].nameNl}</strong>
                    <p>
                      {component.recipes.length} recepten ·{" "}
                      {weight(component.grams)} totaal
                    </p>
                    <small>
                      {["rice", "pasta"].includes(component.ingredientId)
                        ? "Kook samen in passende rondes. Weeg na het koken voor de verdeling."
                        : "Weeg of snijd in één keer en verdeel over de recepten."}
                    </small>
                  </div>
                ))}
                {!shared.length && (
                  <p>
                    Voeg meerdere recepten toe om gedeelde ingrediënten te
                    vinden.
                  </p>
                )}
                {aromatics.length > 1 && (
                  <Notice>
                    {aromatics.join(", ")} gebruiken allemaal soja, knoflook en
                    gember. Bereid die samen voor; voeg ze volgens de
                    receptverhouding toe.
                  </Notice>
                )}
              </Card>
              <Card>
                <h3>Jouw product, jouw waarden</h3>
                <p className="muted">
                  Verpakkingen verschillen per winkel. Je kunt de inhoud en
                  voedingswaarden aanpassen.
                </p>
                <Link href="/ingredients" className="text-link">
                  Naar ingrediënten ↗
                </Link>
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  );
}
