export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  ingredients?: string[];
  preparationTime?: number;
  isPopular?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

export type PaymentMethod = 'cash' | 'bkash' | 'nagad';

export type OrderStatus = 'received' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  status: OrderStatus;
  createdAt: Date;
  deliveryAddress: string;
  customerPhone: string;
  customerName: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: Date;
  }[];
}
