import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Routes accessibles sans authentification
const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/welcome",
  "/login-partner",
  "/magasin",
  "/forgot-password",
];
// Parmi les routes publiques, celles-ci redirigent les utilisateurs déjà connectés
const AUTH_REDIRECT_ROUTES = [
  "/login",
  "/register",
  "/welcome",
  "/login-partner",
];
const SETUP_ROUTES = ["/profile-setup-step-1", "/profile-setup-step-2"];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Obligatoire : rafraîchit la session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isSetup = SETUP_ROUTES.some((r) => pathname.startsWith(r));

  // Non connecté → /welcome
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    return NextResponse.redirect(url);
  }

  // Connecté sur page d'auth → redirection par rôle (/magasin reste accessible)
  if (user && AUTH_REDIRECT_ROUTES.some((r) => pathname.startsWith(r))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const url = request.nextUrl.clone();
    if (profile?.role === "partner_admin") {
      url.pathname = "/partners";
    } else if (profile?.role === "admin") {
      url.pathname = "/admin";
    } else {
      url.pathname = "/dashboard";
    }
    return NextResponse.redirect(url);
  }

  // Connecté + profil incomplet → setup
  // Exception : partner_admin n'a pas de profil santé à remplir
  if (user && !isPublic && !isSetup) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "partner_admin") {
      const { data: hp } = await supabase
        .from("user_health_profiles")
        .select("is_complete")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!hp?.is_complete) {
        const url = request.nextUrl.clone();
        url.pathname = "/profile-setup-step-1";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
