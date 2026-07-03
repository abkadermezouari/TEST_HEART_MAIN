import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface NotificationRow {
  id: string;
  type: "warning" | "success" | "info";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  nutritionist_id: string;
  patient_id: string;
}

export async function getNotifications(
  role: string,
  userId: string
): Promise<NotificationRow[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("patient_alerts")
    .select("*")
    .order("created_at", { ascending: false });

  if (role === "nutritionist") {
    query = query.eq("nutritionist_id", userId);
  } else if (role === "admin") {
    // admin voit tout — pas de filtre
  } else {
    // user / partner_admin : alertes reçues en tant que patient
    query = query.eq("patient_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as NotificationRow[];
}

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { count, error } = await supabase
    .from("patient_alerts")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)
    .eq("patient_id", userId);

  if (error) return 0;
  return count ?? 0;
}
