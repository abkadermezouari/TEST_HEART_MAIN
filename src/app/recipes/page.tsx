import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import { RecipeFavoriteButton } from "@/components/ui/RecipeFavoriteButton";
import TopBar from "@/components/layout/TopBar";
import { requireAuth, getHealthProfile } from "@/lib/auth";
import { getRecipes, RECIPES_PER_PAGE } from "@/lib/queries/recipes";
import { getSavedRecipeIds } from "@/lib/queries/favorites";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";

export const dynamic = "force-dynamic";

const difficultyLabel: Record<string, string> = { easy: "Facile", medium: "Moyen", hard: "Difficile" };

const conditionLabels: Record<string, string> = {
  diabetic: "Diabète",
  celiac: "Cœliaque",
  healthy: "Mode Sain",
  vegetarian: "Végétarien",
  vegan: "Végétalien",
  keto: "Kéto",
};

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string; q?: string; page?: string; all?: string }>;
}) {
  const params = await searchParams;
  const tags = params.tags ? params.tags.split(",") : [];
  const page = Math.max(1, Number(params.page ?? 1));
  // `all=1` lets the user bypass the implicit profile filter.
  const showAll = params.all === "1";

  const profile = await requireAuth();
  const healthProfile = await getHealthProfile();

  const activeConditions =
    healthProfile?.is_complete ? ((healthProfile.health_conditions ?? []) as string[]) : [];

  const filterByProfile = activeConditions.length > 0 && !showAll;

  const [{ recipes, total }, savedIds, unreadCount] = await Promise.all([
    getRecipes({
      dietTags: tags.length ? tags : undefined,
      search: params.q,
      page,
      compatibleWith: filterByProfile ? activeConditions : undefined,
    }),
    getSavedRecipeIds(),
    getUnreadNotificationCount(profile.id),
  ]);

  const totalPages = Math.ceil(total / RECIPES_PER_PAGE);
  const conditionNames = activeConditions.map((c) => conditionLabels[c] ?? c).join(", ");

  const allTags = ["faible_ig", "sans_gluten", "vegetalien", "keto", "premium", "eco"];

  function pageHref(p: number) {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (tags.length) qs.set("tags", tags.join(","));
    if (showAll) qs.set("all", "1");
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return `/recipes${s ? `?${s}` : ""}`;
  }

  // Href that bypasses the profile filter while keeping search/tags.
  function allRecipesHref() {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (tags.length) qs.set("tags", tags.join(","));
    qs.set("all", "1");
    return `/recipes?${qs.toString()}`;
  }

  // Href that re-activates the profile filter while keeping search/tags.
  function profileFilterHref() {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (tags.length) qs.set("tags", tags.join(","));
    const s = qs.toString();
    return `/recipes${s ? `?${s}` : ""}`;
  }

  return (
    <div className="bg-[#f7fafa] min-h-screen">
      <Sidebar role={profile.role} />
      <TopBar unreadCount={unreadCount} />

      <main className="ml-60 mt-[60px] flex min-h-screen">
        {/* Panneau filtre IA */}
        <aside className="w-[300px] border-r border-neutral-200 bg-white p-6 flex flex-col gap-6 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto shrink-0">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-2">Générateur IA</h3>
            <p className="text-sm text-on-surface-variant">Filtrez les recettes selon vos besoins nutritionnels.</p>
          </div>

          <form className="flex flex-col gap-6 flex-1">
            <div>
              <label className="text-sm font-semibold text-on-surface block mb-2">Recherche</label>
              <input name="q" defaultValue={params.q}
                placeholder="Nom de recette…"
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div>
              <label className="text-sm font-semibold text-on-surface block mb-3">Régimes &amp; Santé</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const active = tags.includes(tag);
                  const nextTags = active ? tags.filter((t) => t !== tag) : [...tags, tag];
                  return (
                    <a key={tag} href={`/recipes?tags=${nextTags.join(",")}`}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${active ? "border-2 border-primary-container bg-primary-container/5 text-primary" : "border border-outline-variant bg-surface text-on-surface-variant hover:border-primary-container"}`}>
                      {tag.replace(/_/g, " ")}
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-neutral-100">
              <button type="submit"
                className="w-full bg-primary text-on-primary py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                Générer
              </button>
              {(tags.length > 0 || params.q) && (
                <a href="/recipes" className="block text-center text-xs text-outline mt-3 hover:text-on-surface">
                  Effacer les filtres
                </a>
              )}
            </div>
          </form>
        </aside>

        {/* Grille recettes */}
        <section className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">

            {/* Banner — filtre profil actif */}
            {filterByProfile && (
              <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-5 py-3 mb-6">
                <span className="material-symbols-outlined text-primary text-lg shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                  health_and_safety
                </span>
                <p className="text-sm text-on-surface flex-1">
                  <span className="font-semibold">Recettes adaptées à votre profil :</span>{" "}
                  {conditionNames}
                </p>
                <Link href={allRecipesHref()} className="shrink-0 text-xs font-semibold text-primary hover:underline whitespace-nowrap">
                  Voir toutes →
                </Link>
              </div>
            )}

            {/* Banner — filtre profil désactivé par l'utilisateur */}
            {activeConditions.length > 0 && showAll && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6">
                <span className="material-symbols-outlined text-amber-600 text-lg shrink-0">info</span>
                <p className="text-sm text-amber-800 flex-1">
                  Filtre profil désactivé — toutes les recettes sont affichées.
                </p>
                <Link href={profileFilterHref()} className="shrink-0 text-xs font-semibold text-amber-700 hover:underline whitespace-nowrap">
                  Réactiver →
                </Link>
              </div>
            )}

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-on-surface">
                {total} recette{total > 1 ? "s" : ""}
              </h2>
              {totalPages > 1 && (
                <p className="text-sm text-outline">Page {page} sur {totalPages}</p>
              )}
            </div>

            {recipes.length === 0 ? (
              filterByProfile ? (
                /* Empty state spécifique : le filtre profil est la cause */
                <div className="bg-white rounded-xl custom-shadow p-12 text-center">
                  <span
                    className="material-symbols-outlined text-5xl text-primary/30 mb-4 block"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    health_and_safety
                  </span>
                  <h3 className="text-xl font-bold text-on-surface mb-3">
                    Aucune recette compatible avec votre profil
                  </h3>
                  <p className="text-sm text-outline max-w-sm mx-auto mb-6">
                    Votre profil nutritionnel{" "}
                    <span className="font-semibold text-on-surface">({conditionNames})</span>{" "}
                    filtre les recettes affichées. Aucune recette adaptée n&apos;a été trouvée pour le moment.
                  </p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Link
                      href={allRecipesHref()}
                      className="px-5 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Voir toutes les recettes
                    </Link>
                    <Link
                      href="/profile"
                      className="px-5 py-2.5 border border-outline-variant text-on-surface text-sm font-semibold rounded-xl hover:bg-surface-container transition-colors"
                    >
                      Modifier mon profil
                    </Link>
                  </div>
                </div>
              ) : (
                /* Empty state générique : filtres manuels actifs ou catalogue vide */
                <div className="bg-white rounded-xl custom-shadow p-16 text-center">
                  <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">restaurant_menu</span>
                  <p className="font-semibold text-on-surface">Aucune recette trouvée.</p>
                  <p className="text-sm text-outline mt-1">Modifiez vos filtres de recherche.</p>
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {recipes.map((recipe, index) => {
                  const saved = savedIds.includes(recipe.id);
                  return (
                    <div key={recipe.id} className="bg-white rounded-xl overflow-hidden shadow-[0px_2px_4px_rgba(40,37,29,0.05)] group cursor-pointer border border-neutral-100">
                      <div className="relative h-56 overflow-hidden bg-surface-container-low">
                        {recipe.image_url ? (
                          <Image
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            src={recipe.image_url}
                            alt={recipe.title}
                            priority={index === 0}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-6xl text-outline-variant">restaurant</span>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                          {(recipe.diet_tags ?? []).slice(0, 2).map((tag: string, i: number) => (
                            <span key={tag} className={`bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase ${i === 0 ? "text-primary" : "text-secondary"}`}>
                              {tag.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                        <RecipeFavoriteButton recipeId={recipe.id} initialSaved={saved} />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-on-surface mb-2">{recipe.title}</h3>
                        {recipe.description && (
                          <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">{recipe.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-on-surface-variant text-xs font-semibold">
                          {recipe.prep_time_min && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              {recipe.prep_time_min} min
                            </div>
                          )}
                          {recipe.calories_kcal && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">local_fire_department</span>
                              {recipe.calories_kcal} kcal
                            </div>
                          )}
                          {recipe.difficulty && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">fitness_center</span>
                              {difficultyLabel[recipe.difficulty]}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl custom-shadow mt-8">
                <span className="text-sm text-outline">Page {page} sur {totalPages}</span>
                <div className="flex items-center gap-1">
                  {page > 1 && (
                    <a href={pageHref(page - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container">
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </a>
                  )}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <a key={p} href={pageHref(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold ${p === page ? "bg-primary text-on-primary" : "hover:bg-surface-container text-outline"}`}>
                        {p}
                      </a>
                    );
                  })}
                  {page < totalPages && (
                    <a href={pageHref(page + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container">
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
