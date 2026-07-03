export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7fafa]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#01696f] border-t-transparent animate-spin" />
        <p className="text-sm text-[#6f797a] font-semibold">Chargement…</p>
      </div>
    </div>
  );
}
