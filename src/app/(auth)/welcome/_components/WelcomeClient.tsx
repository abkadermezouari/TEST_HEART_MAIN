"use client";

import { User, Store, ChevronRight } from "lucide-react";
import Link from "next/link";

export function WelcomeClient() {
  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Carte client */}
        <Link
          href="/login"
          className="group flex flex-col items-center gap-4 p-8 bg-white rounded-2xl border-2 border-transparent hover:border-[#01696f] custom-shadow transition-all duration-200"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#01696f]/10 flex items-center justify-center group-hover:bg-[#01696f]/20 transition-colors">
            <User className="w-8 h-8 text-[#01696f]" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-[#181c1d] mb-1">Je suis un client</h3>
            <p className="text-sm text-[#6f797a]">
              Trouvez des produits adaptés à votre profil santé
            </p>
          </div>
          <div className="mt-auto flex items-center gap-1 text-sm font-semibold text-[#01696f]">
            Continuer <ChevronRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Carte partenaire */}
        <Link
          href="/login-partner"
          className="group flex flex-col items-center gap-4 p-8 bg-white rounded-2xl border-2 border-transparent hover:border-[#6e3815] custom-shadow transition-all duration-200"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#6e3815]/10 flex items-center justify-center group-hover:bg-[#6e3815]/20 transition-colors">
            <Store className="w-8 h-8 text-[#6e3815]" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-[#181c1d] mb-1">
              Je suis un magasin partenaire
            </h3>
            <p className="text-sm text-[#6f797a]">
              Gérez votre inventaire et vos produits
            </p>
          </div>
          <div className="mt-auto flex items-center gap-1 text-sm font-semibold text-[#6e3815]">
            Continuer <ChevronRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
