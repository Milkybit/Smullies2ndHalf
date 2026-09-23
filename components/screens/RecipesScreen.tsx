"use client";
import { RecipeBrowser } from "../RecipeBrowser";
import { PageTitle } from "../ui";
export function RecipesScreen() {
  return (
    <>
      <PageTitle
        eyebrow="DE RECEPTENBIBLIOTHEEK"
        title="Goed in de pan. Goed uit de vriezer."
        description="30 eiwitrijke recepten. Pas een gerecht aan je doelen aan en plan zoveel porties als je nodig hebt."
      />
      <RecipeBrowser />
    </>
  );
}
