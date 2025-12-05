import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { ShoppingCart, Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";

import Colors from "@/constants/colors";
import { useCart } from "@/contexts/CartContext";
import { categories } from "@/mocks/categories";
import { foodItems } from "@/mocks/foodItems";

export default function HomeScreen() {
  const router = useRouter();
  const { getItemCount } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredItems = foodItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularItems = foodItems.filter((item) => item.isPopular);

  return (
    <View style={styles.container}>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search color={Colors.light.textSecondary} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for food..."
              placeholderTextColor={Colors.light.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === "All" && styles.categoryCardActive,
              ]}
              onPress={() => setSelectedCategory("All")}
            >
              <Text style={styles.categoryIcon}>🍽️</Text>
              <Text
                style={[
                  styles.categoryName,
                  selectedCategory === "All" && styles.categoryNameActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.name &&
                  styles.categoryCardActive,
                ]}
                onPress={() => setSelectedCategory(category.name)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    selectedCategory === category.name &&
                    styles.categoryNameActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedCategory === "All" && searchQuery.length === 0 && popularItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Items 🔥</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.popularContainer}
            >
              {popularItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.popularCard}
                  onPress={() => router.push(`/food/${item.id}` as any)}
                >
                  <Image source={{ uri: item.image }} style={styles.popularImage} />
                  <View style={styles.popularInfo}>
                    <Text style={styles.popularName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.popularPrice}>৳{item.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === "All" ? "All Items" : selectedCategory}
          </Text>
          <View style={styles.foodGrid}>
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.foodCard}
                onPress={() => router.push(`/food/${item.id}` as any)}
              >
                <Image source={{ uri: item.image }} style={styles.foodImage} />
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text
                    style={styles.foodDescription}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                  <View style={styles.foodFooter}>
                    <Text style={styles.foodPrice}>৳{item.price}</Text>
                    {item.preparationTime && (
                      <Text style={styles.foodTime}>
                        ⏱️ {item.preparationTime} min
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {filteredItems.length === 0 && searchQuery.length > 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ color: Colors.light.textSecondary, fontSize: 16 }}>
                  No items found matching "{searchQuery}"
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  cartButton: {
    marginRight: 16,
    position: "relative" as const,
  },
  badge: {
    position: "absolute" as const,
    top: -8,
    right: -8,
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold" as const,
  },
  searchContainer: {
    padding: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    alignItems: "center",
    backgroundColor: Colors.light.background,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.light.border,
    minWidth: 100,
  },
  categoryCardActive: {
    borderColor: Colors.light.primary,
    backgroundColor: `${Colors.light.primary}10`,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
  categoryNameActive: {
    color: Colors.light.primary,
    fontWeight: "bold" as const,
  },
  popularContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  popularCard: {
    width: 200,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  popularImage: {
    width: "100%",
    height: 140,
  },
  popularInfo: {
    padding: 12,
  },
  popularName: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  popularPrice: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: Colors.light.primary,
  },
  foodGrid: {
    paddingHorizontal: 16,
    gap: 16,
  },
  foodCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: "row",
    marginBottom: 0,
  },
  foodImage: {
    width: 120,
    height: 120,
  },
  foodInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  foodDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  foodFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  foodPrice: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: Colors.light.primary,
  },
  foodTime: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
});
