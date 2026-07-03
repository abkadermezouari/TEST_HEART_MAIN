import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WelcomeClient } from "./_components/WelcomeClient";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; error_description?: string }>;
}) {
  const params = await searchParams;

  // Supabase email confirmation redirects here with ?code=...
  if (params.code) {
    redirect(`/callback?code=${encodeURIComponent(params.code)}`);
  }

  if (params.error) {
    redirect(`/login?error=${encodeURIComponent(params.error_description ?? params.error)}`);
  }

  let user = null;

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // Auth check failed — show welcome screen anyway
  }

  if (user) {
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.role) {
        if (profile.role === "partner_admin") redirect("/partners");
        if (profile.role === "admin") redirect("/admin");
        redirect("/dashboard");
      }
    } catch {
      // Profile query failed — show welcome screen
    }
  }

  return (
    <main className="min-h-screen bg-[#f7fafa] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="material-symbols-outlined text-[#004f54] text-[32px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
          <span
            className="material-symbols-outlined text-[#004f54] text-[28px] -ml-4 mt-2"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
        </div>
        <h1 className="text-4xl font-bold text-[#004f54] tracking-tight">Smart Healthy</h1>
        <p className="text-sm text-[#6f797a]">Dietary Intelligence</p>
      </div>

      {/* Titre */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#181c1d]">Bienvenue sur Smart Healthy</h2>
        <p className="text-[#6f797a] mt-2">Comment souhaitez-vous vous connecter ?</p>
      </div>

      <WelcomeClient />
    </main>
  );
}
