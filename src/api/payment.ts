import { apiEndPoints } from "@/constant/apiEndpoints";
import axios from "@/helpers/axios";

export interface PaymentMethod {
  id: number;
  key: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface PaymentMethodsResponse {
  data: PaymentMethod[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Lấy danh sách phương thức thanh toán
 * @param params - Query parameters (isActive, page, limit)
 */
export const getPaymentMethods = async (params?: {
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<PaymentMethodsResponse | null> => {
  try {
    const payload = {
      method: "GET",
      url: `${apiEndPoints.PAYMENT_METHODS}`,
      params: {
        isActive: true,
        ...params,
      },
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return null;
  }
};
