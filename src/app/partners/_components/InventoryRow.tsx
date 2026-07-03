"use client";

import Image from "next/image";
import { useState } from "react";
import { updateInventoryItemAction } from "../_actions/inventory.action";

export interface InventoryItem {
  id: string;
  price: number;
  quantity: number;
  is_available: boolean;
  products: {
    name: string;
    image_url: string | null;
    product_categories: { name: string } | null;
  } | null;
}

export function InventoryRow({ item, isOdd }: { item: InventoryItem; isOdd: boolean }) {
  const [price, setPrice] = useState(String(item.price));
  const [qty, setQty] = useState(String(item.quantity));
  const [available, setAvailable] = useState(item.is_available);
  const [saving, setSaving] = useState(false);

  async function persist(overrides?: { is_available?: boolean }) {
    setSaving(true);
    await updateInventoryItemAction({
      inventoryId: item.id,
      price: Number(price),
      quantity: Number(qty),
      is_available: overrides?.is_available ?? available,
    });
    setSaving(false);
  }

  const isLowStock = Number(qty) < 10;

  return (
    <tr className={`hover:bg-teal-50/30 transition-colors ${isOdd ? "bg-[#f1f4f4]" : ""}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {item.products?.image_url ? (
            <Image
              width={40}
              height={40}
              alt={item.products.name}
              className="rounded-lg object-cover"
              src={item.products.image_url}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm text-neutral-400">inventory_2</span>
            </div>
          )}
          <span className="font-bold text-sm">{item.products?.name ?? "—"}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="bg-neutral-100 text-neutral-600 text-[10px] font-bold px-2 py-1 rounded-full">
          {item.products?.product_categories?.name ?? "—"}
        </span>
      </td>
      <td className="px-6 py-4">
        <input
          className="w-20 bg-transparent border-none p-0 text-sm font-bold focus:ring-0 outline-none"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={() => persist()}
          type="text"
        />
      </td>
      <td className="px-6 py-4">
        <input
          className={`w-16 bg-transparent border-none p-0 text-sm font-bold focus:ring-0 outline-none ${isLowStock ? "text-[#ae2f34]" : ""}`}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          onBlur={() => persist()}
          type="number"
          min="0"
        />
      </td>
      <td className="px-6 py-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            checked={available}
            onChange={async (e) => {
              const next = e.target.checked;
              setAvailable(next);
              await persist({ is_available: next });
            }}
            className="sr-only peer"
            type="checkbox"
          />
          <div className="w-9 h-5 bg-neutral-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
        </label>
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={() => persist()}
          disabled={saving}
          title="Enregistrer"
          className="p-1 hover:bg-neutral-100 rounded text-neutral-400 disabled:opacity-40 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">
            {saving ? "sync" : "save"}
          </span>
        </button>
      </td>
    </tr>
  );
}
