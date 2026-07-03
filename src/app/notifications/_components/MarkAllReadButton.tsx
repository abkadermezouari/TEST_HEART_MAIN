"use client";

import { useTransition } from "react";
import { markAllReadAction } from "../_actions/notifications.action";

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => { void markAllReadAction(); });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-sm font-semibold text-[#004f54] hover:underline disabled:opacity-50"
    >
      {isPending ? "..." : "Tout marquer comme lu"}
    </button>
  );
}
