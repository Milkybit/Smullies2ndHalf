import type {
  Appliance,
  CookingTask,
  Equipment,
  IngredientCatalog,
  ResolvedBatchItem,
} from "@/domain/types";
import { aggregatePrepComponents, generatePrepList } from "./components";
import { OVEN_FALLBACK_TIME_FACTOR } from "@/domain/constants";

export const KITCHEN_ASSUMPTIONS = {
  recipesPerWave: 2,
  proteinGrams: 1500,
  panProteinGrams: 750,
  dryCarbGrams: 1000,
  coolMinutes: 20,
  cleanupMinutes: 15,
};

/** Insert into free intervals, reserving both appliances and ONE cook's hands. */
export function cookingPlan(
  batch: ResolvedBatchItem[],
  equipment: Equipment,
  catalog: IngredientCatalog,
): CookingTask[] {
  if (!batch.length) return [];
  const proteinCapacity =
    equipment.maxProteinGrams ?? KITCHEN_ASSUMPTIONS.proteinGrams;
  const carbCapacity =
    equipment.maxDryCarbGrams ?? KITCHEN_ASSUMPTIONS.dryCarbGrams;
  if (
    !Number.isInteger(equipment.burners) ||
    equipment.burners < 1 ||
    equipment.burners > 8 ||
    !Number.isInteger(equipment.ovens) ||
    equipment.ovens < 0 ||
    equipment.ovens > 4 ||
    !Number.isInteger(equipment.maxServingsPerPot) ||
    equipment.maxServingsPerPot < 1 ||
    equipment.maxServingsPerPot > 20 ||
    !Number.isFinite(proteinCapacity) ||
    proteinCapacity < 300 ||
    proteinCapacity > 5000 ||
    !Number.isFinite(carbCapacity) ||
    carbCapacity < 100 ||
    carbCapacity > 3000
  )
    throw new Error(
      "Controleer pitten, ovens, porties en de gewichtsgrenzen van je pannen.",
    );
  const tasks: CookingTask[] = [];
  const overlaps = (a: number, b: number, c: number, d: number) =>
    a < d && c < b;
  function add(
    id: string,
    title: string,
    appliance: Appliance,
    duration: number,
    activeMinutes: number,
    dependencies: string[],
    group: string,
    notes: string,
    extra: Partial<CookingTask> = {},
    notBefore = 0,
    preview = false,
  ) {
    const earliest = Math.max(
      notBefore,
      ...dependencies.map((id) => {
        const dep = tasks.find((t) => t.id === id);
        if (!dep) throw new Error(`Ontbrekende kookstap: ${id}`);
        return dep.endMinute;
      }),
    );
    const count =
      appliance === "burner"
        ? equipment.burners
        : appliance === "oven"
          ? equipment.ovens
          : 1;
    const attentionWindows =
      extra.attentionWindows ??
      (activeMinutes ? [{ offset: 0, minutes: activeMinutes }] : []);
    let bestStart = Infinity,
      bestResource = 1;
    for (let resource = 1; resource <= count; resource++) {
      let start = earliest;
      while (true) {
        const nextStarts: number[] = [];
        for (const t of tasks) {
          if (
            appliance !== "passive" &&
            t.appliance === appliance &&
            t.resource === resource &&
            overlaps(
              start,
              start + duration,
              t.startMinute,
              t.applianceReleaseMinute ?? t.endMinute,
            )
          )
            nextStarts.push(t.applianceReleaseMinute ?? t.endMinute);
          for (const ours of attentionWindows)
            for (const theirs of t.attentionWindows ?? [])
              if (
                overlaps(
                  start + ours.offset,
                  start + ours.offset + ours.minutes,
                  t.startMinute + theirs.offset,
                  t.startMinute + theirs.offset + theirs.minutes,
                )
              )
                nextStarts.push(
                  t.startMinute + theirs.offset + theirs.minutes - ours.offset,
                );
        }
        if (!nextStarts.length) break;
        start = Math.max(...nextStarts);
      }
      if (start < bestStart) {
        bestStart = start;
        bestResource = resource;
      }
    }
    const task: CookingTask = {
      id,
      title,
      appliance,
      durationMinutes: duration,
      dependencies,
      group,
      notes,
      startMinute: bestStart,
      endMinute: bestStart + duration,
      resource: bestResource,
      ...extra,
      attentionWindows,
      activeMinutes: attentionWindows.reduce((sum, w) => sum + w.minutes, 0),
    };
    if (!preview) tasks.push(task);
    return task;
  }
  const prep = generatePrepList(batch, catalog);
  const names = (rows: { ingredientId: string; grams: number }[]) =>
    rows
      .map((r) => `${Math.round(r.grams)} g ${catalog[r.ingredientId].nameNl}`)
      .join("; ");
  const prepMinutes = Math.ceil(
    20 + prep.chop.reduce((sum, r) => sum + r.grams, 0) / 300,
  );
  add(
    "prep",
    "Mise en place · samen wassen, snijden en afwegen",
    "worktop",
    prepMinutes,
    prepMinutes,
    [],
    "Voorbereiden",
    `${names(prep.chop.map((r) => ({ ingredientId: r.ingredient.id, grams: r.grams })))}. Label per recept. Zet gesneden groente en rauw eiwit gekoeld weg en haal alleen de volgende ronde eruit. Houd rauw vlees en groente gescheiden; reinig materiaal tussendoor.`,
  );
  const baseIds: string[] = [];
  for (const base of prep.bases) {
    const id = `base-${base.component.id}`;
    const minutes = Math.ceil(3 + base.inputGrams / 1000);
    add(
      id,
      `Gedeelde basis · ${base.component.nameNl} · ${Math.round(base.inputGrams)} g`,
      "worktop",
      minutes,
      minutes,
      ["prep"],
      "Sausbases",
      `${names(base.ingredientQuantities)}. ${base.component.instructions.join(" ")} Verdeling: ${base.recipes.map((r) => `${r.name}: ${Math.round(r.grams)} g (${Math.round((100 * r.grams) / base.inputGrams)}%)`).join("; ")}.`,
      { componentId: base.component.id, inputGrams: base.inputGrams },
    );
    baseIds.push(id);
  }
  const ordered = [...batch].sort(
    (a, b) =>
      a.recipe.sauceFamily.localeCompare(b.recipe.sauceFamily) ||
      a.recipe.proteinIngredientId.localeCompare(
        b.recipe.proteinIngredientId,
      ) ||
      a.recipeId.localeCompare(b.recipeId),
  );
  const portions = ordered.flatMap((item) => {
    const rounds: ResolvedBatchItem[] = [];
    const integrated = item.recipe.componentRefs.some(
      (ref) => ref.component.type === "mixed_base",
    );
    const rawProtein = item.scaled.ingredients.find(
      (row) => row.role === "protein",
    )!.grams;
    const capacity =
      item.recipe.equipment.includes("oven") && equipment.ovens
        ? proteinCapacity
        : Math.min(proteinCapacity, KITCHEN_ASSUMPTIONS.panProteinGrams);
    const maxServings = integrated
      ? Math.min(
          equipment.maxServingsPerPot,
          Math.max(1, Math.floor(capacity / rawProtein)),
        )
      : equipment.maxServingsPerPot;
    for (let left = item.servings; left > 0; left -= maxServings)
      rounds.push({ ...item, servings: Math.min(left, maxServings) });
    return rounds;
  });
  const waves: ResolvedBatchItem[][] = [];
  for (const item of portions) {
    const integrated = item.recipe.componentRefs.some(
      (ref) => ref.component.type === "mixed_base",
    );
    const last = waves.at(-1);
    if (
      integrated ||
      !last ||
      last.length >= KITCHEN_ASSUMPTIONS.recipesPerWave ||
      last[0].recipe.componentRefs.some(
        (ref) => ref.component.type === "mixed_base",
      )
    )
      waves.push([item]);
    else last.push(item);
  }
  let barrier = ["prep", ...baseIds];
  const recipeRounds = new Map<string, number>();
  for (const [waveIndex, waveItems] of waves.entries()) {
    const wave = waveIndex + 1;
    const byRecipe = new Map<string, ResolvedBatchItem>();
    for (const item of waveItems) {
      const old = byRecipe.get(item.recipeId);
      byRecipe.set(
        item.recipeId,
        old ? { ...old, servings: old.servings + item.servings } : { ...item },
      );
    }
    const components = aggregatePrepComponents([...byRecipe.values()]);
    const produced = new Map<string, string[]>();
    const roundEntries = waveItems.map((item) => {
      const round = (recipeRounds.get(item.recipeId) ?? 0) + 1;
      recipeRounds.set(item.recipeId, round);
      return { item, round, parts: aggregatePrepComponents([item]) };
    });
    // Long integrated preparations start before rice, so rice cannot sit for a stew.
    const integratedTasks = new Map<string, CookingTask>();
    for (const { item, round, parts } of roundEntries) {
      const mixed = parts.find((c) => c.component.type === "mixed_base");
      if (!mixed) continue;
      const c = mixed.component,
        oven = c.equipment === "oven" && equipment.ovens > 0;
      const duration = Math.ceil(
        (c.activeMinutes + c.passiveMinutes) *
          (c.equipment === "oven" && !oven ? OVEN_FALLBACK_TIME_FACTOR : 1),
      );
      const task = add(
        `cook-${item.recipeId}-${round}`,
        `Eigen bereiding · ${item.recipe.nameNl} · ${item.servings} porties`,
        oven ? "oven" : "burner",
        duration,
        c.activeMinutes,
        barrier,
        `Productieronde ${wave}`,
        `${c.equipment === "oven" && !oven ? "Geen oven: gaar in een ruime afgedekte pan, controleer gaarheid. " : ""}${c.instructions.join(" ")} Weeg en verdeel deze ronde apart.`,
        {
          componentId: c.id,
          inputGrams: mixed.inputGrams,
          componentAllocations: mixed.recipes,
        },
      );
      integratedTasks.set(`${item.recipeId}-${round}`, task);
    }
    const heat = components
      .filter((c) => ["protein", "carbohydrate"].includes(c.component.type))
      .sort(
        (a, b) =>
          (a.component.type === "protein" ? 0 : 1) -
            (b.component.type === "protein" ? 0 : 1) ||
          b.component.passiveMinutes - a.component.passiveMinutes ||
          a.component.id.localeCompare(b.component.id),
      );
    for (const entry of heat) {
      const c = entry.component;
      const appliance: Appliance =
        c.equipment === "oven" && equipment.ovens
          ? "oven"
          : c.equipment === "no-heat"
            ? "worktop"
            : "burner";
      const fallback = c.equipment === "oven" && !equipment.ovens;
      const capacity =
        c.type === "carbohydrate"
          ? carbCapacity
          : appliance === "burner"
            ? Math.min(proteinCapacity, KITCHEN_ASSUMPTIONS.panProteinGrams)
            : proteinCapacity;
      const rounds = Math.ceil(entry.inputGrams / capacity);
      const ids: string[] = [];
      for (let round = 1; round <= rounds; round++) {
        const grams = Math.min(
          capacity,
          entry.inputGrams - capacity * (round - 1),
        );
        const active = fallback ? 12 : c.activeMinutes;
        const duration = fallback ? 22 : c.activeMinutes + c.passiveMinutes;
        const id = `component-${wave}-${c.id}-${round}`;
        const dependencies =
          c.type === "carbohydrate"
            ? [...barrier, ...integratedTasks.values()].map((dep) =>
                typeof dep === "string" ? dep : dep.id,
              )
            : barrier;
        const proteinReady = Math.max(
          0,
          ...[...produced.values()]
            .flat()
            .map((id) => tasks.find((t) => t.id === id)!.endMinute),
        );
        const extra = {
          componentId: c.id,
          inputGrams: grams,
          componentAllocations: entry.recipes.map((r) => ({
            ...r,
            grams: (r.grams * grams) / entry.inputGrams,
          })),
        };
        const create = (usePan: boolean, preview = false) =>
          add(
            id,
            `${usePan ? `${catalog[c.ingredientQuantities[0].ingredientId].nameNl} · neutraal in de pan` : c.nameNl} · ${Math.round(grams)} g · ronde ${wave}.${round}`,
            usePan ? "burner" : appliance,
            usePan ? 22 : duration,
            usePan ? 12 : active,
            dependencies,
            `Productieronde ${wave}`,
            `${fallback || usePan ? "Bak deze kleine kipronde neutraal in een antiaanbakpan en gaar afgedekt; controleer volledige gaarheid. Bewaar alle sappen." : c.instructions.join(" ")} ${usePan ? "Een vrije pit voorkomt wachten op de oven. " : ""}Deze ronde: ${entry.recipes.map((r) => r.name).join(", ")}. Voer de opbrengst van deze ronde direct in bij Opbrengst invoeren.`,
            extra,
            c.type === "carbohydrate"
              ? Math.max(0, proteinReady - duration)
              : 0,
            preview,
          );
        const ovenPlan = create(false, true);
        const panPlan =
          appliance === "oven" &&
          grams <=
            Math.min(proteinCapacity, KITCHEN_ASSUMPTIONS.panProteinGrams)
            ? create(true, true)
            : undefined;
        const usePan = !!panPlan && panPlan.endMinute < ovenPlan.endMinute;
        const done = create(usePan);
        const transfer = add(
          `transfer-${id}`,
          `Haal uit ${done.appliance === "oven" ? "oven" : "pan"} en verdeel · ${catalog[c.ingredientQuantities[0].ingredientId].nameNl} · ronde ${wave}.${round}`,
          "worktop",
          3,
          3,
          [done.id],
          `Productieronde ${wave}`,
          `Verdeel nu naar de verhoudingen van deze productieronde: ${entry.recipes.map((r) => `${r.name}: ${Math.round((100 * r.grams) / entry.inputGrams)}%`).join("; ")}. Spreid in ondiepe bakjes en koel direct; wacht niet op de rest. ${c.type === "protein" ? "Bewaar vleessappen. " : ""}Spoel de pan; houd rauw en gaar gescheiden.`,
        );
        if (done.appliance !== "worktop")
          done.applianceReleaseMinute = transfer.endMinute;
        ids.push(transfer.id);
      }
      produced.set(c.id, ids);
    }
    const stores: string[] = [];
    for (const { item, round, parts } of roundEntries) {
      const dependencies = [
        ...new Set([
          ...barrier,
          ...parts.flatMap((c) => produced.get(c.component.id) ?? []),
        ]),
      ];
      let cook = integratedTasks.get(`${item.recipeId}-${round}`);
      if (!cook) {
        const finish = parts.find((c) => c.component.type === "finisher")!;
        const c = finish.component;
        cook = add(
          `cook-${item.recipeId}-${round}`,
          `Basis afwerken · ${item.recipe.nameNl} · ${item.servings} porties`,
          "burner",
          c.activeMinutes + c.passiveMinutes,
          c.activeMinutes,
          dependencies,
          `Productieronde ${wave}`,
          `${c.instructions.join(" ")} Alleen deze afwerking: ${names(finish.ingredientQuantities)}. Groente en sausbasis zijn al afgewogen; eiwit is al gaar. Eventuele yoghurt pas van het vuur toevoegen.`,
          {
            componentId: c.id,
            inputGrams: finish.inputGrams,
            attentionWindows: [
              { offset: 0, minutes: c.activeMinutes },
              { offset: c.activeMinutes + c.passiveMinutes - 3, minutes: 3 },
            ],
          },
        );
      }
      const portion = add(
        `portion-${item.recipeId}-${round}`,
        `Verdeel en label ${item.servings} bakjes · ${item.recipe.nameNl}`,
        "worktop",
        Math.ceil(3 + item.servings * 0.6),
        Math.ceil(3 + item.servings * 0.6),
        [cook.id, ...dependencies],
        "Portioneren",
        "Verdeel saus, groente en eiwit gelijkmatig. Voeg de toegewezen rijst/pasta toe. Gebruik de gemeten opbrengst; behoud de verhouding per recept en ronde.",
      );
      const cool = add(
        `cool-${item.recipeId}-${round}`,
        "Snel koelen in ondiepe porties",
        "passive",
        KITCHEN_ASSUMPTIONS.coolMinutes,
        0,
        [portion.id],
        "Koelen",
        "Koel actief met bijvoorbeeld een koudwaterbad. Zet binnen 2 uur na bereiding afgedekt gekoeld weg. Twintig minuten is een planningsschatting, geen meting of garantie. Controleer koelruimte vóór de kookdag.",
      );
      const store = add(
        `store-${item.recipeId}-${round}`,
        `Bewaar ${item.servings} porties · ronde ${wave}`,
        "worktop",
        3,
        3,
        [cool.id],
        "Bewaren",
        "Koelkast maximaal 2 dagen; vries overige porties in zodra voldoende afgekoeld. Maximaal twee opeenvolgende productierondes tegelijk in bewerking. Pauzeer als koelen achterloopt. Reinig gebruikte materialen.",
      );
      stores.push(store.id);
    }
    // Begin heating the next wave while these portions cool. Completed storage
    // tasks are already scheduled and keep the cook's hands reserved. Limit
    // warm food to two consecutive waves rather than all sixty meals at once.
    barrier = integratedTasks.size ? stores : [...produced.values()].flat();
    if (waveIndex >= 1)
      barrier.push(
        ...tasks
          .filter(
            (t) =>
              t.id.startsWith("store-") &&
              t.title.endsWith(`ronde ${wave - 1}`),
          )
          .map((t) => t.id),
      );
  }
  add(
    "cleanup",
    "Laatste opruimronde",
    "worktop",
    KITCHEN_ASSUMPTIONS.cleanupMinutes,
    KITCHEN_ASSUMPTIONS.cleanupMinutes,
    tasks.filter((t) => t.id.startsWith("store-")).map((t) => t.id),
    "Afronden",
    "Reinig werkblad en materiaal. Controleer labels en of alle porties gekoeld staan.",
  );
  return tasks.sort(
    (a, b) => a.startMinute - b.startMinute || a.id.localeCompare(b.id),
  );
}
