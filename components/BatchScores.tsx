import type { Recipe } from "@/domain/types";
import {
  calculateBatchDiversity,
  calculateBatchEfficiency,
} from "@/calculations/compatibility";
export function BatchScores({ recipes }: { recipes: Recipe[] }) {
  const efficiency = calculateBatchEfficiency(recipes),
    diversity = calculateBatchDiversity(recipes);
  return (
    <div className="batch-scores">
      <details>
        <summary>
          <strong>
            {efficiency.score}
            <small>/100</small>
          </strong>{" "}
          Efficiëntie <span>Bekijk de opbouw</span>
        </summary>
        <p>Index van gedeelde voorbereiding; geen percentage tijdwinst.</p>
        <ul>
          {efficiency.breakdown.map((row) => (
            <li key={row.label}>
              {row.label}: {row.score}/100 · gewicht {row.weight}%
            </li>
          ))}
        </ul>
        <p>
          {efficiency.uniqueMajorIngredients} belangrijke ingrediënten ·{" "}
          {efficiency.uniqueIngredients} inclusief voorraadkast.{" "}
          {efficiency.separateIngredientUses} losse ingrediëntvermeldingen
          samengevoegd; dit zijn geen bespaarde ingrediëntsoorten.
        </p>
      </details>
      <details>
        <summary>
          <strong>
            {diversity.score}
            <small>/100</small>
          </strong>{" "}
          Variatie <span>Bekijk de opbouw</span>
        </summary>
        <p>
          Vijf gelijk gewogen categorieën. Extra soorten boven het
          referentieaantal leveren geen bonus op.
        </p>
        <ul>
          {diversity.breakdown.map((row) => (
            <li key={row.label}>
              {row.label}: {row.count} · referentie {row.target} · {row.score}
              /100
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
