// src/components/FluidProgressBar.tsx
// Spring-animated fluid progress bar using Reanimated layout animations.

import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, RADIUS, TYPOGRAPHY } from "../constants/theme";

interface Props {
  score: number;          // 0–100
  gradientFrom: string;
  gradientTo: string;
  height?: number;
  showLabel?: boolean;
}

export const FluidProgressBar: React.FC<Props> = ({
  score,
  gradientFrom,
  gradientTo,
  height = 10,
  showLabel = false,
}) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(score, {
      stiffness: 300,
      damping: 25,
    });
  }, [score]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as any,
  }));

  return (
    <View>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>Score</Text>
          <Text style={styles.scoreText}>{Math.round(score)}%</Text>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View style={[styles.fill, animatedStyle, { height }]}>
          <LinearGradient
            colors={[gradientFrom, gradientTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  labelText: {
    ...TYPOGRAPHY.labelS,
    color: COLORS.textTertiary,
    textTransform: "uppercase",
  },
  scoreText: {
    ...TYPOGRAPHY.labelM,
    color: COLORS.textSecondary,
  },
  track: {
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: RADIUS.full,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    borderRadius: RADIUS.full,
    overflow: "hidden",
    maxWidth: "100%",
  },
});
