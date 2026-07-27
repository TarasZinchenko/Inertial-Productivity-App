// src/store/types.ts
// All shared TypeScript types and interfaces for the app.

import { CategoryKey } from "../engine/math";

export interface EventLog {
  id: string;
  category: CategoryKey;
  final_score: number;   // 0–100
  timestamp: string;     // ISO 8601 full datetime
  date: string;          // YYYY-MM-DD local date
}

export interface CategoryState {
  lastScore: number;        // Score at time of last log (100 on Day 1)
  lastLogDate: string | null; // YYYY-MM-DD or null (never logged)
}

export type AllCategoryStates = Record<CategoryKey, CategoryState>;

export type ComboRank = "S" | "A" | "Recovery" | "C" | null;

export interface AppState {
  // Metagame
  totalXP: number;

  // Per-category state
  categories: AllCategoryStates;

  // Immutable event log
  eventLogs: EventLog[];

  // UI state
  activeDrawerCategory: CategoryKey | null;
  lastComboRank: ComboRank;

  // Actions
  setActiveDrawerCategory: (category: CategoryKey | null) => void;
  logEvent: (category: CategoryKey, input: number) => void;
  clearLastComboRank: () => void;
  rehydrate: () => Promise<void>;
}
