"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useStore } from "./store";
import { Icon, Notice } from "./ui";
import { ProfileScreen } from "./screens/ProfileScreen";

const navigation = [
  ["/", "Dashboard", "dashboard"],
  ["/profile", "Profiel", "profile"],
  ["/meals", "Dagindeling", "meals"],
  ["/recipes", "Recepten", "recipes"],
  ["/batch", "Batch samenstellen", "batch"],
  ["/shopping", "Boodschappen", "shopping"],
  ["/cooking", "Kookplan", "cooking"],
  ["/ingredients", "Ingrediënten", "ingredients"],
  ["/settings", "Instellingen", "settings"],
];
export function Shell({ children }: { children: ReactNode }) {
  const { state, ready, storageError } = useStore();
  const pathname = usePathname().replace(/\/$/, "") || "/";
  if (!ready)
    return (
      <div className="loading" role="status">
        <span className="brand-mark">
          <Icon name="ingredients" size={28} />
        </span>
        Je planner openen…
      </div>
    );
  if (!state.profile && pathname !== "/settings")
    return (
      <main className="onboarding-page">
        <a className="skip-link" href="#profile-form">
          Ga naar formulier
        </a>
        <div className="onboarding-brand">
          <span className="brand-mark">
            <Icon name="ingredients" />
          </span>
          <strong>
            MealPrep <span>Planner</span>
          </strong>
        </div>
        {storageError && (
          <Notice tone="warning">
            {storageError} <Link href="/settings">Naar Instellingen</Link>
          </Notice>
        )}
        <ProfileScreen onboarding />
      </main>
    );
  return (
    <div className="app-layout">
      <a className="skip-link" href="#main">
        Ga naar inhoud
      </a>
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Icon name="ingredients" size={25} />
          </span>
          <span>
            MealPrep<small>PLANNER</small>
          </span>
        </Link>
        <div className="nav-label">JOUW WERKPLEK</div>
        <nav aria-label="Hoofdnavigatie">
          {navigation.map(([href, label, icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                (href === "/" ? pathname === href : pathname.startsWith(href))
                  ? "page"
                  : undefined
              }
            >
              <Icon name={icon} />
              <span>{label}</span>
              {href === "/batch" && state.batch.length > 0 && (
                <b className="nav-count">{state.batch.length}</b>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <Icon name="lock" />
          <strong>Persoonlijk. Lokaal.</strong>
          <p>Je gegevens blijven in deze browser. Jij houdt de controle.</p>
          <Link href="/settings">
            Maak een back-up <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="sidebar-bottom">
          MEALPREP PLANNER <span>v1.0</span>
        </div>
      </aside>
      <div className="workspace">
        <div className="topbar">
          <span>Jouw voeding, goed geregeld.</span>
          <span className="local-badge">
            <i />
            Lokaal opgeslagen
          </span>
        </div>
        <main id="main" className="main-content">
          {storageError && <Notice tone="warning">{storageError}</Notice>}
          {children}
          <footer className="page-footer">
            Voedingswaarden en energieverbruik zijn schattingen. Een
            planningstool, geen medisch advies.
          </footer>
        </main>
      </div>
    </div>
  );
}
