import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminStats() {
  const supabase = createAdminClient();

  const [usersRes, productsRes, partnersRes, recipesRes, alertsRes, recentUsersRes] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true),
      supabase
        .from("partners")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("recipes")
        .select("id", { count: "exact", head: true })
        .eq("is_published", true),
      supabase
        .from("patient_alerts")
        .select("id", { count: "exact", head: true })
        .eq("is_read", false),
      supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  return {
    totalUsers: usersRes.count ?? 0,
    totalProducts: productsRes.count ?? 0,
    totalPartners: partnersRes.count ?? 0,
    totalRecipes: recipesRes.count ?? 0,
    unreadAlerts: alertsRes.count ?? 0,
    recentUsers: (recentUsersRes.data ?? []) as {
      id: string;
      full_name: string | null;
      email: string;
      role: string;
      created_at: string;
    }[],
  };
}
