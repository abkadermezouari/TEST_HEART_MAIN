"use client";

import { useState, useTransition } from "react";
import { toggleSavedArticleAction } from "@/app/learn/_actions/article.action";

interface ArticleActionsProps {
  articleId: string;
  initialSaved: boolean;
  articleTitle: string;
  articleUrl: string;
}

export function ArticleActions({
  articleId,
  initialSaved,
  articleTitle,
  articleUrl,
}: ArticleActionsProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  function handleBookmark() {
    startTransition(async () => {
      const result = await toggleSavedArticleAction(articleId, saved);
      if (!result.error) setSaved(result.saved ?? !saved);
    });
  }

  function handleShare() {
    const shareData = {
      title: articleTitle,
      url: articleUrl,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard
        .writeText(articleUrl)
        .then(() => alert("Lien copié !"))
        .catch(() => {});
    }
  }

  return (
    <>
      <button
        onClick={handleShare}
        className="p-2 text-[#6f797a] hover:text-[#004f54] transition-colors"
        title="Partager"
      >
        <span className="material-symbols-outlined">share</span>
      </button>
      <button
        onClick={handleBookmark}
        disabled={isPending}
        className={`p-2 transition-colors ${
          saved
            ? "text-[#004f54]"
            : "text-[#6f797a] hover:text-[#004f54]"
        }`}
        title={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        <span
          className="material-symbols-outlined"
          style={saved ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          bookmark
        </span>
      </button>
    </>
  );
}
