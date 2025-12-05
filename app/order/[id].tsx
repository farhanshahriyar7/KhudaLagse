import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Check, MapPin, Phone, User, Receipt } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";

import Colors from "@/constants/colors";
import { useOrders } from "@/contexts/OrderContext";
import { OrderStatus } from "@/types";

const STATUS_STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "received", label: "Order Received", icon: "📦" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "on_the_way", label: "On the Way", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "✅" },
];

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getOrderById, updateOrderStatus } = useOrders();
  const [progressAnim] = useState(new Animated.Value(0));

  const order = getOrderById(id as string);

  useEffect(() => {
    if (order) {
      const currentIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
      Animated.timing(progressAnim, {
        toValue: currentIndex,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [order?.status, order, progressAnim]);

  if (!order) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text>Order not found</Text>
      </View>
    );
  }

  const currentStatusIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isDelivered = order.status === "delivered";
  const isCancelled = order.status === "cancelled";

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: `Order ${order.id}`,
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "bold" as const,
          },
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>
            {isCancelled ? "Order Cancelled" : STATUS_STEPS[currentStatusIndex]?.label}
          </Text>
          <Text style={styles.statusEmoji}>
            {isCancelled ? "❌" : STATUS_STEPS[currentStatusIndex]?.icon}
          </Text>
        </View>

        {!isCancelled && (
          <View style={styles.timelineContainer}>
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <View key={step.key} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        isCompleted && styles.timelineDotActive,
                        isCurrent && styles.timelineDotCurrent,
                      ]}
                    >
                      {isCompleted && <Check size={16} color="#FFFFFF" />}
                    </View>
                    {index < STATUS_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          isCompleted && styles.timelineLineActive,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineRight}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        isCompleted && styles.timelineLabelActive,
                        isCurrent && styles.timelineLabelCurrent,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {order.statusHistory.find((h) => h.status === step.key) && (
                      <Text style={styles.timelineTime}>
                        {new Date(
                          order.statusHistory.find((h) => h.status === step.key)!
                            .timestamp
                        ).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <User size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Customer Name</Text>
              <Text style={styles.detailValue}>{order.customerName}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Phone size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Phone Number</Text>
              <Text style={styles.detailValue}>{order.customerPhone}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MapPin size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Delivery Address</Text>
              <Text style={styles.detailValue}>{order.deliveryAddress}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <Text style={styles.orderItemName}>{item.name}</Text>
                <Text style={styles.orderItemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.orderItemPrice}>৳{item.price * item.quantity}</Text>
            </View>
          ))}

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>৳{order.totalAmount + 50}</Text>
          </View>

          <View style={styles.paymentInfo}>
            <Text style={styles.paymentLabel}>Payment Method</Text>
            <Text style={styles.paymentValue}>
              {order.paymentMethod === "cash"
                ? "Cash on Delivery"
                : order.paymentMethod === "bkash"
                ? "bKash"
                : "Nagad"}
            </Text>
            {order.transactionId && (
              <>
                <Text style={styles.paymentLabel}>Transaction ID</Text>
                <Text style={styles.paymentValue}>{order.transactionId}</Text>
              </>
            )}
          </View>
        </View>

        {isDelivered && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.invoiceButton}
              onPress={() => router.push(`/invoice/${order.id}` as any)}
            >
              <Receipt size={20} color="#FFFFFF" />
              <Text style={styles.invoiceButtonText}>Download Invoice</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isDelivered && !isCancelled && (
          <View style={styles.section}>
            <Text style={styles.demoTitle}>Demo: Update Status</Text>
            <View style={styles.demoButtons}>
              {STATUS_STEPS.map((step) => (
                <TouchableOpacity
                  key={step.key}
                  style={[
                    styles.demoButton,
                    order.status === step.key && styles.demoButtonActive,
                  ]}
                  onPress={() => updateOrderStatus(order.id, step.key)}
                >
                  <Text
                    style={[
                      styles.demoButtonText,
                      order.status === step.key && styles.demoButtonTextActive,
                    ]}
                  >
                    {step.icon} {step.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
  statusContainer: {
    backgroundColor: Colors.light.primary,
    padding: 32,
    alignItems: "center",
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  statusEmoji: {
    fontSize: 60,
  },
  timelineContainer: {
    padding: 24,
    backgroundColor: Colors.light.background,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  timelineItem: {
    flexDirection: "row",
    minHeight: 60,
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 16,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.border,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineDotActive: {
    backgroundColor: Colors.light.success,
  },
  timelineDotCurrent: {
    backgroundColor: Colors.light.primary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.light.border,
    marginTop: 4,
  },
  timelineLineActive: {
    backgroundColor: Colors.light.success,
  },
  timelineRight: {
    flex: 1,
    paddingVertical: 4,
  },
  timelineLabel: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    fontWeight: "600" as const,
  },
  timelineLabelActive: {
    color: Colors.light.text,
  },
  timelineLabelCurrent: {
    color: Colors.light.primary,
    fontWeight: "bold" as const,
  },
  timelineTime: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.light.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  orderItemLeft: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
  orderItemQuantity: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  orderItemPrice: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "bold" as const,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "bold" as const,
    color: Colors.light.primary,
  },
  paymentInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
  },
  paymentLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  invoiceButton: {
    flexDirection: "row",
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  invoiceButtonText: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#FFFFFF",
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  demoButtons: {
    gap: 8,
  },
  demoButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  demoButtonActive: {
    backgroundColor: `${Colors.light.primary}20`,
    borderColor: Colors.light.primary,
  },
  demoButtonText: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: "center",
  },
  demoButtonTextActive: {
    color: Colors.light.primary,
    fontWeight: "bold" as const,
  },
});
