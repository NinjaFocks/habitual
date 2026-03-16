import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "../hooks/useTheme";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const theme = useTheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#6C63FF",
            tabBarInactiveTintColor: theme.textTertiary,
            tabBarStyle: {
              backgroundColor: theme.tabBar,
              borderTopColor: theme.border,
              borderTopWidth: 1,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: "500",
              paddingVertical: 8,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Today",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="today-outline" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="stats"
            options={{
              title: "Stats",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="bar-chart-outline" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Settings",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings-outline" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="habit/[id]"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
