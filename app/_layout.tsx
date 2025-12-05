import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthContext } from "@/contexts/AuthContext";
import { CartContext } from "@/contexts/CartContext";
import { OrderContext } from "@/contexts/OrderContext";
import { requestNotificationPermissions } from "@/services/notificationService";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="food/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ presentation: "modal" }} />
      <Stack.Screen name="checkout" options={{ presentation: "modal" }} />
      <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="invoice/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    requestNotificationPermissions().catch((error) => {
      console.error("Failed to request notification permissions:", error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext>
        <CartContext>
          <OrderContext>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </OrderContext>
        </CartContext>
      </AuthContext>
    </QueryClientProvider>
  );
}
