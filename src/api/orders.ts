import { apiEndPoints } from "@/constant/apiEndpoints";
import axios from "@/helpers/axios";

export interface Receiver {
  name: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  shopId: number;
  receiver: Receiver;
  cartItemIds: number[];
  // Tính toán tài chính (BẮT BUỘC)
  subtotal: number;
  discountAmount: number;
  total: number;
  // Các trường tùy chọn
  discountCodeId?: number;
  shippingMethodId?: number;
  paymentMethodId?: number;
}

export interface CreateOrderResponse {
  orders: Array<{
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
    paymentMethod?: {
      id: number;
      name: string;
      key: string;
    };
    shippingMethodId?: number;
    shippingMethod?: {
      id: number;
      name: string;
      provider: string;
      price: number;
    };
    discountCodeId?: number;
    discountCode?: {
      id: number;
      code: string;
      type: string;
      value: number;
      bearer: string;
    };
    createdAt: string;
    updatedAt: string;
  }>;
  paymentId?: number;
}

export const createOrder = async (data: OrderItem[]): Promise<CreateOrderResponse | null> => {
  try {
    const payload = {
      method: "POST",
      url: apiEndPoints.ORDER,
      data,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
};

export const getOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  try {
    const payload = {
      method: "GET",
      url: apiEndPoints.ORDER,
      params,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getOrder = async (id: string) => {
  try {
    const payload = {
      method: "GET",
      url: `${apiEndPoints.ORDER}/${id}`,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const cancelOrder = async (id: string) => {
  try {
    const payload = {
      method: "PUT",
      url: `${apiEndPoints.ORDER}/${id}`,
      data: {}, // Empty body as per CancelOrderBodySchema
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const updateOrderStatus = async (
  orderId: string | number,
  status: string
) => {
  try {
    const payload = {
      method: "PATCH",
      url: `${apiEndPoints.ORDER}/${orderId}/status`,
      data: { status },
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    return null;
  }
};
