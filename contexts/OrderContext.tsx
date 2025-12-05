import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Order, OrderStatus, PaymentMethod, CartItem } from "@/types";
import {
  sendOrderPlacedNotification,
  sendOrderStatusNotification,
} from "@/services/notificationService";

export const [OrderContext, useOrders] = createContextHook(() => {
  const [orders, setOrders] = useState<Order[]>([]);

  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem("orders");
      const parsed = stored ? JSON.parse(stored) : [];
      return parsed.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        statusHistory: order.statusHistory.map((h: any) => ({
          ...h,
          timestamp: new Date(h.timestamp),
        })),
      }));
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (newOrders: Order[]) => {
      await AsyncStorage.setItem("orders", JSON.stringify(newOrders));
      return newOrders;
    },
  });

  useEffect(() => {
    if (ordersQuery.data) {
      setOrders(ordersQuery.data);
    }
  }, [ordersQuery.data]);

  const createOrder = (
    items: CartItem[],
    paymentMethod: PaymentMethod,
    deliveryAddress: string,
    customerPhone: string,
    customerName: string,
    transactionId?: string
  ): Order => {
    const totalAmount = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items,
      totalAmount,
      paymentMethod,
      transactionId,
      status: "received",
      createdAt: new Date(),
      deliveryAddress,
      customerPhone,
      customerName,
      statusHistory: [
        {
          status: "received",
          timestamp: new Date(),
        },
      ],
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    syncMutation.mutate(updatedOrders);

    sendOrderPlacedNotification(newOrder.id).catch((error) => {
      console.error("Failed to send order placed notification:", error);
    });

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          status,
          statusHistory: [
            ...order.statusHistory,
            {
              status,
              timestamp: new Date(),
            },
          ],
        };
      }
      return order;
    });

    setOrders(updatedOrders);
    syncMutation.mutate(updatedOrders);

    sendOrderStatusNotification(orderId, status).catch((error) => {
      console.error("Failed to send status update notification:", error);
    });
  };

  const getOrderById = (orderId: string) => {
    return orders.find((order) => order.id === orderId);
  };

  return {
    orders,
    createOrder,
    updateOrderStatus,
    getOrderById,
    isLoading: ordersQuery.isLoading,
  };
});
