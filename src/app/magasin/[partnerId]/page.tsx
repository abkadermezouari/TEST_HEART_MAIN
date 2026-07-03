import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getPublishedCatalog } from "@/lib/queries/catalog";
import { MagasinTabs } from "./_components/MagasinTabs";

export default async function MagasinPage({
  params,
}: {
  params: Promise<{ partnerId: string }>;
}) {
  const { partnerId } = await params;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("id", partnerId)
    .eq("is_active", true)
    .maybeSingle();

  if (!partner) notFound();

  const catalog = await getPublishedCatalog(partnerId);
  const products = catalog.filter((item) => item.type === "product");
  const recipes = catalog.filter((item) => item.type === "recipe");

  return (
    <div className="min-h-screen bg-[#f7fafa] text-[#181c1d]">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link
            href="/map"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-[#01696f] mb-4 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Retour à la carte
          </Link>
          <h1 className="text-3xl font-bold">{partner.name}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-neutral-500">
            {partner.address_line && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {partner.address_line}
              </span>
            )}
            {partner.city && <span>{partner.city}</span>}
            {partner.phone && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">call</span>
                {partner.phone}
              </span>
            )}
            {partner.latitude && partner.longitude && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${partner.latitude},${partner.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#01696f] hover:underline font-bold"
              >
                <span className="material-symbols-outlined text-sm">directions</span>
                Itinéraire
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Tabs + Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <MagasinTabs products={products} recipes={recipes} partnerName={partner.name} />
      </div>
    </div>
  );
}
