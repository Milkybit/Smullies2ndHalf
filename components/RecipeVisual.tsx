import Image from "next/image";
import type { Recipe } from "@/domain/types";
import teriyaki from "@/public/images/teriyaki.webp";
import curry from "@/public/images/red-curry.webp";
import ragu from "@/public/images/beef-ragu.webp";

const photography = { teriyaki, "red-curry-chicken": curry, "beef-ragu": ragu };

export function RecipeVisual({
  recipe,
  priority = false,
  className = "",
}: {
  recipe: Recipe;
  priority?: boolean;
  className?: string;
}) {
  const photo = photography[recipe.id as keyof typeof photography];
  return (
    <div
      className={`dish-visual ${photo ? "has-photo" : `dish-type-${recipe.cookingGroup}`} ${className}`}
    >
      {photo ? (
        <>
          <Image
            src={photo}
            alt={`Sfeerbeeld bij ${recipe.nameNl}`}
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 1200px) 45vw, 33vw"
            preload={priority}
          />
          <span className="photo-caption">Sfeerbeeld</span>
        </>
      ) : (
        <div className="dish-type-cover" aria-hidden="true">
          <span>{recipe.cuisine}</span>
          <strong>
            {recipe.cookingGroup === "curry"
              ? "Rijk & romig."
              : recipe.cookingGroup === "tomato-pasta"
                ? "Tijd voor pasta."
                : recipe.cookingGroup === "chili"
                  ? "Rustig gegaard."
                  : "Vol van smaak."}
          </strong>
          <span>{recipe.tags.slice(0, 2).join(" · ")}</span>
        </div>
      )}
    </div>
  );
}
