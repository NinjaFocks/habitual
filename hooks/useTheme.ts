import { useColorScheme } from "react-native";
import { useStore } from "../store";

export const LIGHT_THEME = {
  background: "#F7F7F7",
  surface: "#FFFFFF",
  surfaceSecondary: "#F0F0F0",
  border: "#E5E5E5",
  text: "#1A1A1A",
  textSecondary: "#6B6B6B",
  textTertiary: "#9B9B9B",
  inactive: "#D4D4D4",
  card: "#FFFFFF",
  tabBar: "#FFFFFF",
};

export const DARK_THEME = {
  background: "#0D0D0D",
  surface: "#1A1A1A",
  surfaceSecondary: "#242424",
  border: "#2E2E2E",
  text: "#F5F5F5",
  textSecondary: "#A0A0A0",
  textTertiary: "#5E5E5E",
  inactive: "#3A3A3A",
  card: "#1A1A1A",
  tabBar: "#111111",
};

export type Theme = typeof DARK_THEME;

export const useTheme = () => {
  const systemScheme = useColorScheme();
  const { settings } = useStore();

  const isDark =
    settings.theme === "dark" ||
    (settings.theme === "system" && systemScheme === "dark");

  return isDark ? DARK_THEME : LIGHT_THEME;
};
