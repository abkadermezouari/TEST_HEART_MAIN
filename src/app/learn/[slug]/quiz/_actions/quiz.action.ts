"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function saveQuizResultAction(
  quizId: string,
  score: number,
  maxScore: number
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase.from("user_quiz_results").upsert(
    { user_id: user.id, quiz_id: quizId, score, max_score: maxScore },
    { onConflict: "user_id,quiz_id" }
  );

  if (error) return { error: "Erreur lors de la sauvegarde." };
  return { success: true };
}
