import type {
  ProductForRecommendations,
  RecipeForRecommendations,
  RecommendationContext,
  ScoreBreakdown,
} from "./types";

/* ── Normalisation des valeurs profil ─────────────────────────── */

export function normalizeConditions(raw: string[] | null | undefined): string[] {
  if (!raw) return [];
  const out = new Set<string>();
  for (const v of raw) {
    const k = v.trim().toLowerCase();
    if (!k) continue;
    if (k.includes("diab")) out.add("diabetic");
    else if (k.includes("celi") || k.includes("coelia") || k.includes("gluten")) out.add("celiac");
    else if (k.includes("vegan")) out.add("vegan");
    else if (k.includes("veget")) out.add("vegetarian");
    else if (k.includes("hyper") || k.includes("cardio") || k.includes("tension")) out.add("cardiovascular");
    else out.add(k);
  }
  return Array.from(out);
}

export function normalizeGoals(raw: string[] | null | undefined): string[] {
  if (!raw) return [];
  const out = new Set<string>();
  for (const v of raw) {
    const k = v.trim().toLowerCase();
    if (!k) continue;
    if (k.includes("lose") || k.includes("perd") || k.includes("weight")) out.add("lose_weight");
    else if (k.includes("diabet") || k.includes("glyc")) out.add("manage_diabetes");
    else if (k.includes("gluten")) out.add("avoid_gluten");
    else if (k.includes("muscle") || k.includes("gain")) out.add("gain_muscle");
    else if (k.includes("heart") || k.includes("cardio")) out.add("heart_health");
    else out.add(k);
  }
  return Array.from(out);
}

const NUTRI_SCORE_POINTS: Record<"A" | "B" | "C" | "D" | "E", number> = {
  A: 20,
  B: 16,
  C: 11,
  D: 5,
  E: 1,
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function sumComponents(components: Record<string, number>): number {
  let s = 0;
  for (const v of Object.values(components)) s += v;
  return s;
}

function arrayHas(haystack: readonly string[] | null | undefined, needle: string): boolean {
  if (!haystack || haystack.length === 0) return false;
  const lc = needle.toLowerCase();
  return haystack.some((v) => v.toLowerCase() === lc);
}

function arrayHasAny(haystack: readonly string[] | null | undefined, needles: readonly string[]): boolean {
  if (!haystack || haystack.length === 0) return false;
  return needles.some((n) => arrayHas(haystack, n));
}

function emptyExcluded(reason: string): ScoreBreakdown {
  return { total: 0, components: {}, excluded: true, exclusionReason: reason, signals: [] };
}

/* ── PRODUITS ─────────────────────────────────────────────────────
 * Pondérations (max 100) :
 *   health=35  nutri=20  gi=20  fiber=10  sodium=5  labels=5  popularity=5
 * ─────────────────────────────────────────────────────────────── */

export function scoreProduct(
  product: ProductForRecommendations,
  context: RecommendationContext,
): ScoreBreakdown {
  const signals: string[] = [];
  const components: Record<string, number> = {
    health: 0,
    nutri: 0,
    gi: 0,
    fiber: 0,
    sodium: 0,
    labels: 0,
    popularity: 0,
  };

  // C-1 : isCeliac couvre conditions ET goals pour protéger les utilisateurs
  // qui ont uniquement renseigné un objectif sans condition médicale explicite.
  const isCeliac =
    context.conditions.includes("celiac") || context.goals.includes("avoid_gluten");
  const isDiabetic =
    context.conditions.includes("diabetic") || context.goals.includes("manage_diabetes");
  const cardio =
    context.conditions.includes("cardiovascular") || context.goals.includes("heart_health");
  const wantsLoseWeight = context.goals.includes("lose_weight");

  /* ── Exclusions dures ── */
  if (isCeliac) {
    const compatible = arrayHas(product.compatible_with, "celiac");
    const glutenFree = arrayHas(product.labels, "sans_gluten");
    if (!compatible && !glutenFree) {
      return emptyExcluded("Non compatible sans gluten");
    }
  }

  /* ── 1. Compatibilité santé (35) ────────────────────────────── */
  const compat = product.compatible_with ?? [];
  const matched = context.conditions.filter((c) => arrayHas(compat, c));
  const allMatched = context.conditions.length > 0 && matched.length === context.conditions.length;
  const someMatched = matched.length > 0;
  const compatHasData = compat.length > 0;

  if (context.conditions.length === 0) {
    components.health = 18;
  } else if (allMatched) {
    components.health = 35;
    signals.push("compatible_full");
  } else if (someMatched) {
    components.health = 22;
    signals.push("compatible_partial");
  } else if (!compatHasData) {
    components.health = 14;
  } else {
    components.health = 8;
  }

  /* ── 2. Nutri-Score (20) ────────────────────────────────────── */
  if (product.nutri_score) {
    const nutriKey = product.nutri_score;
    components.nutri =
      nutriKey && nutriKey in NUTRI_SCORE_POINTS
        ? NUTRI_SCORE_POINTS[nutriKey as keyof typeof NUTRI_SCORE_POINTS]
        : 0;
    if (product.nutri_score === "A") signals.push("nutri_a");
    else if (product.nutri_score === "B") signals.push("nutri_b");
    if (product.nutri_score === "D" || product.nutri_score === "E") signals.push("nutri_low");
  } else {
    components.nutri = 10;
  }

  /* ── 3. Indice glycémique (20) ──────────────────────────────── */
  const gi = product.glycemic_index;
  if (gi !== null && gi !== undefined) {
    if (isDiabetic) {
      if (gi <= 35) {
        components.gi = 20;
        signals.push("gi_excellent");
      } else if (gi <= 55) {
        components.gi = 15;
        signals.push("gi_good");
      } else if (gi <= 69) {
        components.gi = 5;
        signals.push("gi_medium");
      } else {
        components.gi = 0;
        signals.push("gi_high");
      }
    } else {
      if (gi <= 35) components.gi = 14;
      else if (gi <= 55) components.gi = 12;
      else if (gi <= 69) components.gi = 8;
      else components.gi = 4;
    }
  } else {
    // AM-1 : valeur neutre (10) pour les produits sans IG renseigné,
    // évite de pénaliser les produits naturels sans métadonnée.
    components.gi = 10;
  }

  /* ── 4. Fibres (10) ─────────────────────────────────────────── */
  const fiber = product.fiber_g;
  if (fiber !== null && fiber !== undefined) {
    if (fiber >= 5) {
      components.fiber = 10;
      signals.push("fiber_high");
    } else if (fiber >= 3) {
      components.fiber = 7;
      signals.push("fiber_good");
    } else {
      components.fiber = 2;
    }
  } else {
    components.fiber = 4;
  }

  /* ── 5. Sodium (5) ──────────────────────────────────────────── */
  const sodium = product.sodium_g;
  if (sodium !== null && sodium !== undefined) {
    if (sodium <= 0.1) components.sodium = 5;
    else if (sodium <= 0.4) components.sodium = cardio ? 2 : 4;
    else components.sodium = cardio ? 0 : 2;
    if (cardio && sodium > 0.4) signals.push("sodium_high");
  } else {
    components.sodium = 3;
  }

  /* ── 6. Labels utiles (5) ───────────────────────────────────── */
  let labelScore = 0;
  if (arrayHas(product.labels, "sans_gluten")) {
    labelScore += isCeliac ? 3 : 1;
    signals.push("label_sans_gluten");
  }
  if (arrayHas(product.labels, "bio")) {
    labelScore += 1;
    signals.push("label_bio");
  }
  if (
    arrayHas(product.labels, "vegan") &&
    (context.conditions.includes("vegetarian") || context.conditions.includes("vegan"))
  ) {
    labelScore += 1;
    signals.push("label_vegan");
  }
  if (arrayHas(product.labels, "halal")) labelScore += 0.5;
  components.labels = clamp(labelScore, 0, 5);

  /* ── 7. Popularité (5) — signal faible, facteur de départage ── */
  let popScore = 0;
  if (context.popularProductIds.has(product.id)) {
    popScore += 3;
    signals.push("popular");
  }
  if (product.category_id && context.affinityCategoryIds.has(product.category_id)) {
    popScore += 2;
  }
  components.popularity = clamp(popScore, 0, 5);

  /* ── Garde-fous (priorité santé) ────────────────────────────── */

  // Diabétique + IG élevé : on ne laisse jamais le produit passer comme "idéal".
  if (isDiabetic && gi !== null && gi !== undefined && gi >= 70) {
    components.health = Math.min(components.health, 12);
    const idx = signals.indexOf("compatible_full");
    if (idx !== -1) signals.splice(idx, 1);
  }

  // Diabétique + sucres élevés : pénalité sur les axes nutritionnels.
  const sugars = product.sugars_g;
  if (isDiabetic && sugars !== null && sugars !== undefined && sugars > 15) {
    components.gi = Math.max(0, components.gi - 5);
    components.nutri = Math.max(0, components.nutri - 4);
    signals.push("sugar_high");
    const idx = signals.indexOf("compatible_full");
    if (idx !== -1) signals.splice(idx, 1);
  }

  // Objectif perte de poids : densité énergétique élevée — pénalité silencieuse.
  if (wantsLoseWeight) {
    const kcal = product.energy_kcal;
    if (kcal !== null && kcal !== undefined && kcal >= 400) {
      components.nutri = Math.max(0, components.nutri - 3);
      signals.push("energy_dense");
    }
  }

  const total = clamp(sumComponents(components));
  return { total, components, excluded: false, signals };
}

/* ── RECETTES ─────────────────────────────────────────────────────
 * Pondérations (max 100) :
 *   health=40  diet_tags=20  calories=15  difficulty=10  featured=10  variety=5
 * ─────────────────────────────────────────────────────────────── */

export function scoreRecipe(
  recipe: RecipeForRecommendations,
  context: RecommendationContext,
  tdeeKcal: number | null = null,
): ScoreBreakdown {
  const signals: string[] = [];
  const components: Record<string, number> = {
    health: 0,
    diet_tags: 0,
    calories: 0,
    difficulty: 0,
    featured: 0,
    variety: 0,
  };

  // C-1 : même protection que pour les produits.
  const isCeliac =
    context.conditions.includes("celiac") || context.goals.includes("avoid_gluten");
  const isDiabetic =
    context.conditions.includes("diabetic") || context.goals.includes("manage_diabetes");
  const wantsLoseWeight = context.goals.includes("lose_weight");

  /* ── Exclusions dures ── */
  if (isCeliac) {
    const compatible = arrayHas(recipe.compatible_with, "celiac");
    const glutenFreeTag = arrayHas(recipe.diet_tags, "sans_gluten");
    if (!compatible && !glutenFreeTag) {
      return emptyExcluded("Recette non sans gluten");
    }
  }

  /* ── 1. Compatibilité santé (40) ─────────────────────────────── */
  const compat = recipe.compatible_with ?? [];
  const matched = context.conditions.filter((c) => arrayHas(compat, c));
  const allMatched = context.conditions.length > 0 && matched.length === context.conditions.length;
  const someMatched = matched.length > 0;
  const compatHasData = compat.length > 0;

  if (context.conditions.length === 0) {
    components.health = 22;
  } else if (allMatched) {
    components.health = 40;
    signals.push("compatible_full");
  } else if (someMatched) {
    components.health = 26;
    signals.push("compatible_partial");
  } else if (!compatHasData) {
    components.health = 16;
  } else {
    components.health = 8;
  }

  /* ── 2. Diet tags (20) ──────────────────────────────────────── */
  let tagScore = 0;
  if (arrayHasAny(recipe.diet_tags, ["faible_ig", "low_gi", "diabetic_friendly"])) {
    tagScore += isDiabetic ? 12 : 7;
    signals.push("low_gi");
  }
  if (arrayHas(recipe.diet_tags, "sans_gluten")) {
    tagScore += isCeliac ? 8 : 3;
  }
  if (arrayHasAny(recipe.diet_tags, ["high_fiber", "fiber"])) {
    tagScore += 4;
    signals.push("fiber_rich");
  }
  if (arrayHas(recipe.diet_tags, "healthy")) tagScore += 3;
  if (arrayHas(recipe.diet_tags, "eco")) tagScore += 1;
  if (arrayHas(recipe.diet_tags, "keto") && wantsLoseWeight) tagScore += 3;
  components.diet_tags = clamp(tagScore, 0, 20);

  /* ── 3. Calories (15) ──────────────────────────────────────── */
  const cal = recipe.calories_kcal;
  if (cal !== null && cal !== undefined) {
    if (tdeeKcal && tdeeKcal > 0) {
      const portionShare = cal / tdeeKcal;
      if (portionShare >= 0.2 && portionShare <= 0.4) {
        components.calories = 15;
        signals.push("calories_balanced");
      } else if (portionShare < 0.2) {
        components.calories = 11;
        signals.push("calories_light");
      } else if (portionShare <= 0.5) {
        components.calories = 8;
      } else {
        components.calories = 4;
        if (wantsLoseWeight) signals.push("calories_high");
      }
    } else {
      if (cal <= 250) {
        components.calories = 11;
        signals.push("calories_light");
      } else if (cal <= 500) {
        components.calories = 13;
        signals.push("calories_balanced");
      } else if (cal <= 700) {
        components.calories = 8;
      } else {
        components.calories = 4;
        if (wantsLoseWeight) signals.push("calories_high");
      }
    }
  } else {
    components.calories = 7;
  }

  /* ── 4. Difficulté (10) ─────────────────────────────────────── */
  if (recipe.difficulty === "easy") {
    components.difficulty = 10;
    signals.push("easy");
  } else if (recipe.difficulty === "medium") {
    components.difficulty = 7;
  } else if (recipe.difficulty === "hard") {
    components.difficulty = 4;
  } else {
    components.difficulty = 6;
  }

  /* ── 5. Featured (10) ───────────────────────────────────────── */
  if (recipe.is_featured) {
    components.featured = 10;
    signals.push("featured");
  } else {
    components.featured = 4;
  }

  /* ── 6. Variété (5) — bonus si rapide à préparer ────────────── */
  // M-2 : renommé recipeTotalTime pour éviter le shadow du champ retourné.
  const recipeTotalTime = (recipe.prep_time_min ?? 0) + (recipe.cook_time_min ?? 0);
  if (recipeTotalTime > 0 && recipeTotalTime <= 20) components.variety = 5;
  else if (recipeTotalTime <= 40) components.variety = 3;
  else components.variety = 1;

  /* ── Garde-fous ── */
  if (
    isDiabetic &&
    !arrayHasAny(recipe.diet_tags, ["faible_ig", "low_gi", "diabetic_friendly"]) &&
    cal !== null &&
    cal !== undefined &&
    cal > 600
  ) {
    components.health = Math.min(components.health, 14);
    const idx = signals.indexOf("compatible_full");
    if (idx !== -1) signals.splice(idx, 1);
  }

  return { total: clamp(sumComponents(components)), components, excluded: false, signals };
}
