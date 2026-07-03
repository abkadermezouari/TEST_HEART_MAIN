"use client";

interface ImportPreviewProps {
  rows: Record<string, string>[];
  headers: string[];
  catalogType: "product" | "recipe";
  onSave: (selectedRows: Record<string, string>[]) => Promise<void>;
  onCancel: () => void;
}

export function ImportPreview({
  rows,
  headers,
  catalogType,
  onSave,
  onCancel,
}: ImportPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#181c1d]">Aperçu de l&apos;import</h3>
          <p className="text-sm text-neutral-500">
            {rows.length} ligne{rows.length > 1 ? "s" : ""} détectée{rows.length > 1 ? "s" : ""}
            {" "}— Type : {catalogType === "product" ? "Produits" : "Recettes"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-neutral-500 hover:text-[#181c1d] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(rows)}
            className="bg-[#01696f] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#004f54] transition-colors"
          >
            Tout enregistrer
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-neutral-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-neutral-50 text-neutral-500 font-bold uppercase">
              <th className="px-4 py-3 w-8">#</th>
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.slice(0, 50).map((row, i) => (
              <tr key={i} className="hover:bg-teal-50/30">
                <td className="px-4 py-2 text-neutral-400">{i + 1}</td>
                {headers.map((h) => (
                  <td key={h} className="px-4 py-2 text-[#181c1d] max-w-[200px] truncate">
                    {row[h]}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length > 50 && (
              <tr>
                <td colSpan={headers.length + 1} className="px-4 py-3 text-center text-neutral-400">
                  ... et {rows.length - 50} autre{rows.length - 50 > 1 ? "s" : ""} ligne{rows.length - 50 > 1 ? "s" : ""}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
