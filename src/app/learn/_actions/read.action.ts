"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function markArticleReadAction(articleId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("user_read_articles")
    .upsert({ user_id: user.id, article_id: articleId }, { ignoreDuplicates: true });

  revalidatePath("/learn");
}
