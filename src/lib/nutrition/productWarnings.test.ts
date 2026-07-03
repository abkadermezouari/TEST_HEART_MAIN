import { describe, it, expect } from "vitest";
import { getProductProfileWarning } from "./productWarnings";
import type { ProductSignalsForWarning } from "./productWarnings";

const PRODUCT_SAFE_CELIAC: ProductSignalsForWarning = {
  glycemic_index: 40,
  nutri_score: "A",
  labels: ["sans_gluten"],
  compatible_with: ["celiac"],
};

const PRODUCT_GLUTEN: ProductSignalsForWarning = {
  glycemic_index: 40,
  nutri_score: "A",
  labels: [],
  compatible_with: [],
};

const PRODUCT_HIGH_GI: ProductSignalsForWarning = {
  glycemic_index: 75,
  nutri_score: "B",
  labels: [],
  compatible_with: ["diabetic"],
};

const PRODUCT_LOW_GI: ProductSignalsForWarning = {
  glycemic_index: 30,
  nutri_score: "A",
  labels: [],
  compatible_with: ["diabetic"],
};

describe("getProductProfileWarning", () => {
  it("retourne null si aucune condition active", () => {
    expect(getProductProfileWarning(PRODUCT_SAFE_CELIAC, [])).toBeNull();
  });

  it("retourne 'positive' pour un produit sans gluten avec profil cœliaque", () => {
    const result = getProductProfileWarning(PRODUCT_SAFE_CELIAC, ["celiac"]);
    expect(result?.level).toBe("positive");
  });

  it("retourne 'warning' pour un produit avec gluten avec profil cœliaque", () => {
    const result = getProductProfileWarning(PRODUCT_GLUTEN, ["celiac"]);
    expect(result?.level).toBe("warning");
  });

  it("retourne 'warning' pour IG élevé avec profil diabétique", () => {
    const result = getProductProfileWarning(PRODUCT_HIGH_GI, ["diabetic"]);
    expect(result?.level).toBe("warning");
    expect(result?.text).toContain("IG élevé");
  });

  it("retourne 'positive' pour IG bas avec profil diabétique", () => {
    const result = getProductProfileWarning(PRODUCT_LOW_GI, ["diabetic"]);
    expect(result?.level).toBe("positive");
  });

  it("retourne null pour un profil sain avec Nutri-Score B", () => {
    const product: ProductSignalsForWarning = {
      glycemic_index: null,
      nutri_score: "B",
      labels: [],
      compatible_with: [],
    };
    expect(getProductProfileWarning(product, ["healthy"])).toBeNull();
  });
});
