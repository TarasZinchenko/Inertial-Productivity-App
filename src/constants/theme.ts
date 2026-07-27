// src/constants/theme.ts
// Central design token file — single source of truth for the Apple Premium Light theme.

export const COLORS = {
  // Backgrounds
  background: "#F5F5F7",
  surface: "#FFFFFF",
  surfaceAlt: "rgba(255,255,255,0.72)",

  // Borders & Glassmorphism
  glassBorder: "rgba(255,255,255,0.50)",
  divider: "rgba(0,0,0,0.06)",

  // Text
  textPrimary: "#1C1C1E",
  textSecondary: "#636366",
  textTertiary: "#AEAEB2",

  // Category Accents
  sport: {
    from: "#34C759",
    to: "#30D158",
    glow: "rgba(52, 199, 89, 0.30)",
  },
  work: {
    from: "#FF9500",
    to: "#FFCC00",
    glow: "rgba(255, 149, 0, 0.28)",
  },
  language: {
    from: "#32ADE6",
    to: "#007AFF",
    glow: "rgba(50, 173, 230, 0.28)",
  },
  posture: {
    from: "#BF5AF2",
    to: "#9B59B6",
    glow: "rgba(191, 90, 242, 0.28)",
  },

  // Rank Colors
  rankS: "#FFD700",
  rankA: "#34C759",
  rankRecovery: "#32ADE6",
  rankC: "#AEAEB2",

  // Core states
  coreSleep: "#C7C7CC",
  coreAwake: "#FF9500",

  // Shadows
  shadowColor: "#000000",
};

export const SHADOWS = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 32,
    elevation: 3,
  },
  drawer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
  },
  orb: {
    shadowColor: "#FF9500",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    elevation: 0,
  },
};

export const TYPOGRAPHY = {
  // Display numerics (e.g., score %)
  displayXL: { fontFamily: "Inter_800ExtraBold", fontSize: 56, letterSpacing: -2 },
  displayL:  { fontFamily: "Inter_800ExtraBold", fontSize: 40, letterSpacing: -1.5 },
  displayM:  { fontFamily: "Inter_700Bold",      fontSize: 28, letterSpacing: -1 },
  displayS:  { fontFamily: "Inter_700Bold",      fontSize: 20, letterSpacing: -0.5 },

  // Body / Labels
  labelL:    { fontFamily: "Inter_600SemiBold",  fontSize: 16, letterSpacing: 0 },
  labelM:    { fontFamily: "Inter_600SemiBold",  fontSize: 13, letterSpacing: 0.2 },
  labelS:    { fontFamily: "Inter_500Medium",    fontSize: 11, letterSpacing: 0.5 },
  body:      { fontFamily: "Inter_400Regular",   fontSize: 15, letterSpacing: 0 },
  caption:   { fontFamily: "Inter_400Regular",   fontSize: 12, letterSpacing: 0.2 },
};

export const RADIUS = {
  xs: 8,
  s: 12,
  m: 16,
  l: 20,
  xl: 28,
  full: 9999,
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

// Spring physics preset for ALL animations
export const SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
};
