import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import {
  getMyPartner,
  getPartnerWithInventory,
  getPartnerDashboardStats,
} from "@/lib/queries/partners";
import { getPartnerCatalog } from "@/lib/queries/catalog";
import { InventoryRow, type InventoryItem } from "./_components/InventoryRow";
import { CatalogPanel } from "./_components/CatalogPanel";
import { GpsCoordinatesForm } from "./_components/GpsCoordinatesForm";

export default async function PartnersPage() {
  const profile = await requireAuth();
  const partner = await getMyPartner();

  if (!partner) {
    return (
      <div className="min-h-screen bg-[#f7fafa] flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-[#01696f]">
              storefront
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#181c1d] mb-2">
            Aucun commerce enregistré
          </h2>
          <p className="text-neutral-500 text-sm mb-4">
            Votre compte n&apos;est pas encore associé à un commerce partenaire.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login-partner"
              className="inline-flex items-center gap-2 bg-[#6e3815] text-white px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-lg">
                storefront
              </span>
              Créer mon espace partenaire
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border border-[#bec8c9] text-[#181c1d] px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#f1f4f4] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                arrow_back
              </span>
              Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [partnerData, stats, catalog] = await Promise.all([
    getPartnerWithInventory(partner.id),
    getPartnerDashboardStats(partner.id),
    getPartnerCatalog(partner.id),
  ]);

  const inventory = partnerData?.partner_inventory ?? [];

  // Aggregate total views
  const totalViews = stats.dailyViews.reduce(
    (sum, d) => sum + (d.total_views ?? 0),
    0,
  );

  // Aggregate top searched terms
  const termMap = new Map<string, number>();
  stats.topSearched.forEach((log) => {
    const term = (log as { search_term: string | null }).search_term;
    if (term) termMap.set(term, (termMap.get(term) ?? 0) + 1);
  });
  const topTerms = [...termMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCount = topTerms[0]?.[1] ?? 1;

  const kpis = [
    {
      label: "Ventes du jour",
      value: "—",
      trend: "",
      trendColor: "text-neutral-400",
    },
    {
      label: "Vues Total",
      value:
        totalViews > 999
          ? `${(totalViews / 1000).toFixed(1)}k`
          : String(totalViews),
      trend: "+30j",
      trendColor: "text-teal-600",
    },
    {
      label: "Articles Actifs",
      value: String(stats.activeItems),
      trend: "Stable",
      trendColor: "text-neutral-400",
    },
    {
      label: "Alertes Stock",
      value: String(stats.lowStockAlerts.length).padStart(2, "0"),
      trend: stats.lowStockAlerts.length > 0 ? "Important" : "OK",
      trendColor:
        stats.lowStockAlerts.length > 0 ? "text-[#ae2f34]" : "text-teal-600",
      valueColor:
        stats.lowStockAlerts.length > 0 ? "text-[#ae2f34]" : undefined,
    },
  ];

  return (
    <div className="bg-[#f7fafa] min-h-screen text-[#181c1d]">
      {/* Partner Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 border-r border-neutral-200 bg-[#F9F8F5] flex flex-col gap-2 py-6 px-0 z-50">
        <div className="px-6 mb-8">
          <h1 className="text-xl font-bold tracking-tight text-[#01696F]">
            Smart Healthy
          </h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
            Dietary Intelligence
          </p>
        </div>
        <nav className="flex-1">
          {[
            {
              href: "/partners",
              icon: "dashboard",
              label: "Tableau de bord",
              active: true,
            },
            { href: "/map", icon: "map", label: "Carte", active: false },
            {
              href: "/dashboard",
              icon: "home",
              label: "Accueil",
              active: false,
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-200 ease-in-out hover:pl-7 ${
                item.active
                  ? "text-[#01696F] bg-teal-50 border-r-4 border-[#01696F] font-semibold"
                  : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 mt-auto">
          <div className="flex items-center gap-3 p-2 bg-white rounded-xl shadow-sm border border-neutral-100">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#01696f]">
                storefront
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-xs truncate">{partner.name}</p>
              <p className="text-[10px] text-neutral-400">
                {partner.partner_code ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Top Bar */}
      <header className="fixed top-0 right-0 left-60 h-[60px] bg-[#F9F8F5]/80 backdrop-blur-md border-b border-neutral-200 flex items-center justify-between px-6 gap-4 z-40">
        <div className="flex items-center bg-white border border-neutral-200 rounded-full px-4 py-1.5 w-full max-w-md focus-within:ring-2 focus-within:ring-teal-500/20">
          <span className="material-symbols-outlined text-neutral-400 text-lg">
            search
          </span>
          <input
            className="bg-transparent border-none text-sm w-full outline-none"
            placeholder="Rechercher dans l'inventaire..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-neutral-200/50 rounded-full transition-colors relative">
            <span className="material-symbols-outlined text-neutral-600">
              notifications
            </span>
            {stats.lowStockAlerts.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ae2f34] rounded-full border-2 border-white" />
            )}
          </button>
          <div className="h-8 w-[1px] bg-neutral-200 mx-1" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#01696F]">
              {profile.full_name ?? profile.email}
            </span>
            {profile.avatar_url ? (
              <Image
                width={32}
                height={32}
                alt="Profil"
                className="rounded-full object-cover border border-neutral-200"
                src={profile.avatar_url}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-[#01696f] font-bold text-sm">
                {(profile.full_name ?? profile.email)[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="pl-60 pt-[60px]">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Alert Banner – ruptures de stock */}
          {stats.lowStockAlerts.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-center gap-4">
              <div className="bg-yellow-400 text-yellow-900 w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  warning
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-yellow-900 text-sm">
                  Action requise : Stock faible
                </h4>
                <p className="text-yellow-800 text-xs">
                  {stats.lowStockAlerts.length} produit
                  {stats.lowStockAlerts.length > 1 ? "s" : ""} avec moins de 10
                  unités restantes.
                </p>
              </div>
              <Link
                href="#inventory"
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
              >
                Gérer le stock
              </Link>
            </div>
          )}

          {/* KPI Strip */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="bg-white p-6 rounded-xl shadow-[0px_2px_4px_rgba(40,37,29,0.05)] border border-neutral-100"
              >
                <p className="text-neutral-500 text-xs font-bold uppercase mb-1">
                  {kpi.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-bold ${kpi.valueColor ?? "text-[#181c1d]"}`}
                  >
                    {kpi.value}
                  </span>
                  <span className={`text-xs font-bold ${kpi.trendColor}`}>
                    {kpi.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Line Chart – vues */}
            <div className="bg-white p-6 rounded-xl shadow-[0px_2px_4px_rgba(40,37,29,0.05)] border border-neutral-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-[#181c1d]">
                  Vues des produits
                </h3>
              </div>
              <div className="h-64 flex flex-col justify-end gap-2 px-2">
                {stats.dailyViews.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">
                    <span className="material-symbols-outlined mr-2">
                      bar_chart
                    </span>
                    Aucune donnée disponible
                  </div>
                ) : (
                  <div className="flex items-end justify-between h-full gap-2">
                    {(() => {
                      const maxViews = Math.max(
                        ...stats.dailyViews.map((d) => d.total_views ?? 0),
                        1,
                      );
                      return stats.dailyViews.slice(-7).map((d, i) => (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <div
                            className="w-full bg-[#01696f] rounded-t-sm"
                            style={{
                              height: `${Math.round(((d.total_views ?? 0) / maxViews) * 200)}px`,
                              minHeight: "4px",
                            }}
                          />
                          <span className="text-[9px] font-bold text-neutral-400">
                            {new Date(d.day)
                              .toLocaleDateString("fr-FR", { weekday: "short" })
                              .slice(0, 3)
                              .toUpperCase()}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Bar Chart – top recherchés */}
            <div className="bg-white p-6 rounded-xl shadow-[0px_2px_4px_rgba(40,37,29,0.05)] border border-neutral-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-[#181c1d]">
                  Produits les plus recherchés
                </h3>
              </div>
              <div className="space-y-4">
                {topTerms.length === 0 ? (
                  <p className="text-sm text-neutral-400 text-center py-8">
                    Aucune recherche enregistrée.
                  </p>
                ) : (
                  topTerms.map(([name, count]) => (
                    <div key={name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-[#181c1d] mb-1">
                        <span className="capitalize">{name}</span>
                        <span>
                          {count} recherche{count > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#01696f] rounded-full"
                          style={{
                            width: `${Math.round((count / maxCount) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div
            id="inventory"
            className="bg-white rounded-xl shadow-[0px_2px_4px_rgba(40,37,29,0.05)] border border-neutral-100 overflow-hidden"
          >
            <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-[#181c1d]">
                  Gestion de l&apos;Inventaire
                </h2>
                <p className="text-sm text-neutral-500">
                  {inventory.length} produit{inventory.length > 1 ? "s" : ""} —
                  cliquez sur un champ pour modifier.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    search
                  </span>
                  <input
                    className="pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                    placeholder="Filtrer..."
                    type="text"
                  />
                </div>
                <Link
                  href="/search"
                  className="bg-[#01696F] hover:bg-[#004f54] text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Ajouter un produit
                </Link>
              </div>
            </div>

            {inventory.length === 0 ? (
              <div className="p-16 text-center text-neutral-400">
                <span className="material-symbols-outlined text-5xl mb-3 block text-neutral-300">
                  inventory_2
                </span>
                <p className="font-semibold">
                  Aucun produit dans votre inventaire.
                </p>
                <p className="text-sm mt-1">
                  Ajoutez des produits via le catalogue.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50">
                      <th className="px-6 py-4">Produit</th>
                      <th className="px-6 py-4">Catégorie</th>
                      <th className="px-6 py-4">Prix (DZD)</th>
                      <th className="px-6 py-4">Quantité</th>
                      <th className="px-6 py-4">Disponibilité</th>
                      <th className="px-6 py-4 text-right">Sauvegarder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {(inventory as InventoryItem[]).map((item, i) => (
                      <InventoryRow
                        key={item.id}
                        item={{
                          id: item.id,
                          price: item.price,
                          quantity: item.quantity,
                          is_available: item.is_available,
                          products: item.products
                            ? {
                                name: item.products.name,
                                image_url: item.products.image_url,
                                product_categories:
                                  (
                                    item.products as {
                                      product_categories?: {
                                        name: string;
                                      } | null;
                                    }
                                  ).product_categories ?? null,
                              }
                            : null,
                        }}
                        isOdd={i % 2 === 1}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-6 border-t border-neutral-100 flex items-center justify-between text-sm text-neutral-500">
              <span>
                Affichage de {inventory.length} produit
                {inventory.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Import Catalogue */}
          <div className="mt-10">
            <CatalogPanel
              partnerId={partner.id}
              catalogItems={catalog.map((item) => ({
                id: item.id,
                type: item.type as "product" | "recipe",
                name: item.name,
                data: item.data as Record<string, unknown>,
                is_published: item.is_published,
              }))}
            />
          </div>

          {/* GPS Coordinates */}
          <div className="mt-10 mb-12">
            <GpsCoordinatesForm
              partnerId={partner.id}
              initialData={{
                name: partner.name,
                address_line: partner.address_line,
                latitude: partner.latitude,
                longitude: partner.longitude,
                phone: partner.phone,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
