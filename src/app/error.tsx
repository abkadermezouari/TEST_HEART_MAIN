"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fafa] px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-[#ae2f34]/10 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-[#ae2f34]">
            error
          </span>
        </div>
        <h1 className="text-2xl font-bold text-[#181c1d] mb-2">Une erreur est survenue</h1>
        <p className="text-sm text-[#6f797a] mb-8">
          {error.message || "Une erreur inattendue s&apos;est produite. Veuillez réessayer."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#01696f] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
