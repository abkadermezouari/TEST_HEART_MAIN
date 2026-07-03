"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const registerSchema = z.object({
  full_name: z.string().min(2, "Prénom trop court"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
});

export async function registerAction(input: unknown) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Cet email est déjà utilisé." };
    }
    return { error: "Inscription échouée. Réessayez." };
  }

  const {
    data: { user: registeredUser },
  } = await supabase.auth.getUser();

  // Si email confirmation est activée, l'utilisateur n'est pas connecté immédiatement
  if (!registeredUser) {
    redirect("/login?registered=true");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", registeredUser.id)
    .maybeSingle();

  redirect(profile?.role === "partner_admin" ? "/partners" : "/dashboard");
}
