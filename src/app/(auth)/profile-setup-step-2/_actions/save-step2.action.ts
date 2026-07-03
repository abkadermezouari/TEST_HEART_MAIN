"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const step2Schema = z.object({
  health_conditions: z.array(z.string()).default([]),
  goals: z.array(z.string()).default([]),
});

export async function saveStep2Action(input: unknown) {
  const parsed = step2Schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("user_health_profiles")
    .update({
      health_conditions: parsed.data.health_conditions,
      goals: parsed.data.goals,
      is_complete: true,
    })
    .eq("user_id", user.id);

  if (error) return { error: "Erreur de sauvegarde. Réessayez." };

  redirect("/dashboard");
}
