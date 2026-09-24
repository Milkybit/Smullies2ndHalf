"use client";
import { RecipeBrowser } from "../RecipeBrowser";
import { PageTitle } from "../ui";
import Link from "next/link";
import { usePlanner } from "../store";
export function RecipesScreen() {
  const { state } = usePlanner();
  return (
    <>
      <PageTitle
        eyebrow="Lekker eten, slim voorbereid"
        title="Vind jouw volgende favoriet."
        description="30 gerechten om naar uit te kijken. Eiwitrijk, geschikt voor de vriezer en aan te passen aan jouw voedingsdoelen."
      />
      <RecipeBrowser />
      <Link href="/batch" className="button primary candidate-cta">
        Optimaliseer met {state.candidateRecipeIds?.length ?? 0} kandidaten →
      </Link>
    </>
  );
}
