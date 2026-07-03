"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const promoteSchema = z.object({
  userId: z.string().uuid(),
});

export async function promoteToAdminAction(input: unknown) {
  const parsed = promoteSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { error } = await admin
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", parsed.data.userId);

  if (error) return { error: "Erreur lors de la promotion." };
  revalidatePath("/admin");
  return { success: true };
}
