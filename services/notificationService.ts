import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { OrderStatus } from "@/types";

let Notifications: any = null;

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (Platform.OS !== "web" && !isExpoGo) {
  try {
    Notifications = require("expo-notifications");

    if (Notifications) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
  } catch (error) {
    console.warn("expo-notifications is not available:", error);
    Notifications = null;
  }
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === "web" || !Notifications) {
    console.log("Notifications not available on web");
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permissions not granted");
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("orders", {
      name: "Order Updates",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
};

export const sendOrderPlacedNotification = async (orderId: string) => {
  if (Platform.OS === "web" || !Notifications) {
    console.log("🎉 Order Placed:", orderId);
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎉 Order Placed Successfully!",
      body: `Your order ${orderId} has been received and is being prepared.`,
      data: { orderId, type: "order_placed" },
      sound: true,
    },
    trigger: null,
  });
};

export const sendOrderStatusNotification = async (
  orderId: string,
  status: OrderStatus
) => {
  const statusMessages: Record<OrderStatus, { title: string; body: string }> = {
    received: {
      title: "📋 Order Received",
      body: `Order ${orderId} has been received.`,
    },
    preparing: {
      title: "👨‍🍳 Preparing Your Food",
      body: `Your order ${orderId} is now being prepared with care.`,
    },
    on_the_way: {
      title: "🚴 On the Way!",
      body: `Your order ${orderId} is on the way to you!`,
    },
    delivered: {
      title: "✅ Delivered",
      body: `Your order ${orderId} has been delivered. Enjoy your meal!`,
    },
    cancelled: {
      title: "❌ Order Cancelled",
      body: `Your order ${orderId} has been cancelled.`,
    },
  };

  const message = statusMessages[status];

  if (Platform.OS === "web" || !Notifications) {
    console.log(`${message.title}:`, message.body);
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      data: { orderId, status, type: "status_update" },
      sound: true,
    },
    trigger: null,
  });
};
