"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import type {
  Activity,
  Goal,
  Profile,
  Sex,
  TargetOverrides,
} from "@/domain/types";
import { ACTIVITY_LABELS } from "@/domain/constants";
import { profileErrors, overrideErrors } from "@/domain/validation";
import { calculateTargets } from "@/calculations/energy";
import { createMealSlots } from "@/calculations/meals";
import { number } from "@/services/format";
import { useStore } from "../store";
import { Card, Icon, Notice, PageTitle, Stat } from "../ui";
import { RecipeVisual } from "../RecipeVisual";
import { recipes } from "@/data/recipes";

export function ProfileScreen({
  onboarding = false,
}: {
  onboarding?: boolean;
}) {
  const { state, update } = useStore();
  const p = state.profile;
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState({
    age: p ? String(p.age) : "",
    sex: p?.sex ?? "",
    heightCm: p ? String(p.heightCm) : "",
    weightKg: p ? String(p.weightKg) : "",
    bodyFatPercentage:
      p?.bodyFatPercentage === undefined ? "" : String(p.bodyFatPercentage),
    activity: p?.activity ?? "",
    workoutsPerWeek: p ? String(p.workoutsPerWeek) : "",
    goal: String(p?.goal ?? "maintenance"),
    weeklyWeightLossKg: String(p?.weeklyWeightLossKg ?? 0.5),
    surplusCalories: String(p?.surplusCalories ?? 250),
  });
  const [manual, setManual] = useState(
    Object.fromEntries(
      ["calories", "protein", "carbs", "fat"].map((key) => [
        key,
        state.overrides[key as keyof TargetOverrides]?.toString() ?? "",
      ]),
    ),
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  function values(): { profile: Profile; overrides: TargetOverrides } {
    const profile: Profile = {
      age: Number(draft.age),
      sex: draft.sex as Sex,
      heightCm: Number(draft.heightCm),
      weightKg: Number(draft.weightKg),
      bodyFatPercentage:
        draft.bodyFatPercentage === ""
          ? undefined
          : Number(draft.bodyFatPercentage),
      activity: draft.activity as Activity,
      workoutsPerWeek:
        draft.workoutsPerWeek === "" ? NaN : Number(draft.workoutsPerWeek),
      goal: draft.goal as Goal,
      weeklyWeightLossKg: Number(draft.weeklyWeightLossKg),
      surplusCalories: Number(draft.surplusCalories),
    };
    const overrides: TargetOverrides = {};
    for (const key of ["calories", "protein", "carbs", "fat"] as const)
      if (manual[key] !== "") overrides[key] = Number(manual[key]);
    return { profile, overrides };
  }
  const current = values();
  const valid =
    !profileErrors(current.profile).length &&
    !overrideErrors(current.overrides).length;
  const targets = valid
    ? calculateTargets(current.profile, current.overrides)
    : null;
  function submit(event: FormEvent) {
    event.preventDefault();
    const { profile, overrides } = values();
    const problems = [...profileErrors(profile), ...overrideErrors(overrides)];
    setErrors(problems);
    if (problems.length) return;
    if (onboarding && step === 1) {
      setStep(2);
      return;
    }
    const target = calculateTargets(profile, overrides);
    update((old) => ({
      ...old,
      profile,
      overrides,
      meals: old.meals.length ? old.meals : createMealSlots(target.calories),
    }));
    setSaved(true);
  }
  function field(
    key: keyof typeof draft,
    label: string,
    min: number,
    max: number,
    inputStep = "1",
    optional = false,
  ) {
    return (
      <div className="field">
        <label htmlFor={key}>
          {label}
          {optional && <span> • optioneel</span>}
        </label>
        <input
          id={key}
          name={key}
          type="number"
          required={!optional}
          min={min}
          max={max}
          step={inputStep}
          value={draft[key]}
          placeholder={optional ? "Laat leeg als je dit niet weet" : "Vul in"}
          onChange={(event) => {
            setDraft({ ...draft, [key]: event.target.value });
            setSaved(false);
          }}
        />
      </div>
    );
  }
  return (
    <>
      {!onboarding && (
        <PageTitle
          eyebrow="PERSOONLIJKE BASIS"
          title="Jouw profiel"
          description="Een onderbouwd startpunt. Je doelen blijven altijd aanpasbaar."
        />
      )}
      <div className={onboarding ? "onboarding-grid" : "profile-grid"}>
        {onboarding && (
          <div className="onboarding-intro">
            <div className="eyebrow">Jouw doel. Jouw smaak. Jouw plan.</div>
            <h1>
              Voeding die werkt.
              <br />
              Eten dat je wilt<span>.</span>
            </h1>
            <p>
              Een persoonlijk voedingsplan, lekkere recepten en een kookdag die
              je vooruithelpt. Begin bij jezelf; wij rekenen de rest uit.
            </p>
            <RecipeVisual
              recipe={recipes.find((recipe) => recipe.id === "teriyaki")!}
              priority
            />
            <div className={`onboarding-step ${step === 1 ? "active" : ""}`}>
              <b>01</b>
              <div>
                <strong>Jouw uitgangspunt</strong>
                <span>Profiel & dagelijkse activiteit</span>
              </div>
            </div>
            <div className={`onboarding-step ${step === 2 ? "active" : ""}`}>
              <b>02</b>
              <div>
                <strong>Jouw doelen</strong>
                <span>Calorieën & macroverdeling</span>
              </div>
            </div>
            <div className="privacy-line">
              <Icon name="lock" />
              Je persoonlijke gegevens blijven op dit apparaat.
            </div>
          </div>
        )}
        <Card className="profile-form">
          <form id="profile-form" onSubmit={submit}>
            <div className="section-heading">
              <div>
                <div className="eyebrow">
                  {onboarding ? `STAP ${step} VAN 2` : "PROFIEL & DOELEN"}
                </div>
                <h2>
                  {onboarding
                    ? step === 1
                      ? "Vertel iets over jezelf"
                      : "Maak je doelen persoonlijk"
                    : "Je uitgangspunten"}
                </h2>
              </div>
              <span className="icon-tile">
                <Icon name="profile" />
              </span>
            </div>
            {(!onboarding || step === 1) && (
              <>
                <div className="form-grid">
                  {field("age", "Leeftijd (jaar)", 16, 100)}
                  <div className="field">
                    <label htmlFor="sex">Geslacht voor BMR-berekening</label>
                    <select
                      id="sex"
                      required
                      value={draft.sex}
                      onChange={(e) =>
                        setDraft({ ...draft, sex: e.target.value })
                      }
                    >
                      <option value="">Kies een formule</option>
                      <option value="male">Man</option>
                      <option value="female">Vrouw</option>
                    </select>
                  </div>
                  {field("heightCm", "Lengte (cm)", 100, 250, "0.1")}
                  {field("weightKg", "Gewicht (kg)", 30, 300, "0.1")}
                  {field(
                    "bodyFatPercentage",
                    "Vetpercentage (%)",
                    3,
                    70,
                    "0.1",
                    true,
                  )}
                  {field("workoutsPerWeek", "Trainingen per week", 0, 21)}
                </div>
                <div className="field">
                  <label htmlFor="activity">
                    Activiteit, inclusief je trainingen
                  </label>
                  <select
                    id="activity"
                    required
                    value={draft.activity}
                    onChange={(e) =>
                      setDraft({ ...draft, activity: e.target.value })
                    }
                  >
                    <option value="">
                      Kies je dagelijkse activiteitsniveau
                    </option>
                    {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <small>
                    Trainingen zitten al in de activiteitsfactor en worden niet
                    dubbel opgeteld.
                  </small>
                </div>
              </>
            )}
            {(!onboarding || step === 2) && (
              <>
                <div className="field">
                  <label htmlFor="goal">Je doel</label>
                  <select
                    id="goal"
                    value={draft.goal}
                    onChange={(e) =>
                      setDraft({ ...draft, goal: e.target.value })
                    }
                  >
                    <option value="loss">Afvallen</option>
                    <option value="maintenance">Gewicht behouden</option>
                    <option value="gain">Spiermassa opbouwen</option>
                  </select>
                </div>
                {draft.goal === "loss" && (
                  <>
                    <div className="preset-buttons">
                      {[0.25, 0.5, 0.75, 1].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={
                            Number(draft.weeklyWeightLossKg) === value
                              ? "selected"
                              : ""
                          }
                          onClick={() =>
                            setDraft({
                              ...draft,
                              weeklyWeightLossKg: String(value),
                            })
                          }
                        >
                          {number(value, 2)} kg/week
                        </button>
                      ))}
                    </div>
                    {field(
                      "weeklyWeightLossKg",
                      "Gewenst verlies (kg per week), ook vrij in te vullen",
                      0.05,
                      2,
                      "0.05",
                    )}
                  </>
                )}
                {draft.goal === "gain" &&
                  field(
                    "surplusCalories",
                    "Gewenst overschot (kcal per dag)",
                    0,
                    2000,
                  )}
                <details className="override-details">
                  <summary>Calorieën of macro’s zelf instellen</summary>
                  <p className="muted small">
                    Laat een veld leeg voor de berekende waarde. Eiwit, vet en
                    koolhydraten mogen afzonderlijk worden overschreven.
                  </p>
                  <div className="form-grid">
                    {(
                      [
                        ["calories", "Calorieën (kcal)"],
                        ["protein", "Eiwit (g)"],
                        ["carbs", "Koolhydraten (g)"],
                        ["fat", "Vet (g)"],
                      ] as const
                    ).map(([key, label]) => (
                      <div className="field" key={key}>
                        <label htmlFor={`override-${key}`}>{label}</label>
                        <input
                          id={`override-${key}`}
                          type="number"
                          min={key === "calories" ? 500 : 0}
                          max={key === "calories" ? 10000 : 1500}
                          step="1"
                          placeholder="Automatisch"
                          value={manual[key]}
                          onChange={(e) =>
                            setManual({ ...manual, [key]: e.target.value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </details>
              </>
            )}
            {errors.map((error) => (
              <Notice key={error} tone="warning">
                {error}
              </Notice>
            ))}
            {(!onboarding || step === 2) && targets && (
              <div className="target-preview">
                <div className="eyebrow">JOUW DAGELIJKSE RICHTING</div>
                <strong>
                  {number(targets.calories)} <small>kcal</small>
                </strong>
                <div className="macro-tags">
                  <span>{number(targets.protein)} g eiwit</span>
                  <span>{number(targets.carbs)} g koolhydraten</span>
                  <span>{number(targets.fat)} g vet</span>
                </div>
                <p className="small muted">
                  BMR {number(targets.bmr)} • geschat TDEE{" "}
                  {number(targets.tdee)} •{" "}
                  {targets.energyBalance < 0 ? "tekort" : "overschot"}{" "}
                  {number(Math.abs(targets.energyBalance))} kcal. Automatisch
                  advies: {number(targets.recommendedCalories)} kcal.
                </p>
                {targets.warnings.map((warning) => (
                  <Notice key={warning} tone="warning">
                    {warning}
                  </Notice>
                ))}
              </div>
            )}
            <div className="form-actions">
              {onboarding && step === 2 && (
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setStep(1)}
                >
                  Terug
                </button>
              )}
              <button className="button primary" type="submit">
                {onboarding
                  ? step === 1
                    ? "Volgende: je doelen"
                    : "Open mijn planner"
                  : "Profiel opslaan"}
                <Icon name="arrow" />
              </button>
            </div>
            {saved && (
              <Notice tone="success">
                Je profiel is bijgewerkt. Je eetmomenten blijven behouden;{" "}
                <Link href="/meals">verdeel je calorieën opnieuw</Link> als je
                doel is veranderd.
              </Notice>
            )}
          </form>
        </Card>
        {!onboarding && (
          <div className="stack">
            <Card>
              <h2>Hoe we rekenen</h2>
              <p>
                Met een vetpercentage gebruiken we Katch–McArdle. Anders
                gebruiken we Mifflin–St Jeor. Je BMR wordt vermenigvuldigd met
                je activiteitsfactor.
              </p>
              <p className="muted">
                Dit is een schatting van je energieverbruik, geen exacte meting.
                Voor automatisch afvallen begrenzen we het tekort op 25% van dat
                verbruik.
              </p>
              {targets && (
                <div className="stats-grid two">
                  <Stat label="BMR" value={number(targets.bmr)} unit="kcal" />
                  <Stat
                    label="Geschat TDEE"
                    value={number(targets.tdee)}
                    unit="kcal"
                  />
                </div>
              )}
            </Card>
            <Card>
              <h3>Jij blijft aan het stuur</h3>
              <p className="muted">
                De rekenregels geven een vertrekpunt. Je kunt calorieën en
                macro’s zelf wijzigen. De planner geeft geen medisch advies.
              </p>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
