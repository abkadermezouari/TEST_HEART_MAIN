"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const gpsSchema = z.object({
  partnerId: z.string().uuid(),
  name: z.string().min(1),
  address_line: z.string().nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  phone: z.string().nullable(),
});

export async function updateGpsCoordinatesAction(input: unknown) {
  const parsed = gpsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { partnerId, name, address_line, latitude, longitude, phone } = parsed.data;

  const { error } = await supabase
    .from("partners")
    .update({ name, address_line, latitude, longitude, phone })
    .eq("id", partnerId)
    .eq("owner_id", user.id);

  if (error) return { error: "Erreur lors de la mise à jour." };

  revalidatePath("/partners");
  revalidatePath("/map");
  return { success: true };
}
