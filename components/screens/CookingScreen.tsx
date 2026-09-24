"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePlanner } from "../store";
import { cookingPlan } from "@/calculations/cooking";
import { number } from "@/services/format";
import { Card, Empty, Notice, NumberField, PageTitle, WhyLink } from "../ui";
import { YieldCalculator } from "../YieldCalculator";
import { BatchJourney } from "../BatchJourney";
const APPLIANCE_LABELS = {
  worktop: "Werkblad",
  burner: "Pit",
  oven: "Oven",
  passive: "Wachttijd",
};
export function CookingScreen() {
  const { state, update, batch, catalog } = usePlanner();
  const [tab, setTab] = useState("plan");
  const tasks = useMemo(
    () => cookingPlan(batch, state.equipment, catalog),
    [batch, state.equipment, catalog],
  );
  const end = Math.max(0, ...tasks.map((task) => task.endMinute));
  function setEquipment(key: keyof typeof state.equipment, value: number) {
    update((old) => ({
      ...old,
      equipment: { ...old.equipment, [key]: value },
      completedTasks: {},
    }));
  }
  return (
    <>
      <PageTitle
        eyebrow="RUST IN DE KEUKEN"
        title="Je kookdag, stap voor stap"
        description="Een praktische volgorde voor jouw recepten en apparatuur. Werk in rondes en vink af wat klaar is."
      />
      <BatchJourney active="cooking" />
      <div className="tabs no-print" role="tablist" aria-label="Kookmodus">
        <button
          role="tab"
          aria-selected={tab === "plan"}
          onClick={() => setTab("plan")}
        >
          Kookplan
        </button>
        <button
          role="tab"
          aria-selected={tab === "yield"}
          onClick={() => setTab("yield")}
        >
          Opbrengst invoeren
        </button>
      </div>
      {!batch.length ? (
        <Empty title="Er staat nog geen kookdag klaar">
          <p>Selecteer recepten om de planning te maken.</p>
          <Link href="/batch" className="button primary">
            Batch samenstellen
          </Link>
        </Empty>
      ) : tab === "yield" ? (
        <YieldCalculator />
      ) : (
        <>
          <Card className="equipment-card">
            <NumberField
              label="Beschikbare pitten"
              value={state.equipment.burners}
              min={1}
              max={8}
              onCommit={(value) => setEquipment("burners", value)}
            />
            <NumberField
              label="Beschikbare ovens"
              value={state.equipment.ovens}
              min={0}
              max={4}
              onCommit={(value) => setEquipment("ovens", value)}
            />
            <NumberField
              label="Max. porties per pan / ovenschaal"
              value={state.equipment.maxServingsPerPot}
              min={1}
              max={20}
              onCommit={(value) => setEquipment("maxServingsPerPot", value)}
            />
            <div>
              <span className="muted small">Geschatte doorlooptijd</span>
              <strong className="duration-label">
                {Math.floor(end / 60)} u {end % 60} min
              </strong>
            </div>
          </Card>
          <Card className="equipment-card">
            <NumberField
              label="Max. rauw eiwit per ovenronde (g)"
              value={state.equipment.maxProteinGrams ?? 1500}
              min={300}
              max={5000}
              onCommit={(value) => setEquipment("maxProteinGrams", value)}
            />
            <NumberField
              label="Max. droge rijst/pasta per pan (g)"
              value={state.equipment.maxDryCarbGrams ?? 1000}
              min={100}
              max={3000}
              onCommit={(value) => setEquipment("maxDryCarbGrams", value)}
            />
            <p className="muted small">
              Bakken in een pan: maximaal 750 g eiwit per ronde. Voorverwarmen
              is onderdeel van de voorbereiding. Stem gewichten af op je eigen
              schalen en pannen.
            </p>
          </Card>
          <Notice>
            Planning voor één kok: gedeelde voorbereiding, daarna maximaal twee
            afwerkingspannen per ronde. Apparaten kunnen tegelijk werken;
            actieve start-, afwerk- en verdeelhandelingen overlappen niet.
            Roeren en gaarheid controleren blijven jouw verantwoordelijkheid.
            Tijden zijn schattingen. Controleer koelcapaciteit; verdeel grote
            batches zo nodig over twee dagen. Koel gare gerechten direct, ook
            als de rijst nog niet klaar is. <WhyLink section="cooking" />
          </Notice>
          {end > 300 && (
            <Notice tone="warning">
              Deze batch vraagt naar schatting {Math.floor(end / 60)} uur en{" "}
              {end % 60} minuten met één kok. Plan hiervoor een hele kookdag of
              verdeel de batch over twee dagen. Er kunnen twee productierondes
              tegelijk in bewerking zijn; reserveer ruimte voor maximaal{" "}
              {state.equipment.maxServingsPerPot * 4} ondiepe bakjes en
              controleer de invriescapaciteit van je apparaat.
            </Notice>
          )}
          <div className="timeline">
            {tasks.map((task) => (
              <article
                className={`timeline-item ${state.completedTasks[task.id] ? "completed" : ""}`}
                key={task.id}
              >
                <div className="timeline-time">
                  {String(Math.floor(task.startMinute / 60)).padStart(2, "0")}:
                  {String(task.startMinute % 60).padStart(2, "0")}
                  <span>vanaf start</span>
                </div>
                <Card>
                  <div className="task-heading">
                    <label>
                      <input
                        type="checkbox"
                        checked={!!state.completedTasks[task.id]}
                        onChange={() =>
                          update((old) => ({
                            ...old,
                            completedTasks: {
                              ...old.completedTasks,
                              [task.id]: !old.completedTasks[task.id],
                            },
                          }))
                        }
                      />
                      <h3>{task.title}</h3>
                    </label>
                    <span className="badge">
                      {number(task.durationMinutes)} min
                    </span>
                  </div>
                  <div className="task-meta">
                    <span>
                      {APPLIANCE_LABELS[task.appliance]}
                      {["oven", "burner"].includes(task.appliance)
                        ? ` ${task.resource}`
                        : ""}
                    </span>
                    <span>{task.group}</span>
                  </div>
                  <p>{task.notes}</p>
                  {task.dependencies.length > 0 && (
                    <details>
                      <summary>Na welke stap?</summary>
                      <ul>
                        {task.dependencies.map((id) => (
                          <li key={id}>
                            {tasks.find((row) => row.id === id)?.title}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </Card>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
