// Reproducible scenario audit; uses the Vite runtime already supplied by Vitest.
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { mkdirSync, writeFileSync } from "node:fs";
const root = fileURLToPath(new URL("../", import.meta.url));
const server = await createServer({
  root,
  configFile: false,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { recipes } = await server.ssrLoadModule("/data/recipes.ts");
  const { buildCatalog } = await server.ssrLoadModule("/data/ingredients.ts");
  const { SIXTY_MEAL_SCENARIO } = await server.ssrLoadModule(
    "/data/optimizer-scenario.ts",
  );
  const { optimizeRecipeBatch } = await server.ssrLoadModule(
    "/calculations/optimizer.ts",
  );
  const { resolveBatch, shoppingList } = await server.ssrLoadModule(
    "/calculations/batch.ts",
  );
  const { aggregatePrepComponents, generatePrepList } =
    await server.ssrLoadModule("/calculations/components.ts");
  const { cookingPlan } = await server.ssrLoadModule(
    "/calculations/cooking.ts",
  );
  const catalog = buildCatalog();
  const comparisons = ["maximum_efficiency", "balanced", "maximum_variety"].map(
    (optimizationPreference) => {
      const r = optimizeRecipeBatch(
        { ...SIXTY_MEAL_SCENARIO, optimizationPreference },
        recipes,
        catalog,
      );
      return {
        mode: optimizationPreference,
        efficiency: r.efficiency.score,
        variety: r.diversity.score,
        ingredients: r.efficiency.uniqueMajorIngredients,
        recipes: r.batch.map((r) => r.recipeId),
      };
    },
  );
  const result = optimizeRecipeBatch(SIXTY_MEAL_SCENARIO, recipes, catalog);
  const batch = resolveBatch(result.batch, recipes, catalog);
  const components = aggregatePrepComponents(batch);
  const tasks = cookingPlan(
    batch,
    { burners: 4, ovens: 1, maxServingsPerPot: 6 },
    catalog,
  );
  const shopping = shoppingList(batch, catalog);
  const report = {
    input: SIXTY_MEAL_SCENARIO,
    comparisons,
    efficiency: result.efficiency,
    diversity: result.diversity,
    meals: batch.map((r) => ({
      id: r.recipeId,
      name: r.recipe.nameNl,
      servings: r.servings,
      protein: r.recipe.proteinIngredientId,
      kcal: r.scaled.nutrition.kcal,
      proteinGrams: r.scaled.nutrition.protein,
      ingredients: r.scaled.ingredients.map((row) => ({
        id: row.ingredientId,
        grams: row.grams * r.servings,
      })),
    })),
    components,
    shopping: shopping.map((row) => ({
      id: row.ingredient.id,
      name: row.ingredient.nameNl,
      grams: row.grams,
      packages: row.packages,
    })),
    prep: generatePrepList(batch, catalog),
    estimatedMinutes: Math.max(...tasks.map((t) => t.endMinute)),
    activeMinutes: tasks.reduce((sum, t) => sum + (t.activeMinutes ?? 0), 0),
    tasks,
  };
  mkdirSync(new URL("../reports/", import.meta.url), { recursive: true });
  writeFileSync(
    new URL("../reports/optimizer-60-meals.json", import.meta.url),
    JSON.stringify(report, null, 2) + "\n",
  );
  const round = (n) => Math.round(n * 10) / 10;
  let md = `# Testbatch · 60 maaltijden\n\nReproduceerbaar met \`node scripts/inspect-optimizer.mjs\`. Brondata: 15 kandidaten, 10 recepten × 6 porties, 600 kcal en minimaal 50 g eiwit, 4 pitten en 1 oven.\n\n## Resultaat\n\n| Recept | Porties | kcal per portie | Eiwit per portie |\n|---|---:|---:|---:|\n`;
  md += report.meals
    .map(
      (r) =>
        `| ${r.name} | ${r.servings} | ${round(r.kcal)} | ${round(r.proteinGrams)} g |`,
    )
    .join("\n");
  md += `\n\nEfficiëntie ${result.efficiency.score}/100; variatie ${result.diversity.score}/100. ${result.efficiency.uniqueMajorIngredients} belangrijke ingrediënten, ${shopping.length} inclusief voorraadkast. Tijdschatting: ${report.estimatedMinutes} minuten, waarvan ${report.activeMinutes} geplande actieve minuten.\n\n## Afweging per modus\n\n| Modus | Efficiëntie | Variatie | Belangrijke ingrediënten |\n|---|---:|---:|---:|\n`;
  md += comparisons
    .map(
      (r) =>
        `| ${r.mode} | ${r.efficiency} | ${r.variety} | ${r.ingredients} |`,
    )
    .join("\n");
  md += "\n\n## Gedeelde componenten\n\n";
  md += components
    .filter(
      (c) =>
        c.recipes.length > 1 &&
        ["sauce_base", "protein", "carbohydrate"].includes(c.component.type),
    )
    .map(
      (c) =>
        `- **${c.component.nameNl}**: ${round(c.inputGrams)} g voor ${c.recipes.length} recepten. ${c.ingredientQuantities.map((r) => `${round(r.grams)} g ${catalog[r.ingredientId].nameNl}`).join("; ")}.`,
    )
    .join("\n");
  md +=
    "\n\n## Boodschappen (vóór bereiding)\n\n| Ingrediënt | Nodig |\n|---|---:|\n" +
    shopping
      .map((r) => `| ${r.ingredient.nameNl} | ${round(r.grams)} g |`)
      .join("\n");
  md +=
    "\n\n## Chronologische kookplanning\n\nTijden vanaf start; voorbereiding en opruimen inbegrepen. Dit is een schatting voor één kok, geen geteste kooktijd.\n\n| Minuut | Taak | Apparaat |\n|---|---|---|\n" +
    tasks
      .map(
        (t) =>
          `| ${t.startMinute}–${t.endMinute} | ${t.title} | ${t.appliance} ${t.resource} |`,
      )
      .join("\n") +
    "\n";
  writeFileSync(
    new URL("../reports/optimizer-60-meals.md", import.meta.url),
    md,
  );
  console.log(
    JSON.stringify(
      {
        meals: report.meals.map(({ ingredients, ...r }) => r),
        comparisons,
        estimatedMinutes: report.estimatedMinutes,
        activeMinutes: report.activeMinutes,
        components: components
          .filter((c) =>
            ["sauce_base", "protein", "carbohydrate"].includes(
              c.component.type,
            ),
          )
          .map((c) => ({
            id: c.component.id,
            grams: c.inputGrams,
            recipes: c.recipes.length,
          })),
        waves: tasks
          .filter((t) => t.id.startsWith("cook-"))
          .map((t) => ({
            name: t.title,
            start: t.startMinute,
            end: t.endMinute,
            group: t.group,
          })),
      },
      null,
      2,
    ),
  );
} finally {
  await server.close();
}
