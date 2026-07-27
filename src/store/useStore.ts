// src/store/useStore.ts
// Zustand store with immutable event logging, combo analysis, and XP tracking.
// Decay is recalculated on every rehydrate (app foreground / mount).

import { create } from "zustand";
import { generateUUID } from "../engine/uuid";

import { CategoryKey, getDecayedScore, getFinalScore, todayISO, yesterdayISO } from "../engine/math";
import { analyzeCombo } from "../engine/combo";
import { AppState, AllCategoryStates, EventLog } from "./types";
import { saveXP, loadXP, saveCategories, loadCategories, saveLogs, loadLogs } from "./storage";

// Initial state: 100% score, seeded with yesterday so decay is immediately visible
const DEFAULT_CATEGORIES: AllCategoryStates = {
  sport:    { lastScore: 100, lastLogDate: null },
  work:     { lastScore: 100, lastLogDate: null },
  language: { lastScore: 100, lastLogDate: null },
  posture:  { lastScore: 100, lastLogDate: null },
};

export const useStore = create<AppState>((set, get) => ({
  totalXP: 0,
  categories: DEFAULT_CATEGORIES,
  eventLogs: [],
  activeDrawerCategory: null,
  lastComboRank: null,

  setActiveDrawerCategory: (category) => {
    set({ activeDrawerCategory: category });
  },

  logEvent: (category: CategoryKey, input: number) => {
    const state = get();
    const catState = state.categories[category];

    // 1. Calculate current decayed score (uses exact day-based formulas)
    const decayed = getDecayedScore(category, catState.lastScore, catState.lastLogDate);

    // 2. Apply gain formula → final score
    const finalScore = getFinalScore(category, decayed, input);

    // 3. Build immutable log entry
    const entry: EventLog = {
      id: generateUUID(),
      category,
      final_score: Math.round(finalScore),
      timestamp: new Date().toISOString(),
      date: todayISO(),
    };

    // 4. Gather last 3 logs for this category (including the new one)
    const previousLogs = state.eventLogs
      .filter((l) => l.category === category)
      .slice(-2) // last 2, we'll append the new one
      .map((l) => l.final_score);
    const comboScores = [...previousLogs, entry.final_score];
    const combo = analyzeCombo(comboScores);

    // 5. Update XP (never decreases)
    const newXP = state.totalXP + combo.xp;

    // 6. Update category state — store the final score and today's date
    const newCategories: AllCategoryStates = {
      ...state.categories,
      [category]: {
        lastScore: entry.final_score,
        lastLogDate: entry.date,
      },
    };

    const newLogs = [...state.eventLogs, entry];

    set({
      totalXP: newXP,
      categories: newCategories,
      eventLogs: newLogs,
      activeDrawerCategory: null,
      lastComboRank: combo.rank,
    });

    // Persist asynchronously
    saveXP(newXP);
    saveCategories(newCategories);
    saveLogs(newLogs);
  },

  clearLastComboRank: () => set({ lastComboRank: null }),

  rehydrate: async () => {
    const [xp, cats, logs] = await Promise.all([
      loadXP(),
      loadCategories(),
      loadLogs(),
    ]);

    // Use loaded categories, or defaults if first launch.
    // Decay is NOT precomputed here — it's calculated on-the-fly via
    // getDecayedScore() whenever the UI reads category state.
    // This ensures scores are always fresh relative to Date.now().
    set({
      totalXP: xp,
      categories: cats ?? DEFAULT_CATEGORIES,
      eventLogs: logs,
    });
  },
}));
