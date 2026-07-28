// src/engine/math.ts
// Pure mathematical engine for the Inertial Productivity System.
// All decay and gain formulas are implemented here, fully decoupled from UI.

export type CategoryKey = "sport" | "work" | "language" | "posture";

/** 
 * Returns exact local calendar-day difference between two dates/ISO strings.
 * Bulletproof against UTC parsing bugs, DST transitions, and timezone shifts.
 */
export function daysBetween(
  fromDateStrOrNum: string | number | null,
  toDateStrOrNum: string | number
): number {
  if (!fromDateStrOrNum || !toDateStrOrNum) return 0;

  const toLocalDateComponents = (input: string | number): { year: number; month: number; day: number } => {
    if (typeof input === "number") {
      const d = new Date(input);
      return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
    }
    if (typeof input === "string") {
      const cleanStr = input.trim();
      const datePart = cleanStr.includes("T") ? cleanStr.split("T")[0] : cleanStr;
      const parts = datePart.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1; // 0-indexed month
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          return { year: y, month: m, day: d };
        }
      }
      const d = new Date(cleanStr);
      return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
    }
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
  };

  const from = toLocalDateComponents(fromDateStrOrNum);
  const to = toLocalDateComponents(toDateStrOrNum);

  // Construct dates at 12:00 PM (Noon) local time to neutralize DST +/-1h shifts
  const fromNoon = new Date(from.year, from.month, from.day, 12, 0, 0, 0).getTime();
  const toNoon = new Date(to.year, to.month, to.day, 12, 0, 0, 0).getTime();

  const diffMs = toNoon - fromNoon;
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

/** Returns today's date as YYYY-MM-DD in the user's local timezone */
export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Returns yesterday's date as YYYY-MM-DD in local timezone (used for initial state seeding) */
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
//   Day 3: Score = Last_Score - 30  (70% workout trigger)
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
//   Day 1: Score = Last_Score - 10   (90%)
//   Day 2: Score = Last_Score - 30   (70%)
//   Day 3: Score = Last_Score - 60   (40%)
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
// ─────────────────────────────────────────────────────────────────────────────
export function getDecayedScore(
  category: CategoryKey,
  lastScore: number,
  lastLogDate: string | null
): number {
  // If never logged (null), seed as yesterday so Day 1 initial decay is shown
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
  input: number
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
