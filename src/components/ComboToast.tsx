// src/components/ComboToast.tsx
// Rank notification overlay that fires after logging an S-Rank or Recovery Combo.
// Appears from bottom with spring physics, auto-dismisses after 2.8 seconds.

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from "../constants/theme";
import { ComboRank } from "../store/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  rank: ComboRank;
  xp: number;
  onDismiss: () => void;
}

const RANK_CONFIG: Record<
  NonNullable<ComboRank>,
  { label: string; subtitle: string; colors: [string, string]; xp: number }
> = {
  S: {
    label: "S-Rank",
    subtitle: "Perfect Rhythm",
    colors: ["#FFD700", "#FF9500"],
    xp: 300,
  },
  A: {
    label: "A-Rank",
    subtitle: "Steady Maintenance",
    colors: ["#34C759", "#30D158"],
    xp: 100,
  },
  Recovery: {
    label: "Recovery",
    subtitle: "The Comeback",
    colors: ["#32ADE6", "#007AFF"],
    xp: 250,
  },
  C: {
    label: "C-Rank",
    subtitle: "Keep building momentum",
    colors: ["#AEAEB2", "#8E8E93"],
    xp: 0,
  },
};

export const ComboToast: React.FC<Props> = ({ rank, xp, onDismiss }) => {
  const translateY = useSharedValue(120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!rank || rank === "C") return;

    // Fire heavy haptic for S-Rank
    if (rank === "S") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Animate in
    translateY.value = withSpring(0, { stiffness: 280, damping: 22 });
    opacity.value = withTiming(1, { duration: 200 });

    // Auto-dismiss after 2.8s
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 280 });
      translateY.value = withTiming(80, { duration: 280 }, (finished) => {
        if (finished) runOnJS(onDismiss)();
      });
    }, 2800);

    return () => clearTimeout(timer);
  }, [rank]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!rank || rank === "C") return null;

  const config = RANK_CONFIG[rank];

  return (
    <Animated.View style={[styles.container, animStyle]} pointerEvents="none">
      <LinearGradient
        colors={config.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.toast}
      >
        <View style={styles.left}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankBadgeText}>{rank}</Text>
          </View>
        </View>
        <View style={styles.center}>
          <Text style={styles.rankLabel}>{config.label}</Text>
          <Text style={styles.rankSubtitle}>{config.subtitle}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.xpLabel}>+{xp}</Text>
          <Text style={styles.xpUnit}>XP</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 120,
    left: SPACING.l,
    right: SPACING.l,
    zIndex: 100,
    borderRadius: RADIUS.l,
    overflow: "hidden",
    shadowColor: "#FF9500",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 20,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.l,
    gap: SPACING.m,
    borderRadius: RADIUS.l,
  },
  left: {
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeText: {
    ...TYPOGRAPHY.displayS,
    color: "#FFFFFF",
  },
  center: {
    flex: 1,
    gap: 2,
  },
  rankLabel: {
    ...TYPOGRAPHY.labelL,
    color: "#FFFFFF",
  },
  rankSubtitle: {
    ...TYPOGRAPHY.caption,
    color: "rgba(255,255,255,0.80)",
  },
  right: {
    alignItems: "center",
  },
  xpLabel: {
    ...TYPOGRAPHY.displayS,
    color: "#FFFFFF",
  },
  xpUnit: {
    ...TYPOGRAPHY.labelS,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1,
  },
});
