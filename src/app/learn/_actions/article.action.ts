"use server";

// Toggle lu/non-lu — appelé par ArticleActions.tsx (bouton bookmark interactif).
// Distinct de markArticleReadAction (read.action.ts) qui est un upsert one-way.
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function toggleSavedArticleAction(articleId: string, currentlySaved: boolean) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  if (currentlySaved) {
    await supabase
      .from("user_read_articles")
      .delete()
      .eq("user_id", user.id)
      .eq("article_id", articleId);
  } else {
    await supabase
      .from("user_read_articles")
      .insert({ user_id: user.id, article_id: articleId });
  }

  revalidatePath("/learn");
  return { saved: !currentlySaved };
}
