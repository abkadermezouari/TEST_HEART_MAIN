"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/(auth)/login/_actions/logout.action";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logoutAction())}
      disabled={isPending}
      className="flex items-center gap-2 px-5 py-2.5 border border-outline-variant rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-lg">logout</span>
      {isPending ? "Déconnexion…" : "Déconnexion"}
    </button>
  );
}
