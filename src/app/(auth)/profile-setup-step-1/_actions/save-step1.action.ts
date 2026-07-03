"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const step1Schema = z.object({
  age: z.coerce.number().int().min(1).max(129),
  weight_kg: z.coerce.number().positive(),
  height_cm: z.coerce.number().positive(),
  activity_level: z.enum(["sedentary", "moderate", "active"]),
});

export async function saveStep1Action(input: unknown) {
  const parsed = step1Schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  // Calcul TMB (Harris-Benedict révisé)
  const { age, weight_kg, height_cm, activity_level } = parsed.data;
  const bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5; // formule homme (approximation)
  const multiplier = { sedentary: 1.2, moderate: 1.55, active: 1.725 }[activity_level];
  const tdee = bmr * multiplier;

  const { error } = await supabase
    .from("user_health_profiles")
    .upsert({
      user_id: user.id,
      age,
      weight_kg,
      height_cm,
      activity_level,
      bmr_kcal: Math.round(bmr),
      tdee_kcal: Math.round(tdee),
      is_complete: false,
    });

  if (error) return { error: "Erreur de sauvegarde. Réessayez." };

  redirect("/profile-setup-step-2");
}
