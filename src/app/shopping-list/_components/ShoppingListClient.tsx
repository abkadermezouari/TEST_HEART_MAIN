"use client";

import { useState, useTransition } from "react";
import {
  addItemAction,
  toggleItemCheckedAction,
  updateItemQuantityAction,
  removeItemAction,
  clearCheckedAction,
} from "../_actions/shopping-list.action";

interface ShoppingItem {
  id: string;
  product_name: string;
  product_id: string | null;
  quantity: number;
  is_checked: boolean;
}

interface ShoppingListClientProps {
  listId: string;
  initialItems: ShoppingItem[];
}

export function ShoppingListClient({ listId, initialItems }: ShoppingListClientProps) {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState("");
  const [isPending, startTransition] = useTransition();

  const unchecked = items.filter((i) => !i.is_checked);
  const checked = items.filter((i) => i.is_checked);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = newItem.trim();
    if (!name) return;

    const optimistic: ShoppingItem = {
      id: `temp-${Date.now()}`,
      product_name: name,
      product_id: null,
      quantity: 1,
      is_checked: false,
    };
    setItems((prev) => [optimistic, ...prev]);
    setNewItem("");
    startTransition(async () => {
      await addItemAction({ productName: name });
    });
  }

  function handleToggle(itemId: string, isChecked: boolean) {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, is_checked: !isChecked } : it))
    );
    startTransition(() => { void toggleItemCheckedAction(itemId, isChecked); });
  }

  function handleRemove(itemId: string) {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    startTransition(() => { void removeItemAction(itemId); });
  }

  function handleQuantityDelta(itemId: string, delta: number) {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, quantity: newQty } : it))
    );
    startTransition(() => { void updateItemQuantityAction(itemId, newQty); });
  }

  function handleClearChecked() {
    setItems((prev) => prev.filter((it) => !it.is_checked));
    startTransition(() => { void clearCheckedAction(listId); });
  }

  return (
    <div className="space-y-6">
      {/* Formulaire d'ajout */}
      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Ajouter un article… (ex : Avoine 500g)"
          className="flex-1 bg-white border border-[#bec8c9] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#004f54]/20 focus:border-[#004f54] outline-none"
        />
        <button
          type="submit"
          disabled={!newItem.trim() || isPending}
          className="bg-[#004f54] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 transition-all"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Ajouter
        </button>
      </form>

      {/* Articles à acheter */}
      {unchecked.length > 0 && (
        <div className="bg-white rounded-xl custom-shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h3 className="font-semibold text-[#181c1d]">
              À acheter{" "}
              <span className="text-sm font-normal text-[#6f797a]">
                ({unchecked.length})
              </span>
            </h3>
          </div>
          <ul className="divide-y divide-neutral-100">
            {unchecked.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={() => handleToggle(item.id, item.is_checked)}
                onQuantityDelta={(d) => handleQuantityDelta(item.id, d)}
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Articles cochés */}
      {checked.length > 0 && (
        <div className="bg-white rounded-xl custom-shadow overflow-hidden opacity-80">
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="font-semibold text-[#181c1d]">
              Dans le panier{" "}
              <span className="text-sm font-normal text-[#6f797a]">({checked.length})</span>
            </h3>
            <button
              onClick={handleClearChecked}
              className="text-xs font-semibold text-[#ae2f34] hover:underline"
            >
              Supprimer tout
            </button>
          </div>
          <ul className="divide-y divide-neutral-100">
            {checked.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={() => handleToggle(item.id, item.is_checked)}
                onQuantityDelta={(d) => handleQuantityDelta(item.id, d)}
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Liste vide */}
      {items.length === 0 && (
        <div className="bg-white rounded-xl custom-shadow p-16 text-center">
          <span className="material-symbols-outlined text-5xl mb-3 block text-neutral-300">
            shopping_cart
          </span>
          <p className="font-semibold text-[#181c1d]">Liste vide</p>
          <p className="text-sm text-[#6f797a] mt-1">Ajoutez vos articles ci-dessus.</p>
        </div>
      )}
    </div>
  );
}

/* ── Ligne d'article ─────────────────────────────────────────── */
function ItemRow({
  item,
  onToggle,
  onQuantityDelta,
  onRemove,
}: {
  item: ShoppingItem;
  onToggle: () => void;
  onQuantityDelta: (delta: number) => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center gap-4 px-6 py-3 hover:bg-neutral-50 transition-colors">
      {/* Checkbox */}
      <button onClick={onToggle} className="shrink-0" aria-label="Cocher l'article">
        <span
          className={`material-symbols-outlined text-2xl transition-colors ${
            item.is_checked ? "text-[#004f54]" : "text-neutral-300"
          }`}
          style={{ fontVariationSettings: item.is_checked ? "'FILL' 1" : "'FILL' 0" }}
        >
          check_circle
        </span>
      </button>

      {/* Nom */}
      <span
        className={`flex-1 text-sm font-medium transition-colors ${
          item.is_checked ? "line-through text-[#6f797a]" : "text-[#181c1d]"
        }`}
      >
        {item.product_name}
      </span>

      {/* Quantité */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onQuantityDelta(-1)}
          className="w-7 h-7 rounded-full border border-[#bec8c9] flex items-center justify-center text-[#6f797a] hover:border-[#004f54] hover:text-[#004f54] transition-colors"
          aria-label="Diminuer la quantité"
        >
          <span className="material-symbols-outlined text-sm">remove</span>
        </button>
        <span className="w-8 text-center text-sm font-semibold text-[#181c1d]">
          {item.quantity}
        </span>
        <button
          onClick={() => onQuantityDelta(1)}
          className="w-7 h-7 rounded-full border border-[#bec8c9] flex items-center justify-center text-[#6f797a] hover:border-[#004f54] hover:text-[#004f54] transition-colors"
          aria-label="Augmenter la quantité"
        >
          <span className="material-symbols-outlined text-sm">add</span>
        </button>
      </div>

      {/* Supprimer */}
      <button
        onClick={onRemove}
        className="shrink-0 p-1 text-neutral-300 hover:text-[#ae2f34] transition-colors"
        aria-label="Supprimer l'article"
      >
        <span className="material-symbols-outlined text-lg">delete</span>
      </button>
    </li>
  );
}
