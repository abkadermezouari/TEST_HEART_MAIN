import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { requireAuth } from "@/lib/auth";
import { getArticleBySlug, getUserReadArticleIds } from "@/lib/queries/articles";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import { ArticleActions } from "../_components/ArticleActions";

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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const profile = await requireAuth();
  const [article, readIds, unreadCount] = await Promise.all([
    getArticleBySlug(slug).catch(() => null),
    getUserReadArticleIds(),
    getUnreadNotificationCount(profile.id),
  ]);

  if (!article) notFound();

  const isRead = readIds.includes(article.id);
  const icon = categoryIcon[article.category] ?? "article";
  const level = article.difficulty ? difficultyLabel[article.difficulty] : "Débutant";
  const content = (article as Record<string, unknown>).content as string | null;

  return (
    <div className="bg-[#f7fafa] min-h-screen text-[#181c1d]">
      <Sidebar role={profile.role} />
      <TopBar
        userName={profile.full_name ?? "Utilisateur"}
        userAvatar={profile.avatar_url ?? undefined}
        unreadCount={unreadCount}
      />

      <main className="ml-60 pt-[60px] min-h-screen">
        <div className="max-w-3xl mx-auto p-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#6f797a] mb-6">
            <Link href="/learn" className="hover:text-[#004f54] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Apprendre
            </Link>
            <span>/</span>
            <span className="text-[#181c1d] font-medium truncate">{article.title}</span>
          </nav>

          <article className="bg-white rounded-2xl shadow-sm border border-[#bec8c9] overflow-hidden">
            {/* Hero Image */}
            <div className="h-72 relative">
              {article.image_url ? (
                <Image
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                  src={article.image_url}
                  alt={article.title}
                />
              ) : (
                <div className="w-full h-full bg-[#004f54]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-8xl text-[#004f54]/30">{icon}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                <div>
                  <span className="px-3 py-1 bg-[#004f54] text-white rounded-full text-xs font-semibold mb-3 inline-block uppercase tracking-wider">
                    {article.category.replace(/_/g, " ")}
                  </span>
                  <h1 className="text-white text-3xl font-bold leading-tight">{article.title}</h1>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="px-8 py-4 border-b border-[#bec8c9] flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6 text-sm text-[#6f797a]">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  {article.read_time_min ?? "—"} min de lecture
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">bar_chart</span>
                  {level}
                </span>
                {isRead && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    LU
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ArticleActions
                  articleId={article.id}
                  initialSaved={isRead}
                  articleTitle={article.title}
                  articleUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/learn/${article.slug}`}
                />
              </div>
            </div>

            <div className="p-8">
              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-lg text-[#3f4949] mb-8 leading-relaxed border-l-4 border-[#004f54] pl-5">
                  {article.excerpt}
                </p>
              )}

              {/* Content */}
              {content ? (
                <div className="prose prose-sm max-w-none text-[#3f4949] leading-relaxed whitespace-pre-wrap">
                  {content}
                </div>
              ) : (
                <div className="py-12 text-center text-neutral-400">
                  <span className="material-symbols-outlined text-4xl mb-2 block text-neutral-300">article</span>
                  <p className="text-sm">Le contenu complet de cet article n&apos;est pas encore disponible.</p>
                </div>
              )}

              {/* Quiz CTA */}
              <div className="mt-10 p-6 bg-[#e0e3e3] rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#004f54] flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined">quiz</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#181c1d]">Testez vos connaissances</h4>
                    <p className="text-xs text-[#6f797a]">Quiz sur : {article.title}</p>
                  </div>
                </div>
                <Link
                  href={`/learn/${article.slug}/quiz`}
                  className="bg-[#004f54] text-white px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
                >
                  Commencer le quiz
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-[#ebeeee] border-t border-[#bec8c9] flex justify-between items-center">
              <Link
                href="/learn"
                className="flex items-center gap-2 text-[#004f54] text-sm font-semibold hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Retour aux articles
              </Link>
              <Link
                href={`/learn/${article.slug}/quiz`}
                className="bg-[#01696f] text-[#97e6ec] px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                Faire le quiz
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
