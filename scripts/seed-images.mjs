// Script exécutable une seule fois : met à jour les image_url produits et recettes
// Lancer avec : node scripts/seed-images.mjs

import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// ── Charger .env.local ────────────────────────────────────────
const envPath = resolve(process.cwd(), ".env.local");
const envLines = readFileSync(envPath, "utf-8").split("\n");
const env = {};
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Mises à jour produits ─────────────────────────────────────
const productUpdates = [
  { filter: "name.ilike.%lentill%",       url: "https://images.unsplash.com/photo-1612257999756-c9e4da1b1e99?w=400" },
  { filter: "name.ilike.%pois chich%",    url: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=400" },
  { filter: "name.ilike.%riz%",           url: "https://images.unsplash.com/photo-1536304993881-ff86e0c9c7ce?w=400" },
  { filter: "name.ilike.%pain%",          url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" },
  { filter: "name.ilike.%flocon%,name.ilike.%avoine%", url: "https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=400" },
  { filter: "name.ilike.%yaourt%",        url: "https://images.unsplash.com/photo-1571212515416-fca988083d3c?w=400" },
  { filter: "name.ilike.%fromage blanc%", url: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a318?w=400" },
  { filter: "name.ilike.%carott%",        url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400" },
  { filter: "name.ilike.%avocat%",        url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400" },
  { filter: "name.ilike.%pomm%",          url: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400" },
  { filter: "name.ilike.%eau min%",       url: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400" },
  { filter: "name.ilike.%miel%",          url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400" },
];

// ── Mises à jour recettes (titres réels en base) ─────────────
const recipeUpdates = [
  { title: "Salade healthy algérienne",       url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400" },
  { title: "Couscous léger diabétique",       url: "https://images.unsplash.com/photo-1584277261846-c6a1672ed979?w=400" },
  { title: "Pâtes sans gluten aux légumes",   url: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400" },
];

async function run() {
  console.log("🚀 Mise à jour des images produits...");
  for (const { filter, url } of productUpdates) {
    const { error, count } = await supabase
      .from("products")
      .update({ image_url: url }, { count: "estimated" })
      .or(filter);
    if (error) console.error(`  ✗ [${filter}]`, error.message);
    else console.log(`  ✓ ${count ?? "?"} produit(s) mis à jour — ${filter}`);
  }

  // Lire les recettes existantes pour mapper par titre réel
  console.log("\n🚀 Lecture des recettes en base...");
  const { data: recipes, error: fetchErr } = await supabase
    .from("recipes")
    .select("id, title");
  if (fetchErr) { console.error("  ✗ Impossible de lire les recettes:", fetchErr.message); return; }
  console.log("  Recettes trouvées :", recipes.map((r) => `"${r.title}"`).join(", "));

  console.log("\n🚀 Mise à jour des images recettes...");
  for (const { title, url } of recipeUpdates) {
    // Matching souple : cherche si la recette en base contient les mots-clés du titre cible
    const keywords = title.toLowerCase().replace(/[àâä]/g, "a").replace(/[éèêë]/g, "e").replace(/[îï]/g, "i").replace(/[ôö]/g, "o").replace(/[ùûü]/g, "u").split(/\s+/).filter((w) => w.length > 3);
    const match = recipes.find((r) => {
      const norm = r.title.toLowerCase().replace(/[àâä]/g, "a").replace(/[éèêë]/g, "e").replace(/[îï]/g, "i").replace(/[ôö]/g, "o").replace(/[ùûü]/g, "u");
      return keywords.some((kw) => norm.includes(kw));
    });
    if (!match) { console.log(`  ⚠ Aucune recette trouvée pour "${title}"`); continue; }
    const { error, count } = await supabase
      .from("recipes")
      .update({ image_url: url }, { count: "estimated" })
      .eq("id", match.id);
    if (error) console.error(`  ✗ "${match.title}"`, error.message);
    else console.log(`  ✓ Recette mise à jour — "${match.title}"`);
  }

  console.log("\n✅ Terminé.");
}

run().catch(console.error);
