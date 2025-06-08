import React from "react";
import { Tabs } from "expo-router";
import { useSettingsStore } from "@/store/settingsStore";
import { colors } from "@/constants/colors";
import { Car, Settings } from "lucide-react-native";
import { AuthGuard } from "@/components/AuthGuard";


export default function TabLayout() {
  const { darkMode } = useSettingsStore();
  const theme = darkMode ? colors.dark : colors.light;
  
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.subtext,
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "AM MOTORS",
            tabBarLabel: "Inventory",
            tabBarIcon: ({ color, size }) => (
              <Car size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarLabel: "Settings",
            tabBarIcon: ({ color, size }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}