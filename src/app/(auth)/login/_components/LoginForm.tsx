"use client";

import { useTransition, useState } from "react";
import { loginAction } from "../_actions/login.action";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginAction({
        email: fd.get("email"),
        password: fd.get("password"),
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
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
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-xs font-semibold text-[#6f797a]" htmlFor="password">
            Mot de passe
          </label>
          <a className="text-xs font-semibold text-[#004f54] hover:underline" href="/forgot-password">
            Mot de passe oublié ?
          </a>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
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
        {isPending ? "Connexion…" : "Connexion"}
      </button>
    </form>
  );
}
