import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const origin = requestUrl.origin;

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_user`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const isPartnerAdmin = profile?.role === "partner_admin";

  // Pour les partner_admin, vérifier qu'un partenaire existe bien
  if (isPartnerAdmin) {
    const { data: partner } = await supabase
      .from("partners")
      .select("id, is_active")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!partner) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        `${origin}/login-partner?error=${encodeURIComponent("Aucun magasin associé. Contactez le support.")}`
      );
    }

    if (!partner.is_active) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        `${origin}/login-partner?error=${encodeURIComponent("Votre magasin a été désactivé.")}`
      );
    }
  }

  const destination = isPartnerAdmin
    ? "/partners"
    : profile?.role === "admin"
    ? "/admin"
    : "/dashboard";

  return NextResponse.redirect(`${origin}${destination}`);
}
