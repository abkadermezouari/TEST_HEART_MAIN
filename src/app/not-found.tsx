import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fafa] px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-[#01696f]/10 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-[#01696f]">
            search_off
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#181c1d] mb-2">Page introuvable</h1>
        <p className="text-sm text-[#6f797a] mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-[#01696f] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity inline-block"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
