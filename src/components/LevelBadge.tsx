// src/components/LevelBadge.tsx
// XP level ring badge displayed below the Core Visualizer.
// Shows current level, label, and animated progress arc.

import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { COLORS, TYPOGRAPHY, SPACING } from "../constants/theme";
import { LevelInfo } from "../engine/levels";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 86;
const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Props {
  levelInfo: LevelInfo;
}

export const LevelBadge: React.FC<Props> = ({ levelInfo }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(levelInfo.progress, { stiffness: 120, damping: 20 });
  }, [levelInfo.progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={styles.container}>
      <Svg width={RING_SIZE} height={RING_SIZE}>
        {/* Track ring */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke="rgba(0,0,0,0.07)"
          strokeWidth={4}
          fill="none"
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke="#8B5CF6"
          strokeWidth={4}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
        />
      </Svg>

      {/* Level number overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.center}>
          <Text style={styles.levelNum}>{levelInfo.level}</Text>
        </View>
      </View>

      {/* Label below */}
      <Text style={styles.levelLabel}>{levelInfo.label}</Text>
      <Text style={styles.xpLabel}>
        {levelInfo.xpRequired.toLocaleString()} → {levelInfo.xpForNext.toLocaleString()} XP
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: SPACING.xs,
  },
  center: {
      ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  levelNum: {
    ...TYPOGRAPHY.displayS,
    color: COLORS.textPrimary,
  },
  levelLabel: {
    ...TYPOGRAPHY.labelM,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  xpLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
});
