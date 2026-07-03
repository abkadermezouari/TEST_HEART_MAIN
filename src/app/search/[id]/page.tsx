import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { requireAuth } from "@/lib/auth";
import { getProductById } from "@/lib/queries/products";
import { getSavedProductIds } from "@/lib/queries/favorites";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductImage } from "@/components/ui/ProductImage";
import { ProductFavoriteButton } from "@/components/ui/ProductFavoriteButton";

const scoreColors: Record<string, string> = {
  A: "#038141", B: "#85bb2f", C: "#fecb02", D: "#ee8100", E: "#e63e11",
};

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [, product, savedIds] = await Promise.all([
    requireAuth(),
    getProductById(id).catch(() => null),
    getSavedProductIds(),
  ]);
  if (!product) notFound();

  const saved = savedIds.includes(product.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inventory: any[] = (product as any).partner_inventory ?? [];

  return (
    <div className="bg-[#f7fafa] min-h-screen">
      <Sidebar />
      <TopBar />
      <main className="ml-60 pt-header-height min-h-screen">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-outline mb-6">
            <Link href="/search" className="hover:text-primary">Produits</Link>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-on-surface font-bold">{product.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Colonne gauche */}
            <div className="lg:w-[55%] flex flex-col gap-6">
              <div className="bg-white p-6 rounded-xl custom-shadow flex flex-col items-center">
                <div className="w-full h-90 rounded-lg overflow-hidden mb-6 bg-surface-container-low flex items-center justify-center">
                  <ProductImage
                    src={product.image_url}
                    alt={product.name}
                    size="detail"
                    className="w-full h-full object-contain p-8"
                    placeholderClassName="w-full h-full flex items-center justify-center bg-surface-container-low"
                    iconSize="text-7xl"
                    priority
                  />
                </div>
                <div className="grid grid-cols-2 w-full gap-4">
                  <div className="bg-surface-container-low p-4 rounded-lg">
                    <span className="text-xs font-semibold text-outline block mb-1">Marque</span>
                    <span className="font-bold text-primary">{product.brand ?? "—"}</span>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-lg">
                    <span className="text-xs font-semibold text-outline block mb-1">Labels</span>
                    <div className="flex flex-wrap gap-1">
                      {(product.labels ?? []).length > 0
                        ? (product.labels ?? []).map((l: string) => <span key={l} className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">{l}</span>)
                        : <span className="text-sm text-outline">—</span>}
                    </div>
                  </div>
                </div>
                {product.barcode && (
                  <div className="mt-6 w-full p-4 border-2 border-dashed border-outline-variant rounded-lg flex flex-col items-center gap-2 opacity-60">
                    <span className="material-symbols-outlined text-4xl">barcode</span>
                    <span className="text-xs font-mono">{product.barcode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite */}
            <div className="lg:w-[45%] flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold text-on-surface">{product.name}</h1>
                <ProductFavoriteButton
                  productId={product.id}
                  initialSaved={saved}
                  className={`shrink-0 p-2 rounded-full border transition-colors ${saved ? "text-secondary border-secondary/30 bg-secondary/5" : "text-outline border-outline-variant hover:text-secondary"}`}
                />
              </div>

              {(product.compatible_with ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(product.compatible_with ?? []).map((c: string) => (
                    <span key={c} className="bg-[#e7f5e9] text-[#2e7d32] font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Compatible {c}
                    </span>
                  ))}
                </div>
              )}

              {product.nutri_score && (
                <div className="bg-white p-6 rounded-xl custom-shadow">
                  <span className="text-sm font-semibold text-outline block mb-4">Profil Nutritionnel Global</span>
                  <div className="flex items-center h-14 w-full rounded-lg overflow-hidden">
                    {(["A","B","C","D","E"] as const).map((s) => (
                      <div key={s} className={`flex-1 h-full flex items-center justify-center ${product.nutri_score === s ? "border-4 border-white" : "opacity-30"}`}
                        style={{ backgroundColor: scoreColors[s] }}>
                        <span className={`font-black text-white ${product.nutri_score === s ? "text-2xl" : "text-lg"}`}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {product.glycemic_index !== null && (
                <div className="bg-white p-6 rounded-xl custom-shadow">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-sm font-semibold text-outline">Indice Glycémique (IG)</span>
                    <span className={`text-2xl font-bold ${product.glycemic_index <= 55 ? "text-[#2e7d32]" : product.glycemic_index <= 69 ? "text-orange-500" : "text-red-600"}`}>
                      {product.glycemic_index}
                    </span>
                  </div>
                  <div className="relative h-4 bg-surface-container-highest rounded-full overflow-hidden flex">
                    <div className="h-full w-[35%] bg-green-500" />
                    <div className="h-full w-[35%] bg-orange-400" />
                    <div className="h-full w-[30%] bg-red-500" />
                    <div className="absolute top-0 h-full w-1 bg-white shadow-lg border-x-2 border-primary z-10"
                      style={{ left: `${Math.min(product.glycemic_index, 99)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold mt-2 text-outline">
                    <span>BAS (0-55)</span><span>MOYEN (56-69)</span><span>ÉLEVÉ (70+)</span>
                  </div>
                </div>
              )}

              {(product.energy_kcal || product.protein_g || product.carbs_g || product.fiber_g) && (
                <div className="bg-white p-6 rounded-xl custom-shadow">
                  <span className="text-sm font-semibold text-outline block mb-4">Tableau Nutritionnel (pour 100g)</span>
                  <div className="space-y-3">
                    {[
                      { label: "Énergie",            v: product.energy_kcal, u: "kcal", c: "" },
                      { label: "Glucides",            v: product.carbs_g,    u: "g",    c: "" },
                      { label: "dont sucres",         v: product.sugars_g,   u: "g",    c: "text-secondary" },
                      { label: "Fibres",              v: product.fiber_g,    u: "g",    c: "text-[#2e7d32]" },
                      { label: "Protéines",           v: product.protein_g,  u: "g",    c: "" },
                      { label: "Lipides",             v: product.fat_g,      u: "g",    c: "" },
                      { label: "Sodium",              v: product.sodium_g,   u: "g",    c: "" },
                    ].filter((r) => r.v !== null).map((row) => (
                      <div key={row.label} className="flex justify-between items-center py-2 border-b border-outline-variant/30 last:border-0">
                        <span className="text-sm text-outline">{row.label}</span>
                        <span className={`font-bold ${row.c || "text-on-surface"}`}>{row.v} {row.u}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tableau commerces */}
          <section className="mt-12 bg-white rounded-2xl custom-shadow overflow-hidden">
            <div className="p-6 border-b border-outline-variant">
              <h2 className="text-2xl font-semibold text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">shopping_cart</span>
                Où acheter ce produit
              </h2>
            </div>
            {inventory.length === 0 ? (
              <div className="p-12 text-center text-outline">
                <span className="material-symbols-outlined text-5xl text-outline-variant mb-3 block">store_mall_directory</span>
                <p className="font-semibold">Aucun commerce ne propose ce produit pour l&apos;instant.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low text-xs font-semibold text-outline uppercase tracking-wider">
                      <th className="px-6 py-4">Commerce</th>
                      <th className="px-6 py-4">Ville</th>
                      <th className="px-6 py-4">Prix</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {inventory.map((item, i) => (
                      <tr key={i} className="hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-on-surface">{item.partners?.name ?? "—"}</td>
                        <td className="px-6 py-4 text-sm text-outline">{item.partners?.city ?? "—"}</td>
                        <td className="px-6 py-4 font-bold text-primary">{item.price} {item.currency}</td>
                        <td className="px-6 py-4">
                          {item.is_available
                            ? <span className="text-[#2e7d32] bg-[#e7f5e9] px-2 py-0.5 rounded text-xs font-bold">EN STOCK</span>
                            : <span className="text-secondary bg-secondary/10 px-2 py-0.5 rounded text-xs font-bold">RUPTURE</span>}
                        </td>
                        <td className="px-6 py-4">
                          <Link href="/map" className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90">Y aller</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
