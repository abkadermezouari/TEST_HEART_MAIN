import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Product } from "@/lib/database.types";

export interface ProductFilters {
  categorySlug?: string;
  nutriScore?: string[];
  maxGlycemicIndex?: number;
  labels?: string[];
  compatibleWith?: string[];
  search?: string;
  page?: number;
  perPage?: number;
}

export const PRODUCTS_PER_PAGE = 12;

export async function getProducts(filters: ProductFilters = {}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { page = 1, perPage = PRODUCTS_PER_PAGE } = filters;
  const from = (page - 1) * perPage;

  // Résoudre categorySlug en category_id avant la requête principale.
  let categoryId: string | undefined;
  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from("product_categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();
    if (cat) categoryId = cat.id;
  }

  let query = supabase
    .from("products")
    .select("*, product_categories(name, slug)", { count: "exact" })
    .eq("is_published", true)
    .range(from, from + perPage - 1);

  if (categoryId) query = query.eq("category_id", categoryId);
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);
  if (filters.nutriScore?.length) query = query.in("nutri_score", filters.nutriScore);
  if (filters.maxGlycemicIndex !== undefined) query = query.lte("glycemic_index", filters.maxGlycemicIndex);
  if (filters.labels?.length) query = query.overlaps("labels", filters.labels);
  if (filters.compatibleWith?.length) query = query.overlaps("compatible_with", filters.compatibleWith);

  const { data, count, error } = await query;
  if (error) throw error;
  return {
    products: data as (Product & { product_categories: { name: string; slug: string } | null })[],
    total: count ?? 0,
  };
}

export async function getProductById(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_categories(name, slug),
      partner_inventory(
        price, currency, quantity, is_available,
        partners(name, address_line, city, latitude, longitude, opening_hours)
      )
    `)
    .eq("id", id)
    .eq("is_published", true)
    .single();
  if (error) throw error;
  return data;
}

export async function getDashboardProducts(limit = 4) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase
    .from("products")
    .select("id, name, brand, image_url, nutri_score, glycemic_index")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getRecommendedProducts(compatibleWith: string[] = [], limit = 4) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  let query = supabase
    .from("products")
    .select("*, product_categories(name, slug)")
    .eq("is_published", true)
    .in("nutri_score", ["A", "B"])
    .limit(limit);

  if (compatibleWith.length) query = query.overlaps("compatible_with", compatibleWith);
  const { data } = await query;
  return data ?? [];
}
