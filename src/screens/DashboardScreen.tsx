// src/screens/DashboardScreen.tsx
// Main dashboard: Light Core orb, level badge, category cards, action drawer.

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  AppState as RNAppState,
  AppStateStatus,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";

import { useStore } from "../store/useStore";
import { CATEGORIES } from "../constants/categories";
import { COLORS, TYPOGRAPHY, SPACING } from "../constants/theme";
import { getDecayedScore, todayISO } from "../engine/math";
import { getLevelInfo } from "../engine/levels";

import { CoreVisualizer } from "../components/CoreVisualizer";
import { LevelBadge } from "../components/LevelBadge";
import { CategoryCard } from "../components/CategoryCard";
import { ActionDrawer } from "../components/ActionDrawer";
import { ComboToast } from "../components/ComboToast";
import { CATEGORY_MAP } from "../constants/categories";

export const DashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [tick, setTick] = useState(0);

  const {
    categories,
    totalXP,
    activeDrawerCategory,
    lastComboRank,
    setActiveDrawerCategory,
    clearLastComboRank,
    rehydrate,
  } = useStore();

  // Rehydrate from storage on mount
  useEffect(() => {
    rehydrate();
  }, []);

  // Re-calculate scores whenever app foregrounds or tab comes into focus
  useEffect(() => {
    const subscription = RNAppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        rehydrate();
        setTick((t) => t + 1);
      }
    });
    return () => subscription.remove();
  }, [rehydrate]);

  useEffect(() => {
    if (isFocused) {
      setTick((t) => t + 1);
    }
  }, [isFocused]);

  // Calculate average decayed score across all categories
  // Included `tick` in dependencies to force fresh re-evaluation on foreground/focus
  const averageScore = useMemo(() => {
    const scores = CATEGORIES.map((meta) => {
      const state = categories[meta.key];
      return getDecayedScore(meta.key, state.lastScore, state.lastLogDate);
    });
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }, [categories, tick]);

  const isAwake = averageScore >= 50;
  const levelInfo = getLevelInfo(totalXP);

  const activeDrawerMeta = activeDrawerCategory
    ? CATEGORY_MAP[activeDrawerCategory]
    : null;

  // XP awarded for the last combo
  const lastComboXP = useMemo(() => {
    if (!lastComboRank) return 0;
    const map: Record<string, number> = { S: 300, A: 100, Recovery: 250, C: 0 };
    return map[lastComboRank] ?? 0;
  }, [lastComboRank]);

  return (
    <View style={[styles.root, { backgroundColor: COLORS.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + SPACING.m, paddingBottom: insets.bottom + 160 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {isAwake ? "Core Active" : "Core Dormant"}
          </Text>
          <Text style={styles.totalXP}>{totalXP.toLocaleString()} XP</Text>
        </View>

        {/* ── The Light Core + Level Badge ───────────────── */}
        <View style={styles.coreSection}>
          <CoreVisualizer averageScore={averageScore} isAwake={isAwake} />
          <View style={styles.coreInfo}>
            <Text style={styles.avgScore}>{Math.round(averageScore)}</Text>
            <Text style={styles.avgLabel}>avg score</Text>
          </View>
          <LevelBadge levelInfo={levelInfo} />
        </View>

        {/* ── Section Title ──────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DISCIPLINES</Text>
          <Text style={styles.sectionSubtitle}>Tap a card to log a session</Text>
        </View>

        {/* ── Category Cards ─────────────────────────────── */}
        <View style={styles.cards}>
          {CATEGORIES.map((meta) => (
            <CategoryCard
              key={meta.key}
              meta={meta}
              state={categories[meta.key]}
              onPress={() => setActiveDrawerCategory(meta.key)}
            />
          ))}
        </View>
      </ScrollView>

      {/* ── Action Drawer (bottom sheet) ───────────────── */}
      <ActionDrawer
        category={activeDrawerMeta}
        onClose={() => setActiveDrawerCategory(null)}
      />

      {/* ── Combo Toast notification ───────────────────── */}
      <ComboToast
        rank={lastComboRank}
        xp={lastComboXP}
        onDismiss={clearLastComboRank}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.l,
    gap: SPACING.l,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    ...TYPOGRAPHY.labelL,
    color: COLORS.textSecondary,
  },
  totalXP: {
    ...TYPOGRAPHY.labelL,
    color: COLORS.textPrimary,
  },
  coreSection: {
    alignItems: "center",
    gap: SPACING.m,
    paddingVertical: SPACING.m,
  },
  coreInfo: {
    alignItems: "center",
    gap: 2,
  },
  avgScore: {
    ...TYPOGRAPHY.displayXL,
    color: COLORS.textPrimary,
  },
  avgLabel: {
    ...TYPOGRAPHY.labelS,
    color: COLORS.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelS,
    color: COLORS.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
  cards: {
    gap: 0,
  },
});
