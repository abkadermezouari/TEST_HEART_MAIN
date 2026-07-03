"use client";

import { useState } from "react";
import { FileUpload } from "./FileUpload";
import { ImportPreview } from "./ImportPreview";
import { CatalogTable } from "./CatalogTable";
import { importCatalogAction } from "../_actions/catalog.action";

interface CatalogPanelProps {
  partnerId: string;
  catalogItems: {
    id: string;
    type: "product" | "recipe";
    name: string;
    data: Record<string, unknown>;
    is_published: boolean;
  }[];
}

type Step = "idle" | "preview";
type PreviewData = { rows: Record<string, string>[]; headers: string[]; catalogType: "product" | "recipe" };

export function CatalogPanel({ partnerId, catalogItems }: CatalogPanelProps) {
  const [step, setStep] = useState<Step>("idle");
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [catalogType, setCatalogType] = useState<"product" | "recipe">("product");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleFileParsed(rows: Record<string, string>[], headers: string[]) {
    setPreviewData({ rows, headers, catalogType });
    setStep("preview");
    setMessage(null);
  }

  async function handleSave(rows: Record<string, string>[]) {
    if (!previewData) return;
    setMessage(null);
    const result = await importCatalogAction({
      partnerId,
      catalogType: previewData.catalogType,
      rows,
    });
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else if (result.success) {
      setMessage({
        type: "success",
        text: `${result.imported} élément${result.imported > 1 ? "s" : ""} importé${result.imported > 1 ? "s" : ""}${result.skipped ? `, ${result.skipped} ignoré${result.skipped > 1 ? "s" : ""} (doublon)` : ""}`,
      });
      setStep("idle");
      setPreviewData(null);
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`text-sm font-bold p-3 rounded-lg ${
            message.type === "success"
              ? "bg-teal-50 text-teal-700 border border-teal-200"
              : "bg-red-50 text-[#ae2f34] border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Type selector + upload zone */}
      <div className="bg-white rounded-xl shadow-[0px_2px_4px_rgba(40,37,29,0.05)] border border-neutral-100 p-6">
        <h2 className="text-2xl font-bold text-[#181c1d] mb-4">Importer votre base de données</h2>

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setCatalogType("product")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              catalogType === "product"
                ? "bg-[#01696f] text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Produits
          </button>
          <button
            onClick={() => setCatalogType("recipe")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              catalogType === "recipe"
                ? "bg-[#01696f] text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Recettes
          </button>
        </div>

        {step === "idle" && <FileUpload onFileParsed={handleFileParsed} />}
        {step === "preview" && previewData && (
          <ImportPreview
            rows={previewData.rows}
            headers={previewData.headers}
            catalogType={previewData.catalogType}
            onSave={handleSave}
            onCancel={() => {
              setStep("idle");
              setPreviewData(null);
            }}
          />
        )}
      </div>

      {/* Existing imported items */}
      <div className="bg-white rounded-xl shadow-[0px_2px_4px_rgba(40,37,29,0.05)] border border-neutral-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#181c1d]">Catalogue importé</h2>
          <span className="text-sm text-neutral-500">
            {catalogItems.length} élément{catalogItems.length > 1 ? "s" : ""}
          </span>
        </div>
        <CatalogTable items={catalogItems} />
      </div>
    </div>
  );
}
