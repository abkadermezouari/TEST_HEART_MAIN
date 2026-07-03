import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { requireAuth, getHealthProfile } from "@/lib/auth";
import { ProductImage } from "@/components/ui/ProductImage";
import { getPartners } from "@/lib/queries/partners";
import { getRecommendations } from "@/lib/recommendations/queries";
import { getUserReadArticleIds } from "@/lib/queries/articles";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import Link from "next/link";

const NUTRI_BG: Record<"A" | "B" | "C" | "D" | "E", string> = {
  A: "bg-emerald-600",
  B: "bg-yellow-500",
  C: "bg-orange-500",
  D: "bg-orange-700",
  E: "bg-red-600",
};

export default async function DashboardPage() {
  const profile = await requireAuth();
  const [healthProfile, reco, partners, readArticleIds, unreadCount] =
    await Promise.all([
      getHealthProfile(),
      getRecommendations(profile.id, 6, 4),
      getPartners(),
      getUserReadArticleIds(),
      getUnreadNotificationCount(profile.id),
    ]);

  const {
    products: productsRec,
    recipes: recipesRec,
    savedProductCount,
    savedRecipeCount,
  } = reco;
  const firstName = profile.full_name?.split(" ")[0] ?? "vous";
  const profileComplete = productsRec.profileComplete;

  return (
    <div className="bg-[#f7fafa] min-h-screen">
      <Sidebar role={profile.role} />
      <TopBar
        userName={profile.full_name ?? "Utilisateur"}
        userAvatar={profile.avatar_url ?? undefined}
        unreadCount={unreadCount}
      />

      <main className="ml-60 pt-[60px] p-6 min-h-screen">
        <div className="max-w-[1440px] mx-auto space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: "bookmark",
                bg: "bg-teal-50",
                color: "text-[#004f54]",
                label: "Produits sauvegardés",
                value: String(savedProductCount),
              },
              {
                icon: "restaurant",
                bg: "bg-orange-50",
                color: "text-[#6e3815]",
                label: "Recettes sauvegardées",
                value: String(savedRecipeCount),
              },
              {
                icon: "menu_book",
                bg: "bg-blue-50",
                color: "text-blue-600",
                label: "Articles lus",
                value: String(readArticleIds.length),
              },
              {
                icon: "favorite",
                bg: "bg-red-50",
                color: "text-[#ae2f34]",
                accent: true,
                label: "Objectif calorique",
                value: healthProfile?.tdee_kcal
                  ? `${Math.round(healthProfile.tdee_kcal)} kcal`
                  : "—",
              },
            ].map((card) => (
              <div
                key={card.label}
                className={`bg-white p-6 rounded-xl custom-shadow flex items-center gap-4 ${card.accent ? "border-l-4 border-secondary" : ""}`}
              >
                <div
                  className={`w-12 h-12 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}
                >
                  <span className="material-symbols-outlined">{card.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#3f4949]">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bandeau profil incomplet */}
          {!profileComplete && (
            <div className="bg-white border border-[#004f54]/20 rounded-xl custom-shadow p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center text-[#004f54] shrink-0">
                <span className="material-symbols-outlined">tune</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#181c1d]">
                  Affinez vos recommandations
                </p>
                <p className="text-sm text-[#3f4949]">
                  Complétez votre profil pour recevoir des recommandations plus
                  précises et adaptées à vos besoins.
                </p>
              </div>
              <Link
                href="/profile"
                className="shrink-0 px-4 py-2 bg-[#004f54] text-white rounded-lg font-bold text-sm hover:bg-[#003a3e] transition-colors"
              >
                Compléter
              </Link>
            </div>
          )}

          {/* UX-4 : bandeau fallback si profil complet mais peu de correspondances */}
          {profileComplete && productsRec.fallback && (
            <div className="bg-white border border-neutral-200 rounded-xl custom-shadow p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#004f54] shrink-0">
                info
              </span>
              <p className="text-sm text-[#3f4949]">
                Nous n&apos;avons pas trouvé de correspondance parfaite — voici
                une sélection saine adaptée.
              </p>
            </div>
          )}

          {/* Pour vous + Recette du jour */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Section "Pour vous" */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-3xl font-bold">Bonjour, {firstName} 👋</h2>
                <Link
                  href="/search"
                  className="text-sm font-semibold text-[#004f54] hover:underline"
                >
                  Voir tout →
                </Link>
              </div>
              <div className="mb-6">
                <p className="text-lg font-semibold text-[#181c1d]">
                  Pour vous
                </p>
                <p className="text-sm text-[#3f4949]">
                  {profileComplete
                    ? "Sélection basée sur votre profil santé"
                    : "Sélection saine — complétez votre profil pour personnaliser"}
                </p>
              </div>

              {productsRec.items.length === 0 ? (
                <div className="bg-white rounded-xl custom-shadow p-12 text-center text-outline">
                  <span className="material-symbols-outlined text-5xl mb-3 block text-outline-variant">
                    inventory_2
                  </span>
                  <p className="font-semibold">
                    Aucune recommandation disponible pour le moment.
                  </p>
                  <p className="text-sm mt-1">
                    Notre catalogue s&apos;enrichit régulièrement.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {productsRec.items.map(
                    ({ product, recommendation_reason }, idx) => (
                      <Link
                        key={product.id}
                        href={`/search/${product.id}`}
                        className="bg-white rounded-xl overflow-hidden custom-shadow group block"
                      >
                        <div className="relative h-48 bg-surface-container-low">
                          <ProductImage
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            priority={idx === 0}
                          />
                          <div className="absolute top-3 left-3 flex flex-col gap-2">
                            {(() => {
                              const nutri = product.nutri_score;
                              const nutriBgClass =
                                nutri && nutri in NUTRI_BG
                                  ? NUTRI_BG[nutri as keyof typeof NUTRI_BG]
                                  : "bg-gray-400";
                              return nutri ? (
                                <span
                                  className={`px-2 py-0.5 font-bold text-lg rounded-md text-white ${nutriBgClass}`}
                                >
                                  {nutri}
                                </span>
                              ) : null;
                            })()}
                            {product.glycemic_index !== null && (
                              <span className="bg-[#004f54] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                                IG {product.glycemic_index}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-xs font-semibold text-[#3f4949] mb-1">
                            {product.brand ?? "—"}
                          </p>
                          <h4 className="font-bold mb-2 line-clamp-2">
                            {product.name}
                          </h4>
                          <div className="flex items-start gap-2 text-xs">
                            <span className="material-symbols-outlined text-[#004f54] text-base shrink-0">
                              auto_awesome
                            </span>
                            <span className="font-semibold text-[#004f54] line-clamp-2">
                              {recommendation_reason.primary}
                            </span>
                          </div>
                          {recommendation_reason.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {recommendation_reason.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-[#004f54]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Recette à la une + Conseil */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {recipesRec.items[0] ? (
                <div className="bg-white rounded-xl overflow-hidden custom-shadow">
                  <div className="relative h-40">
                    <ProductImage
                      src={recipesRec.items[0].recipe.image_url}
                      alt={recipesRec.items[0].recipe.title}
                      className="w-full h-full object-cover"
                      placeholderClassName="w-full h-full bg-surface-container-low flex items-center justify-center"
                      iconSize="text-4xl"
                      priority
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded mb-1 inline-block">
                        RECETTE DU JOUR
                      </span>
                      <h3 className="text-white font-bold line-clamp-2">
                        {recipesRec.items[0].recipe.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-semibold text-[#004f54] mb-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-base shrink-0">
                        auto_awesome
                      </span>
                      <span className="line-clamp-2">
                        {recipesRec.items[0].recommendation_reason.primary}
                      </span>
                    </p>
                    <div className="flex items-center justify-between mb-4 text-neutral-500 text-sm">
                      {recipesRec.items[0].recipe.prep_time_min && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">
                            schedule
                          </span>
                          {recipesRec.items[0].recipe.prep_time_min} min
                        </span>
                      )}
                      {recipesRec.items[0].recipe.calories_kcal && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">
                            local_fire_department
                          </span>
                          {recipesRec.items[0].recipe.calories_kcal} kcal
                        </span>
                      )}
                    </div>
                    <Link
                      href="/recipes"
                      className="block w-full py-3 bg-[#004f54] text-white rounded-lg font-bold text-sm text-center"
                    >
                      Voir la recette
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl custom-shadow p-8 text-center text-outline">
                  <span className="material-symbols-outlined text-4xl mb-2 block text-outline-variant">
                    restaurant_menu
                  </span>
                  <p className="text-sm">Aucune recette disponible.</p>
                </div>
              )}

              <div className="bg-[#01696f] text-[#97e6ec] p-6 rounded-xl custom-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-400/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-teal-100">
                      lightbulb
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Conseil du jour</h4>
                    <p className="text-sm opacity-90 leading-relaxed">
                      {healthProfile?.health_conditions?.includes("diabetic")
                        ? "Privilégiez les aliments à IG bas (< 55) pour stabiliser votre glycémie tout au long de la journée."
                        : "Visez 5 portions de légumes et fruits par jour pour un apport optimal en micronutriments."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recettes adaptées */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Recettes adaptées</h2>
              <Link
                href="/recipes"
                className="text-sm font-semibold text-[#004f54] hover:underline"
              >
                Voir toutes →
              </Link>
            </div>
            <p className="text-sm text-[#3f4949] mb-6">
              {profileComplete
                ? "Des idées de repas cohérentes avec vos besoins"
                : "Des idées de repas équilibrées — complétez votre profil pour plus de pertinence"}
            </p>

            {profileComplete &&
              recipesRec.fallback &&
              recipesRec.items.length > 0 && (
                <div className="mb-4 flex items-center gap-2 text-sm text-[#3f4949]">
                  <span className="material-symbols-outlined text-base text-[#004f54]">
                    info
                  </span>
                  Nous n&apos;avons pas trouvé de correspondance parfaite —
                  voici une sélection saine adaptée.
                </div>
              )}

            {recipesRec.items.length <= 1 ? (
              <div className="bg-white rounded-xl custom-shadow p-8 text-center text-outline">
                <span className="material-symbols-outlined text-4xl mb-2 block text-outline-variant">
                  restaurant_menu
                </span>
                <p className="text-sm">
                  Pas encore assez de recettes pour personnaliser cette
                  sélection.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipesRec.items
                  .slice(1)
                  .map(({ recipe, recommendation_reason }) => (
                    <Link
                      key={recipe.id}
                      href="/recipes"
                      className="bg-white rounded-xl overflow-hidden custom-shadow group block"
                    >
                      <div className="relative h-36">
                        <ProductImage
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          placeholderClassName="w-full h-full bg-surface-container-low flex items-center justify-center"
                          iconSize="text-3xl"
                        />
                        {recipe.difficulty && (
                          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                            {recipe.difficulty === "easy"
                              ? "Facile"
                              : recipe.difficulty === "medium"
                                ? "Moyen"
                                : "Difficile"}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-sm mb-2 line-clamp-2">
                          {recipe.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 mb-2">
                          {recipe.prep_time_min !== null && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                schedule
                              </span>
                              {recipe.prep_time_min} min
                            </span>
                          )}
                          {recipe.calories_kcal !== null && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">
                                local_fire_department
                              </span>
                              {recipe.calories_kcal} kcal
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-[#004f54] flex items-start gap-1">
                          <span className="material-symbols-outlined text-sm shrink-0">
                            auto_awesome
                          </span>
                          <span className="line-clamp-2">
                            {recommendation_reason.primary}
                          </span>
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>

          {/* Commerces proches */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white rounded-xl overflow-hidden custom-shadow h-70 relative">
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 border border-neutral-200">
                <span className="w-2 h-2 rounded-full bg-[#004f54]" />
                <span className="text-xs font-bold">Commerces partenaires</span>
              </div>
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <div className="text-center text-outline">
                  <span className="material-symbols-outlined text-5xl mb-2 block text-outline-variant">
                    map
                  </span>
                  <Link
                    href="/map"
                    className="text-sm text-[#004f54] hover:underline font-semibold"
                  >
                    Ouvrir la carte →
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-xl custom-shadow p-6">
              <h3 className="font-bold text-2xl mb-6">Commerces proches</h3>
              {partners.length === 0 ? (
                <p className="text-sm text-outline text-center py-4">
                  Aucun commerce partenaire.
                </p>
              ) : (
                <div className="space-y-4">
                  {partners.slice(0, 3).map((partner) => (
                    <div
                      key={partner.id}
                      className="flex items-center justify-between pb-4 border-b border-neutral-100 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-neutral-600">
                            storefront
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-sm">{partner.name}</p>
                          <p className="text-xs font-semibold text-neutral-500">
                            {partner.city ?? "—"}
                          </p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-neutral-400">
                        chevron_right
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/map"
                className="block w-full mt-6 py-3 border border-neutral-200 text-[#181c1d] rounded-lg font-bold text-sm text-center hover:bg-neutral-50 transition-colors"
              >
                Explorer la carte
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
