// src/components/CoreVisualizer.tsx
// "DARK MATTER ENERGY CORE" — cosmic SVG artifact with Reanimated spring physics.
//
// Structure (outer → inner):
//   1. Outer Pulsing Energy Aura — soft blurred radial glow
//   2. Rotating Nebula Rings — multi-layered SVG gradients with slow rotation
//   3. Inner Dark Nucleus — obsidian core with dynamic specular highlights
//
// Palette:
//   Deep Void Obsidian (#0B0813)
//   Pulsing Indigo (#2D1B69)
//   Plasma Purple (#8B5CF6)
//   Ethereal Cyan (#06B6D4)
//
// Low Energy State (avg < 50%): desaturates to dim cracked obsidian.

import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  interpolate,
  interpolateColor,
  Easing,
} from "react-native-reanimated";
import Svg, { Defs, RadialGradient, Stop, Circle, Ellipse, G, Rect } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedG = Animated.createAnimatedComponent(G);

const SIZE = 260;
const HALF = SIZE / 2;

// ── Color Palette ──────────────────────────────────
const AWAKE = {
  voidCore:     "#0B0813",
  indigo:       "#2D1B69",
  plasma:       "#8B5CF6",
  cyan:         "#06B6D4",
  auraOuter:    "rgba(139, 92, 246, 0.00)",
  auraInner:    "rgba(6, 182, 212, 0.35)",
  ringStroke:   "rgba(139, 92, 246, 0.25)",
  specular:     "rgba(6, 182, 212, 0.40)",
  highlight:    "rgba(255, 255, 255, 0.18)",
};

const DORMANT = {
  voidCore:     "#15131A",
  indigo:       "#1A1820",
  plasma:       "#3D3650",
  cyan:         "#2A2833",
  auraOuter:    "rgba(60, 54, 80, 0.00)",
  auraInner:    "rgba(42, 40, 51, 0.12)",
  ringStroke:   "rgba(60, 54, 80, 0.12)",
  specular:     "rgba(42, 40, 51, 0.10)",
  highlight:    "rgba(255, 255, 255, 0.04)",
};

interface Props {
  averageScore: number; // 0–100
  isAwake: boolean;     // false if avg < 50%
}

export const CoreVisualizer: React.FC<Props> = ({ averageScore, isAwake }) => {
  const palette = isAwake ? AWAKE : DORMANT;

  // ── Breathing scale (1.0 → 1.05 → 1.0) with spring physics ────────
  const breathe = useSharedValue(1);
  useEffect(() => {
    breathe.value = withRepeat(
      withSpring(isAwake ? 1.05 : 1.015, {
        stiffness: isAwake ? 12 : 6,
        damping: isAwake ? 4 : 8,
      }),
      -1,
      true
    );
  }, [isAwake]);

  // ── Rotation for nebula rings (slow continuous) ────────────────────
  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);
  useEffect(() => {
    const speed1 = isAwake ? 12000 : 30000;
    const speed2 = isAwake ? 18000 : 45000;
    rotation1.value = withRepeat(
      withTiming(360, { duration: speed1, easing: Easing.linear }),
      -1, false
    );
    rotation2.value = withRepeat(
      withTiming(-360, { duration: speed2, easing: Easing.linear }),
      -1, false
    );
  }, [isAwake]);

  // ── Aura pulse radius driven by average score ─────────────────────
  const auraR = useSharedValue(90);
  useEffect(() => {
    auraR.value = withSpring(80 + (averageScore / 100) * 50, { stiffness: 60, damping: 18 });
  }, [averageScore]);

  // ── Inner nucleus subtle pulse ─────────────────────────────────────
  const nucleusR = useSharedValue(52);
  useEffect(() => {
    nucleusR.value = withRepeat(
      withTiming(isAwake ? 55 : 53, { duration: isAwake ? 2400 : 6000, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
  }, [isAwake]);

  // ── Animated Props ─────────────────────────────────────────────────
  const animatedAuraProps = useAnimatedProps(() => ({
    r: auraR.value,
  }));

  const animatedNucleusProps = useAnimatedProps(() => ({
    r: nucleusR.value,
  }));

  // ── Ring 1 rotation style ──────────────────────────────────────────
  const ring1Style = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation1.value}deg` },
    ],
  }));

  // ── Ring 2 rotation style (counter-rotate) ─────────────────────────
  const ring2Style = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation2.value}deg` },
    ],
  }));

  // ── Outer breathing container ──────────────────────────────────────
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: breathe.value },
    ],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <Defs>
          {/* Aura glow gradient */}
          <RadialGradient id="auraGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={palette.cyan} stopOpacity={isAwake ? "0.35" : "0.08"} />
            <Stop offset="40%" stopColor={palette.plasma} stopOpacity={isAwake ? "0.18" : "0.04"} />
            <Stop offset="100%" stopColor={palette.plasma} stopOpacity="0" />
          </RadialGradient>

          {/* Core nucleus gradient — dark center, purple edge */}
          <RadialGradient id="nucleusGrad" cx="40%" cy="35%" r="65%">
            <Stop offset="0%" stopColor={palette.voidCore} />
            <Stop offset="60%" stopColor={palette.indigo} />
            <Stop offset="100%" stopColor={palette.plasma} />
          </RadialGradient>

          {/* Specular highlight — ethereal cyan */}
          <RadialGradient id="specularGrad" cx="32%" cy="28%" r="40%">
            <Stop offset="0%" stopColor={palette.specular} />
            <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </RadialGradient>

          {/* Inner void glow */}
          <RadialGradient id="innerGlow" cx="50%" cy="50%" r="35%">
            <Stop offset="0%" stopColor={palette.cyan} stopOpacity={isAwake ? "0.12" : "0.02"} />
            <Stop offset="100%" stopColor={palette.voidCore} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* ── Layer 1: Outer Pulsing Energy Aura ────────────────── */}
        <AnimatedCircle
          cx={HALF}
          cy={HALF}
          fill="url(#auraGrad)"
          animatedProps={animatedAuraProps}
        />

        {/* ── Layer 2: Nebula Ring 1 (tilted ellipse, slow rotate) ─ */}
        <Ellipse
          cx={HALF}
          cy={HALF}
          rx={72}
          ry={28}
          fill="none"
          stroke={palette.ringStroke}
          strokeWidth={1.2}
          opacity={isAwake ? 0.65 : 0.2}
          rotation={25}
          origin={`${HALF}, ${HALF}`}
        />

        {/* ── Layer 2b: Nebula Ring 2 (counter-tilted, dotted) ──── */}
        <Ellipse
          cx={HALF}
          cy={HALF}
          rx={80}
          ry={22}
          fill="none"
          stroke={palette.ringStroke}
          strokeWidth={0.8}
          strokeDasharray="4,8"
          opacity={isAwake ? 0.45 : 0.1}
          rotation={-15}
          origin={`${HALF}, ${HALF}`}
        />

        {/* ── Layer 2c: Energy orbit ring ──────────────────────── */}
        <Circle
          cx={HALF}
          cy={HALF}
          r={65}
          fill="none"
          stroke={palette.plasma}
          strokeWidth={0.6}
          opacity={isAwake ? 0.3 : 0.06}
        />

        {/* ── Layer 3: Inner Dark Nucleus ──────────────────────── */}
        <AnimatedCircle
          cx={HALF}
          cy={HALF}
          fill="url(#nucleusGrad)"
          animatedProps={animatedNucleusProps}
        />

        {/* Inner void glow (subtle cyan center point) */}
        <Circle
          cx={HALF}
          cy={HALF}
          r={20}
          fill="url(#innerGlow)"
        />

        {/* Specular highlight — top-left arc shimmer */}
        <Ellipse
          cx={HALF - 14}
          cy={HALF - 18}
          rx={18}
          ry={10}
          fill="url(#specularGrad)"
          opacity={isAwake ? 0.8 : 0.15}
        />

        {/* Thin rim ring — barely visible structure line */}
        <Circle
          cx={HALF}
          cy={HALF}
          r={54}
          fill="none"
          stroke={palette.highlight}
          strokeWidth={0.8}
        />

        {/* Outer structure ring */}
        <Circle
          cx={HALF}
          cy={HALF}
          r={58}
          fill="none"
          stroke={palette.ringStroke}
          strokeWidth={0.4}
          strokeDasharray="2,6"
          opacity={isAwake ? 0.4 : 0.08}
        />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
