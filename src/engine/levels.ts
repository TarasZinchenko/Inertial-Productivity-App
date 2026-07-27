// src/engine/levels.ts
// XP Level thresholds and helper functions for the Light Core metagame.

export interface LevelInfo {
  level: number;
  label: string;
  xpRequired: number;     // total XP needed to reach this level
  xpForNext: number;      // total XP needed for next level
  progress: number;       // 0–1 fraction toward next level
}

// Exponential XP thresholds as specified:
// Lvl 1: 0 | Lvl 2: 300 | Lvl 3: 1000 | Lvl 4: 2500 | Lvl 5: 6000 | ...
// Beyond Lvl 5 we continue the exponential curve: multiply prev gap by ~2.5
const LEVEL_THRESHOLDS: number[] = [
  0,     // Lvl 1
  300,   // Lvl 2
  1000,  // Lvl 3
  2500,  // Lvl 4
  6000,  // Lvl 5
  13000, // Lvl 6
  27000, // Lvl 7
  55000, // Lvl 8
  110000,// Lvl 9
  220000,// Lvl 10
];

const LEVEL_LABELS: string[] = [
  "Dormant",
  "Awakening",
  "Kindled",
  "Radiant",
  "Luminous",
  "Blazing",
  "Incandescent",
  "Stellar",
  "Cosmic",
  "Transcendent",
];

export function getLevelInfo(totalXP: number): LevelInfo {
  let level = 1;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }

  const xpRequired = LEVEL_THRESHOLDS[level - 1];
  const xpForNext =
    level < LEVEL_THRESHOLDS.length
      ? LEVEL_THRESHOLDS[level]
      : LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] * 2;

  const progress = Math.min(
    1,
    (totalXP - xpRequired) / (xpForNext - xpRequired)
  );

  return {
    level,
    label: LEVEL_LABELS[level - 1] ?? "Transcendent",
    xpRequired,
    xpForNext,
    progress,
  };
}
