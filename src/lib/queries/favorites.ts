import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getSavedProductIds(): Promise<string[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("user_saved_products")
    .select("product_id")
    .eq("user_id", user.id);
  return (data ?? []).map((r) => r.product_id);
}

export async function getSavedRecipeIds(): Promise<string[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("user_saved_recipes")
    .select("recipe_id")
    .eq("user_id", user.id);
  return (data ?? []).map((r) => r.recipe_id);
}

export async function getActiveShoppingList() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("shopping_lists")
    .select("*, shopping_list_items(*)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}
