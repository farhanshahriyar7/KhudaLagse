import { Stack, useRouter } from "expo-router";
import { ShoppingBag, Receipt } from "lucide-react-native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import Colors from "@/constants/colors";
import { useOrders } from "@/contexts/OrderContext";

const STATUS_CONFIG = {
  received: { label: "Order Received", color: Colors.light.primary, icon: "📦" },
  preparing: { label: "Preparing", color: Colors.light.secondary, icon: "👨‍🍳" },
  on_the_way: { label: "On the Way", color: Colors.light.warning, icon: "🚚" },
  delivered: { label: "Delivered", color: Colors.light.success, icon: "✅" },
  cancelled: { label: "Cancelled", color: Colors.light.error, icon: "❌" },
};

export default function OrdersScreen() {
  const router = useRouter();
  const { orders } = useOrders();

  const activeOrders = orders.filter(
    (order) => order.status !== "delivered" && order.status !== "cancelled"
  );
  const pastOrders = orders.filter(
    (order) => order.status === "delivered" || order.status === "cancelled"
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "My Orders",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "bold" as const,
          },
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Orders</Text>
            {activeOrders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status];
              return (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  onPress={() => router.push(`/order/${order.id}` as any)}
                >
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderId}>{order.id}</Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${statusConfig.color}20` },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: statusConfig.color }]}
                      >
                        {statusConfig.icon} {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderItems}>
                    <Text style={styles.orderItemsText}>
                      {order.items.map((item) => `${item.name} (${item.quantity})`).join(", ")}
                    </Text>
                  </View>

                  <View style={styles.orderFooter}>
                    <Text style={styles.orderTotal}>৳{order.totalAmount}</Text>
                    <Text style={styles.orderItemCount}>
                      {order.items.length} items
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {pastOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Orders</Text>
            {pastOrders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status];
              return (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  onPress={() => router.push(`/order/${order.id}` as any)}
                >
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderId}>{order.id}</Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${statusConfig.color}20` },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: statusConfig.color }]}
                      >
                        {statusConfig.icon} {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderItems}>
                    <Text style={styles.orderItemsText}>
                      {order.items.map((item) => `${item.name} (${item.quantity})`).join(", ")}
                    </Text>
                  </View>

                  <View style={styles.orderFooter}>
                    <Text style={styles.orderTotal}>৳{order.totalAmount}</Text>
                    <TouchableOpacity
                      style={styles.invoiceButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push(`/invoice/${order.id}` as any);
                      }}
                    >
                      <Receipt size={16} color={Colors.light.primary} />
                      <Text style={styles.invoiceText}>Invoice</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {orders.length === 0 && (
          <View style={styles.emptyState}>
            <ShoppingBag size={80} color={Colors.light.border} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>
              Start ordering delicious food!
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push("/(tabs)/" as any)}
            >
              <Text style={styles.browseButtonText}>Browse Menu</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.light.text,
  },
  orderDate: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItemsText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: Colors.light.primary,
  },
  orderItemCount: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  invoiceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${Colors.light.primary}10`,
    borderRadius: 8,
  },
  invoiceText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600" as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#FFFFFF",
  },
});
