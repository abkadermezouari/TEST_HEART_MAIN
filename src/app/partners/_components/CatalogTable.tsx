"use client";

import { useState } from "react";
import { publishCatalogAction, deleteCatalogItemAction } from "../_actions/catalog.action";

interface CatalogRow {
  id: string;
  type: "product" | "recipe";
  name: string;
  data: Record<string, unknown>;
  is_published: boolean;
}

interface CatalogTableProps {
  items: CatalogRow[];
}

export function CatalogTable({ items: initialItems }: CatalogTableProps) {
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleTogglePublish(itemId: string, currentPublished: boolean) {
    setPublishing(true);
    setMessage(null);
    const result = await publishCatalogAction({
      itemId,
      is_published: !currentPublished,
    });
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemId ? { ...it, is_published: !currentPublished } : it,
        ),
      );
    }
    setPublishing(false);
  }

  async function handleDelete(itemId: string) {
    setDeleting(itemId);
    setMessage(null);
    const result = await deleteCatalogItemAction(itemId);
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setItems((prev) => prev.filter((it) => it.id !== itemId));
    }
    setDeleting(null);
  }

  if (items.length === 0) {
    return (
      <div className="p-16 text-center text-neutral-400">
        <span className="material-symbols-outlined text-5xl mb-3 block text-neutral-300">inventory_2</span>
        <p className="font-semibold">Aucun élément importé.</p>
        <p className="text-sm mt-1">Importez un fichier CSV ou Excel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50">
              <th className="px-6 py-4">Nom</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-teal-50/30">
                <td className="px-6 py-4">
                  <span className="font-bold text-sm">{item.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-neutral-100 text-neutral-600 text-[10px] font-bold px-2 py-1 rounded-full">
                    {item.type === "product" ? "Produit" : "Recette"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      checked={item.is_published}
                      onChange={() => handleTogglePublish(item.id, item.is_published)}
                      disabled={publishing}
                      className="sr-only peer"
                      type="checkbox"
                    />
                    <div className="w-9 h-5 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
                  </label>
                  <span className="ml-2 text-xs text-neutral-500">
                    {item.is_published ? "Publié" : "Brouillon"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="p-1 hover:bg-red-50 rounded text-red-400 disabled:opacity-40 transition-colors"
                    title="Supprimer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {deleting === item.id ? "sync" : "delete"}
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
