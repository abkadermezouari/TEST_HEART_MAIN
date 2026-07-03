"use client";

import { useState, useTransition } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { PartnerRegisterForm } from "./PartnerRegisterForm";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "user" | "partner";

interface AuthTabsProps {
  mode?: AuthMode;
}

const isPartner = (m: AuthMode) => m === "partner";

export function AuthTabs({ mode = "user" }: AuthTabsProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const partner = isPartner(mode);
  const accent = partner ? "text-[#6e3815]" : "text-[#004f54]";
  const accentBg = partner ? "bg-[#6e3815] text-white" : "bg-[#004f54] text-white";
  const accentRing = partner ? "ring-[#6e3815]/30" : "ring-[#01696f]/30";
  const accentBorder = partner ? "border-[#6e3815]" : "border-[#01696f]";

  function handleGoogleSignIn() {
    setOauthError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/callback`,
        },
      });
      if (error) setOauthError("Connexion Google échouée. Réessayez.");
    });
  }

  return (
    <>
      {/* Tab Switcher */}
      <div className="flex bg-[#f1f4f4] p-1 rounded-lg mb-8">
        <button
          onClick={() => setTab("login")}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
            tab === "login"
              ? "bg-white shadow-sm " + accent
              : "text-[#6f797a] hover:text-[#181c1d]"
          }`}
        >
          Se connecter
        </button>
        <button
          onClick={() => setTab("register")}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
            tab === "register"
              ? "bg-white shadow-sm " + accent
              : "text-[#6f797a] hover:text-[#181c1d]"
          }`}
        >
          S&apos;inscrire
        </button>
      </div>

      {tab === "login" ? (
        partner ? (
          <PartnerLoginForm />
        ) : (
          <LoginForm />
        )
      ) : partner ? (
        <PartnerRegisterForm />
      ) : (
        <RegisterForm />
      )}

      {/* Google OAuth */}
      <div className="mt-6">
        <div className="relative flex items-center justify-center py-2">
          <div className="w-full border-t border-[#bec8c9]" />
          <span className="absolute px-4 bg-white text-xs font-semibold text-[#6f797a]">OU</span>
        </div>

        {oauthError && (
          <p role="alert" className="mt-3 text-sm text-[#ae2f34] bg-[#ae2f34]/5 border border-[#ae2f34]/20 rounded-lg px-4 py-2 text-center">
            {oauthError}
          </p>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={isPending}
          className="mt-4 w-full flex items-center justify-center gap-3 border border-[#bec8c9] py-3 px-6 rounded-lg text-sm font-semibold text-[#181c1d] hover:bg-[#f1f4f4] transition-all disabled:opacity-60"
          type="button"
        >
          {isPending ? (
            <span className="material-symbols-outlined text-lg" style={{ animation: "spin 1s linear infinite" }}>sync</span>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          {isPending ? "Redirection vers Google…" : "Continuer avec Google"}
        </button>
      </div>
    </>
  );
}

/* ── PartnerLoginForm intégré ici pour éviter une cascade d'imports ── */

import { partnerLoginAction } from "@/app/(auth)/login-partner/_actions/partner-login.action";
import { Eye, EyeOff } from "lucide-react";

function PartnerLoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await partnerLoginAction({
        store_name: fd.get("store_name"),
        email: fd.get("email"),
        password: fd.get("password"),
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div>
        <label className="block text-xs font-semibold text-[#6f797a] mb-2" htmlFor="store_name">
          Nom de votre magasin
        </label>
        <input
          id="store_name"
          name="store_name"
          type="text"
          required
          autoComplete="organization"
          className="w-full px-4 py-3 bg-[#f7fafa] border border-[#bec8c9] rounded-lg focus:ring-2 focus:ring-[#6e3815]/30 focus:border-[#6e3815] outline-none transition-all text-sm"
          placeholder="Ex: UNO Hypermarché"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#6f797a] mb-2" htmlFor="partner-email">
          Email professionnel
        </label>
        <input
          id="partner-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-4 py-3 bg-[#f7fafa] border border-[#bec8c9] rounded-lg focus:ring-2 focus:ring-[#6e3815]/30 focus:border-[#6e3815] outline-none transition-all text-sm"
          placeholder="contact@votremagasin.com"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-semibold text-[#6f797a]" htmlFor="partner-password">
            Mot de passe
          </label>
          <a className="text-xs font-semibold text-[#6e3815] hover:underline" href="/forgot-password">
            Mot de passe oublié ?
          </a>
        </div>
        <div className="relative">
          <input
            id="partner-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 bg-[#f7fafa] border border-[#bec8c9] rounded-lg focus:ring-2 focus:ring-[#6e3815]/30 focus:border-[#6e3815] outline-none transition-all text-sm pr-10"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6f797a] hover:text-[#181c1d]"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-[#ae2f34] bg-[#ae2f34]/5 border border-[#ae2f34]/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#6e3815] text-white py-3 px-6 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
      >
        {isPending ? "Connexion…" : "Se connecter en tant que partenaire"}
      </button>
    </form>
  );
}
