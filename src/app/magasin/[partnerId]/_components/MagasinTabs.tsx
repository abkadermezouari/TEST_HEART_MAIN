"use client";

import { useState } from "react";

interface CatalogItem {
  id: string;
  name: string;
  type: string;
  data: Record<string, string>;
}

export function MagasinTabs({
  products,
  recipes,
  partnerName,
}: {
  products: CatalogItem[];
  recipes: CatalogItem[];
  partnerName: string;
}) {
  const [tab, setTab] = useState<"products" | "recipes">("products");

  const activeItems = tab === "products" ? products : recipes;

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setTab("products")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            tab === "products"
              ? "bg-[#01696f] text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          Produits
          <span
            className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
              tab === "products" ? "bg-white/20" : "bg-neutral-200"
            }`}
          >
            {products.length}
          </span>
        </button>
        <button
          onClick={() => setTab("recipes")}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            tab === "recipes"
              ? "bg-[#01696f] text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          Recettes
          <span
            className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
              tab === "recipes" ? "bg-white/20" : "bg-neutral-200"
            }`}
          >
            {recipes.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {tab === "products" && products.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <span className="material-symbols-outlined text-5xl mb-3 block text-neutral-300">
            inventory_2
          </span>
          <p className="font-semibold">Aucun produit publié pour le moment.</p>
          <p className="text-sm mt-1">
            Revenez plus tard pour découvrir le catalogue de {partnerName}.
          </p>
        </div>
      ) : tab === "products" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((item) => renderProductCard(item))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <span className="material-symbols-outlined text-5xl mb-3 block text-neutral-300">
            menu_book
          </span>
          <p className="font-semibold">Aucune recette publiée pour le moment.</p>
          <p className="text-sm mt-1">
            Revenez plus tard pour découvrir les recettes de {partnerName}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((item) => renderRecipeCard(item))}
        </div>
      )}
    </>
  );
}

function renderProductCard(item: CatalogItem) {
  const d = item.data;
  const price = d["prix"] ?? d["price"] ?? d["Prix"] ?? d["PRICE"];
  const category = d["catégorie"] ?? d["categorie"] ?? d["category"] ?? d["Catégorie"];
  const description = d["description"] ?? d["Description"] ?? d["DESCRIPTION"];

  return (
    <div
      key={item.id}
      className="bg-white p-5 rounded-xl shadow-sm border border-neutral-100 hover:border-[#01696f]/20 hover:shadow-md transition-all"
    >
      <h3 className="font-bold text-[#181c1d] mb-2">{item.name}</h3>
      {category && (
        <span className="inline-block bg-neutral-100 text-neutral-600 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
          {category}
        </span>
      )}
      {description && (
        <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{description}</p>
      )}
      {price && (
        <p className="text-lg font-bold text-[#01696f]">{price} DZD</p>
      )}
      <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-1">
        {Object.entries(d)
          .filter(
            ([k]) =>
              !["nom", "name"].includes(k.toLowerCase()) &&
              k.toLowerCase() !== (typeof price === "string" ? "prix" : "price") &&
              k.toLowerCase() !== "catégorie" &&
              k.toLowerCase() !== "categorie" &&
              k.toLowerCase() !== "category" &&
              k.toLowerCase() !== "description"
          )
          .slice(0, 4)
          .map(([key, value]) => (
            <div key={key} className="text-xs">
              <span className="text-neutral-400">{key}</span>
              <p className="font-bold text-[#181c1d] truncate">{value}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

function renderRecipeCard(item: CatalogItem) {
  const d = item.data;
  const prepTime = d["temps_preparation"] ?? d["prep_time"] ?? d["Temps de préparation"];
  const cookTime = d["temps_cuisson"] ?? d["cook_time"] ?? d["Temps de cuisson"];
  const servings = d["portions"] ?? d["servings"] ?? d["Portions"];
  const description = d["description"] ?? d["Description"];

  return (
    <div
      key={item.id}
      className="bg-white p-5 rounded-xl shadow-sm border border-neutral-100 hover:border-[#01696f]/20 hover:shadow-md transition-all"
    >
      <h3 className="font-bold text-[#181c1d] mb-2">{item.name}</h3>
      {description && (
        <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{description}</p>
      )}
      <div className="flex items-center gap-4 text-xs text-neutral-500">
        {prepTime && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">timer</span>
            {prepTime}
          </span>
        )}
        {cookTime && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">cooking</span>
            {cookTime}
          </span>
        )}
        {servings && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">person</span>
            {servings}
          </span>
        )}
      </div>
      <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-1">
        {Object.entries(d)
          .filter(
            ([k]) =>
              !["nom", "name", "titre", "title"].includes(k.toLowerCase()) &&
              k.toLowerCase() !== "description" &&
              k.toLowerCase() !== (typeof prepTime === "string" ? "temps_preparation" : "prep_time") &&
              k.toLowerCase() !== (typeof cookTime === "string" ? "temps_cuisson" : "cook_time") &&
              k.toLowerCase() !== (typeof servings === "string" ? "portions" : "servings")
          )
          .slice(0, 4)
          .map(([key, value]) => (
            <div key={key} className="text-xs">
              <span className="text-neutral-400">{key}</span>
              <p className="font-bold text-[#181c1d] truncate">{value}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
