import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Promeut un compte utilisateur existant en compte partenaire.
 * - Passe profiles.role à 'partner_admin'
 * - Crée une ligne partners si elle n'existe pas encore
 *
 * Retourne { partner } ou lance une erreur.
 */
export async function upgradeToPartner(params: {
  userId: string;
  storeName: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  // 1. Passer le rôle à partner_admin
  const { error: profileError } = await admin
    .from("profiles")
    .update({ role: "partner_admin" })
    .eq("id", params.userId);

  if (profileError) {
    throw new Error("Impossible de mettre à jour votre profil. Réessayez.");
  }

  // 2. Vérifier si un partenaire existe déjà
  const { data: existing } = await admin
    .from("partners")
    .select("id, name")
    .eq("owner_id", params.userId)
    .maybeSingle();

  if (existing) {
    return { partner: existing };
  }

  // 3. Créer la ligne partners
  const { data: inserted, error: insertError } = await admin
    .from("partners")
    .insert({
      owner_id: params.userId,
      name: params.storeName,
      is_active: true,
      is_verified: false,
      country: "Algérie",
    })
    .select("id, name")
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: retry } = await admin
        .from("partners")
        .select("id, name")
        .eq("owner_id", params.userId)
        .maybeSingle();
      if (retry) return { partner: retry };
    }
    throw new Error("Erreur lors de la création du magasin. Réessayez.");
  }

  return { partner: inserted! };
}
