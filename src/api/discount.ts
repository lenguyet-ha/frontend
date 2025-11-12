import { apiEndPoints } from "@/constant/apiEndpoints";
import axios from "@/helpers/axios";

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

export interface DiscountCodesResponse {
  data: DiscountCode[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Lấy danh sách mã giảm giá
 * @param params - Query parameters (isActive, page, limit)
 */
export const getDiscountCodes = async (params?: {
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<DiscountCodesResponse | null> => {
  try {
    const payload = {
      method: "GET",
      url: `${apiEndPoints.DISCOUNT_CODES}`,
      params: {
        isActive: true,
        page: 1,
        limit: 100,
        ...params,
      },
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching discount codes:", error);
    return null;
  }
};

/**
 * Kiểm tra mã giảm giá có hợp lệ không
 * @param discountCode - Thông tin mã giảm giá
 * @param shopId - ID của shop (nếu cần kiểm tra mã của shop)
 */
export const isDiscountCodeValid = (
  discountCode: DiscountCode,
  shopId?: number
): { valid: boolean; reason?: string } => {
  const now = new Date();
  const validFrom = new Date(discountCode.validFrom);
  const validTo = new Date(discountCode.validTo);

  // Kiểm tra thời gian hiệu lực
  if (now < validFrom) {
    return { valid: false, reason: "Mã giảm giá chưa có hiệu lực" };
  }
  if (now > validTo) {
    return { valid: false, reason: "Mã giảm giá đã hết hạn" };
  }

  // Kiểm tra số lượt sử dụng
  if (discountCode.usedCount >= discountCode.usageLimit) {
    return { valid: false, reason: "Mã giảm giá đã hết lượt sử dụng" };
  }

  // Kiểm tra mã của shop
  if (discountCode.bearer === "SHOP" && discountCode.shopId !== null) {
    if (shopId && discountCode.shopId !== shopId) {
      return { valid: false, reason: "Mã giảm giá chỉ áp dụng cho shop khác" };
    }
  }

  return { valid: true };
};

/**
 * Tính số tiền giảm giá
 * @param discountCode - Thông tin mã giảm giá
 * @param subtotal - Tổng tiền hàng
 */
export const calculateDiscountAmount = (
  discountCode: DiscountCode,
  subtotal: number
): number => {
  if (discountCode.type === "PERCENTAGE") {
    return Math.floor(subtotal * (discountCode.value / 100));
  } else if (discountCode.type === "FIXED") {
    return discountCode.value;
  }
  return 0;
};
