import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface QuizData {
  id: string;
  title: string;
  quiz_questions: {
    id: string;
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string | null;
    sort_order: number;
  }[];
}

export async function getQuizByArticleSlug(slug: string): Promise<QuizData | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: article } = await supabase
    .from("articles")
    .select("id")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!article) return null;

  const { data: quiz } = await supabase
    .from("quizzes")
    .select(
      `id, title, quiz_questions (id, question, options, correct_answer, explanation, sort_order)`
    )
    .eq("article_id", article.id)
    .maybeSingle();

  if (!quiz) return null;

  return {
    id: quiz.id,
    title: quiz.title,
    quiz_questions: ((quiz.quiz_questions ?? []) as QuizData["quiz_questions"]).sort(
      (a, b) => a.sort_order - b.sort_order
    ),
  };
}

export async function getUserQuizResult(quizId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_quiz_results")
    .select("score, max_score, completed_at")
    .eq("quiz_id", quizId)
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}
