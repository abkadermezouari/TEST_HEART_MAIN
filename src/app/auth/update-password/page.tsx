"use client";

import { useTransition, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [hasHash, setHasHash] = useState(false);

  useEffect(() => {
    if (window.location.hash) setHasHash(true);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    startTransition(async () => {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError("Erreur lors de la mise à jour. Le lien a peut-être expiré.");
      } else {
        router.push("/dashboard");
      }
    });
  }

  if (!hasHash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7fafa] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#bec8c9] p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 mx-auto mb-4">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#181c1d] mb-2">Lien invalide</h1>
          <p className="text-sm text-[#6f797a]">
            Ce lien de réinitialisation n&apos;est pas valide. Demandez un nouveau lien.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fafa] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#bec8c9] p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#01696f] flex items-center justify-center text-white mx-auto mb-4">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#181c1d]">Nouveau mot de passe</h1>
          <p className="text-sm text-[#6f797a] mt-2">
            Choisissez un nouveau mot de passe.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#6f797a] mb-2" htmlFor="password">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-4 py-3 bg-[#f7fafa] border border-[#bec8c9] rounded-lg focus:ring-2 focus:ring-[#01696f]/30 focus:border-[#01696f] outline-none transition-all text-sm"
              placeholder="••••••••"
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
            {isPending ? "Mise à jour…" : "Mettre à jour le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
