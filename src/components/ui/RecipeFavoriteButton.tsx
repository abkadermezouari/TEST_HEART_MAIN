"use client";

import { useTransition, useState } from "react";
import { toggleSavedRecipeAction } from "@/app/recipes/_actions/favorites.action";

interface RecipeFavoriteButtonProps {
  recipeId: string;
  initialSaved: boolean;
  className?: string;
}

export function RecipeFavoriteButton({
  recipeId,
  initialSaved,
  className,
}: RecipeFavoriteButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleSavedRecipeAction(recipeId, saved);
      if (!result.error) setSaved(result.saved ?? !saved);
    });
  }

  const defaultClass = `absolute bottom-4 right-4 bg-white/90 backdrop-blur w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors ${
    saved ? "text-secondary" : "text-primary hover:text-secondary"
  }`;

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={className ?? defaultClass}
      aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
      >
        favorite
      </span>
    </button>
  );
}
