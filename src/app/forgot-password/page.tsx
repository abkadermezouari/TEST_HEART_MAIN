"use client";

import { useTransition, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    startTransition(async () => {
      const supabase = createClient();
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (err) {
        setError("Une erreur est survenue. Vérifiez votre email et réessayez.");
      } else {
        setMessage("Un lien de réinitialisation a été envoyé à votre adresse email.");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fafa] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#bec8c9] p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#01696f] flex items-center justify-center text-white mx-auto mb-4">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock_reset
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#181c1d]">Mot de passe oublié</h1>
          <p className="text-sm text-[#6f797a] mt-2">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {message ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-800 font-semibold">{message}</p>
            <Link
              href="/login"
              className="block mt-4 text-sm font-semibold text-[#004f54] hover:underline text-center"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#6f797a] mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-[#f7fafa] border border-[#bec8c9] rounded-lg focus:ring-2 focus:ring-[#01696f]/30 focus:border-[#01696f] outline-none transition-all text-sm"
                placeholder="votre@email.com"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-[#ae2f34] bg-[#ae2f34]/5 border border-[#ae2f34]/20 rounded-lg px-4 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#01696f] text-white py-3 px-6 rounded-lg text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isPending ? "Envoi en cours…" : "Envoyer le lien"}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm font-semibold text-[#004f54] hover:underline"
              >
                Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
