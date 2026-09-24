import { notFound } from "next/navigation";
import { recipes } from "@/data/recipes";
import { RecipeDetailScreen } from "@/components/screens/RecipeDetailScreen";
export function generateStaticParams() {
  return recipes.map((recipe) => ({ id: recipe.id }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!recipes.some((recipe) => recipe.id === id)) notFound();
  return <RecipeDetailScreen recipeId={id} />;
}
