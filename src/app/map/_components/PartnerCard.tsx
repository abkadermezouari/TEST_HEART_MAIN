"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Partner {
  id: string;
  name: string;
  address_line: string | null;
  city: string | null;
  phone: string | null;
  is_active: boolean | null;
  is_verified: boolean | null;
  latitude: number | null;
  longitude: number | null;
}

interface PartnerCardProps {
  partner: Partner;
  isSelected: boolean;
}

export default function PartnerCard({ partner, isSelected }: PartnerCardProps) {
  const router = useRouter();
  const isDisabled = !partner.is_active;
  const statusLabel = partner.is_active ? "Ouvert" : "Fermé";
  const statusColor = partner.is_active
    ? "bg-green-100 text-green-700"
    : "bg-neutral-200 text-neutral-600";

  const href = isSelected ? "/map" : `/map?partner=${partner.id}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => e.key === "Enter" && router.push(href)}
      className={`block bg-white p-5 rounded-xl shadow-sm border transition-all cursor-pointer ${
        isSelected
          ? "border-[#004f54] ring-2 ring-[#004f54]/20"
          : "border-neutral-100 hover:border-[#004f54]/30"
      } ${isDisabled ? "opacity-70" : ""}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-[#181c1d]">{partner.name}</h3>
          <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {[partner.address_line, partner.city].filter(Boolean).join(", ") ||
              "Adresse non disponible"}
          </p>
        </div>
        <span
          className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-4">
        {[
          { label: "Ville", value: partner.city ?? "—", color: "" },
          { label: "Téléphone", value: partner.phone ?? "—", color: "" },
          {
            label: "Statut",
            value: partner.is_verified ? "Vérifié" : "Non vérifié",
            color: partner.is_verified ? "text-[#004f54]" : "text-neutral-500",
          },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <span className="text-xs text-neutral-400">{stat.label}</span>
            <span className={`text-sm font-bold ${stat.color || "text-[#181c1d]"}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {isDisabled ? (
          <span className="flex-1 py-2.5 rounded-lg text-sm font-bold text-center bg-neutral-200 text-neutral-500 cursor-not-allowed">
            Indisponible
          </span>
        ) : (
          <>
            <Link
              href={`/magasin/${partner.id}`}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-center bg-[#004f54] text-white hover:bg-[#01696f] transition-colors"
            >
              Voir le catalogue
            </Link>
            <Link
              href="/search"
              className="py-2.5 px-3 rounded-lg text-sm font-bold text-center border border-[#bec8c9] text-[#004f54] hover:bg-neutral-50 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">search</span>
            </Link>
          </>
        )}
        {partner.latitude && partner.longitude ? (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${partner.latitude},${partner.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-10 h-10 border border-[#bec8c9] flex items-center justify-center rounded-lg hover:bg-neutral-50 transition-colors ${
              isDisabled ? "text-neutral-400" : "text-[#004f54]"
            }`}
          >
            <span className="material-symbols-outlined">directions</span>
          </a>
        ) : (
          <span className="w-10 h-10 border border-[#bec8c9] flex items-center justify-center rounded-lg text-neutral-300 cursor-not-allowed">
            <span className="material-symbols-outlined">directions</span>
          </span>
        )}
      </div>
    </div>
  );
}
