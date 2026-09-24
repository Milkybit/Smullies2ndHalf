"use client";
import { RecipeBrowser } from "../RecipeBrowser";
import { PageTitle } from "../ui";
export function RecipesScreen() {
  return (
    <>
      <PageTitle
        eyebrow="Lekker eten, slim voorbereid"
        title="Vind jouw volgende favoriet."
        description="30 gerechten om naar uit te kijken. Eiwitrijk, geschikt voor de vriezer en aan te passen aan jouw voedingsdoelen."
      />
      <RecipeBrowser />
    </>
  );
}
