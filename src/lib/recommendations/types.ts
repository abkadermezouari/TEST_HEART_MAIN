import type { Product, Recipe, UserHealthProfile } from "@/lib/database.types";

// M-3 : bmr_kcal retiré — jamais utilisé dans le scoring.
export type HealthProfileForRecommendations = Pick<
  UserHealthProfile,
  | "health_conditions"
  | "goals"
  | "tdee_kcal"
  | "activity_level"
  | "is_complete"
> | null;

// DT-2 : is_published retiré — toujours true après le filtre Supabase.
export type ProductForRecommendations = Pick<
  Product,
  | "id"
  | "category_id"
  | "name"
  | "brand"
  | "image_url"
  | "nutri_score"
  | "glycemic_index"
  | "labels"
  | "compatible_with"
  | "energy_kcal"
  | "carbs_g"
  | "sugars_g"
  | "fiber_g"
  | "protein_g"
  | "sodium_g"
>;

export type RecipeForRecommendations = Pick<
  Recipe,
  | "id"
  | "title"
  | "description"
  | "image_url"
  | "prep_time_min"
  | "cook_time_min"
  | "difficulty"
  | "calories_kcal"
  | "diet_tags"
  | "compatible_with"
  | "is_published"
  | "is_featured"
>;

export interface RecommendationContext {
  /** Conditions normalisées (ex: ["diabetic","celiac"]). */
  conditions: string[];
  /** Objectifs normalisés (ex: ["lose_weight"]). */
  goals: string[];
  /** True si le profil santé est rempli et complet. */
  hasProfile: boolean;
  /** Identifiants des produits déjà sauvegardés par l'utilisateur. */
  savedProductIds: Set<string>;
  /** Identifiants des recettes déjà sauvegardées par l'utilisateur. */
  savedRecipeIds: Set<string>;
  /** Produits vus via partenaires ou recherches — facteur de départage silencieux. */
  popularProductIds: Set<string>;
  /** Catégories implicitement intéressantes issues des comportements. */
  affinityCategoryIds: Set<string>;
}

export interface RecommendationReason {
  primary: string;
  tags: string[];
}

/**
 * Décomposition du score. Les clés de `components` sont stables.
 * Produits  : health, nutri, gi, fiber, sodium, labels, popularity
 * Recettes  : health, diet_tags, calories, difficulty, featured, variety
 */
export interface ScoreBreakdown {
  total: number;
  components: Record<string, number>;
  excluded: boolean;
  exclusionReason?: string;
  signals: string[];
}

// M-5 : recommendation_tags supprimé — les tags visibles sont dans recommendation_reason.tags.
export interface RecommendedProduct {
  product: ProductForRecommendations;
  recommendation_score: number;
  recommendation_reason: RecommendationReason;
}

export interface RecommendedRecipe {
  recipe: RecipeForRecommendations;
  recommendation_score: number;
  recommendation_reason: RecommendationReason;
}

export interface RecommendationResult<T> {
  items: T[];
  /** True si les recommandations sont en mode fallback (profil absent/incomplet ou pas de match qualifié). */
  fallback: boolean;
  /** True si le profil santé de l'utilisateur est complet. */
  profileComplete: boolean;
}

/** Résultat combiné retourné par la facade getRecommendations. */
export interface RecommendationsBundle {
  products: RecommendationResult<RecommendedProduct>;
  recipes: RecommendationResult<RecommendedRecipe>;
  /** Nombre de produits déjà sauvegardés par l'utilisateur. */
  savedProductCount: number;
  /** Nombre de recettes déjà sauvegardées par l'utilisateur. */
  savedRecipeCount: number;
}
