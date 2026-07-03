"use client";

import { useTransition, useState } from "react";
import { toggleSavedProductAction } from "@/app/search/_actions/favorites.action";

interface ProductFavoriteButtonProps {
  productId: string;
  initialSaved: boolean;
  className?: string;
}

export function ProductFavoriteButton({
  productId,
  initialSaved,
  className,
}: ProductFavoriteButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleSavedProductAction(productId, saved);
      if (!result.error) setSaved(result.saved ?? !saved);
    });
  }

  const defaultClass = `absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center transition-colors ${
    saved ? "text-secondary" : "text-outline hover:text-secondary"
  }`;

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={className ?? defaultClass}
      aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <span
        className="material-symbols-outlined text-lg"
        style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
      >
        favorite
      </span>
    </button>
  );
}
