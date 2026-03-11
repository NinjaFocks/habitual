import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Habitual",
  slug: "habitual",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0a0a0a",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.habitual.app",
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0a0a0a",
    },
    package: "com.habitual.app",
    permissions: ["RECEIVE_BOOT_COMPLETED", "SCHEDULE_EXACT_ALARM"],
  },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png",
        color: "#6C63FF",
        sounds: [],
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  scheme: "habitual",
  extra: {
    eas: {
      projectId: "06e31e20-88f3-4707-bf8e-8ccf8f92ee4c",
    },
  }
});
