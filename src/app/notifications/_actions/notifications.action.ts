"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function markAlertReadAction(alertId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("patient_alerts")
    .update({ is_read: true })
    .eq("id", alertId)
    .or(`patient_id.eq.${user.id},nutritionist_id.eq.${user.id}`);

  if (error) return { error: "Erreur lors de la mise à jour." };

  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllReadAction() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("patient_alerts")
    .update({ is_read: true })
    .eq("is_read", false)
    .or(`patient_id.eq.${user.id},nutritionist_id.eq.${user.id}`);

  if (error) return { error: "Erreur lors de la mise à jour." };

  revalidatePath("/notifications");
  return { success: true };
}
