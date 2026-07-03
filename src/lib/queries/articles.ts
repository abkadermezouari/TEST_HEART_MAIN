import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getArticles(filters: { category?: string; tags?: string[] } = {}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("articles")
    .select("id, title, slug, excerpt, image_url, category, read_time_min, difficulty, tags, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (filters.category && filters.category !== "all") query = query.eq("category", filters.category);
  if (filters.tags?.length) query = query.overlaps("tags", filters.tags);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getArticleBySlug(slug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  if (error) throw error;
  return data;
}

export async function getUserReadArticleIds(): Promise<string[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("user_read_articles")
    .select("article_id")
    .eq("user_id", user.id);
  return (data ?? []).map((r) => r.article_id);
}
