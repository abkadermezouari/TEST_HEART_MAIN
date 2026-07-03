import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { requireAuth } from "@/lib/auth";
import { getQuizByArticleSlug, getUserQuizResult } from "@/lib/queries/quiz";
import { getUnreadNotificationCount } from "@/lib/queries/notifications";
import { QuizClient } from "./_components/QuizClient";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await requireAuth();

  const [quiz, unreadCount] = await Promise.all([
    getQuizByArticleSlug(slug).catch(() => null),
    getUnreadNotificationCount(profile.id),
  ]);
  const previousResult = quiz
    ? await getUserQuizResult(quiz.id).catch(() => null)
    : null;

  return (
    <div className="bg-[#f7fafa] min-h-screen text-[#181c1d]">
      <Sidebar role={profile.role} />
      <TopBar
        userName={profile.full_name ?? "Utilisateur"}
        userAvatar={profile.avatar_url ?? undefined}
        unreadCount={unreadCount}
      />

      <main className="ml-60 pt-[60px] min-h-screen">
        {!quiz ? (
          /* ── État quiz indisponible ── */
          <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-[#bec8c9] p-12 max-w-md w-full text-center">
              <div className="w-20 h-20 rounded-full bg-[#004f54]/10 flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-[#004f54]">quiz</span>
              </div>
              <h1 className="text-2xl font-bold mb-2">Quiz bientôt disponible</h1>
              <p className="text-sm text-[#6f797a] mb-6">
                Ce quiz est en cours de préparation. Revenez bientôt&nbsp;!
              </p>
              <div className="bg-[#f1f4f4] rounded-xl p-4 mb-8 text-left flex items-start gap-3">
                <span className="material-symbols-outlined text-[#004f54] shrink-0">lightbulb</span>
                <p className="text-sm text-[#3f4949]">
                  Les quiz vous permettent de valider votre compréhension après chaque article et
                  de suivre votre progression.
                </p>
              </div>
              <Link
                href={`/learn/${slug}`}
                className="inline-flex items-center gap-2 bg-[#004f54] text-white px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Retour à l&apos;article
              </Link>
            </div>
          </div>
        ) : (
          <QuizClient
            quiz={quiz}
            articleSlug={slug}
            previousResult={
              previousResult as {
                score: number;
                max_score: number;
                completed_at: string;
              } | null
            }
          />
        )}
      </main>
    </div>
  );
}
