import { apiEndPoints } from "@/constant/apiEndpoints";
import axios from "@/helpers/axios";

export interface ShippingMethod {
  id: number;
  name: string;
  provider: string;
  price: number;
  isActive: boolean;
}

export interface ShippingMethodsResponse {
  data: ShippingMethod[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Lấy danh sách phương thức vận chuyển
 * @param params - Query parameters (isActive, page, limit)
 */
export const getShippingMethods = async (params?: {
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<ShippingMethodsResponse | null> => {
  try {
    const payload = {
      method: "GET",
      url: `${apiEndPoints.SHIPPING_METHODS}`,
      params: {
        isActive: true,
        ...params,
      },
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching shipping methods:", error);
    return null;
  }
};
