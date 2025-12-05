import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { CartItem, FoodItem } from "@/types";

export const [CartContext, useCart] = createContextHook(() => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (newCart: CartItem[]) => {
      await AsyncStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    },
  });

  useEffect(() => {
    if (cartQuery.data) {
      setCart(cartQuery.data);
    }
  }, [cartQuery.data]);

  const addToCart = (item: FoodItem, quantity = 1) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    let updatedCart: CartItem[];

    if (existingItem) {
      updatedCart = cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      );
    } else {
      updatedCart = [...cart, { ...item, quantity }];
    }

    setCart(updatedCart);
    syncMutation.mutate(updatedCart);
  };

  const removeFromCart = (itemId: string) => {
    const updatedCart = cart.filter((item) => item.id !== itemId);
    setCart(updatedCart);
    syncMutation.mutate(updatedCart);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedCart = cart.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    setCart(updatedCart);
    syncMutation.mutate(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
    syncMutation.mutate([]);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    isLoading: cartQuery.isLoading,
  };
});
