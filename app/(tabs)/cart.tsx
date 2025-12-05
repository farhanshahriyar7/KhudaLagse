import { Stack, useRouter } from "expo-router";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react-native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Image } from "expo-image";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function CartScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cart, updateQuantity, removeFromCart, getTotal } = useCart();

  const handleRemoveItem = (itemId: string, itemName: string) => {
    Alert.alert(
      "Remove Item",
      `Remove ${itemName} from cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeFromCart(itemId),
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Please add items to cart before checkout");
      return;
    }

    if (!isAuthenticated) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to continue with checkout",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Sign In",
            onPress: () => router.push("/auth" as any),
          },
        ]
      );
      return;
    }

    router.push("/checkout" as any);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Cart",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "bold" as const,
          },
        }}
      />

      {cart.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Add some delicious food to get started!</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.back()}
          >
            <Text style={styles.browseButtonText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.itemsContainer}>
              {cart.map((item) => (
                <View key={item.id} style={styles.cartItem}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>৳{item.price}</Text>
                    
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus size={16} color={Colors.light.primary} />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={16} color={Colors.light.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.itemRight}>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(item.id, item.name)}
                    >
                      <Trash2 size={20} color={Colors.light.error} />
                    </TouchableOpacity>
                    <Text style={styles.itemTotal}>
                      ৳{item.price * item.quantity}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>৳{getTotal()}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>৳50</Text>
              </View>
              
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>৳{getTotal() + 50}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.checkoutContainer}>
            <View style={styles.checkoutInfo}>
              <Text style={styles.checkoutTotal}>৳{getTotal() + 50}</Text>
              <Text style={styles.checkoutItems}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: Colors.light.text,
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
  itemsContainer: {
    padding: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.light.text,
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: `${Colors.light.primary}20`,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    minWidth: 24,
    textAlign: "center",
  },
  itemRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  removeButton: {
    padding: 4,
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: Colors.light.primary,
  },
  summaryContainer: {
    backgroundColor: Colors.light.background,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginBottom: 16,
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
  checkoutContainer: {
    flexDirection: "row",
    backgroundColor: Colors.light.background,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 12,
  },
  checkoutInfo: {
    justifyContent: "center",
  },
  checkoutTotal: {
    fontSize: 22,
    fontWeight: "bold" as const,
    color: Colors.light.text,
  },
  checkoutItems: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  checkoutButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#FFFFFF",
  },
});
