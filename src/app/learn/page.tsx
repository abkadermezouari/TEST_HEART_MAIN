import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { requireAuth } from "@/lib/auth";
import { getArticles, getUserReadArticleIds } from "@/lib/queries/articles";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import { ArticleActions } from "./_components/ArticleActions";

const categoryIcon: Record<string, string> = {
  glycemic_index: "nutrition",
  labels: "label",
  fats: "heart_plus",
  fiber: "bakery_dining",
  general: "article",
};

const difficultyLabel: Record<string, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
};

const categoryFilters = [
  { label: "Tout", value: "" },
  { label: "Indice Glycémique", value: "glycemic_index" },
  { label: "Labels", value: "labels" },
  { label: "Fibres", value: "fiber" },
];

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; category?: string }>;
}) {
  const params = await searchParams;

  const profile = await requireAuth();
  const [articles, readIds, unreadCount] = await Promise.all([
    getArticles({ category: params.category || undefined }),
    getUserReadArticleIds(),
    getUnreadNotificationCount(profile.id),
  ]);

  // Article affiché dans le panneau de droite
  const featured = params.slug
    ? (articles.find((a) => a.slug === params.slug) ?? articles[0] ?? null)
    : articles[0] ?? null;

  const featuredIdx = featured ? articles.findIndex((a) => a.id === featured.id) : -1;
  const prevArticle = featuredIdx > 0 ? articles[featuredIdx - 1] : null;
  const nextArticle = featuredIdx >= 0 && featuredIdx < articles.length - 1 ? articles[featuredIdx + 1] : null;

  const readCount = articles.filter((a) => readIds.includes(a.id)).length;

  function articleHref(slug: string) {
    return params.category
      ? `/learn?category=${params.category}&slug=${slug}`
      : `/learn?slug=${slug}`;
  }

  return (
    <div className="bg-[#f7fafa] min-h-screen text-[#181c1d]">
      <Sidebar role={profile.role} />
      <TopBar
        userName={profile.full_name ?? "Utilisateur"}
        userAvatar={profile.avatar_url ?? undefined}
        unreadCount={unreadCount}
      />

      <main className="ml-60 pt-[60px] min-h-screen">
        <div className="max-w-[1200px] mx-auto p-6">
          {/* Progress Banner */}
          <section className="mb-6">
            <div className="bg-[#01696f] rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2 text-[#a1f0f6]">Votre parcours nutritionnel</h2>
                <p className="text-base opacity-90 max-w-md text-[#97e6ec]">
                  Continuez à apprendre pour maîtriser les bases d&apos;une alimentation saine pour votre cœur.
                </p>
              </div>
              <div className="relative z-10 flex flex-col items-end gap-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-[#a1f0f6]">
                    {readCount} article{readCount > 1 ? "s" : ""} sur {articles.length}
                  </span>
                  <div className="w-48 h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#a1f0f6]"
                      style={{ width: articles.length > 0 ? `${Math.round((readCount / articles.length) * 100)}%` : "0%" }}
                    />
                  </div>
                </div>
                {nextArticle && (
                  <p className="text-xs font-semibold italic text-[#a1f0f6]/80">
                    Prochaine étape : {nextArticle.title}
                  </p>
                )}
              </div>
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
            </div>
          </section>

          {articles.length === 0 ? (
            <div className="text-center py-16 text-neutral-500">
              <span className="material-symbols-outlined text-5xl mb-3 block text-neutral-300">menu_book</span>
              <p className="font-semibold">Aucun article disponible.</p>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6 items-start">
              {/* Left: Article List */}
              <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categoryFilters.map(({ label, value }) => {
                    const isActive = (params.category ?? "") === value;
                    const href = value
                      ? `/learn?category=${value}`
                      : "/learn";
                    return (
                      <Link
                        key={label}
                        href={href}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-[#004f54] text-white"
                            : "bg-[#ebeeee] text-[#3f4949] hover:bg-[#e6e9e9]"
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>

                {/* Articles */}
                <div className="space-y-3">
                  {articles.map((article) => {
                    const isRead = readIds.includes(article.id);
                    const isActive = featured?.id === article.id;
                    const icon = categoryIcon[article.category] ?? "article";
                    const level = article.difficulty ? difficultyLabel[article.difficulty] : "Débutant";

                    return (
                      <Link
                        key={article.id}
                        href={articleHref(article.slug)}
                        className={`group bg-white rounded-xl p-4 shadow-sm transition-all border-2 block ${
                          isActive ? "border-[#004f54]" : "border-[#bec8c9] hover:bg-[#ebeeee]"
                        }`}
                      >
                        <div className="flex gap-4">
                          <div
                            className={`w-16 h-16 rounded-lg flex items-center justify-center shrink-0 ${
                              isActive
                                ? "bg-[#a1f0f6]/30 text-[#004f54]"
                                : "bg-[#e6e9e9] text-[#3f4949] group-hover:bg-[#a1f0f6]/20 group-hover:text-[#004f54]"
                            } transition-colors`}
                          >
                            <span className="material-symbols-outlined text-3xl">{icon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-semibold ${isActive ? "text-[#004f54]" : ""}`}>
                                {article.title}
                              </h4>
                              {isRead && (
                                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full shrink-0 ml-2">
                                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                  LU
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[#6f797a]">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                {article.read_time_min ?? "—"} min
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">bar_chart</span>
                                {level}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Right: Article Detail */}
              {featured && (
                <div className="col-span-12 lg:col-span-7">
                  <article className="bg-white rounded-2xl shadow-sm border border-[#bec8c9] overflow-hidden">
                    {/* Lien page dédiée */}
                    <div className="px-8 pt-4 flex justify-end">
                      <Link
                        href={`/learn/${featured.slug}`}
                        className="text-xs font-semibold text-[#004f54] hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        Voir l&apos;article complet
                      </Link>
                    </div>
                    {/* Hero */}
                    <div className="h-64 relative">
                      {featured.image_url ? (
                        <Image
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                          src={featured.image_url}
                          alt={featured.title}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#004f54]/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-7xl text-[#004f54]/30">
                            {categoryIcon[featured.category] ?? "article"}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                        <div>
                          <span className="px-3 py-1 bg-[#004f54] text-white rounded-full text-xs font-semibold mb-3 inline-block uppercase tracking-wider">
                            {featured.category.replace(/_/g, " ")}
                          </span>
                          <h1 className="text-white text-3xl font-bold">{featured.title}</h1>
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      {featured.excerpt && (
                        <p className="text-lg text-[#3f4949] mb-6 leading-relaxed">
                          {featured.excerpt}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-[#f1f4f4] p-5 rounded-xl border-l-4 border-[#004f54]">
                          <div className="flex items-center gap-2 mb-2 text-[#004f54]">
                            <span className="material-symbols-outlined">lightbulb</span>
                            <span className="text-sm font-semibold">À retenir</span>
                          </div>
                          <p className="text-sm text-[#3f4949]">
                            Plus l&apos;IG est élevé, plus le pic de glycémie est important, provoquant une sécrétion massive d&apos;insuline.
                          </p>
                        </div>
                        <div className="bg-[#6e3815]/5 p-5 rounded-xl border-l-4 border-[#6e3815]">
                          <div className="flex items-center gap-2 mb-2 text-[#6e3815]">
                            <span className="material-symbols-outlined">warning</span>
                            <span className="text-sm font-semibold">Le Saviez-vous ?</span>
                          </div>
                          <p className="text-sm text-[#3f4949]">
                            La cuisson augmente généralement l&apos;IG des aliments (ex: pâtes al dente vs bien cuites).
                          </p>
                        </div>
                      </div>

                      {/* Quiz CTA */}
                      <div className="p-6 bg-[#e0e3e3] rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#004f54] flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">quiz</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold">Prêt pour un quiz ?</h4>
                            <p className="text-xs text-[#6f797a]">Testez vos connaissances sur {featured.title}</p>
                          </div>
                        </div>
                        <Link
                          href={`/learn/${featured.slug}/quiz`}
                          className="bg-[#004f54] text-white px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                          Commencer
                        </Link>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-8 py-6 bg-[#ebeeee] border-t border-[#bec8c9] flex justify-between items-center">
                      {prevArticle ? (
                        <Link
                          href={articleHref(prevArticle.slug)}
                          className="flex items-center gap-2 text-[#004f54] text-sm font-semibold hover:opacity-80 transition-opacity"
                        >
                          <span className="material-symbols-outlined">arrow_back</span>
                          Article précédent
                        </Link>
                      ) : (
                        <span className="flex items-center gap-2 text-neutral-300 text-sm font-semibold cursor-not-allowed">
                          <span className="material-symbols-outlined">arrow_back</span>
                          Article précédent
                        </span>
                      )}

                      <div className="flex items-center gap-4">
                        <ArticleActions
                          articleId={featured.id}
                          initialSaved={readIds.includes(featured.id)}
                          articleTitle={featured.title}
                          articleUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/learn?slug=${featured.slug}`}
                        />

                        {nextArticle ? (
                          <Link
                            href={articleHref(nextArticle.slug)}
                            className="bg-[#01696f] text-[#97e6ec] px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
                          >
                            Suivant <span className="material-symbols-outlined">arrow_forward</span>
                          </Link>
                        ) : (
                          <span className="bg-neutral-200 text-neutral-400 px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 cursor-not-allowed">
                            Suivant <span className="material-symbols-outlined">arrow_forward</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#ff6b6b] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-50">
        <span className="material-symbols-outlined text-3xl">question_answer</span>
      </button>
    </div>
  );
}
