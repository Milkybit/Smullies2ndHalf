"use client";
import { useRef, useState } from "react";
import { useStore } from "../store";
import { MAX_BACKUP_BYTES, parseBackup } from "@/services/storage";
import { downloadText } from "@/services/format";
import { Card, Icon, Notice, PageTitle } from "../ui";
export function SettingsScreen() {
  const { state, replace, reset } = useStore();
  const [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);
  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > MAX_BACKUP_BYTES)
        throw new Error("Kies een back-up van maximaal 2 MB.");
      const imported = parseBackup(await file.text());
      if (
        !window.confirm(
          "Deze geldige back-up vervangt je huidige profiel, batch, ingrediënten en vinkjes. Doorgaan?",
        )
      )
        return;
      replace(imported);
      setMessage("Back-up geïmporteerd. Je gegevens zijn hersteld.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Importeren is niet gelukt. Je huidige gegevens zijn behouden.",
      );
    } finally {
      if (input.current) input.current.value = "";
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="JOUW GEGEVENS"
        title="Instellingen"
        description="Alles staat lokaal in deze browser. Met een back-up neem je je planner mee."
      />
      {message && <Notice>{message}</Notice>}
      <div className="settings-grid">
        <Card>
          <span className="icon-tile">
            <Icon name="lock" />
          </span>
          <h2>Een eigen back-up</h2>
          <p>
            Bewaar je profiel, doelen, eetmomenten, ingrediënten, batch,
            kookopbrengst en vinkjes in één JSON-bestand.
          </p>
          <div className="button-group">
            <button
              className="button primary"
              onClick={() =>
                downloadText(
                  JSON.stringify(state, null, 2),
                  `mealprep-backup-${new Date().toISOString().slice(0, 10)}.json`,
                  "application/json",
                )
              }
            >
              Exporteer gegevens
            </button>
            <button
              className="button secondary"
              onClick={() => input.current?.click()}
            >
              Importeer gegevens
            </button>
            <input
              ref={input}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              aria-label="Back-upbestand importeren"
              onChange={(e) => {
                void importFile(e.target.files?.[0]);
              }}
            />
          </div>
          <p className="small muted">
            Import wordt eerst gecontroleerd en vervangt je gegevens pas na
            bevestiging. Je back-up bevat persoonlijke informatie; bewaar die op
            een eigen, veilige plek.
          </p>
        </Card>
        <Card>
          <h2>Zo werkt lokale opslag</h2>
          <p>
            De app bewaart wijzigingen automatisch in localStorage. Er is geen
            account, synchronisatie, analysecode of externe voedings- of
            AI-dienst.
          </p>
          <p>
            Andere browsers, apparaten en webadressen hebben ieder hun eigen
            gegevens. Het wissen van browsergegevens verwijdert ook je planner.
            Gebruik export/import om over te stappen.
          </p>
          <p className="muted small">
            Gebruik de planner op één tab tegelijk om elkaar overschrijvende
            wijzigingen te voorkomen.
          </p>
        </Card>
        <Card className="danger-card">
          <h2>Opnieuw beginnen</h2>
          <p>
            Verwijder alle gegevens van deze MealPrep Planner. De
            standaardrecepten en -ingrediënten blijven beschikbaar.
          </p>
          <button
            className="button danger"
            onClick={() => {
              if (
                window.confirm(
                  "Alle MealPrep Planner-gegevens uit deze browser verwijderen? Dit kan alleen met een eigen back-up worden hersteld.",
                )
              ) {
                reset();
                setMessage(
                  "De applicatie is gereset. Open Dashboard om je profiel opnieuw in te stellen.",
                );
              }
            }}
          >
            Reset applicatie
          </button>
        </Card>
        <Card>
          <h2>Over MealPrep Planner</h2>
          <p>
            Versie 1.0 · 30 vriesvriendelijke recepten · metrische eenheden ·
            volledig Nederlandstalig.
          </p>
          <p className="muted">
            Voedingswaarden en energieverbruik zijn benaderingen. Receptscores
            zijn redactionele inschattingen. De rekenregels zijn een hulpmiddel
            voor planning, geen medisch advies.
          </p>
          <a
            className="text-link"
            href="https://www.voedingscentrum.nl/nl/service/vraag-en-antwoord/koken-en-bewaren/hoe-kan-ik-meal-preppen"
            target="_blank"
            rel="noreferrer"
          >
            Veilig mealpreppen — Voedingscentrum ↗
          </a>
        </Card>
      </div>
    </>
  );
}
