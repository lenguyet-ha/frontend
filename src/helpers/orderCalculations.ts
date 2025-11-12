import { DiscountCode } from "@/types/checkout";

/**
 * Utilities for order calculations
 */

/**
 * Tính số tiền giảm giá
 * @param discountCode - Mã giảm giá
 * @param subtotal - Tổng tiền hàng
 * @returns Số tiền giảm (làm tròn xuống)
 */
export const calculateDiscountAmount = (
  discountCode: DiscountCode,
  subtotal: number
): number => {
  if (discountCode.type === "PERCENTAGE") {
    return Math.floor(subtotal * (discountCode.value / 100));
  } else if (discountCode.type === "FIXED") {
    return Math.min(discountCode.value, subtotal); // Không giảm quá subtotal
  }
  return 0;
};

/**
 * Kiểm tra mã giảm giá có hợp lệ không
 * @param discountCode - Mã giảm giá
 * @param shopId - ID của shop (optional)
 * @returns Object chứa valid status và lý do
 */
export const validateDiscountCode = (
  discountCode: DiscountCode,
  shopId?: number
): { valid: boolean; reason?: string } => {
  const now = new Date();
  const validFrom = new Date(discountCode.validFrom);
  const validTo = new Date(discountCode.validTo);

  // Kiểm tra thời gian hiệu lực
  if (now < validFrom) {
    return { 
      valid: false, 
      reason: `Mã giảm giá sẽ có hiệu lực từ ${validFrom.toLocaleDateString("vi-VN")}` 
    };
  }
  
  if (now > validTo) {
    return { 
      valid: false, 
      reason: `Mã giảm giá đã hết hạn vào ${validTo.toLocaleDateString("vi-VN")}` 
    };
  }

  // Kiểm tra số lượt sử dụng
  if (discountCode.usedCount >= discountCode.usageLimit) {
    return { 
      valid: false, 
      reason: "Mã giảm giá đã hết lượt sử dụng" 
    };
  }

  // Kiểm tra mã của shop
  if (discountCode.bearer === "SHOP" && discountCode.shopId !== null) {
    if (shopId && discountCode.shopId !== shopId) {
      return { 
        valid: false, 
        reason: "Mã giảm giá chỉ áp dụng cho shop khác" 
      };
    }
  }

  return { valid: true };
};

/**
 * Tính tổng tiền đơn hàng
 * @param subtotal - Tổng tiền hàng
 * @param shippingFee - Phí vận chuyển
 * @param discountAmount - Số tiền giảm giá
 * @returns Tổng tiền (không được âm)
 */
export const calculateOrderTotal = (
  subtotal: number,
  shippingFee: number,
  discountAmount: number
): number => {
  const total = subtotal + shippingFee - discountAmount;
  return Math.max(0, total); // Không được âm
};

/**
 * Phân bổ discount amount theo tỷ lệ subtotal
 * @param totalSubtotal - Tổng subtotal của tất cả shop
 * @param shopSubtotal - Subtotal của shop cụ thể
 * @param totalDiscountAmount - Tổng discount amount
 * @returns Discount amount cho shop (làm tròn xuống)
 */
export const allocateDiscountAmount = (
  totalSubtotal: number,
  shopSubtotal: number,
  totalDiscountAmount: number
): number => {
  if (totalSubtotal === 0) return 0;
  return Math.floor((shopSubtotal / totalSubtotal) * totalDiscountAmount);
};

/**
 * Format tiền VNĐ
 * @param amount - Số tiền
 * @returns Chuỗi đã format (ví dụ: "123.456 VND")
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString("vi-VN")} VND`;
};

/**
 * Validate số điện thoại
 * @param phone - Số điện thoại
 * @returns true nếu hợp lệ
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // 9-20 ký tự, chỉ chứa số và dấu + ở đầu (optional)
  const phoneRegex = /^\+?\d{9,20}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate địa chỉ
 * @param address - Địa chỉ
 * @returns true nếu hợp lệ
 */
export const validateAddress = (address: string): boolean => {
  // Tối thiểu 10 ký tự
  return address.trim().length >= 10;
};

/**
 * Validate tên người nhận
 * @param name - Tên
 * @returns true nếu hợp lệ
 */
export const validateReceiverName = (name: string): boolean => {
  // Tối thiểu 2 ký tự
  return name.trim().length >= 2;
};
