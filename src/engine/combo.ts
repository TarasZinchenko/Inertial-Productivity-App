// src/engine/combo.ts
// Combo Engine: analyzes the last 3 logged events for a category
// and assigns an XP-awarding rank.

export type ComboRank = "S" | "A" | "Recovery" | "C";

export interface ComboResult {
  rank: ComboRank;
  xp: number;
  label: string;
  subtitle: string;
}

/**
 * Analyze the last 3 final_score values for a category.
 * Pass in ascending order: [oldest, middle, newest].
 * If fewer than 3 events exist, defaults to C-Rank.
 */
export function analyzeCombo(scores: number[]): ComboResult {
  if (scores.length < 3) {
    return { rank: "C", xp: 0, label: "C-Rank", subtitle: "Keep building momentum" };
  }

  const [s1, s2, s3] = scores.slice(-3);

  // S-Rank: ALL >= 90
  if (s1 >= 90 && s2 >= 90 && s3 >= 90) {
    return { rank: "S", xp: 300, label: "S-Rank", subtitle: "Perfect Rhythm" };
  }

  // A-Rank: ALL >= 70
  if (s1 >= 70 && s2 >= 70 && s3 >= 70) {
    return { rank: "A", xp: 100, label: "A-Rank", subtitle: "Steady Maintenance" };
  }

  // Recovery Rank: strictly increasing by >= 15 points per step
  // e.g. [20, 45, 75] — each step up by >= 15
  const step1 = s2 - s1; // increase from oldest to middle
  const step2 = s3 - s2; // increase from middle to newest
  if (step1 >= 15 && step2 >= 15) {
    return { rank: "Recovery", xp: 250, label: "Recovery", subtitle: "The Comeback" };
  }

  // C-Rank: degradation or low scores
  return { rank: "C", xp: 0, label: "C-Rank", subtitle: "Degradation detected" };
}
