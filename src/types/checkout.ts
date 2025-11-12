/**
 * Type definitions for Checkout feature
 */

// Discount Code Types
export interface DiscountCode {
  id: number;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  bearer: "ADMIN" | "SHOP";
  shopId: number | null;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

// Shipping Method Types
export interface ShippingMethod {
  id: number;
  name: string;
  provider: string;
  price: number;
  isActive: boolean;
}

// Payment Method Types
export interface PaymentMethod {
  id: number;
  key: string;
  name: string;
  description: string;
  isActive: boolean;
}

// Order Types
export interface Receiver {
  name: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  shopId: number;
  receiver: Receiver;
  cartItemIds: number[];
  // Financial calculations (REQUIRED)
  subtotal: number;
  discountAmount: number;
  total: number;
  // Optional fields
  discountCodeId?: number;
  shippingMethodId?: number;
  paymentMethodId?: number;
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  receiver: Receiver;
  shopId: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  commissionRate: number;
  adminCommissionAmount: number;
  shopPayoutAmount: number;
  payoutStatus: string;
  paymentMethodId?: number;
  paymentMethod?: PaymentMethod;
  shippingMethodId?: number;
  shippingMethod?: ShippingMethod;
  discountCodeId?: number;
  discountCode?: DiscountCode;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderResponse {
  data: Order[];
  paymentId?: number;
}

// Validation Types
export interface DiscountCodeValidation {
  valid: boolean;
  reason?: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type DiscountCodesResponse = PaginatedResponse<DiscountCode>;
export type ShippingMethodsResponse = PaginatedResponse<ShippingMethod>;
export type PaymentMethodsResponse = PaginatedResponse<PaymentMethod>;
