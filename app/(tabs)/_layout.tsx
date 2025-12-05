import { Tabs, useRouter } from "expo-router";
import { Home, ShoppingCart, PackageOpen, User } from "lucide-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";

export default function TabLayout() {
  const router = useRouter();
  const { user } = useAuth();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.light.background,
          borderTopColor: Colors.light.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600" as const,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: true,
          title: "KhudaLagse",
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: "bold",
            color: Colors.light.primary,
          },
          headerTitleAlign: "center",
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 16 }}
              onPress={() => {
                if (user) {
                  router.push("/profile");
                } else {
                  router.push("/auth");
                }
              }}
            >
              <User color={Colors.light.primary} size={24} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 16 }}
              onPress={() => router.push("/(tabs)/cart")}
            >
              <ShoppingCart color={Colors.light.primary} size={24} />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => <PackageOpen color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
