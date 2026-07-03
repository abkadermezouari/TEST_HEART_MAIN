"use client";

import { useTransition, useState } from "react";
import { registerAction } from "../_actions/register.action";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await registerAction({
        full_name: fd.get("full_name"),
        email: fd.get("email"),
        password: fd.get("password"),
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div>
        <label className="block text-xs font-semibold text-[#6f797a] mb-2" htmlFor="full_name">
          Prénom &amp; Nom
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          autoComplete="name"
          className="w-full px-4 py-3 bg-[#f7fafa] border border-[#bec8c9] rounded-lg focus:ring-2 focus:ring-[#01696f]/30 focus:border-[#01696f] outline-none transition-all text-sm"
          placeholder="Marie Dupont"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#6f797a] mb-2" htmlFor="reg-email">
          Email
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-4 py-3 bg-[#f7fafa] border border-[#bec8c9] rounded-lg focus:ring-2 focus:ring-[#01696f]/30 focus:border-[#01696f] outline-none transition-all text-sm"
          placeholder="votre@email.com"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#6f797a] mb-2" htmlFor="reg-password">
          Mot de passe
        </label>
        <input
          id="reg-password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="w-full px-4 py-3 bg-[#f7fafa] border border-[#bec8c9] rounded-lg focus:ring-2 focus:ring-[#01696f]/30 focus:border-[#01696f] outline-none transition-all text-sm"
          placeholder="Minimum 8 caractères"
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
        {isPending ? "Création du compte…" : "Créer mon compte"}
      </button>
    </form>
  );
}
