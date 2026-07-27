// src/screens/HistoryScreen.tsx
// Sub-screen showing the last 20 event logs per category.
// Minimal chart using inline bar visualization.

import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { useStore } from "../store/useStore";
import { CATEGORIES, CATEGORY_MAP } from "../constants/categories";
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { CategoryKey } from "../engine/math";
import { EventLog } from "../store/types";

const MiniBar: React.FC<{ score: number; color: string }> = ({ score, color }) => (
  <View style={miniStyles.wrap}>
    <View style={[miniStyles.bar, { height: (score / 100) * 48, backgroundColor: color }]} />
    <Text style={miniStyles.label}>{Math.round(score)}</Text>
  </View>
);

const miniStyles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 2, justifyContent: "flex-end", height: 62 },
  bar: { width: 10, borderRadius: 5, minHeight: 3 },
  label: { ...TYPOGRAPHY.caption, color: COLORS.textTertiary, fontSize: 9 },
});

const CategoryHistory: React.FC<{ category: CategoryKey; logs: EventLog[] }> = ({
  category,
  logs,
}) => {
  const meta = CATEGORY_MAP[category];
  const recentLogs = [...logs].reverse().slice(0, 10).reverse();

  if (recentLogs.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={[styles.catLabel, { color: meta.gradientFrom }]}>{meta.label}</Text>
        <Text style={styles.emptyText}>No logs yet. Start your first session.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={[styles.catLabel, { color: meta.gradientFrom }]}>{meta.label}</Text>
        <Text style={styles.logCount}>{logs.length} sessions</Text>
      </View>

      {/* Mini bar chart */}
      <View style={styles.chart}>
        {recentLogs.map((log) => (
          <MiniBar key={log.id} score={log.final_score} color={meta.gradientFrom} />
        ))}
      </View>

      {/* Last 5 log rows */}
      <View style={styles.logList}>
        {recentLogs.slice(-5).reverse().map((log) => (
          <View key={log.id} style={styles.logRow}>
            <View style={[styles.logDot, { backgroundColor: meta.gradientFrom }]} />
            <Text style={styles.logDate}>{log.date}</Text>
            <Text style={[styles.logScore, { color: meta.gradientFrom }]}>
              {log.final_score}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export const HistoryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { eventLogs } = useStore();

  const logsByCategory = useMemo(() => {
    const grouped: Record<CategoryKey, EventLog[]> = {
      work: [], sport: [], language: [], posture: [],
    };
    for (const log of eventLogs) {
      grouped[log.category].push(log);
    }
    return grouped;
  }, [eventLogs]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + SPACING.l, paddingBottom: insets.bottom + SPACING.xxl },
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <Text style={styles.pageTitle}>History</Text>
      <Text style={styles.pageSubtitle}>Last logged sessions per discipline</Text>

      {CATEGORIES.map((meta) => (
        <CategoryHistory
          key={meta.key}
          category={meta.key}
          logs={logsByCategory[meta.key]}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: SPACING.l,
    gap: SPACING.m,
  },
  pageTitle: {
    ...TYPOGRAPHY.displayM,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  pageSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.s,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.m,
    gap: SPACING.m,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.60)",
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catLabel: {
    ...TYPOGRAPHY.labelL,
  },
  logCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textTertiary,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    paddingTop: SPACING.xs,
  },
  logList: {
    gap: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.s,
  },
  logRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
  },
  logDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  logDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },
  logScore: {
    ...TYPOGRAPHY.labelM,
  },
});
