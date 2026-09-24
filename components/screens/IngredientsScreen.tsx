"use client";
import { useState, type FormEvent } from "react";
import type { Ingredient } from "@/domain/types";
import { ingredients } from "@/data/ingredients";
import { CATEGORY_LABELS, WEIGHT_LABELS } from "@/domain/constants";
import { number, weight } from "@/services/format";
import { usePlanner } from "../store";
import { Card, Notice, PageTitle } from "../ui";
function IngredientEditor({
  ingredient,
  onClose,
}: {
  ingredient: Ingredient;
  onClose: () => void;
}) {
  const { update } = usePlanner();
  const [error, setError] = useState("");
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nutritionPer100g = {
      kcal: Number(data.get("kcal")),
      protein: Number(data.get("protein")),
      carbs: Number(data.get("carbs")),
      fat: Number(data.get("fat")),
      fiber: Number(data.get("fiber")),
    };
    if (
      Object.entries(nutritionPer100g).some(
        ([key, value]) =>
          !Number.isFinite(value) ||
          value < 0 ||
          value > (key === "kcal" ? 1000 : 100),
      )
    ) {
      setError(
        "Controleer de voedingswaarden: 0–1.000 kcal en 0–100 g per macro.",
      );
      return;
    }
    const packageInput = String(data.get("packageSize") ?? "");
    const defaultPackageSize = packageInput ? Number(packageInput) : undefined;
    if (
      defaultPackageSize !== undefined &&
      (!Number.isFinite(defaultPackageSize) ||
        defaultPackageSize < 1 ||
        defaultPackageSize > 100000)
    ) {
      setError("Verpakkingsgrootte moet tussen 1 en 100.000 g liggen.");
      return;
    }
    update((old) => ({
      ...old,
      ingredientOverrides: {
        ...old.ingredientOverrides,
        [ingredient.id]: { nutritionPer100g, defaultPackageSize },
      },
      completedTasks: {},
    }));
    onClose();
  }
  return (
    <Card className="ingredient-editor">
      <form onSubmit={save}>
        <div className="section-heading">
          <div>
            <div className="eyebrow">JOUW PRODUCT</div>
            <h2>{ingredient.nameNl}</h2>
          </div>
          <button type="button" className="button secondary" onClick={onClose}>
            Annuleren
          </button>
        </div>
        <p>
          Neem de waarden per 100 g over van de verpakking. Gewichtssoort:{" "}
          <strong>{WEIGHT_LABELS[ingredient.weightBasis]}</strong>.
        </p>
        <div className="form-grid three">
          {(
            [
              ["kcal", "Energie (kcal)"],
              ["protein", "Eiwit (g)"],
              ["carbs", "Koolhydraten (g)"],
              ["fat", "Vet (g)"],
              ["fiber", "Vezels (g)"],
            ] as const
          ).map(([key, label]) => (
            <div className="field" key={key}>
              <label htmlFor={`ingredient-${key}`}>{label}</label>
              <input
                id={`ingredient-${key}`}
                name={key}
                type="number"
                min="0"
                max={key === "kcal" ? 1000 : 100}
                step="0.1"
                required
                defaultValue={ingredient.nutritionPer100g[key]}
              />
            </div>
          ))}
          <div className="field">
            <label htmlFor="packageSize">Verpakking / uitlekgewicht (g)</label>
            <input
              id="packageSize"
              name="packageSize"
              type="number"
              min="1"
              max="100000"
              step="1"
              defaultValue={ingredient.defaultPackageSize ?? ""}
              placeholder="Onbekend: laat leeg"
            />
          </div>
        </div>
        {error && <Notice tone="warning">{error}</Notice>}
        <p className="small muted">
          Vloeistoffen rekenen we intern in gram.{" "}
          {ingredient.densityGramsPerMl
            ? `Voor dit ingrediënt gebruiken we ${number(ingredient.densityGramsPerMl, 2)} g per ml.`
            : "Gebruik bij bonen en tonijn het uitlekgewicht."}
        </p>
        <button className="button primary">Ingrediënt opslaan</button>
      </form>
    </Card>
  );
}
export function IngredientsScreen() {
  const { catalog, state, update } = usePlanner();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const visible = Object.values(catalog).filter((ingredient) =>
    ingredient.nameNl.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow="DE BASIS VAN ELKE BEREKENING"
        title="Ingrediënten"
        description="Voedingswaarden zijn schattingen. Pas ze aan je supermarktproducten aan; alle recepten rekenen direct mee."
      />
      <Notice>
        Alle waarden zijn per 100 g rauw, droog of uitgelekt product. Gekookt
        gewicht gebruik je alleen bij het portioneren. Verpakkingsgroottes zijn
        voorbeelden en kunnen worden aangepast.
      </Notice>
      {editing && (
        <IngredientEditor
          key={editing}
          ingredient={catalog[editing]}
          onClose={() => setEditing(null)}
        />
      )}
      <Card>
        <div className="field search-field">
          <label htmlFor="ingredient-search">Zoek ingrediënt</label>
          <input
            id="ingredient-search"
            type="search"
            placeholder="Bijvoorbeeld rijst, kip of passata"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table>
            <caption className="sr-only">Voedingswaarden per 100 gram</caption>
            <thead>
              <tr>
                <th>Ingrediënt</th>
                <th>kcal</th>
                <th>Eiwit</th>
                <th>Kh</th>
                <th>Vet</th>
                <th>Vezels</th>
                <th>Verpakking</th>
                <th>Actie</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((ingredient) => (
                <tr key={ingredient.id}>
                  <td>
                    <strong>{ingredient.nameNl}</strong>
                    <small>
                      {CATEGORY_LABELS[ingredient.category]} ·{" "}
                      {WEIGHT_LABELS[ingredient.weightBasis]}
                      {state.ingredientOverrides[ingredient.id]
                        ? " · aangepast"
                        : ""}
                    </small>
                  </td>
                  {(["kcal", "protein", "carbs", "fat", "fiber"] as const).map(
                    (key) => (
                      <td key={key}>
                        {number(ingredient.nutritionPer100g[key], 1)}
                      </td>
                    ),
                  )}
                  <td>
                    {ingredient.defaultPackageSize
                      ? weight(ingredient.defaultPackageSize)
                      : "Onbekend"}
                  </td>
                  <td>
                    <div className="button-group">
                      <button
                        className="button secondary small-button"
                        onClick={() => {
                          setEditing(ingredient.id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        aria-label={`Bewerk ${ingredient.nameNl}`}
                      >
                        Bewerk
                      </button>
                      {state.ingredientOverrides[ingredient.id] && (
                        <button
                          className="text-link"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Standaardwaarden voor ${ingredient.nameNl} herstellen?`,
                              )
                            )
                              update((old) => {
                                const overrides = {
                                  ...old.ingredientOverrides,
                                };
                                delete overrides[ingredient.id];
                                return {
                                  ...old,
                                  ingredientOverrides: overrides,
                                  completedTasks: {},
                                };
                              });
                          }}
                          aria-label={`Herstel ${ingredient.nameNl}`}
                        >
                          Herstel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small">
          {visible.length} van {ingredients.length} ingrediënten
        </p>
      </Card>
    </>
  );
}
