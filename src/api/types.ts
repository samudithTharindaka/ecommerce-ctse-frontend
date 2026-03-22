export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: string;
  username: string;
  email: string;
  roles: string[];
}

export interface TokenValidationResponse {
  valid: boolean;
  userId?: string;
  username?: string;
  roles?: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sellerId?: string;
  sellerName?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

export interface StockCheckResponse {
  productId: string;
  requestedQuantity: number;
  available: boolean;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface CartResponse {
  cartId: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderResponse {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  shippingAddress: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentResponse {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  description?: string;
  failureReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiErrorBody {
  message?: string;
  error?: string;
  status?: number;
}
