import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  let user = null;

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    redirect("/welcome");
  }

  if (!user) redirect("/welcome");

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "partner_admin") redirect("/partners");
    if (profile?.role === "admin") redirect("/admin");
    redirect("/dashboard");
  } catch {
    redirect("/welcome");
  }
}
