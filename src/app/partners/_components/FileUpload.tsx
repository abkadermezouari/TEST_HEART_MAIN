"use client";

import { useState, useRef, useCallback } from "react";

interface FileUploadProps {
  onFileParsed: (rows: Record<string, string>[], headers: string[]) => void;
}

export function FileUpload({ onFileParsed }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parseFile = useCallback(
    async (file: File) => {
      setError(null);
      setLoading(true);
      try {
        if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
          setError("Format non supporté. Utilisez un fichier .csv ou .xlsx");
          setLoading(false);
          return;
        }

        let rows: Record<string, string>[];
        let headers: string[];

        if (file.name.endsWith(".csv")) {
          const text = await file.text();
          const lines = text.split("\n").filter((l) => l.trim());
          headers = lines[0].split(",").map((h) => h.trim().replace(/^"(.*)"$/, "$1"));
          rows = lines.slice(1).map((line) => {
            const values = line.split(",").map((v) => v.trim().replace(/^"(.*)"$/, "$1"));
            const row: Record<string, string> = {};
            headers.forEach((h, i) => {
              row[h] = values[i] ?? "";
            });
            return row;
          });
        } else {
          const XLSX = await import("xlsx");
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

          if (json.length === 0) {
            setError("Fichier vide.");
            setLoading(false);
            return;
          }

          headers = json[0].map((h) => String(h));
          rows = json.slice(1).map((row) => {
            const obj: Record<string, string> = {};
            headers.forEach((h, i) => {
              obj[h] = row[i] != null ? String(row[i]) : "";
            });
            return obj;
          });
        }

        if (rows.length === 0) {
          setError("Aucune ligne de données trouvée.");
          setLoading(false);
          return;
        }

        onFileParsed(rows, headers);
      } catch {
        setError("Erreur lors de la lecture du fichier.");
      } finally {
        setLoading(false);
      }
    },
    [onFileParsed],
  );

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver ? "border-[#01696f] bg-teal-50" : "border-neutral-200"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) parseFile(file);
        }}
      >
        <span className="material-symbols-outlined text-4xl text-neutral-300 mb-3 block">
          {dragOver ? "file_open" : "cloud_upload"}
        </span>
        <p className="text-sm font-bold text-[#181c1d] mb-1">
          Glissez-déposez votre fichier ici
        </p>
        <p className="text-xs text-neutral-500 mb-4">CSV ou Excel (.csv, .xlsx, .xls)</p>
        <button
          onClick={() => inputRef.current?.click()}
          className="bg-[#01696f] text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-[#004f54] transition-colors"
          disabled={loading}
        >
          {loading ? "Lecture en cours..." : "Importer un fichier"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) parseFile(file);
          }}
        />
      </div>
      {error && (
        <p className="text-sm text-[#ae2f34] bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
      )}
    </div>
  );
}
