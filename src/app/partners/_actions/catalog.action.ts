"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const importSchema = z.object({
  partnerId: z.string().uuid(),
  catalogType: z.enum(["product", "recipe"]),
  rows: z.array(z.record(z.string(), z.string())),
});

export async function importCatalogAction(input: unknown) {
  const parsed = importSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { partnerId, catalogType, rows } = parsed.data;

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const name = row["nom"] ?? row["name"] ?? Object.values(row)[0];
    if (!name || !name.trim()) {
      skipped++;
      continue;
    }

    const { error } = await supabase.from("partner_catalog").upsert(
      {
        partner_id: partnerId,
        type: catalogType,
        name: name.trim(),
        data: row as unknown as Record<string, unknown>,
      },
      { onConflict: "partner_id,type,name", ignoreDuplicates: false },
    );

    if (error) {
      if (error.code === "23505") {
        skipped++;
      } else {
        return { error: `Erreur lors de l'import: ${error.message}` };
      }
    } else {
      imported++;
    }
  }

  revalidatePath("/partners");
  revalidatePath("/map");
  revalidatePath("/magasin", "layout");
  return { success: true, imported, skipped };
}

const publishSchema = z.object({
  itemId: z.string().uuid(),
  is_published: z.boolean(),
});

export async function publishCatalogAction(input: unknown) {
  const parsed = publishSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { itemId, is_published } = parsed.data;

  const { error } = await supabase
    .from("partner_catalog")
    .update({ is_published })
    .eq("id", itemId)
    .in(
      "partner_id",
      (
        await supabase.from("partners").select("id").eq("owner_id", user.id)
      ).data?.map((p) => p.id) ?? [],
    );

  if (error) return { error: "Erreur lors de la publication." };

  revalidatePath("/partners");
  revalidatePath("/map");
  revalidatePath("/magasin", "layout");
  return { success: true };
}

export async function deleteCatalogItemAction(itemId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("partner_catalog")
    .delete()
    .eq("id", itemId)
    .in(
      "partner_id",
      (
        await supabase.from("partners").select("id").eq("owner_id", user.id)
      ).data?.map((p) => p.id) ?? [],
    );

  if (error) return { error: "Erreur lors de la suppression." };

  revalidatePath("/partners");
  revalidatePath("/map");
  revalidatePath("/magasin", "layout");
  return { success: true };
}
