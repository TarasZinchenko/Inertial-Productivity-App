// src/components/CategoryCard.tsx
// Premium glassmorphism card showing category score, decay state, and log button.
// Tapping ANYWHERE on the card opens the ActionDrawer.

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { COLORS, SHADOWS, TYPOGRAPHY, RADIUS, SPACING } from "../constants/theme";
import { CategoryMeta } from "../constants/categories";
import { FluidProgressBar } from "./FluidProgressBar";
import { CategoryKey, getDecayedScore } from "../engine/math";
import { CategoryState } from "../store/types";

// Lucide-like thin SVG icons rendered inline
const CategoryIcon: React.FC<{ cat: CategoryKey; color: string }> = ({ cat, color }) => {
  // Proper Unicode geometric shapes, not emojis
  const icons: Record<CategoryKey, string> = {
    work:     "◈",
    sport:    "◎",
    language: "◷",
    posture:  "◉",
  };
  return <Text style={{ fontSize: 20, color, fontWeight: "300" }}>{icons[cat]}</Text>;
};

interface Props {
  meta: CategoryMeta;
  state: CategoryState;
  onPress: () => void;
}

export const CategoryCard: React.FC<Props> = ({ meta, state, onPress }) => {
  const currentDecayed = getDecayedScore(meta.key, state.lastScore, state.lastLogDate);
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.97, { stiffness: 500, damping: 15 }),
      withSpring(1, { stiffness: 300, damping: 20 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Determine urgency level for subtle warning indicator
  const isLow    = currentDecayed < 40;
  const isMedium = currentDecayed >= 40 && currentDecayed < 70;

  const urgencyColor = isLow ? "#FF3B30" : isMedium ? meta.gradientFrom : "#34C759";

  return (
    <Animated.View style={[styles.cardWrap, animStyle]}>
      {/* The entire card is a single Pressable — tap anywhere to open drawer */}
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        {/* Left accent bar */}
        <LinearGradient
          colors={[meta.gradientFrom, meta.gradientTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.accentBar}
        />

        <View style={styles.content}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <View style={styles.labelGroup}>
              <CategoryIcon cat={meta.key} color={meta.gradientFrom} />
              <View style={styles.textGroup}>
                <Text style={styles.label}>{meta.label}</Text>
                <Text style={styles.rhythm}>{meta.rhythm}</Text>
              </View>
            </View>

            {/* Score */}
            <View style={styles.scoreGroup}>
              <Text style={[styles.scoreNum, { color: meta.gradientFrom }]}>
                {Math.round(currentDecayed)}
              </Text>
              <Text style={styles.scorePct}>%</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.barWrap}>
            <FluidProgressBar
              score={currentDecayed}
              gradientFrom={meta.gradientFrom}
              gradientTo={meta.gradientTo}
              height={8}
            />
          </View>

          {/* Footer: urgency indicator + action label */}
          <View style={styles.footer}>
            <View style={[styles.urgencyDot, { backgroundColor: urgencyColor }]} />
            <Text style={styles.urgencyText}>
              {isLow ? "Needs attention" : isMedium ? "Maintain" : "On track"}
            </Text>
            <View style={styles.logPill}>
              <LinearGradient
                colors={[meta.gradientFrom, meta.gradientTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.logPillGrad}
              >
                <Text style={styles.logPillText}>LOG</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrap: {
    marginBottom: SPACING.m,
    borderRadius: RADIUS.l,
    ...SHADOWS.card,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.l,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.60)",
  },
  cardPressed: {
    opacity: 0.92,
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: RADIUS.l,
    borderBottomLeftRadius: RADIUS.l,
  },
  content: {
    flex: 1,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.m,
    gap: SPACING.s,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
  },
  textGroup: {
    gap: 2,
  },
  label: {
    ...TYPOGRAPHY.labelL,
    color: COLORS.textPrimary,
  },
  rhythm: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
  scoreGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  scoreNum: {
    ...TYPOGRAPHY.displayM,
  },
  scorePct: {
    ...TYPOGRAPHY.labelL,
    color: COLORS.textTertiary,
    marginBottom: 3,
    marginLeft: 1,
  },
  barWrap: {
    marginVertical: SPACING.xs,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
    marginTop: 2,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.full,
  },
  urgencyText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    flex: 1,
  },
  logPill: {
    borderRadius: RADIUS.full,
    overflow: "hidden",
  },
  logPillGrad: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  logPillText: {
    ...TYPOGRAPHY.labelS,
    color: "#FFFFFF",
    letterSpacing: 1.2,
  },
});
