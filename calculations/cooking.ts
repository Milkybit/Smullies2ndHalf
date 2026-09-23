import type {
  Appliance,
  CookingTask,
  Equipment,
  IngredientCatalog,
  ResolvedBatchItem,
} from "@/domain/types";

export function cookingPlan(
  batch: ResolvedBatchItem[],
  equipment: Equipment,
  catalog: IngredientCatalog,
): CookingTask[] {
  if (!batch.length) return [];
  if (
    !Number.isInteger(equipment.burners) ||
    equipment.burners < 1 ||
    equipment.burners > 8 ||
    !Number.isInteger(equipment.ovens) ||
    equipment.ovens < 0 ||
    equipment.ovens > 4 ||
    !Number.isInteger(equipment.maxServingsPerPot) ||
    equipment.maxServingsPerPot < 1 ||
    equipment.maxServingsPerPot > 20
  )
    throw new Error("Controleer het aantal pitten, ovens en porties per pan.");
  const tasks: CookingTask[] = [];
  const availability: Record<Appliance, number[]> = {
    worktop: [0],
    burner: Array(equipment.burners).fill(0),
    oven: Array(equipment.ovens).fill(0),
    passive: [0],
  };
  function add(
    id: string,
    title: string,
    appliance: Appliance,
    durationMinutes: number,
    dependencies: string[],
    group: string,
    notes: string,
    earliest = 0,
  ) {
    const resources = availability[appliance];
    const dependencyEnd = Math.max(
      0,
      ...dependencies.map(
        (id) => tasks.find((task) => task.id === id)!.endMinute,
      ),
    );
    const resource =
      appliance === "passive" ? 0 : resources.indexOf(Math.min(...resources));
    const startMinute = Math.max(
      earliest,
      dependencyEnd,
      appliance === "passive" ? 0 : resources[resource],
    );
    const task = {
      id,
      title,
      appliance,
      durationMinutes,
      dependencies,
      group,
      notes,
      startMinute,
      endMinute: startMinute + durationMinutes,
      resource: resource + 1,
    };
    tasks.push(task);
    if (appliance !== "passive") resources[resource] = task.endMinute;
    return task;
  }
  const meals = batch.reduce((sum, item) => sum + item.servings, 0);
  add(
    "prep",
    "Mise en place • snijden, wegen en bakjes klaarzetten",
    "worktop",
    Math.ceil(15 + meals * 0.6),
    [],
    "Voorbereiden",
    "Snijd gedeelde ui, knoflook en gember tegelijk. Zet rauw vlees weer gekoeld weg. Gebruik aparte snijplanken. Houd smaakmakers per recept afgewogen.",
  );
  const ordered = [...batch].sort(
    (a, b) =>
      b.recipe.cookMinutes - a.recipe.cookMinutes ||
      a.recipe.cookingGroup.localeCompare(b.recipe.cookingGroup),
  );
  const cooked: {
    item: ResolvedBatchItem;
    task: CookingTask;
    servings: number;
    round: number;
  }[] = [];
  for (const item of ordered) {
    let left = item.servings;
    let round = 0;
    while (left > 0) {
      round++;
      const servings = Math.min(left, equipment.maxServingsPerPot);
      left -= servings;
      const ovenWanted = item.recipe.equipment.includes("oven");
      const appliance = ovenWanted && equipment.ovens > 0 ? "oven" : "burner";
      const duration = Math.ceil(
        item.recipe.cookMinutes *
          (ovenWanted && equipment.ovens === 0 ? 1.2 : 1),
      );
      const task = add(
        `cook-${item.recipeId}-${round}`,
        `${item.recipe.nameNl} • ${servings} porties${item.servings > equipment.maxServingsPerPot ? ` • ronde ${round}` : ""}`,
        appliance,
        duration,
        ["prep"],
        item.recipe.cookingGroup,
        `${ovenWanted && !equipment.ovens ? "Geen oven: bak en gaar afgedekt in een ruime pan. " : ""}Volg de receptstappen: eiwit garen, saus maken en groente kort beetgaar toevoegen. Bewaar voldoende saus.`,
      );
      cooked.push({ item, task, servings, round });
    }
  }
  // Cook shared starch in rounds sized to the actual pan capacity. Align each round
  // with ready sauces, instead of leaving all cooked rice waiting for a long stew.
  const components = new Map<string, typeof cooked>();
  for (const entry of cooked) {
    const starch = entry.item.scaled.ingredients.find(
      (row) => row.role === "carbohydrate",
    );
    if (starch)
      components.set(starch.ingredientId, [
        ...(components.get(starch.ingredientId) ?? []),
        entry,
      ]);
  }
  const componentTasks = new Map<string, string[]>();
  for (const [ingredientId, entries] of components) {
    const sorted = [...entries].sort(
      (a, b) => a.task.endMinute - b.task.endMinute,
    );
    let group: typeof cooked = [];
    let groupServings = 0;
    let round = 0;
    const flush = () => {
      if (!group.length) return;
      round++;
      const grams = group.reduce(
        (sum, entry) =>
          sum +
          entry.item.scaled.ingredients.find(
            (row) => row.ingredientId === ingredientId,
          )!.grams *
            entry.servings,
        0,
      );
      const earliestFinish = Math.min(
        ...group.map((entry) => entry.task.endMinute),
      );
      const duration = ingredientId === "pasta" ? 18 : 25;
      const task = add(
        `starch-${ingredientId}-${round}`,
        `${catalog[ingredientId].nameNl} samen koken • ${Math.round(grams)} g droog • ronde ${round}`,
        "burner",
        duration,
        ["prep"],
        "Basiscomponenten",
        "Weeg de gekookte opbrengst per ronde. Voeg de gewichten samen bij Opbrengst invoeren. Verdeel iedere ronde naar de droge verhouding; koel gereed eten direct in ondiepe bakjes. Pasta 1–2 minuten korter koken.",
        Math.max(0, earliestFinish - duration),
      );
      for (const entry of group)
        componentTasks.set(entry.task.id, [
          ...(componentTasks.get(entry.task.id) ?? []),
          task.id,
        ]);
      group = [];
      groupServings = 0;
    };
    for (const entry of sorted) {
      if (groupServings + entry.servings > equipment.maxServingsPerPot) flush();
      group.push(entry);
      groupServings += entry.servings;
    }
    flush();
  }
  for (const entry of [...cooked].sort(
    (a, b) => a.task.endMinute - b.task.endMinute,
  )) {
    const key = `${entry.item.recipeId}-${entry.round}`;
    // Sauce cooling does not wait for later rice rounds, preventing unsafe holding.
    add(
      `cool-sauce-${key}`,
      `Koel gare saus direct • ${entry.item.recipe.nameNl}`,
      "passive",
      5,
      [entry.task.id],
      "Koelen",
      "Verdeel in ondiepe bakjes en zet binnen 2 uur gekoeld weg. Wacht niet op andere recepten; voeg rijst/pasta later toe als de planning uitloopt.",
    );
    const portion = add(
      `portion-${key}`,
      `Portioneer ${entry.servings} bakjes • ${entry.item.recipe.nameNl}`,
      "worktop",
      Math.ceil(3 + entry.servings * 0.7),
      [entry.task.id, ...(componentTasks.get(entry.task.id) ?? [])],
      "Portioneren",
      "Gebruik het gekookte gewicht uit Opbrengst invoeren. Verdeel eiwit, groente en saus gelijkmatig. Werk in kleine rondes.",
    );
    const cool = add(
      `cool-${key}`,
      "Snel koelen en labelen",
      "passive",
      20,
      [portion.id],
      "Koelen",
      "Zet ondiepe bakjes binnen 2 uur na bereiding in koelkast of vriezer. Controleer de capaciteit van je koelkast/vriezer; koel grote batches in rondes. De tijd is een planningsschatting, geen voedselveiligheidsmeting.",
    );
    add(
      `store-${key}`,
      `Bewaar ${entry.servings} gelabelde porties`,
      "worktop",
      3,
      [cool.id],
      "Bewaren",
      "Vermeld gerecht en bereidingsdatum. Koelkast maximaal 2 dagen; vries overige porties in.",
    );
  }
  add(
    "cleanup",
    "Laatste opruimronde",
    "worktop",
    15,
    tasks.filter((task) => task.id.startsWith("store-")).map((task) => task.id),
    "Afronden",
    "Reinig werkblad, pannen en keukengerei. Controleer of alle porties gekoeld staan.",
  );
  return tasks.sort(
    (a, b) => a.startMinute - b.startMinute || a.id.localeCompare(b.id),
  );
}
