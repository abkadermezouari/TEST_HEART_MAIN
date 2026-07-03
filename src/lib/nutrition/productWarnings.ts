/**
 * Centralized product–profile compatibility warnings for Smart Healthy.
 * Called on /search to surface the single most relevant alert per product card.
 *
 * Priority: celiac (safety) > diabetic GI > diabetic nutri > vegetarian > healthy
 * Only one badge is ever surfaced per product to avoid visual noise.
 */

export type WarningLevel = "warning" | "caution" | "positive";

export interface ProductWarning {
  text: string;
  level: WarningLevel;
  /** Material Symbols icon name. */
  icon: string;
}

export interface ProductSignalsForWarning {
  glycemic_index?: number | null;
  nutri_score?: "A" | "B" | "C" | "D" | "E" | null;
  labels: string[];
  compatible_with: string[];
}

export function getProductProfileWarning(
  product: ProductSignalsForWarning,
  activeConditions: string[],
): ProductWarning | null {
  if (activeConditions.length === 0) return null;

  const labels = (product.labels ?? []).map((l) => l.toLowerCase());
  const compat = (product.compatible_with ?? []).map((c) => c.toLowerCase());
  const gi = product.glycemic_index ?? null;
  const score = product.nutri_score ?? null;

  // ── 1. Celiac — safety-critical ─────────────────────────────
  if (activeConditions.includes("celiac")) {
    const isSafe = labels.includes("sans_gluten") || compat.includes("celiac");
    if (!isSafe) {
      return { text: "Vérifier le gluten", level: "warning", icon: "warning" };
    }
    return { text: "Sans gluten ✓", level: "positive", icon: "check_circle" };
  }

  // ── 2. Diabetic — GI first, then nutri ──────────────────────
  if (activeConditions.includes("diabetic")) {
    if (gi !== null && gi >= 70) {
      return { text: "IG élevé — à limiter", level: "warning", icon: "monitor_heart" };
    }
    if (score === "D" || score === "E") {
      return { text: "À consommer avec prudence", level: "caution", icon: "info" };
    }
    if (gi !== null && gi <= 35) {
      return { text: "IG faible — adapté", level: "positive", icon: "check_circle" };
    }
    return null;
  }

  // ── 3. Vegetarian / Vegan ────────────────────────────────────
  if (activeConditions.includes("vegetarian") || activeConditions.includes("vegan")) {
    const isOk =
      labels.some((l) => ["vegan", "vegetarian", "végétalien", "vegetal"].includes(l)) ||
      compat.some((c) => ["vegetarian", "vegan"].includes(c));
    if (!isOk) {
      return { text: "Vérifier la composition", level: "caution", icon: "eco" };
    }
    return null;
  }

  // ── 4. Healthy — nutri-score guidance ───────────────────────
  if (activeConditions.includes("healthy")) {
    if (score === "D" || score === "E") {
      return { text: "Choix moins équilibré", level: "caution", icon: "info" };
    }
    if (score === "A") {
      return { text: "Excellent choix", level: "positive", icon: "check_circle" };
    }
    return null;
  }

  return null;
}

/** Separate Tailwind class keys so the JIT scanner can detect every class string. */
export const WARNING_STYLES: Record<WarningLevel, { bg: string; text: string; border: string }> = {
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  caution: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
  },
  positive: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
};
