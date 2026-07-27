// src/constants/categories.ts
// Static metadata for each category — icons, labels, descriptions.

import { CategoryKey } from "../engine/math";
import { COLORS } from "./theme";

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  subtitle: string;
  rhythm: string;
  gradientFrom: string;
  gradientTo: string;
  glow: string;
  hasRating: boolean;    // Work and Posture have a 1-5 rating input
  ratingLabel?: string;  // e.g. "Efficiency" / "Quality"
}

export const CATEGORIES: CategoryMeta[] = [
  {
    key: "work",
    label: "Work",
    subtitle: "Deep Work Sessions",
    rhythm: "Every other day",
    gradientFrom: COLORS.work.from,
    gradientTo: COLORS.work.to,
    glow: COLORS.work.glow,
    hasRating: true,
    ratingLabel: "Efficiency",
  },
  {
    key: "sport",
    label: "Sport",
    subtitle: "Physical Training",
    rhythm: "Every 2–3 days",
    gradientFrom: COLORS.sport.from,
    gradientTo: COLORS.sport.to,
    glow: COLORS.sport.glow,
    hasRating: false,
  },
  {
    key: "language",
    label: "Language",
    subtitle: "Speech & Practice",
    rhythm: "Every 3 days",
    gradientFrom: COLORS.language.from,
    gradientTo: COLORS.language.to,
    glow: COLORS.language.glow,
    hasRating: false,
  },
  {
    key: "posture",
    label: "Posture",
    subtitle: "Ergonomic Check-in",
    rhythm: "Daily",
    gradientFrom: COLORS.posture.from,
    gradientTo: COLORS.posture.to,
    glow: COLORS.posture.glow,
    hasRating: true,
    ratingLabel: "Quality",
  },
];

export const CATEGORY_MAP: Record<CategoryKey, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c])
) as Record<CategoryKey, CategoryMeta>;
