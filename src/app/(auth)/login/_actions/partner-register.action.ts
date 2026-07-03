"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { z } from "zod";
import { upgradeToPartner } from "@/lib/partners/upgrade-to-partner";

const partnerRegisterSchema = z.object({
  full_name: z.string().min(2, "Prénom trop court"),
  store_name: z.string().min(2, "Le nom du magasin doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
});

export async function registerPartnerAction(input: unknown) {
  const parsed = partnerRegisterSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { email, password, full_name, store_name } = parsed.data;

  // ── Étape 1 : tenter une inscription classique (email inexistant) ──
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        role: "partner_admin",
      },
    },
  });

  // Email déjà utilisé → l'utilisateur a déjà un compte client
  if (signUpError && signUpError.message.includes("already registered")) {
    // Tenter de connecter l'utilisateur avec les identifiants fournis
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return {
        error:
          "Un compte existe déjà avec cet email. Connectez-vous d'abord puis revenez sur cette page pour devenir partenaire.",
      };
    }

    // Authentifié : promouvoir le compte en partner_admin
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser?.user) {
      return { error: "Impossible de récupérer votre compte. Réessayez." };
    }

    try {
      await upgradeToPartner({ userId: authUser.user.id, storeName: store_name });
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Erreur lors de la mise à niveau du compte." };
    }

    redirect("/partners");
  }

  // Autre erreur d'inscription
  if (signUpError) {
    return { error: "Inscription échouée. Réessayez." };
  }

  // ── Inscription réussie sur un nouvel email ──
  const newUserId = signUpData?.user?.id;

  if (newUserId) {
    const adminClient = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — partners.Insert mal inféré par Supabase JS v2
    const { error: partnerError } = await adminClient.from("partners").insert({
      owner_id: newUserId,
      name: store_name,
      is_active: true,
      is_verified: false,
      country: "Algérie",
    });

    if (partnerError) {
      return { error: "Erreur lors de la création du magasin. Réessayez." };
    }
  }

  // Si email confirmation activée → pas de session, redirect vers login
  const {
    data: { user: registeredUser },
  } = await supabase.auth.getUser();

  if (!registeredUser) {
    redirect("/login?registered=true");
  }

  redirect("/partners");
}
