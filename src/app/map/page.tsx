import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { requireAuth } from "@/lib/auth";
import { getPartners, getPartnerWithInventory } from "@/lib/queries/partners";
import { getPublishedCatalog } from "@/lib/queries/catalog";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import PartnerCard from "./_components/PartnerCard";

// Predefined visual positions on the static map image (6 slots, cycles if more partners).
const MARKER_POSITIONS = [
  { top: "28%", left: "38%" },
  { top: "52%", left: "58%" },
  { top: "42%", left: "22%" },
  { top: "32%", left: "64%" },
  { top: "62%", left: "44%" },
  { top: "20%", left: "52%" },
];

const MARKER_ICONS = [
  "storefront",
  "shopping_basket",
  "local_grocery_store",
  "local_shipping",
  "food_bank",
  "eco",
];

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ partner?: string; open?: string; verified?: string; q?: string }>;
}) {
  const params = await searchParams;
  const selectedPartnerId = params.partner ?? null;
  const filterOpen = params.open !== "false";
  const filterVerified = params.verified === "true";
  const filterSearch = params.q ?? "";

  const profile = await requireAuth();
  const [partners, unreadCount] = await Promise.all([
    getPartners({
      onlyActive: filterOpen,
      onlyVerified: filterVerified,
      search: filterSearch || undefined,
    }),
    getUnreadNotificationCount(profile.id),
  ]);

  const selectedPartnerData = selectedPartnerId
    ? await getPartnerWithInventory(selectedPartnerId).catch(() => null)
    : null;

  const inventory = (selectedPartnerData?.partner_inventory ?? []) as Array<{
    id: string;
    price: number | null;
    currency: string | null;
    quantity: number | null;
    is_available: boolean | null;
    products: {
      id: string;
      name: string;
      image_url: string | null;
      nutri_score: string | null;
    } | null;
  }>;

  // Fallback: si le partenaire utilise partner_catalog (import CSV) au lieu de partner_inventory
  const catalogItems = selectedPartnerId && inventory.length === 0
    ? await getPublishedCatalog(selectedPartnerId).catch(() => [])
    : [];

  const totalItems = inventory.length || catalogItems.length;

  const selectedPartner = partners.find((p) => p.id === selectedPartnerId) ?? null;

  return (
    <div className="bg-[#f7fafa] text-[#181c1d]">
      <Sidebar role={profile.role} />
      <TopBar
        userName={profile.full_name ?? "Utilisateur"}
        userAvatar={profile.avatar_url ?? undefined}
        unreadCount={unreadCount}
      />

      <main className="ml-60 pt-[60px] h-screen flex flex-col">
        {/* Filter Header */}
        <section className="bg-white px-8 py-4 border-b border-neutral-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-semibold text-[#181c1d]">Store Locator</h2>
            <div className="h-6 w-[1px] bg-neutral-200" />

            {/* Filtre Actifs / Tous */}
            <a
              href={`/map?open=${filterOpen ? "false" : "true"}${filterVerified ? "&verified=true" : ""}${filterSearch ? `&q=${encodeURIComponent(filterSearch)}` : ""}${selectedPartnerId ? `&partner=${selectedPartnerId}` : ""}`}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                filterOpen ? "bg-[#004f54] text-white" : "bg-[#ebeeee] text-[#3f4949] hover:bg-[#e6e9e9]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              {filterOpen ? "Ouverts" : "Tous"}
            </a>

            {/* Filtre Vérifiés */}
            <a
              href={`/map?${filterOpen ? "" : "open=false&"}verified=${filterVerified ? "false" : "true"}${filterSearch ? `&q=${encodeURIComponent(filterSearch)}` : ""}${selectedPartnerId ? `&partner=${selectedPartnerId}` : ""}`}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
                filterVerified ? "bg-[#004f54] text-white" : "bg-[#ebeeee] text-[#3f4949] hover:bg-[#e6e9e9]"
              }`}
            >
              <span className="material-symbols-outlined text-sm">verified</span>
              Vérifiés
            </a>

            {/* Recherche par nom */}
            <form method="GET" action="/map" className="flex items-center gap-2">
              {!filterOpen && <input type="hidden" name="open" value="false" />}
              {filterVerified && <input type="hidden" name="verified" value="true" />}
              {selectedPartnerId && <input type="hidden" name="partner" value={selectedPartnerId} />}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">search</span>
                <input
                  name="q"
                  defaultValue={filterSearch}
                  placeholder="Rechercher…"
                  className="pl-8 pr-3 py-1.5 rounded-full text-xs border border-[#bec8c9] focus:ring-2 focus:ring-[#004f54]/20 focus:border-[#004f54] outline-none w-40"
                />
              </div>
            </form>
            {filterSearch && (
              <a
                href={`/map?${filterOpen ? "" : "open=false&"}${filterVerified ? "verified=true" : ""}`}
                className="text-xs font-semibold text-[#ae2f34] hover:underline"
              >
                Effacer
              </a>
            )}
          </div>

          <span className="text-sm font-medium text-neutral-500">
            {partners.length} commerce{partners.length > 1 ? "s" : ""} trouvé{partners.length > 1 ? "s" : ""}
          </span>
        </section>

        {/* Map + List Split */}
        <section className="flex-1 flex overflow-hidden">
          {/* Map */}
          <div className="w-[60%] relative bg-neutral-200 overflow-hidden">
            <Image
              fill
              priority
              alt="Map"
              className="object-cover"
              style={{ filter: "grayscale(0.5)" }}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHZK0PZeMQ04KxllEh4ry-37VA8apv3bDgGwOAFbGD9cVRXqKDskTd_jHiUh9ksSNc6eOviDpr1j6YMs3wvbMmYG_jq_J8L9L2hlesxNtwebh5Tgbm9vhfX8klSllX3zkSbkOLE7uvytEl5NPDz1HzeDb_WwJu68KoZ5_h-LYMyS-HE2A5ZjH-cYEYezR_Dkl0TTp3sOn3KbUgtFpQFA76KK7xNK_DGYYOJGzB5qWSUD8n2YeHowRJo9ct6xBnUujMjfrnZJBtksAS"
              sizes="60vw"
            />
            {/* Dynamic markers — one per partner, cycling through predefined positions */}
            {partners.map((partner, i) => {
              const pos = MARKER_POSITIONS[i % MARKER_POSITIONS.length];
              const icon = MARKER_ICONS[i % MARKER_ICONS.length];
              const isSelected = partner.id === selectedPartnerId;
              return (
                <div
                  key={partner.id}
                  className="absolute group z-10"
                  style={{ top: pos.top, left: pos.left }}
                >
                  <Link href={isSelected ? "/map" : `/map?partner=${partner.id}`}>
                    <div className={`text-white p-2 rounded-full shadow-lg cursor-pointer transform transition-transform group-hover:scale-125 ${isSelected ? "bg-[#ae2f34] scale-110" : "bg-[#004f54]"}`}>
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                  </Link>
                  <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded shadow-md text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {partner.name}
                  </div>
                </div>
              );
            })}
            {/* Controls */}
            <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-10">
              {["add", "remove"].map((icon) => (
                <button key={icon} className="w-12 h-12 bg-white shadow-xl rounded-xl flex items-center justify-center hover:bg-neutral-50">
                  <span className="material-symbols-outlined">{icon}</span>
                </button>
              ))}
              <button className="w-12 h-12 bg-white shadow-xl rounded-xl flex items-center justify-center hover:bg-neutral-50 mt-4">
                <span className="material-symbols-outlined">my_location</span>
              </button>
            </div>
          </div>

          {/* Store List */}
          <div className="w-[40%] bg-[#f7fafa] overflow-y-auto custom-scrollbar border-l border-neutral-200">
            <div className="p-6 space-y-4">
              {partners.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <span className="material-symbols-outlined text-4xl mb-2 block text-neutral-300">storefront</span>
                  <p className="text-sm">Aucun commerce partenaire disponible.</p>
                </div>
              ) : (
                partners.map((partner) => (
                  <PartnerCard
                    key={partner.id}
                    partner={partner}
                    isSelected={partner.id === selectedPartnerId}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Bottom Products Strip */}
        <section className="bg-white border-t border-neutral-200 shadow-2xl relative z-[55]">
          <div className="px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#004f54] rounded-full animate-pulse" />
              <h4 className="text-sm font-semibold text-[#181c1d]">
                Produits disponibles{selectedPartner ? ` — ${selectedPartner.name}` : ""}
                {totalItems > 0 && (
                  <span className="ml-2 text-xs font-normal text-neutral-400">({totalItems} article{totalItems > 1 ? "s" : ""})</span>
                )}
              </h4>
            </div>
            <span className="material-symbols-outlined text-[#004f54]">keyboard_arrow_up</span>
          </div>
          <div className="max-h-[120px] overflow-x-auto px-8 py-3 flex gap-4 custom-scrollbar items-center">
            {!selectedPartnerId ? (
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <span className="material-symbols-outlined text-neutral-300">storefront</span>
                Sélectionnez un commerce pour afficher ses produits disponibles.
              </div>
            ) : inventory.length > 0 ? (
              inventory.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-[#f7fafa] border border-neutral-100 rounded-xl px-4 py-2 shrink-0">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                    {item.products?.image_url ? (
                      <Image fill sizes="40px" className="object-cover" src={item.products.image_url} alt={item.products?.name ?? ""} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-neutral-400">inventory_2</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#181c1d] truncate max-w-[120px]">{item.products?.name ?? "—"}</p>
                    <p className="text-[10px] text-neutral-500">
                      {item.price != null ? `${item.price} ${item.currency ?? "DZD"}` : "—"}
                      {item.quantity != null && (
                        <span className={`ml-2 ${item.quantity < 10 ? "text-[#ae2f34]" : "text-neutral-400"}`}>
                          {item.quantity} unités
                        </span>
                      )}
                    </p>
                  </div>
                  {item.products?.nutri_score && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      item.products.nutri_score === "A" ? "bg-green-100 text-green-700" :
                      item.products.nutri_score === "B" ? "bg-lime-100 text-lime-700" :
                      item.products.nutri_score === "C" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {item.products.nutri_score}
                    </span>
                  )}
                </div>
              ))
            ) : catalogItems.length > 0 ? (
              catalogItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-[#f7fafa] border border-neutral-100 rounded-xl px-4 py-2 shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm text-neutral-400">
                      {item.type === "recipe" ? "restaurant_menu" : "inventory_2"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#181c1d] truncate max-w-[120px]">{item.name}</p>
                    <p className="text-[10px] text-neutral-500">
                      {item.type === "recipe" ? "Recette" : "Produit"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <span className="material-symbols-outlined text-neutral-300">inventory_2</span>
                Aucun produit en stock pour ce commerce.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
