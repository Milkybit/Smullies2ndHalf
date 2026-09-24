"use client";
import { useStore } from "../store";
import { explanationSections } from "@/data/explanations";
import { EVIDENCE_DESCRIPTIONS, EVIDENCE_LABELS } from "@/domain/constants";
import type { EvidenceLevel, WorkedStep } from "@/domain/types";
import { workedMealprep, workedTargets } from "@/services/explanation";
import { Card, PageTitle } from "../ui";

const EVIDENCE_TONES: Record<EvidenceLevel, string> = {
  evidence: "green",
  "rule-of-thumb": "amber",
  choice: "",
};
export function HowItWorksScreen() {
  const { state } = useStore();
  const targets = state.profile
    ? workedTargets(state.profile, state.overrides)
    : null;
  const worked: Record<string, WorkedStep[]> = {
    ...(targets ?? {}),
    meals: workedMealprep(state.meals),
  };
  return (
    <>
      <PageTitle
        eyebrow="ACHTERGROND"
        title="Zo werkt het"
        description="Hoe BatchPrepBaas rekent, welke aannames erin zitten, waarom dat werkt en wanneer het niet klopt. BatchPrepBaas is een hulpmiddel voor planning, geen medisch advies."
      />
      <div className="explain-layout">
        <aside className="stack explain-aside">
          <Card>
            <h3>Inhoud</h3>
            <ol className="explain-toc">
              {explanationSections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ol>
          </Card>
          <Card className="combine-card">
            <h3>Drie soorten aannames</h3>
            {(Object.keys(EVIDENCE_LABELS) as EvidenceLevel[]).map((level) => (
              <div className="shared-item" key={level}>
                <span className={`badge ${EVIDENCE_TONES[level]}`}>
                  {EVIDENCE_LABELS[level]}
                </span>
                <small>{EVIDENCE_DESCRIPTIONS[level]}</small>
              </div>
            ))}
          </Card>
        </aside>
        <div className="stack explain-main">
          {explanationSections.map((section, index) => (
            <Card key={section.id} id={section.id} className="explain-section">
              <div className="eyebrow">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h2>{section.title}</h2>
              <h3>Hoe werkt het?</h3>
              {section.how.map((text) => (
                <p key={text}>{text}</p>
              ))}
              {section.formulas && (
                <details className="explain-formula">
                  <summary>Formules</summary>
                  <ul>
                    {section.formulas.map((formula) => (
                      <li key={formula}>
                        <code>{formula}</code>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              {!!worked[section.id]?.length && (
                <div className="explain-worked">
                  <h4>Jouw berekening</h4>
                  <dl>
                    {worked[section.id].map((step) => (
                      <div key={step.label}>
                        <dt>{step.label}</dt>
                        <dd>
                          <span>{step.expression}</span>
                          <strong>= {step.result}</strong>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
              <h3>Welke aannames?</h3>
              <ul className="explain-assumptions">
                {section.assumptions.map((assumption) => (
                  <li key={assumption.text}>
                    <span
                      className={`badge ${EVIDENCE_TONES[assumption.level]}`}
                    >
                      {EVIDENCE_LABELS[assumption.level]}
                    </span>
                    <span>
                      {assumption.text}
                      {assumption.sources && (
                        <small>
                          Bron:{" "}
                          {assumption.sources.map((source, i) => (
                            <span key={source.url}>
                              {i > 0 && "; "}
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {source.label} ↗
                              </a>
                            </span>
                          ))}
                        </small>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <h3>Waarom werkt dit?</h3>
              <p>{section.why}</p>
              <h3>Wanneer klopt het niet?</h3>
              <ul className="explain-limits">
                {section.limits.map((limit) => (
                  <li key={limit}>{limit}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
