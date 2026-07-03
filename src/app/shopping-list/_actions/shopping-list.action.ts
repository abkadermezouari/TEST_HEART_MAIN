"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function getOrCreateActiveListId(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("shopping_lists")
    .insert({ user_id: userId, name: "Ma liste", is_active: true })
    .select("id")
    .single();

  return created?.id ?? null;
}

export async function addItemAction(input: unknown) {
  const parsed = z
    .object({
      productName: z.string().min(1, "Nom requis"),
      productId: z.string().uuid().optional(),
      quantity: z.coerce.number().int().min(1).default(1),
    })
    .safeParse(input);

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const listId = await getOrCreateActiveListId(supabase, user.id);
  if (!listId) return { error: "Impossible de créer la liste." };

  // Incrémenter si déjà présent par nom
  const { data: existing } = await supabase
    .from("shopping_list_items")
    .select("id, quantity")
    .eq("shopping_list_id", listId)
    .eq("product_name", parsed.data.productName)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("shopping_list_items")
      .update({ quantity: existing.quantity + parsed.data.quantity })
      .eq("id", existing.id);
  } else {
    await supabase.from("shopping_list_items").insert({
      shopping_list_id: listId,
      product_id: parsed.data.productId ?? null,
      product_name: parsed.data.productName,
      quantity: parsed.data.quantity,
    });
  }

  revalidatePath("/shopping-list");
  return { success: true };
}

export async function toggleItemCheckedAction(itemId: string, isChecked: boolean) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  await supabase
    .from("shopping_list_items")
    .update({ is_checked: !isChecked })
    .eq("id", itemId);

  revalidatePath("/shopping-list");
  return { success: true };
}

export async function updateItemQuantityAction(itemId: string, quantity: number) {
  if (quantity < 1) return { error: "Quantité invalide." };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  await supabase
    .from("shopping_list_items")
    .update({ quantity })
    .eq("id", itemId);

  revalidatePath("/shopping-list");
  return { success: true };
}

export async function removeItemAction(itemId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  await supabase.from("shopping_list_items").delete().eq("id", itemId);

  revalidatePath("/shopping-list");
  return { success: true };
}

export async function clearCheckedAction(listId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  await supabase
    .from("shopping_list_items")
    .delete()
    .eq("shopping_list_id", listId)
    .eq("is_checked", true);

  revalidatePath("/shopping-list");
  return { success: true };
}
