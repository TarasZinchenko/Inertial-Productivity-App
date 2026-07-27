// src/store/storage.ts
// AsyncStorage-backed persistence layer for the Zustand store.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventLog, AllCategoryStates } from "./types";

const KEYS = {
  TOTAL_XP: "@ipe:totalXP",
  CATEGORIES: "@ipe:categories",
  EVENT_LOGS: "@ipe:eventLogs",
};

export async function saveXP(xp: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.TOTAL_XP, JSON.stringify(xp));
}

export async function loadXP(): Promise<number> {
  const raw = await AsyncStorage.getItem(KEYS.TOTAL_XP);
  return raw ? JSON.parse(raw) : 0;
}

export async function saveCategories(cats: AllCategoryStates): Promise<void> {
  await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(cats));
}

export async function loadCategories(): Promise<AllCategoryStates | null> {
  const raw = await AsyncStorage.getItem(KEYS.CATEGORIES);
  return raw ? JSON.parse(raw) : null;
}

export async function saveLogs(logs: EventLog[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.EVENT_LOGS, JSON.stringify(logs));
}

export async function loadLogs(): Promise<EventLog[]> {
  const raw = await AsyncStorage.getItem(KEYS.EVENT_LOGS);
  return raw ? JSON.parse(raw) : [];
}
