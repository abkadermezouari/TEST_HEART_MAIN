import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Recipe } from "@/lib/database.types";

export interface RecipeFilters {
  dietTags?: string[];
  compatibleWith?: string[];
  maxPrice?: number;
  maxCalories?: number;
  search?: string;
  featured?: boolean;
  page?: number;
  perPage?: number;
}

export const RECIPES_PER_PAGE = 24;

export async function getRecipes(
  filters: RecipeFilters = {},
): Promise<{ recipes: Recipe[]; total: number }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { page = 1, perPage = RECIPES_PER_PAGE } = filters;
  const from = (page - 1) * perPage;

  let query = supabase
    .from("recipes")
    .select("*", { count: "exact" })
    .eq("is_published", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (filters.featured) query = query.eq("is_featured", true);
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);
  if (filters.dietTags?.length) query = query.overlaps("diet_tags", filters.dietTags);
  if (filters.compatibleWith?.length) query = query.overlaps("compatible_with", filters.compatibleWith);
  if (filters.maxPrice !== undefined) query = query.lte("price_estimate", filters.maxPrice);
  if (filters.maxCalories !== undefined) query = query.lte("calories_kcal", filters.maxCalories);

  const { data, count, error } = await query;
  if (error) throw error;
  return { recipes: (data ?? []) as Recipe[], total: count ?? 0 };
}

export async function getRecipeById(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("recipes")
    .select(`
      *,
      recipe_ingredients(*, products(name, image_url)),
      recipe_steps(step_number, instruction)
    `)
    .eq("id", id)
    .eq("is_published", true)
    .single();
  if (error) throw error;
  return data;
}
