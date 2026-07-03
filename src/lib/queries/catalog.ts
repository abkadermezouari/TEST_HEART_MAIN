import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getPartnerCatalog(partnerId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("partner_catalog")
    .select("*")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPublishedCatalog(partnerId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("partner_catalog")
    .select("*")
    .eq("partner_id", partnerId)
    .eq("is_published", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
