"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store } from "lucide-react";

export function PartnerBanner() {
  const [storeName, setStoreName] = useState<string | null>(null);

  useEffect(() => {
    setStoreName(sessionStorage.getItem("partner_store_name"));
  }, []);

  if (!storeName) return null;

  return (
    <div className="mb-6 flex items-center justify-between bg-[#fdf6f2] border border-[#6e3815]/20 rounded-lg px-4 py-3">
      <div className="flex items-center gap-2 min-w-0">
        <Store className="w-4 h-4 text-[#6e3815] shrink-0" />
        <span className="text-sm text-[#6e3815] font-medium truncate">
          Connexion partenaire —{" "}
          <span className="font-semibold">{storeName}</span>
        </span>
      </div>
      <Link
        href="/welcome"
        className="text-xs font-semibold text-[#6e3815] hover:underline underline-offset-2 shrink-0 ml-3"
      >
        Changer
      </Link>
    </div>
  );
}
