// src/engine/math.ts
// Pure mathematical engine for the Inertial Productivity System.
// All decay and gain formulas are implemented here, fully decoupled from UI.
//
// DECAY MODEL: All decay values are SUBTRACTED DIRECTLY from lastScore.
// e.g. Sport Day 3: Score = lastScore - 30 (not lastScore * 0.70).

export type CategoryKey = "sport" | "work" | "language" | "posture";

/** Returns calendar-day difference between two ISO date strings (YYYY-MM-DD) */
export function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(fromISO);
  const b = new Date(toISO);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

/** Returns today's date as YYYY-MM-DD in the user's local timezone */
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Returns yesterday's date as YYYY-MM-DD (used for initial-state seeding) */
export function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// A. SPORT — Accelerating decay (direct subtraction), +80 gain
//   Day 0: Score = Last_Score
//   Day 1: Score = Last_Score - 5
//   Day 2: Score = Last_Score - 15
//   Day 3: Score = Last_Score - 30  (70% trigger for workout signal)
//   Day 4: Score = Last_Score - 50
//   Day 5: Score = Last_Score - 75
//   Day 6+: Score = 0
// ─────────────────────────────────────────────────────────────────────────────
const SPORT_DECAY_TABLE: Record<number, number> = {
  0: 0,
  1: 5,
  2: 15,
  3: 30,
  4: 50,
  5: 75,
};

export function sportDecayedScore(lastScore: number, daysSince: number): number {
  if (daysSince >= 6) return 0;
  const decay = SPORT_DECAY_TABLE[daysSince] ?? 75;
  return Math.max(0, lastScore - decay);
}

export function sportFinalScore(decayedScore: number): number {
  return Math.min(100, decayedScore + 80);
}

// ─────────────────────────────────────────────────────────────────────────────
// B. WORK — Accelerating decay (direct subtraction), efficiency-based gain
//   Day 0: Score = Last_Score
//   Day 1: Score = Last_Score - 10   (90%. Needs E≥1 to cap at 100%)
//   Day 2: Score = Last_Score - 30   (70%. Needs E≥2 to cap at 100%)
//   Day 3: Score = Last_Score - 60   (40%. Needs E=5 to cap at 100%)
//   Day 4+: Score = 0
// ─────────────────────────────────────────────────────────────────────────────
const WORK_DECAY_TABLE: Record<number, number> = {
  0: 0,
  1: 10,
  2: 30,
  3: 60,
};

export function workDecayedScore(lastScore: number, daysSince: number): number {
  if (daysSince >= 4) return 0;
  const decay = WORK_DECAY_TABLE[daysSince] ?? 60;
  return Math.max(0, lastScore - decay);
}

/** efficiency: 1–5. Gain = 10 + (E * 10) → 20 to 60 */
export function workGain(efficiency: number): number {
  return 10 + efficiency * 10;
}

export function workFinalScore(decayedScore: number, efficiency: number): number {
  return Math.min(100, decayedScore + workGain(efficiency));
}

// ─────────────────────────────────────────────────────────────────────────────
// C. LANGUAGE & SPEECH — Linear decay (-10/day), fixed +40 gain per session
//   Score = Math.max(0, Last_Score - (daysPassed * 10))
// ─────────────────────────────────────────────────────────────────────────────
export function languageDecayedScore(lastScore: number, daysSince: number): number {
  return Math.max(0, lastScore - 10 * daysSince);
}

export function languageFinalScore(decayedScore: number): number {
  return Math.min(100, decayedScore + 40);
}

// ─────────────────────────────────────────────────────────────────────────────
// D. POSTURE & ERGONOMICS — Linear decay (-20/day), rating-based gain
//   Score = Math.max(0, Last_Score - (daysPassed * 20))
//   Gain = R * 15  (R in {1..5})
// ─────────────────────────────────────────────────────────────────────────────
export function postureDecayedScore(lastScore: number, daysSince: number): number {
  return Math.max(0, lastScore - 20 * daysSince);
}

/** rating: 1–5 */
export function postureGain(rating: number): number {
  return rating * 15;
}

export function postureFinalScore(decayedScore: number, rating: number): number {
  return Math.min(100, decayedScore + postureGain(rating));
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED API — get current decayed score for any category
//
// FIX: When lastLogDate is null (never logged), we seed it as yesterday
// so that 1 day of decay is immediately visible on first launch instead
// of showing a static 100%.
// ─────────────────────────────────────────────────────────────────────────────
export function getDecayedScore(
  category: CategoryKey,
  lastScore: number,
  lastLogDate: string | null
): number {
  // Seed with yesterday so Day-1 decay shows on first open
  const effectiveDate = lastLogDate ?? yesterdayISO();
  const days = daysBetween(effectiveDate, todayISO());

  switch (category) {
    case "sport":
      return sportDecayedScore(lastScore, days);
    case "work":
      return workDecayedScore(lastScore, days);
    case "language":
      return languageDecayedScore(lastScore, days);
    case "posture":
      return postureDecayedScore(lastScore, days);
  }
}

export function getFinalScore(
  category: CategoryKey,
  decayedScore: number,
  input: number // efficiency (work/posture: 1-5) or ignored (sport/language: pass 0)
): number {
  switch (category) {
    case "sport":
      return sportFinalScore(decayedScore);
    case "work":
      return workFinalScore(decayedScore, input);
    case "language":
      return languageFinalScore(decayedScore);
    case "posture":
      return postureFinalScore(decayedScore, input);
  }
}
