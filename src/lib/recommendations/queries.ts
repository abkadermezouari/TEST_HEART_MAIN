import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { scoreProduct, scoreRecipe, normalizeConditions, normalizeGoals } from "./scoring";
import { buildProductRecommendationReason, buildRecipeRecommendationReason } from "./reasons";
import type {
  ProductForRecommendations,
  RecipeForRecommendations,
  RecommendationContext,
  RecommendationResult,
  RecommendedProduct,
  RecommendedRecipe,
  RecommendationsBundle,
  HealthProfileForRecommendations,
} from "./types";

const PRODUCT_FIELDS =
  "id, category_id, name, brand, image_url, nutri_score, glycemic_index, labels, compatible_with, energy_kcal, carbs_g, sugars_g, fiber_g, protein_g, sodium_g";

const RECIPE_FIELDS =
  "id, title, description, image_url, prep_time_min, cook_time_min, difficulty, calories_kcal, diet_tags, compatible_with, is_published, is_featured";

const MIN_PRODUCT_SCORE = 35;
const MIN_RECIPE_SCORE = 35;

async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

type DBClient = Awaited<ReturnType<typeof getSupabase>>;

/* ── Diversité produits : max 2 par catégorie ───────────────────── */
function diversifyProducts(items: RecommendedProduct[], maxPerCategory = 2): RecommendedProduct[] {
  const counts = new Map<string, number>();
  const out: RecommendedProduct[] = [];
  const overflow: RecommendedProduct[] = [];
  for (const it of items) {
    const cat = it.product.category_id ?? "_uncat";
    const c = counts.get(cat) ?? 0;
    if (c < maxPerCategory) {
      out.push(it);
      counts.set(cat, c + 1);
    } else {
      overflow.push(it);
    }
  }
  return [...out, ...overflow];
}

/* ── Diversité recettes : max 2 par (difficulté × tranche-temps) ── */
function diversifyRecipes(items: RecommendedRecipe[]): RecommendedRecipe[] {
  const counts = new Map<string, number>();
  const out: RecommendedRecipe[] = [];
  const overflow: RecommendedRecipe[] = [];
  for (const it of items) {
    const t = (it.recipe.prep_time_min ?? 0) + (it.recipe.cook_time_min ?? 0);
    const bucket = t <= 20 ? "fast" : t <= 40 ? "med" : "long";
    const key = `${it.recipe.difficulty ?? "?"}::${bucket}`;
    const c = counts.get(key) ?? 0;
    if (c < 2) {
      out.push(it);
      counts.set(key, c + 1);
    } else {
      overflow.push(it);
    }
  }
  return [...out, ...overflow];
}

/* ── Contexte de scoring — un seul appel par page ───────────────── */

// DT-3 : userId est toujours string non-null depuis les fonctions publiques.
async function loadContext(
  supabase: DBClient,
  userId: string,
): Promise<{
  context: RecommendationContext;
  health: HealthProfileForRecommendations;
}> {
  // M-3 : bmr_kcal retiré de la sélection — jamais utilisé dans le scoring.
  const [healthRes, savedP, savedR, viewsRes, searchRes] = await Promise.all([
    supabase
      .from("user_health_profiles")
      .select("health_conditions, goals, tdee_kcal, activity_level, is_complete")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("user_saved_products").select("product_id").eq("user_id", userId),
    supabase.from("user_saved_recipes").select("recipe_id").eq("user_id", userId),
    supabase
      .from("partner_product_views")
      .select("product_id")
      .eq("user_id", userId)
      .order("viewed_at", { ascending: false })
      .limit(50),
    supabase
      .from("product_search_logs")
      .select("product_id")
      .eq("user_id", userId)
      .not("product_id", "is", null)
      .order("searched_at", { ascending: false })
      .limit(50),
  ]);

  const health = healthRes.data ?? null;
  const savedProductIds = new Set((savedP.data ?? []).map((r) => r.product_id));
  const savedRecipeIds = new Set((savedR.data ?? []).map((r) => r.recipe_id));
  const popularProductIds = new Set<string>();
  const affinityCategoryIds = new Set<string>();

  (viewsRes.data ?? []).forEach((r) => popularProductIds.add(r.product_id));
  (searchRes.data ?? []).forEach((r) => {
    if (r.product_id) popularProductIds.add(r.product_id);
  });

  if (popularProductIds.size > 0) {
    const { data: catRows } = await supabase
      .from("products")
      .select("category_id")
      .in("id", Array.from(popularProductIds))
      .not("category_id", "is", null);
    (catRows ?? []).forEach((r) => {
      if (r.category_id) affinityCategoryIds.add(r.category_id);
    });
  }

  // Fallback popularité globale si l'utilisateur n'a aucun signal personnel.
  if (popularProductIds.size === 0) {
    const { data: globalViews } = await supabase
      .from("partner_product_views")
      .select("product_id")
      .order("viewed_at", { ascending: false })
      .limit(50);
    (globalViews ?? []).forEach((r) => popularProductIds.add(r.product_id));
  }

  const conditions = normalizeConditions(health?.health_conditions);
  const goals = normalizeGoals(health?.goals);
  const hasProfile = Boolean(health?.is_complete);

  return {
    health,
    context: {
      conditions,
      goals,
      hasProfile,
      savedProductIds,
      savedRecipeIds,
      popularProductIds,
      affinityCategoryIds,
    },
  };
}

/* ── Scoring produits ─────────────────────────────────────────── */

function buildProductRecommendations(
  products: ProductForRecommendations[],
  context: RecommendationContext,
  limit: number,
): RecommendationResult<RecommendedProduct> {
  const scored: RecommendedProduct[] = [];

  for (const product of products) {
    if (context.savedProductIds.has(product.id)) continue;
    const breakdown = scoreProduct(product, context);
    if (breakdown.excluded) continue;
    // M-5 : recommendation_tags supprimé.
    scored.push({
      product,
      recommendation_score: Math.round(breakdown.total),
      recommendation_reason: buildProductRecommendationReason(product, breakdown, context),
    });
  }

  scored.sort((a, b) => b.recommendation_score - a.recommendation_score);

  const qualified = scored.filter((s) => s.recommendation_score >= MIN_PRODUCT_SCORE);
  const pool = qualified.length > 0 ? qualified : scored.slice(0, limit);
  const items = diversifyProducts(pool, 2).slice(0, limit);

  return {
    items,
    fallback: !context.hasProfile || qualified.length === 0,
    profileComplete: context.hasProfile,
  };
}

/* ── Scoring recettes ─────────────────────────────────────────── */

function buildRecipeRecommendations(
  recipes: RecipeForRecommendations[],
  context: RecommendationContext,
  tdee: number | null,
  limit: number,
): RecommendationResult<RecommendedRecipe> {
  const scored: RecommendedRecipe[] = [];

  for (const recipe of recipes) {
    if (context.savedRecipeIds.has(recipe.id)) continue;
    const breakdown = scoreRecipe(recipe, context, tdee);
    if (breakdown.excluded) continue;
    // M-5 : recommendation_tags supprimé.
    scored.push({
      recipe,
      recommendation_score: Math.round(breakdown.total),
      recommendation_reason: buildRecipeRecommendationReason(recipe, breakdown, context),
    });
  }

  scored.sort((a, b) => b.recommendation_score - a.recommendation_score);

  const qualified = scored.filter((s) => s.recommendation_score >= MIN_RECIPE_SCORE);
  const pool = qualified.length > 0 ? qualified : scored.slice(0, limit);
  const items = diversifyRecipes(pool).slice(0, limit);

  return {
    items,
    fallback: !context.hasProfile || qualified.length === 0,
    profileComplete: context.hasProfile,
  };
}

/* ── M-1 : Facade principale — un seul loadContext par page ─────── */

export async function getRecommendations(
  userId: string,
  productLimit = 6,
  recipeLimit = 4,
): Promise<RecommendationsBundle> {
  const supabase = await getSupabase();
  const { context, health } = await loadContext(supabase, userId);
  const tdee = health?.tdee_kcal ?? null;

  const [rawProducts, rawRecipes] = await Promise.all([
    supabase.from("products").select(PRODUCT_FIELDS).eq("is_published", true),
    supabase.from("recipes").select(RECIPE_FIELDS).eq("is_published", true),
  ]);

  return {
    products: buildProductRecommendations(
      (rawProducts.data ?? []) as ProductForRecommendations[],
      context,
      productLimit,
    ),
    recipes: buildRecipeRecommendations(
      (rawRecipes.data ?? []) as RecipeForRecommendations[],
      context,
      tdee,
      recipeLimit,
    ),
    savedProductCount: context.savedProductIds.size,
    savedRecipeCount: context.savedRecipeIds.size,
  };
}

/* ── Fonctions individuelles (conservées pour usage externe) ──── */

export async function getRecommendedProducts(
  userId: string,
  limit = 6,
): Promise<RecommendationResult<RecommendedProduct>> {
  return (await getRecommendations(userId, limit, 0)).products;
}

export async function getRecommendedRecipes(
  userId: string,
  limit = 4,
): Promise<RecommendationResult<RecommendedRecipe>> {
  return (await getRecommendations(userId, 0, limit)).recipes;
}

/* ── Tendances globales ───────────────────────────────────────── */

// TODO: V2 — utilisé pour le dashboard partenaire et la page analytics.
export async function getTrendingProducts(limit = 4): Promise<ProductForRecommendations[]> {
  const supabase = await getSupabase();

  const { data: views } = await supabase
    .from("partner_product_views")
    .select("product_id")
    .order("viewed_at", { ascending: false })
    .limit(200);

  const counts = new Map<string, number>();
  (views ?? []).forEach((v) => {
    counts.set(v.product_id, (counts.get(v.product_id) ?? 0) + 1);
  });

  const topIds = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topIds.length === 0) {
    const { data } = await supabase
      .from("products")
      .select(PRODUCT_FIELDS)
      .eq("is_published", true)
      .in("nutri_score", ["A", "B"])
      .limit(limit);
    return (data ?? []) as ProductForRecommendations[];
  }

  const { data: rows } = await supabase
    .from("products")
    .select(PRODUCT_FIELDS)
    .in("id", topIds)
    .eq("is_published", true);

  return ((rows ?? []).slice().sort((a, b) => {
    return (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0);
  })) as ProductForRecommendations[];
}

/* ── Résumé profil ────────────────────────────────────────────── */

// TODO: V2 — utilisé pour la page analytics et les insights utilisateur.
export async function getRecommendationSummary(userId: string): Promise<{
  profileComplete: boolean;
  conditions: string[];
  goals: string[];
}> {
  const supabase = await getSupabase();
  const { context } = await loadContext(supabase, userId);
  return {
    profileComplete: context.hasProfile,
    conditions: context.conditions,
    goals: context.goals,
  };
}
