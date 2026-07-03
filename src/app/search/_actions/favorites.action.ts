"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function toggleSavedProductAction(productId: string, currentlySaved: boolean) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  if (currentlySaved) {
    await supabase
      .from("user_saved_products")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
  } else {
    await supabase
      .from("user_saved_products")
      .insert({ user_id: user.id, product_id: productId });
  }

  revalidatePath("/search");
  revalidatePath(`/search/${productId}`);
  return { saved: !currentlySaved };
}

export async function addToShoppingListAction(productId: string, productName: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  // Récupérer ou créer la liste active
  let { data: list } = await supabase
    .from("shopping_lists")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();

  if (!list) {
    const { data: newList } = await supabase
      .from("shopping_lists")
      .insert({ user_id: user.id })
      .select("id")
      .single();
    list = newList;
  }

  if (!list) return { error: "Impossible de créer la liste." };

  // Incrémenter si déjà dans la liste, sinon ajouter
  const { data: existing } = await supabase
    .from("shopping_list_items")
    .select("id, quantity")
    .eq("shopping_list_id", list.id)
    .eq("product_id", productId)
    .single();

  if (existing) {
    await supabase
      .from("shopping_list_items")
      .update({ quantity: existing.quantity + 1 })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("shopping_list_items")
      .insert({ shopping_list_id: list.id, product_id: productId, product_name: productName });
  }

  revalidatePath("/search");
  return { success: true };
}
