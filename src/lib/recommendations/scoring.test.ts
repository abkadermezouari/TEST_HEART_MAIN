import { describe, it, expect } from "vitest";
import {
  scoreProduct,
  scoreRecipe,
  normalizeConditions,
  normalizeGoals,
} from "./scoring";
import type {
  ProductForRecommendations,
  RecipeForRecommendations,
  RecommendationContext,
} from "./types";

const BASE_CONTEXT: RecommendationContext = {
  conditions: [],
  goals: [],
  hasProfile: false,
  savedProductIds: new Set(),
  savedRecipeIds: new Set(),
  popularProductIds: new Set(),
  affinityCategoryIds: new Set(),
};

const PRODUCT_A: ProductForRecommendations = {
  id: "p1",
  category_id: "cat1",
  name: "Avoine Bio",
  brand: "Test",
  image_url: null,
  nutri_score: "A",
  glycemic_index: 40,
  labels: ["bio", "sans_gluten"],
  compatible_with: ["celiac", "diabetic"],
  energy_kcal: 350,
  carbs_g: 60,
  sugars_g: 5,
  fiber_g: 8,
  protein_g: 12,
  sodium_g: 0.05,
};

describe("normalizeConditions", () => {
  it("normalise 'diabétique' en 'diabetic'", () => {
    expect(normalizeConditions(["diabétique"])).toContain("diabetic");
  });

  it("normalise 'coeliaque' en 'celiac'", () => {
    expect(normalizeConditions(["coeliaque"])).toContain("celiac");
  });

  it("retourne [] pour null", () => {
    expect(normalizeConditions(null)).toEqual([]);
  });
});

describe("normalizeGoals", () => {
  it("normalise 'lose weight' en 'lose_weight'", () => {
    expect(normalizeGoals(["lose weight"])).toContain("lose_weight");
  });

  it("retourne [] pour []", () => {
    expect(normalizeGoals([])).toEqual([]);
  });
});

describe("scoreProduct — sans profil", () => {
  it("retourne un score > 0 pour un produit Nutri-A", () => {
    const result = scoreProduct(PRODUCT_A, BASE_CONTEXT);
    expect(result.total).toBeGreaterThan(0);
    expect(result.excluded).toBe(false);
  });

  it("inclut le signal nutri_a pour un produit Nutri-Score A", () => {
    const result = scoreProduct(PRODUCT_A, BASE_CONTEXT);
    expect(result.signals).toContain("nutri_a");
  });

  it("inclut fiber_high pour fibres >= 5g", () => {
    const result = scoreProduct(PRODUCT_A, BASE_CONTEXT);
    expect(result.signals).toContain("fiber_high");
  });
});

describe("scoreProduct — profil cœliaque", () => {
  const celiacContext: RecommendationContext = {
    ...BASE_CONTEXT,
    conditions: ["celiac"],
    hasProfile: true,
  };

  it("n'exclut pas un produit certifié sans gluten", () => {
    const result = scoreProduct(PRODUCT_A, celiacContext);
    expect(result.excluded).toBe(false);
  });

  it("exclut un produit sans certification sans gluten", () => {
    const productWithGluten: ProductForRecommendations = {
      ...PRODUCT_A,
      labels: [],
      compatible_with: [],
    };
    const result = scoreProduct(productWithGluten, celiacContext);
    expect(result.excluded).toBe(true);
  });
});

describe("scoreProduct — profil diabétique", () => {
  const diabeticContext: RecommendationContext = {
    ...BASE_CONTEXT,
    conditions: ["diabetic"],
    hasProfile: true,
  };

  it("donne le score GI maximum pour IG <= 35", () => {
    const result = scoreProduct({ ...PRODUCT_A, glycemic_index: 30 }, diabeticContext);
    expect(result.components.gi).toBe(20);
    expect(result.signals).toContain("gi_excellent");
  });

  it("donne score GI=0 pour IG >= 70", () => {
    const result = scoreProduct({ ...PRODUCT_A, glycemic_index: 75 }, diabeticContext);
    expect(result.components.gi).toBe(0);
    expect(result.signals).toContain("gi_high");
  });
});

describe("scoreProduct — score total", () => {
  it("le score total est compris entre 0 et 100", () => {
    const result = scoreProduct(PRODUCT_A, BASE_CONTEXT);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
  });
});

const RECIPE_EASY: RecipeForRecommendations = {
  id: "r1",
  title: "Salade quinoa",
  description: null,
  image_url: null,
  prep_time_min: 10,
  cook_time_min: 5,
  difficulty: "easy",
  calories_kcal: 350,
  diet_tags: ["faible_ig", "sans_gluten"],
  compatible_with: ["celiac", "diabetic"],
  is_published: true,
  is_featured: false,
};

describe("scoreRecipe", () => {
  it("retourne un score positif pour une recette facile", () => {
    const result = scoreRecipe(RECIPE_EASY, BASE_CONTEXT, null);
    expect(result.total).toBeGreaterThan(0);
    expect(result.excluded).toBe(false);
  });

  it("donne le bonus easy (10pts) pour difficulté=easy", () => {
    const result = scoreRecipe(RECIPE_EASY, BASE_CONTEXT, null);
    expect(result.components.difficulty).toBe(10);
  });

  it("n'exclut pas une recette sans-gluten pour un cœliaque", () => {
    const ctx = { ...BASE_CONTEXT, conditions: ["celiac"], hasProfile: true };
    const result = scoreRecipe(RECIPE_EASY, ctx, null);
    expect(result.excluded).toBe(false);
  });

  it("exclut une recette avec gluten pour un cœliaque", () => {
    const ctx = { ...BASE_CONTEXT, conditions: ["celiac"], hasProfile: true };
    const recipeWithGluten: RecipeForRecommendations = {
      ...RECIPE_EASY,
      compatible_with: [],
      diet_tags: [],
    };
    const result = scoreRecipe(recipeWithGluten, ctx, null);
    expect(result.excluded).toBe(true);
  });
});
