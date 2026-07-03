import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getPartners(filters: {
  city?: string;
  onlyActive?: boolean;
  onlyVerified?: boolean;
  search?: string;
} = {}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase.from("partners").select("*");

  if (filters.onlyActive !== false) query = query.eq("is_active", true);
  if (filters.onlyVerified) query = query.eq("is_verified", true);
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getPartnerWithInventory(partnerId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("partners")
    .select(`
      *,
      partner_inventory(
        id, price, currency, quantity, is_available, low_stock_threshold,
        products(id, name, image_url, nutri_score, glycemic_index, labels, product_categories(name))
      )
    `)
    .eq("id", partnerId)
    .single();
  if (error) throw error;
  return data;
}

export async function getMyPartner() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("partners")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();
  return data;
}

export async function getPartnerDashboardStats(partnerId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [inventoryRes, viewsRes, lowStockRes, searchRes] = await Promise.all([
    supabase
      .from("partner_inventory")
      .select("id, quantity, is_available", { count: "exact" })
      .eq("partner_id", partnerId)
      .eq("is_available", true),
    supabase
      .from("partner_daily_views")
      .select("day, total_views")
      .eq("partner_id", partnerId)
      .order("day", { ascending: true }),
    supabase
      .from("partner_inventory")
      .select("id, quantity, low_stock_threshold, products(name, image_url)")
      .eq("partner_id", partnerId)
      .lt("quantity", 10),
    supabase
      .from("product_search_logs")
      .select("search_term, products(name)")
      .eq("partner_id", partnerId)
      .not("search_term", "is", null)
      .limit(10),
  ]);

  return {
    activeItems: inventoryRes.count ?? 0,
    dailyViews: viewsRes.data ?? [],
    lowStockAlerts: lowStockRes.data ?? [],
    topSearched: searchRes.data ?? [],
  };
}
