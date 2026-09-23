"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useStore } from "./store";
import { Icon, Notice } from "./ui";
import { ProfileScreen } from "./screens/ProfileScreen";

const groups = [
  {
    name: "Jouw plan",
    links: [
      ["/", "Overzicht", "dashboard"],
      ["/recipes", "Recepten", "recipes"],
      ["/batch", "Mijn batch", "batch"],
    ],
  },
  {
    name: "In de keuken",
    links: [
      ["/shopping", "Boodschappen", "shopping"],
      ["/cooking", "Kookdag", "cooking"],
      ["/kitchen", "Keukenspullen", "kitchen"],
    ],
  },
  {
    name: "Persoonlijk",
    links: [
      ["/profile", "Profiel & doelen", "profile"],
      ["/meals", "Dagindeling", "meals"],
      ["/ingredients", "Ingrediënten", "ingredients"],
      ["/settings", "Instellingen", "settings"],
    ],
  },
];

export function Wordmark() {
  return (
    <span className="product-wordmark">
      PrepPartner<span className="wordmark-dot">.</span>
      <small>VOEDING DIE VOOR JE WERKT</small>
    </span>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { state, ready, storageError } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname().replace(/\/$/, "") || "/";
  const currentPage =
    groups
      .flatMap((g) => g.links)
      .find(([href]) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href),
      )?.[1] ?? "Mijn planner";
  if (!ready)
    return (
      <div className="loading" role="status">
        <Wordmark />
        <span>Je planner openen…</span>
      </div>
    );
  if (!state.profile && pathname !== "/settings")
    return (
      <main className="onboarding-page">
        <a className="skip-link" href="#profile-form">
          Ga naar formulier
        </a>
        <div className="onboarding-brand">
          <Wordmark />
          <span className="early-access">Persoonlijke mealprep</span>
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
    <div className="product-layout">
      <a className="skip-link" href="#main">
        Ga naar inhoud
      </a>
      <aside className="product-sidebar">
        <div className="product-sidebar-top">
          <Link
            href="/"
            aria-label="PrepPartner — overzicht"
            onClick={() => setMenuOpen(false)}
          >
            <Wordmark />
          </Link>
          <button
            type="button"
            className="mobile-menu-button"
            aria-expanded={menuOpen}
            aria-controls="product-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
            {menuOpen ? "Sluiten" : "Menu"}
          </button>
        </div>
        <nav
          id="product-navigation"
          className={
            menuOpen ? "product-navigation is-open" : "product-navigation"
          }
          aria-label="Hoofdnavigatie"
        >
          {groups.map((group) => (
            <div className="navigation-group" key={group.name}>
              <div className="navigation-label">{group.name}</div>
              {group.links.map(([href, label, icon]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={
                    (
                      href === "/"
                        ? pathname === href
                        : pathname.startsWith(href)
                    )
                      ? "page"
                      : undefined
                  }
                >
                  <Icon name={icon} size={19} />
                  <span>{label}</span>
                  {href === "/batch" && state.batch.length > 0 && (
                    <span className="product-nav-count">
                      {state.batch.length}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <Link href="/settings" className="product-storage">
          <Icon name="lock" size={17} />
          <span>
            <strong>Op dit apparaat</strong>
            <small>Gegevens & back-up</small>
          </span>
          <Icon name="arrow" size={15} />
        </Link>
      </aside>
      <div className="product-workspace">
        <header className="product-topbar">
          <span>
            Mijn planner <span className="breadcrumb-slash">/</span>{" "}
            <strong>{currentPage}</strong>
          </span>
          <Link href="/profile" className="profile-shortcut">
            <Icon name="profile" size={17} />
            Mijn profiel
          </Link>
        </header>
        <main id="main" className="main-content">
          {storageError && <Notice tone="warning">{storageError}</Notice>}
          {children}
          <footer className="page-footer">
            <span>PrepPartner</span>
            <span>
              Voedingswaarden en energieverbruik zijn schattingen. Je gegevens
              worden in deze browser bewaard.
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
