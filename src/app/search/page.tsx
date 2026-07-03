import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { requireAuth, getHealthProfile } from "@/lib/auth";
import { getProducts, PRODUCTS_PER_PAGE } from "@/lib/queries/products";
import { getSavedProductIds } from "@/lib/queries/favorites";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import { getProductProfileWarning, WARNING_STYLES, type ProductSignalsForWarning } from "@/lib/nutrition/productWarnings";
import Link from "next/link";
import { ProductImage } from "@/components/ui/ProductImage";
import { ProductFavoriteButton } from "@/components/ui/ProductFavoriteButton";

const scoreColors: Record<string, string> = {
  A: "bg-emerald-600", B: "bg-yellow-500",
  C: "bg-orange-500",  D: "bg-orange-700", E: "bg-red-600",
};

const conditionLabels: Record<string, string> = {
  diabetic: "Diabète",
  celiac: "Cœliaque",
  healthy: "Mode Sain",
  vegetarian: "Végétarien",
  vegan: "Végétalien",
  keto: "Kéto",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; score?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));

  const profile = await requireAuth();
  const [healthProfile, { products, total }, savedIds, unreadCount] = await Promise.all([
    getHealthProfile(),
    getProducts({
      search: params.q,
      nutriScore: params.score ? [params.score] : undefined,
      page,
    }),
    getSavedProductIds(),
    getUnreadNotificationCount(profile.id),
  ]);

  const activeConditions =
    healthProfile?.is_complete ? ((healthProfile.health_conditions ?? []) as string[]) : [];

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);

  function pageHref(p: number) {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.score) qs.set("score", params.score);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return `/search${s ? `?${s}` : ""}`;
  }

  const windowStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pageWindow = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => windowStart + i,
  );

  return (
    <div className="bg-[#f7fafa] min-h-screen">
      <Sidebar role={profile.role} />
      <TopBar unreadCount={unreadCount} />

      <main className="pl-60 pt-[60px] min-h-screen">
        <div className="p-8 max-w-7xl mx-auto flex gap-8">

          {/* Panneau filtres */}
          <aside className="w-64 shrink-0">
            <form className="bg-white rounded-xl p-6 custom-shadow space-y-8">
              <div>
                <h4 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">filter_list</span>
                  Recherche
                </h4>
                <input
                  name="q"
                  defaultValue={params.q}
                  placeholder="Nom, marque…"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-on-surface mb-4">Nutri-Score</h4>
                <div className="flex flex-wrap gap-2">
                  {(["A", "B", "C", "D", "E"] as const).map((s) => {
                    const active = params.score === s;
                    const href = active
                      ? (params.q ? `/search?q=${params.q}` : "/search")
                      : `/search?score=${s}${params.q ? `&q=${params.q}` : ""}`;
                    return (
                      <a key={s} href={href}
                        className={`w-8 h-8 flex items-center justify-center rounded font-bold text-white text-sm transition-opacity ${scoreColors[s]} ${active ? "ring-2 ring-offset-1 ring-on-surface" : "opacity-60 hover:opacity-100"}`}>
                        {s}
                      </a>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="w-full py-2 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:opacity-90">
                Rechercher
              </button>
              <Link href="/search" className="block w-full text-center text-sm text-outline hover:text-on-surface">
                Réinitialiser
              </Link>
            </form>
          </aside>

          {/* Grille produits */}
          <section className="flex-1 space-y-5">

            {/* Profile awareness banner */}
            {activeConditions.length > 0 && (
              <div className="flex items-start gap-3 bg-[#004f54]/5 border border-[#004f54]/15 rounded-xl px-5 py-3">
                <span
                  className="material-symbols-outlined text-[#004f54] text-lg shrink-0 mt-0.5"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  health_and_safety
                </span>
                <p className="text-sm text-[#181c1d]">
                  <span className="font-semibold">Catalogue libre</span> —{" "}
                  Smart Healthy signale les produits à surveiller pour votre profil{" "}
                  <span className="font-semibold">
                    ({activeConditions.map((c) => conditionLabels[c] ?? c).join(", ")})
                  </span>.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-sm text-outline">
                {total} produit{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
              </p>
              {totalPages > 1 && (
                <p className="text-sm text-outline">Page {page} sur {totalPages}</p>
              )}
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-xl custom-shadow p-16 text-center">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">search_off</span>
                <p className="font-semibold text-on-surface">Aucun produit trouvé.</p>
                <p className="text-sm text-outline mt-1">Modifiez vos filtres ou ajoutez des produits dans Supabase.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {products.map((product, idx) => {
                  const saved = savedIds.includes(product.id);
                  const warning = getProductProfileWarning(
                    {
                      glycemic_index: product.glycemic_index,
                      nutri_score: product.nutri_score as ProductSignalsForWarning["nutri_score"],
                      labels: product.labels ?? [],
                      compatible_with: product.compatible_with ?? [],
                    },
                    activeConditions,
                  );
                  return (
                    <article key={product.id} className="bg-white rounded-xl overflow-hidden custom-shadow group flex flex-col">
                      <div className="relative h-48 bg-surface-container-low">
                        <ProductImage
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          priority={idx === 0}
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.nutri_score && (
                            <span className={`px-2 py-0.5 ${scoreColors[product.nutri_score]} text-white font-bold text-lg rounded-md`}>
                              {product.nutri_score}
                            </span>
                          )}
                          {product.glycemic_index !== null && (
                            <span className="px-2 py-1 bg-primary text-on-primary text-xs font-semibold rounded-md uppercase">
                              IG {product.glycemic_index}
                            </span>
                          )}
                        </div>
                        <ProductFavoriteButton productId={product.id} initialSaved={saved} />
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-base font-semibold leading-tight text-on-surface mb-2">{product.name}</h3>
                        {product.brand && <p className="text-xs text-outline mb-3">{product.brand}</p>}
                        {warning && (
                          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border mb-3 ${WARNING_STYLES[warning.level].bg} ${WARNING_STYLES[warning.level].text} ${WARNING_STYLES[warning.level].border}`}>
                            <span
                              className="material-symbols-outlined text-sm"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              {warning.icon}
                            </span>
                            {warning.text}
                          </div>
                        )}
                        <div className="mt-auto flex gap-2">
                          <Link href={`/search/${product.id}`}
                            className="flex-1 bg-primary text-on-primary text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Voir le produit
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl custom-shadow">
                <span className="text-sm text-outline">Page {page} sur {totalPages}</span>
                <div className="flex items-center gap-1">
                  {page > 1 && (
                    <a href={pageHref(page - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container">
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </a>
                  )}
                  {pageWindow.map((p) => (
                    <a key={p} href={pageHref(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold ${p === page ? "bg-primary text-on-primary" : "hover:bg-surface-container text-outline"}`}>
                      {p}
                    </a>
                  ))}
                  {page < totalPages && (
                    <a href={pageHref(page + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container">
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
