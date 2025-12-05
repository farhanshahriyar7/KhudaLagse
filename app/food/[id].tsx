import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Plus, Minus, ShoppingBag } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { useCart } from "@/contexts/CartContext";
import { foodItems } from "@/mocks/foodItems";

export default function FoodDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const item = foodItems.find((food) => food.id === id);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>Food item not found</Text>
      </View>
    );
  }

  const handleAddToCart = () => {
    addToCart(item, quantity);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Added to Cart",
      `${item.name} (${quantity}) added to cart`,
      [
        { text: "Continue Shopping", style: "cancel" },
        {
          text: "View Cart",
          onPress: () => router.push("/(tabs)/cart" as any),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color={Colors.light.text} size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{item.name}</Text>
              {item.preparationTime && (
                <Text style={styles.time}>⏱️ {item.preparationTime} min</Text>
              )}
            </View>
            <Text style={styles.price}>৳{item.price}</Text>
          </View>

          <Text style={styles.description}>{item.description}</Text>

          {item.ingredients && item.ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <View style={styles.ingredientsContainer}>
                {item.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientTag}>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity === 1 && styles.quantityButtonDisabled,
                ]}
                onPress={() => {
                  if (quantity > 1) {
                    setQuantity(quantity - 1);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                disabled={quantity === 1}
              >
                <Minus
                  size={24}
                  color={
                    quantity === 1
                      ? Colors.light.textSecondary
                      : Colors.light.primary
                  }
                />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => {
                  setQuantity(quantity + 1);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Plus size={24} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>৳{item.price * quantity}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <ShoppingBag color="#FFFFFF" size={20} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  imageContainer: {
    position: "relative" as const,
  },
  image: {
    width: "100%",
    height: 350,
  },
  backButton: {
    position: "absolute" as const,
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  time: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  price: {
    fontSize: 28,
    fontWeight: "bold" as const,
    color: Colors.light.primary,
  },
  description: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  ingredientsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ingredientTag: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  ingredientText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.light.primary}20`,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
  quantityText: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    minWidth: 40,
    textAlign: "center",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  totalLabel: {
    fontSize: 18,
    color: Colors.light.textSecondary,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: "bold" as const,
    color: Colors.light.primary,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  addToCartButton: {
    flexDirection: "row",
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  addToCartText: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#FFFFFF",
  },
});
