"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateItemSchema = z.object({
  inventoryId: z.string().uuid(),
  price: z.coerce.number().nonnegative(),
  quantity: z.coerce.number().int().nonnegative(),
  is_available: z.boolean(),
});

export async function updateInventoryItemAction(input: unknown) {
  const parsed = updateItemSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("partner_inventory")
    .update({
      price: parsed.data.price,
      quantity: parsed.data.quantity,
      is_available: parsed.data.is_available,
    })
    .eq("id", parsed.data.inventoryId)
    // Vérifie que l'item appartient bien à un commerce du user
    .in("partner_id", (
      await supabase.from("partners").select("id").eq("owner_id", user.id)
    ).data?.map((p) => p.id) ?? []);

  if (error) return { error: "Mise à jour échouée." };

  revalidatePath("/partners");
  return { success: true };
}

export async function addInventoryItemAction(partnerId: string, productId: string, price: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("partner_inventory")
    .insert({ partner_id: partnerId, product_id: productId, price, quantity: 0 });

  if (error) return { error: "Ajout échoué." };
  revalidatePath("/partners");
  return { success: true };
}
