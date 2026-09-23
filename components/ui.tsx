"use client";
import { useEffect, useId, useState, type ReactNode } from "react";
import type { Nutrition } from "@/domain/types";
import { number } from "@/services/format";

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="11" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="18" width="7" height="3" rx="1" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
    meals: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    recipes: (
      <>
        <path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4zM13 7a3 3 0 0 1 3-3h4v15h-3a4 4 0 0 0-4 2" />
      </>
    ),
    batch: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="3" />
        <path d="M3 10h18M8 5V3m8 2V3m-4 11h4m-2-2v4" />
      </>
    ),
    shopping: (
      <>
        <path d="m3 3 3 2 3 12h11l2-10H7M10 7l2-4m5 4-2-4" />
        <circle cx="10" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
      </>
    ),
    cooking: (
      <>
        <path d="M6 13a5 5 0 1 1 2-9 5 5 0 0 1 8 0 5 5 0 1 1 2 9v8H6zM6 17h12" />
      </>
    ),
    ingredients: (
      <>
        <path d="M12 21V10M12 14C5 15 3 10 3 5c5 0 9 2 9 9ZM12 11C12 4 16 2 21 3c0 5-3 9-9 8Z" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m9 3-1 3-3 1-2 3 2 2-1 4 3 2 3-1 2 4 3-2 1-3 4-1 1-4-3-2V6l-4-2-2 2z" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    flame: (
      <path d="M12 2c1 5 6 5 6 10 3 4-1 10-6 10S3 17 5 12c1 2 2 3 3 3-1-5 4-7 4-13Z" />
    ),
    snow: (
      <>
        <path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.ingredients}
    </svg>
  );
}
export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}
export function Stat({
  label,
  value,
  unit,
  hint,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  icon?: string;
}) {
  return (
    <div className="stat">
      <div className="stat-label">
        {label}
        {icon && <Icon name={icon} />}
      </div>
      <div className="stat-value">
        {value} <span>{unit}</span>
      </div>
      {hint && <div className="muted small">{hint}</div>}
    </div>
  );
}
export function Notice({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "warning" | "success";
}) {
  return (
    <div
      className={`notice ${tone}`}
      role={tone === "warning" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="empty">
      <Icon name="batch" size={38} />
      <h2>{title}</h2>
      <div>{children}</div>
    </Card>
  );
}
export function NutritionLine({
  nutrition,
  fiber = false,
}: {
  nutrition: Nutrition;
  fiber?: boolean;
}) {
  return (
    <div className="nutrition-line">
      <strong>
        {number(nutrition.kcal)} <small>kcal</small>
      </strong>
      <span>{number(nutrition.protein)} g eiwit</span>
      <span>{number(nutrition.carbs)} g kh</span>
      <span>{number(nutrition.fat)} g vet</span>
      {fiber && <span>{number(nutrition.fiber, 1)} g vezels</span>}
    </div>
  );
}
export function NumberField({
  label,
  value,
  onCommit,
  min = 0,
  max = 10000,
  step = 1,
  unit,
  compact = false,
}: {
  label: string;
  value: number;
  onCommit: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  compact?: boolean;
}) {
  const id = useId();
  const [text, setText] = useState(String(value));
  const [error, setError] = useState("");
  useEffect(() => {
    setText(String(value));
    setError("");
  }, [value]);
  function commit() {
    const next = Number(text.replace(",", "."));
    if (
      !text.trim() ||
      !Number.isFinite(next) ||
      next < min ||
      next > max ||
      (step === 1 && !Number.isInteger(next))
    ) {
      setError(
        `Gebruik ${number(min)} t/m ${number(max)}${step === 1 ? ", in hele getallen" : ""}.`,
      );
      return;
    }
    setError("");
    onCommit(next);
  }
  return (
    <div className={`field ${compact ? "compact" : ""}`}>
      <label htmlFor={id}>
        {label}
        {unit && <span> ({unit})</span>}
      </label>
      <input
        id={id}
        type="number"
        value={text}
        min={min}
        max={max}
        step={step}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
        }}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <small id={`${id}-error`} className="error">
          {error}
        </small>
      )}
    </div>
  );
}
