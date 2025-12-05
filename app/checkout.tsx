import { Stack, useRouter } from "expo-router";
import { Wallet, CreditCard, Smartphone } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { PaymentMethod } from "@/types";

export default function CheckoutScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cart, getTotal, clearCart } = useCart();
  const { createOrder } = useOrders();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [customerName, setCustomerName] = useState<string>(user?.name || "");
  const [customerPhone, setCustomerPhone] = useState<string>(user?.phone || "");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");

  React.useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        "Authentication Required",
        "Please sign in to continue",
        [
          {
            text: "OK",
            onPress: () => {
              router.back();
              router.push("/auth" as any);
            },
          },
        ]
      );
    }
  }, [isAuthenticated, router]);

  const deliveryFee = 50;
  const total = getTotal() + deliveryFee;

  const handlePlaceOrder = () => {
    if (!customerName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!customerPhone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert("Error", "Please enter delivery address");
      return;
    }

    if (paymentMethod !== "cash" && !transactionId.trim()) {
      Alert.alert(
        "Error",
        `Please enter ${paymentMethod === "bkash" ? "bKash" : "Nagad"} transaction ID`
      );
      return;
    }

    const order = createOrder(
      cart,
      paymentMethod,
      deliveryAddress,
      customerPhone,
      customerName,
      transactionId || undefined
    );

    clearCart();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Alert.alert(
      "Order Placed!",
      `Your order ${order.id} has been placed successfully`,
      [
        {
          text: "Track Order",
          onPress: () => {
            router.dismissAll();
            router.push(`/order/${order.id}` as any);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Checkout",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "bold" as const,
          },
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={Colors.light.textSecondary}
              value={customerName}
              onChangeText={setCustomerName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="01XXXXXXXXX"
              placeholderTextColor={Colors.light.textSecondary}
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Delivery Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter full address"
              placeholderTextColor={Colors.light.textSecondary}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <TouchableOpacity
            style={[
              styles.paymentCard,
              paymentMethod === "cash" && styles.paymentCardActive,
            ]}
            onPress={() => {
              setPaymentMethod("cash");
              setTransactionId("");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={styles.paymentLeft}>
              <View
                style={[
                  styles.paymentIcon,
                  paymentMethod === "cash" && styles.paymentIconActive,
                ]}
              >
                <Wallet
                  size={24}
                  color={
                    paymentMethod === "cash"
                      ? Colors.light.primary
                      : Colors.light.textSecondary
                  }
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.paymentTitle,
                    paymentMethod === "cash" && styles.paymentTitleActive,
                  ]}
                >
                  Cash on Delivery
                </Text>
                <Text style={styles.paymentDescription}>
                  Pay with cash when delivered
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radio,
                paymentMethod === "cash" && styles.radioActive,
              ]}
            >
              {paymentMethod === "cash" && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentCard,
              paymentMethod === "bkash" && styles.paymentCardActive,
            ]}
            onPress={() => {
              setPaymentMethod("bkash");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={styles.paymentLeft}>
              <View
                style={[
                  styles.paymentIcon,
                  paymentMethod === "bkash" && styles.paymentIconActive,
                ]}
              >
                <Smartphone
                  size={24}
                  color={
                    paymentMethod === "bkash"
                      ? Colors.light.primary
                      : Colors.light.textSecondary
                  }
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.paymentTitle,
                    paymentMethod === "bkash" && styles.paymentTitleActive,
                  ]}
                >
                  bKash
                </Text>
                <Text style={styles.paymentDescription}>
                  Send money: 01XXXXXXXXX
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radio,
                paymentMethod === "bkash" && styles.radioActive,
              ]}
            >
              {paymentMethod === "bkash" && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          {paymentMethod === "bkash" && (
            <View style={styles.transactionInput}>
              <TextInput
                style={styles.input}
                placeholder="Enter bKash Transaction ID"
                placeholderTextColor={Colors.light.textSecondary}
                value={transactionId}
                onChangeText={setTransactionId}
              />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.paymentCard,
              paymentMethod === "nagad" && styles.paymentCardActive,
            ]}
            onPress={() => {
              setPaymentMethod("nagad");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={styles.paymentLeft}>
              <View
                style={[
                  styles.paymentIcon,
                  paymentMethod === "nagad" && styles.paymentIconActive,
                ]}
              >
                <CreditCard
                  size={24}
                  color={
                    paymentMethod === "nagad"
                      ? Colors.light.primary
                      : Colors.light.textSecondary
                  }
                />
              </View>
              <View>
                <Text
                  style={[
                    styles.paymentTitle,
                    paymentMethod === "nagad" && styles.paymentTitleActive,
                  ]}
                >
                  Nagad
                </Text>
                <Text style={styles.paymentDescription}>
                  Send money: 01XXXXXXXXX
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.radio,
                paymentMethod === "nagad" && styles.radioActive,
              ]}
            >
              {paymentMethod === "nagad" && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          {paymentMethod === "nagad" && (
            <View style={styles.transactionInput}>
              <TextInput
                style={styles.input}
                placeholder="Enter Nagad Transaction ID"
                placeholderTextColor={Colors.light.textSecondary}
                value={transactionId}
                onChangeText={setTransactionId}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>৳{getTotal()}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>৳{deliveryFee}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>৳{total}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderText}>Place Order (৳{total})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  paymentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  paymentCardActive: {
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}05`,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentIconActive: {
    backgroundColor: `${Colors.light.primary}20`,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.light.text,
  },
  paymentTitleActive: {
    color: Colors.light.primary,
  },
  paymentDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    justifyContent: "center",
    alignItems: "center",
  },
  radioActive: {
    borderColor: Colors.light.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.primary,
  },
  transactionInput: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  summaryValue: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: Colors.light.primary,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  placeOrderButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  placeOrderText: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#FFFFFF",
  },
});
