import { AuthTabs } from "@/app/(auth)/login/_components/AuthTabs";
import Link from "next/link";
import { ArrowLeft, Sparkles, BarChart3, ShoppingBag } from "lucide-react";

interface PartnerLoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function PartnerLoginPage({ searchParams }: PartnerLoginPageProps) {
  const { error: errorMsg } = await searchParams;
  return (
    <main className="flex min-h-screen">
      {/* Left Side */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-120 bg-white p-8 rounded-xl custom-shadow">
          {/* Brand */}
          <div className="flex flex-col items-center mb-2">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="material-symbols-outlined text-[#004f54] text-[32px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
              <span
                className="material-symbols-outlined text-[#004f54] text-[28px] -ml-4 mt-2"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                eco
              </span>
            </div>
            <h1 className="text-4xl font-bold text-[#004f54] tracking-tight">Smart Healthy</h1>
            <p className="text-sm text-outline">Dietary Intelligence</p>
          </div>

          {/* Partner Header */}
          <div className="mb-6 flex items-center justify-between bg-[#fdf6f2] border border-[#6e3815]/20 rounded-lg px-4 py-3">
            <span className="text-sm text-[#6e3815] font-semibold">Espace Partenaire</span>
            <Link
              href="/welcome"
              className="flex items-center gap-1 text-xs font-semibold text-[#6e3815] hover:underline underline-offset-2"
            >
              <ArrowLeft className="w-3 h-3" />
              Retour
            </Link>
          </div>

          {errorMsg && (
            <p role="alert" className="mb-4 text-sm text-[#ae2f34] bg-[#ae2f34]/5 border border-[#ae2f34]/20 rounded-lg px-4 py-2 text-center">
              {errorMsg}
            </p>
          )}

          <AuthTabs mode="partner" />
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#6e3815]/10 p-8 flex-col justify-center relative overflow-hidden">
        <div className="relative z-10 max-w-lg mx-auto space-y-6">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-[#6e3815]">
              Boostez votre magasin avec Smart Healthy.
            </h2>
            <p className="text-lg text-on-surface-variant">
              Gérez votre inventaire, référencez vos produits, et attirez des clients ciblés par
              leurs besoins nutritionnels.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                icon: Sparkles,
                title: "Visibilité ciblée",
                desc: "Vos produits sont mis en avant auprès des clients qui recherchent exactement ce que vous proposez.",
              },
              {
                icon: ShoppingBag,
                title: "Gestion simplifiée",
                desc: "Un tableau de bord intuitif pour gérer votre inventaire, vos prix et vos promotions en temps réel.",
              },
              {
                icon: BarChart3,
                title: "Statistiques détaillées",
                desc: "Suivez les vues, les recherches et les tendances pour optimiser votre offre.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <item.icon className="w-5 h-5 text-[#6e3815] mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-[#181c1d]">{item.title}</h3>
                  <p className="text-xs text-on-surface-variant">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6e3815]/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#01696f]/5 rounded-full -ml-48 -mb-48" />
      </div>
    </main>
  );
}
