"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function toggleSavedRecipeAction(recipeId: string, currentlySaved: boolean) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  if (currentlySaved) {
    await supabase
      .from("user_saved_recipes")
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", recipeId);
  } else {
    await supabase
      .from("user_saved_recipes")
      .insert({ user_id: user.id, recipe_id: recipeId });
  }

  revalidatePath("/recipes");
  return { saved: !currentlySaved };
}
