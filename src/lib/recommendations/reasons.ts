import type {
  RecipeForRecommendations,
  RecommendationContext,
  RecommendationReason,
  ScoreBreakdown,
} from "./types";

/* ── Dictionnaires signaux → libellé court (tags secondaires) ── */

const PRODUCT_TAG_LABELS: Record<string, string> = {
  gi_excellent: "IG très bas",
  gi_good: "IG bas",
  // UX-3 : gi_medium supprimé — "IG modéré" peut induire en erreur pour diabétiques.
  fiber_high: "Riche en fibres",
  fiber_good: "Source de fibres",
  nutri_a: "Nutri-Score A",
  nutri_b: "Nutri-Score B",
  label_sans_gluten: "Sans gluten",
  label_bio: "Bio",
  label_vegan: "Vegan",
  // UX-2 : "popular" géré dynamiquement selon le profil (voir buildProductRecommendationReason).
  popular: "Populaire",
};

const RECIPE_TAG_LABELS: Record<string, string> = {
  low_gi: "IG bas",
  fiber_rich: "Riche en fibres",
  easy: "Facile",
  featured: "À la une",
  calories_balanced: "Apport équilibré",
  calories_light: "Léger",
};

/* ── Conditions médicales qui rendent le tag "Populaire" trompeur ── */
const MEDICAL_CONDITIONS = new Set(["diabetic", "celiac", "cardiovascular"]);

function hasMedicalCondition(context: RecommendationContext): boolean {
  return context.conditions.some((c) => MEDICAL_CONDITIONS.has(c));
}

/* ── Sélection de la raison primaire — une seule, jamais vide ── */

function pickPrimaryProductReason(
  breakdown: ScoreBreakdown,
  context: RecommendationContext,
): string {
  const sig = breakdown.signals;
  const has = (s: string) => sig.includes(s);

  if (!context.hasProfile) {
    if (has("nutri_a")) return "Nutri-Score A";
    if (has("nutri_b")) return "Bon profil nutritionnel";
    if (has("fiber_high")) return "Riche en fibres";
    return "Sélection saine";
  }

  const isDiabetic =
    context.conditions.includes("diabetic") || context.goals.includes("manage_diabetes");
  if (isDiabetic) {
    if (has("gi_excellent")) return "Faible indice glycémique";
    if (has("gi_good")) return "Indice glycémique adapté";
    if (has("fiber_high")) return "Riche en fibres, favorable à la glycémie";
  }

  const isCeliac =
    context.conditions.includes("celiac") || context.goals.includes("avoid_gluten");
  if (isCeliac && has("label_sans_gluten")) {
    return "Compatible avec une alimentation sans gluten";
  }

  if (has("compatible_full")) return "Idéal pour votre profil";
  if (has("compatible_partial")) return "Compatible avec votre alimentation";
  if (has("fiber_high")) return "Riche en fibres";
  if (has("nutri_a")) return "Nutri-Score A";
  if (has("nutri_b")) return "Bon profil nutritionnel";

  return "Recommandé pour vous";
}

function pickPrimaryRecipeReason(
  recipe: RecipeForRecommendations,
  breakdown: ScoreBreakdown,
  context: RecommendationContext,
): string {
  const sig = breakdown.signals;
  const has = (s: string) => sig.includes(s);

  if (!context.hasProfile) {
    if (has("featured") && has("calories_balanced")) return "Recette équilibrée à la une";
    if (has("featured")) return "Recette populaire";
    if (has("easy")) return "Recette simple et équilibrée";
    return "Idée de repas équilibrée";
  }

  const isDiabetic =
    context.conditions.includes("diabetic") || context.goals.includes("manage_diabetes");
  if (isDiabetic && has("low_gi")) {
    return "Adaptée à un meilleur contrôle de la glycémie";
  }

  const isCeliac =
    context.conditions.includes("celiac") || context.goals.includes("avoid_gluten");
  if (isCeliac && recipe.diet_tags && recipe.diet_tags.includes("sans_gluten")) {
    return "Compatible avec une alimentation sans gluten";
  }

  if (has("compatible_full")) return "Recette adaptée à votre profil";
  if (has("calories_balanced")) return "Apport calorique équilibré";
  if (has("easy") && has("low_gi")) return "Recette simple à IG bas";
  if (has("easy")) return "Recette simple à préparer";
  if (has("compatible_partial")) return "Compatible avec votre alimentation";

  return "Recette suggérée pour vous";
}

/* ── Tags secondaires (sans dupliquer la raison primaire) ───────── */

// DT-1 : "IG très bas" supprimé — aucune raison primaire ne retourne cette chaîne.
const PRODUCT_REASON_DEDUP: Record<string, readonly string[]> = {
  "Nutri-Score A": ["nutri_a", "nutri_b"],
  "Bon profil nutritionnel": ["nutri_b"],
  "Faible indice glycémique": ["gi_excellent", "gi_good"],
  "Indice glycémique adapté": ["gi_good"],
  "Riche en fibres": ["fiber_high", "fiber_good"],
  "Riche en fibres, favorable à la glycémie": ["fiber_high", "fiber_good"],
  "Compatible avec une alimentation sans gluten": ["label_sans_gluten"],
};

const RECIPE_REASON_DEDUP: Record<string, readonly string[]> = {
  "Adaptée à un meilleur contrôle de la glycémie": ["low_gi"],
  "Apport calorique équilibré": ["calories_balanced", "calories_light"],
  "Recette simple à IG bas": ["easy", "low_gi"],
  "Recette simple à préparer": ["easy"],
  "Recette équilibrée à la une": ["featured", "calories_balanced"],
  "Recette populaire": ["featured"],
  "Recette simple et équilibrée": ["easy"],
  "Compatible avec une alimentation sans gluten": [],
};

function buildTags(
  signals: readonly string[],
  dictionary: Record<string, string>,
  excludeSignals: readonly string[],
  max = 3,
): string[] {
  const skip = new Set(excludeSignals);
  const seenLabels = new Set<string>();
  const out: string[] = [];
  for (const sig of signals) {
    if (skip.has(sig)) continue;
    const label = dictionary[sig];
    if (!label || seenLabels.has(label)) continue;
    seenLabels.add(label);
    out.push(label);
    if (out.length >= max) break;
  }
  return out;
}

export function buildProductRecommendationReason(
  _product: unknown,
  breakdown: ScoreBreakdown,
  context: RecommendationContext,
): RecommendationReason {
  const primary = pickPrimaryProductReason(breakdown, context);
  const exclude = PRODUCT_REASON_DEDUP[primary] ?? [];

  // UX-2 : pour les profils médicaux, le signal "popular" ne génère aucun tag visible.
  // Il reste actif dans le scoring comme facteur de départage silencieux.
  const signalsForTags = hasMedicalCondition(context)
    ? breakdown.signals.filter((s) => s !== "popular")
    : breakdown.signals;

  return { primary, tags: buildTags(signalsForTags, PRODUCT_TAG_LABELS, exclude) };
}

export function buildRecipeRecommendationReason(
  recipe: RecipeForRecommendations,
  breakdown: ScoreBreakdown,
  context: RecommendationContext,
): RecommendationReason {
  const primary = pickPrimaryRecipeReason(recipe, breakdown, context);
  const exclude = RECIPE_REASON_DEDUP[primary] ?? [];
  return { primary, tags: buildTags(breakdown.signals, RECIPE_TAG_LABELS, exclude) };
}
