// src/navigation/AppNavigator.tsx
// Bottom tab navigator — Dashboard (Core) and History.
// Minimal, icon-forward design matching the Apple Premium Light aesthetic.

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { DashboardScreen } from "../screens/DashboardScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { COLORS, SHADOWS, TYPOGRAPHY, SPACING, RADIUS } from "../constants/theme";

const Tab = createBottomTabNavigator();

// Minimal SVG-like Unicode tab icons (geometric, not emoji)
const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Core:    { active: "◉", inactive: "◎" },
  History: { active: "▦", inactive: "▤" },
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + SPACING.xs }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const icon = TAB_ICONS[route.name];

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            {isFocused ? (
              <LinearGradient
                colors={["#FF9500", "#FFCC00"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activeIconBg}
              >
                <Text style={styles.iconActive}>{icon.active}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.inactiveIconBg}>
                <Text style={styles.iconInactive}>{icon.inactive}</Text>
              </View>
            )}
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Core" component={DashboardScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SPACING.s,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.l,
    justifyContent: "center",
    ...SHADOWS.card,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  activeIconBg: {
    width: 44,
    height: 32,
    borderRadius: RADIUS.s,
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveIconBg: {
    width: 44,
    height: 32,
    borderRadius: RADIUS.s,
    alignItems: "center",
    justifyContent: "center",
  },
  iconActive: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  iconInactive: {
    fontSize: 18,
    color: COLORS.textTertiary,
  },
  tabLabel: {
    ...TYPOGRAPHY.labelS,
    color: COLORS.textTertiary,
    letterSpacing: 0.4,
  },
  tabLabelActive: {
    color: "#FF9500",
  },
});
