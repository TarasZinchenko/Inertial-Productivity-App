// src/components/RatingInput.tsx
// Custom 1-5 rating selector — minimalist, thin-stroke geometric dots.
// No emojis. Touch targets optimized for one-thumb interaction.

import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { COLORS, RADIUS, TYPOGRAPHY, SPACING } from "../constants/theme";

interface Props {
  value: number;      // 1–5
  onChange: (v: number) => void;
  color: string;
  label?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const RatingDot: React.FC<{
  index: number;
  selected: boolean;
  color: string;
  onPress: () => void;
}> = ({ index, selected, color, onPress }) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.85, { stiffness: 500, damping: 15 }),
      withSpring(1, { stiffness: 300, damping: 20 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.dot,
          selected
            ? [styles.dotSelected, { backgroundColor: color, borderColor: color }]
            : styles.dotUnselected,
        ]}
        activeOpacity={0.7}
      >
        <Text style={[styles.dotNumber, { color: selected ? "#FFF" : COLORS.textTertiary }]}>
          {index}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const RatingInput: React.FC<Props> = ({ value, onChange, color, label }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((i) => (
          <RatingDot
            key={i}
            index={i}
            selected={value >= i}
            color={color}
            onPress={() => onChange(i)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: SPACING.s,
  },
  label: {
    ...TYPOGRAPHY.labelS,
    color: COLORS.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.m,
  },
  dot: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  dotSelected: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dotUnselected: {
    backgroundColor: "rgba(0,0,0,0.03)",
    borderColor: "rgba(0,0,0,0.10)",
  },
  dotNumber: {
    ...TYPOGRAPHY.labelL,
  },
});
