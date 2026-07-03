"use client";

import { useTransition, useState } from "react";
import { promoteToAdminAction } from "@/app/admin/_actions/promote-to-admin.action";

interface PromoteButtonProps {
  userId: string;
  userName: string;
}

export function PromoteButton({ userId, userName }: PromoteButtonProps) {
  const [promoted, setPromoted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePromote() {
    const ok = window.confirm(
      `Promouvoir ${userName} en administrateur ? Cette action est irréversible.`
    );
    if (!ok) return;

    setError(null);
    startTransition(async () => {
      const result = await promoteToAdminAction({ userId });
      if (result.error) {
        setError(result.error);
      } else {
        setPromoted(true);
      }
    });
  }

  if (promoted) {
    return (
      <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase bg-teal-50 text-[#004f54]">
        Admin
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handlePromote}
        disabled={isPending}
        className="p-1.5 rounded-lg hover:bg-teal-50 text-neutral-400 hover:text-[#004f54] transition-colors disabled:opacity-50"
        title={`Promouvoir ${userName} en admin`}
        aria-label={`Promouvoir ${userName} en admin`}
      >
        <span className="material-symbols-outlined text-base">
          admin_panel_settings
        </span>
      </button>
      {error && (
        <span className="text-[10px] text-[#ae2f34] font-medium">{error}</span>
      )}
    </div>
  );
}
