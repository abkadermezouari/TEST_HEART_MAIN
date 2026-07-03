"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { upgradeToPartner } from "@/lib/partners/upgrade-to-partner";

const partnerLoginSchema = z.object({
  store_name: z.string().min(2, "Le nom du magasin doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

export async function partnerLoginAction(input: unknown) {
  const parsed = partnerLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { store_name, email, password } = parsed.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Email ou mot de passe incorrect" };
  }

  const {
    data: { user: signedInUser },
  } = await supabase.auth.getUser();

  if (!signedInUser) {
    return { error: "Impossible de récupérer votre session. Réessayez." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", signedInUser.id)
    .maybeSingle();

  // Promotion partner_admin si nécessaire (NON-BLOQUANTE)
  if (!profile || profile.role !== "partner_admin") {
    try {
      await upgradeToPartner({ userId: signedInUser.id, storeName: store_name });
    } catch {
      return { error: "Impossible de créer votre espace partenaire. Contactez le support." };
    }
    redirect("/partners");
  }

  // Déjà partner_admin : vérifier que le partenaire existe et est actif
  const { data: partner } = await supabase
    .from("partners")
    .select("id, is_active")
    .eq("owner_id", signedInUser.id)
    .maybeSingle();

  if (partner && !partner.is_active) {
    await supabase.auth.signOut();
    return { error: "Votre magasin a été désactivé. Contactez le support." };
  }

  // Partner_admin sans ligne partners → tenter de créer
  if (!partner) {
    try {
      await upgradeToPartner({ userId: signedInUser.id, storeName: store_name });
    } catch {
      return { error: "Impossible de créer votre magasin. Contactez le support." };
    }
  }

  redirect("/partners");
}
