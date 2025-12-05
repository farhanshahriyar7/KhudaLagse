import { Stack, useLocalSearchParams } from "expo-router";
import { Download, Share2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import Colors from "@/constants/colors";
import { useOrders } from "@/contexts/OrderContext";

export default function InvoiceScreen() {
  const { id } = useLocalSearchParams();
  const { getOrderById } = useOrders();
  const [isGenerating, setIsGenerating] = useState(false);

  const order = getOrderById(id as string);

  if (!order) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text>Order not found</Text>
      </View>
    );
  }

  const deliveryFee = 50;
  const total = order.totalAmount + deliveryFee;

  const generateHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Invoice - ${order.id}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 40px;
              background: #fff;
              color: #1A1A1A;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid ${Colors.light.primary};
            }
            .company-name {
              font-size: 36px;
              font-weight: bold;
              color: ${Colors.light.primary};
              margin-bottom: 8px;
            }
            .invoice-title {
              font-size: 24px;
              color: #666;
              margin-top: 20px;
            }
            .info-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .info-block {
              flex: 1;
            }
            .info-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .info-value {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 12px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
            }
            .items-table th {
              background: #F8F8F8;
              padding: 12px;
              text-align: left;
              font-size: 14px;
              color: #666;
              text-transform: uppercase;
              border-bottom: 2px solid #E5E5E5;
            }
            .items-table td {
              padding: 16px 12px;
              border-bottom: 1px solid #E5E5E5;
            }
            .item-name {
              font-weight: 600;
              font-size: 16px;
            }
            .totals {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #E5E5E5;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              font-size: 16px;
            }
            .total-row.grand-total {
              font-size: 22px;
              font-weight: bold;
              color: ${Colors.light.primary};
              margin-top: 16px;
              padding-top: 16px;
              border-top: 2px solid #E5E5E5;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
              font-size: 14px;
              padding-top: 20px;
              border-top: 1px solid #E5E5E5;
            }
            .payment-info {
              background: #F8F8F8;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">KhudaLagse</div>
            <div class="invoice-title">INVOICE</div>
          </div>

          <div class="info-section">
            <div class="info-block">
              <div class="info-label">Order ID</div>
              <div class="info-value">${order.id}</div>
              
              <div class="info-label">Date</div>
              <div class="info-value">${new Date(order.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}</div>
              
              <div class="info-label">Time</div>
              <div class="info-value">${new Date(order.createdAt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}</div>
            </div>

            <div class="info-block" style="text-align: right;">
              <div class="info-label">Customer Name</div>
              <div class="info-value">${order.customerName}</div>
              
              <div class="info-label">Phone</div>
              <div class="info-value">${order.customerPhone}</div>
              
              <div class="info-label">Delivery Address</div>
              <div class="info-value">${order.deliveryAddress}</div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
        .map(
          (item) => `
                <tr>
                  <td class="item-name">${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>৳${item.price}</td>
                  <td>৳${item.price * item.quantity}</td>
                </tr>
              `
        )
        .join("")}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>৳${order.totalAmount}</span>
            </div>
            <div class="total-row">
              <span>Delivery Fee</span>
              <span>৳${deliveryFee}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total</span>
              <span>৳${total}</span>
            </div>
          </div>

          <div class="payment-info">
            <div class="info-label">Payment Method</div>
            <div class="info-value">
              ${order.paymentMethod === "cash"
        ? "Cash on Delivery"
        : order.paymentMethod === "bkash"
          ? "bKash"
          : "Nagad"
      }
            </div>
            ${order.transactionId
        ? `
              <div class="info-label">Transaction ID</div>
              <div class="info-value">${order.transactionId}</div>
            `
        : ""
      }
          </div>

          <div class="footer">
            <p>Thank you for your order!</p>
            <p>KhudaLagse - Delicious food delivered to your door</p>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      const html = generateHTML();

      if (Platform.OS === "web") {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.print();
        }
      } else {
        const { uri } = await Print.printToFileAsync({ html });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert("Success", "Invoice generated successfully");
        }
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsGenerating(true);
      const html = generateHTML();

      if (Platform.OS === "web") {
        Alert.alert("Info", "Share feature is available on mobile devices");
      } else {
        const { uri } = await Print.printToFileAsync({ html });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }
      }
    } catch (error) {
      console.error("Error sharing invoice:", error);
      Alert.alert("Error", "Failed to share invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Invoice",
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: "bold" as const,
          },
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.invoiceContainer}>
          <View style={styles.header}>
            <Text style={styles.companyName}>KhudaLagse</Text>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Order ID</Text>
              <Text style={styles.infoValue}>{order.id}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Details</Text>
            <Text style={styles.detailText}>{order.customerName}</Text>
            <Text style={styles.detailText}>{order.customerPhone}</Text>
            <Text style={styles.detailText}>{order.deliveryAddress}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {order.items.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    ৳{item.price} × {item.quantity}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>৳{item.price * item.quantity}</Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>৳{order.totalAmount}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery Fee</Text>
              <Text style={styles.totalValue}>৳{deliveryFee}</Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>৳{total}</Text>
            </View>
          </View>

          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <Text style={styles.detailText}>
              Method:{" "}
              {order.paymentMethod === "cash"
                ? "Cash on Delivery"
                : order.paymentMethod === "bkash"
                  ? "bKash"
                  : "Nagad"}
            </Text>
            {order.transactionId && (
              <Text style={styles.detailText}>
                Transaction ID: {order.transactionId}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDownloadPDF}
          disabled={isGenerating}
        >
          <Download size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>
            {isGenerating ? "Generating..." : "Download PDF"}
          </Text>
        </TouchableOpacity>

        {Platform.OS !== "web" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
            disabled={isGenerating}
          >
            <Share2 size={20} color={Colors.light.primary} />
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        )}
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
  invoiceContainer: {
    margin: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  header: {
    alignItems: "center",
    paddingBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary,
    marginBottom: 24,
  },
  companyName: {
    fontSize: 32,
    fontWeight: "bold" as const,
    color: Colors.light.primary,
    marginBottom: 8,
  },
  invoiceTitle: {
    fontSize: 20,
    color: Colors.light.textSecondary,
    marginTop: 12,
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  infoBlock: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.light.text,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  detailText: {
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.light.text,
  },
  totalsSection: {
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: Colors.light.border,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  grandTotalRow: {
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: Colors.light.border,
  },
  grandTotalLabel: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: Colors.light.text,
  },
  grandTotalValue: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: Colors.light.primary,
  },
  paymentSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#FFFFFF",
  },
  shareButton: {
    backgroundColor: `${Colors.light.primary}20`,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.light.primary,
  },
});
