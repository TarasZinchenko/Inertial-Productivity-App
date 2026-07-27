// src/components/ActionDrawer.tsx
// iOS-style bottom sheet modal with snapping spring physics (Reanimated 4 / GestureDetector API).

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, SHADOWS, TYPOGRAPHY, RADIUS, SPACING } from "../constants/theme";
import { CategoryMeta } from "../constants/categories";
import { RatingInput } from "./RatingInput";
import { useStore } from "../store/useStore";
import { getDecayedScore } from "../engine/math";
import { FluidProgressBar } from "./FluidProgressBar";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.52;
const SNAP_THRESHOLD = DRAWER_HEIGHT * 0.28;

interface Props {
  category: CategoryMeta | null;
  onClose: () => void;
}

export const ActionDrawer: React.FC<Props> = ({ category, onClose }) => {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(3);
  const translateY = useSharedValue(DRAWER_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const { categories, logEvent } = useStore();

  const closeDrawer = useCallback(() => {
    translateY.value = withSpring(DRAWER_HEIGHT, { stiffness: 300, damping: 26 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
    backdropOpacity.value = withTiming(0, { duration: 180 });
  }, [onClose]);

  const openDrawer = useCallback(() => {
    translateY.value = withSpring(0, { stiffness: 280, damping: 28 });
    backdropOpacity.value = withTiming(1, { duration: 220 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  useEffect(() => {
    if (category) {
      setRating(3);
      openDrawer();
    } else {
      // when category is set to null externally, snap closed
      translateY.value = withSpring(DRAWER_HEIGHT, { stiffness: 300, damping: 26 });
      backdropOpacity.value = withTiming(0, { duration: 180 });
    }
  }, [category?.key]);

  // Pan gesture for swipe-to-dismiss
  const startY = useSharedValue(0);
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, startY.value + event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > SNAP_THRESHOLD || event.velocityY > 800) {
        runOnJS(closeDrawer)();
      } else {
        translateY.value = withSpring(0, { stiffness: 300, damping: 25 });
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    });

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleLog = () => {
    if (!category) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    logEvent(category.key, rating);
  };

  if (!category) return null;

  const catState = categories[category.key];
  const decayed = getDecayedScore(category.key, catState.lastScore, catState.lastLogDate);

  // Preview score calculation
  let previewGain = 80; // sport default
  if (category.hasRating) {
    previewGain = 10 + rating * 10; // work / posture
    if (category.key === "posture") previewGain = rating * 15;
  } else if (category.key === "language") {
    previewGain = 40;
  }
  const previewScore = Math.min(100, decayed + previewGain);

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
        pointerEvents={category ? "auto" : "none"}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
      </Animated.View>

      {/* Drawer */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.drawer,
            drawerStyle,
            { paddingBottom: insets.bottom + SPACING.m, height: DRAWER_HEIGHT },
          ]}
        >
          {/* Pill handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.categoryLabel}>{category.label}</Text>
              <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
            </View>
            <TouchableOpacity onPress={closeDrawer} style={styles.closeBtn} activeOpacity={0.7}>
              <View style={styles.closeBtnInner}>
                <Text style={styles.closeX}>×</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Score preview */}
          <View style={styles.scorePreview}>
            <Text style={styles.previewLabel}>PROJECTED SCORE</Text>
            <Text style={[styles.previewScore, { color: category.gradientFrom }]}>
              {Math.round(previewScore)}
            </Text>
            <FluidProgressBar
              score={previewScore}
              gradientFrom={category.gradientFrom}
              gradientTo={category.gradientTo}
            />
          </View>

          {/* Rating input (Work & Posture only) */}
          {category.hasRating && (
            <View style={styles.ratingSection}>
              <RatingInput
                value={rating}
                onChange={setRating}
                color={category.gradientFrom}
                label={category.ratingLabel}
              />
            </View>
          )}

          {/* Log button */}
          <TouchableOpacity onPress={handleLog} activeOpacity={0.88} style={styles.logBtnWrapper}>
            <LinearGradient
              colors={[category.gradientFrom, category.gradientTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logBtn}
            >
              <Text style={styles.logBtnText}>Log {category.label} Session</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.28)",
    zIndex: 10,
  },
  drawer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
    zIndex: 20,
    ...SHADOWS.drawer,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.divider,
    alignSelf: "center",
    marginBottom: SPACING.m,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.l,
  },
  categoryLabel: {
    ...TYPOGRAPHY.displayS,
    color: COLORS.textPrimary,
  },
  categorySubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: { marginTop: 2 },
  closeBtnInner: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeX: {
    fontSize: 20,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  scorePreview: {
    marginBottom: SPACING.l,
    gap: SPACING.xs,
  },
  previewLabel: {
    ...TYPOGRAPHY.labelS,
    color: COLORS.textTertiary,
    letterSpacing: 1.2,
  },
  previewScore: {
    ...TYPOGRAPHY.displayL,
  },
  ratingSection: {
    marginBottom: SPACING.l,
    alignItems: "center",
  },
  logBtnWrapper: {
    borderRadius: RADIUS.l,
    overflow: "hidden",
    marginTop: "auto",
  },
  logBtn: {
    paddingVertical: SPACING.m + 2,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.l,
  },
  logBtnText: {
    ...TYPOGRAPHY.labelL,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
