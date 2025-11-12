/**
 * EXAMPLE: Cách sử dụng Order Calculations
 * 
 * File này minh họa cách sử dụng các hàm tính toán đơn hàng
 */

import {
  calculateDiscountAmount,
  validateDiscountCode,
  calculateOrderTotal,
  allocateDiscountAmount,
  formatCurrency,
} from "@/helpers/orderCalculations";
import { DiscountCode } from "@/types/checkout";

// ============================================================================
// EXAMPLE 1: Tính discount amount với mã PERCENTAGE
// ============================================================================

const percentageDiscount: DiscountCode = {
  id: 1,
  code: "SALE20",
  type: "PERCENTAGE",
  value: 20,
  bearer: "ADMIN",
  shopId: null,
  usageLimit: 100,
  usedCount: 45,
  validFrom: "2025-11-01T00:00:00.000Z",
  validTo: "2025-12-31T23:59:59.000Z",
  isActive: true,
};

const subtotal1 = 130000; // 130.000đ

const discountAmount1 = calculateDiscountAmount(percentageDiscount, subtotal1);
console.log("Example 1 - PERCENTAGE discount:");
console.log(`Subtotal: ${formatCurrency(subtotal1)}`);
console.log(`Discount: ${percentageDiscount.value}%`);
console.log(`Discount Amount: ${formatCurrency(discountAmount1)}`); // 26.000đ

// ============================================================================
// EXAMPLE 2: Tính discount amount với mã FIXED
// ============================================================================

const fixedDiscount: DiscountCode = {
  id: 2,
  code: "FIXED50K",
  type: "FIXED",
  value: 50000,
  bearer: "ADMIN",
  shopId: null,
  usageLimit: 50,
  usedCount: 10,
  validFrom: "2025-11-01T00:00:00.000Z",
  validTo: "2025-12-31T23:59:59.000Z",
  isActive: true,
};

const subtotal2 = 200000; // 200.000đ

const discountAmount2 = calculateDiscountAmount(fixedDiscount, subtotal2);
console.log("\nExample 2 - FIXED discount:");
console.log(`Subtotal: ${formatCurrency(subtotal2)}`);
console.log(`Discount: ${formatCurrency(fixedDiscount.value)}`);
console.log(`Discount Amount: ${formatCurrency(discountAmount2)}`); // 50.000đ

// ============================================================================
// EXAMPLE 3: Validate mã giảm giá
// ============================================================================

// Valid discount code
const validationResult1 = validateDiscountCode(percentageDiscount);
console.log("\nExample 3a - Valid discount code:");
console.log(validationResult1); // { valid: true }

// Expired discount code
const expiredDiscount: DiscountCode = {
  ...percentageDiscount,
  validTo: "2025-01-01T00:00:00.000Z", // Đã hết hạn
};

const validationResult2 = validateDiscountCode(expiredDiscount);
console.log("\nExample 3b - Expired discount code:");
console.log(validationResult2); // { valid: false, reason: "..." }

// Used up discount code
const usedUpDiscount: DiscountCode = {
  ...percentageDiscount,
  usageLimit: 100,
  usedCount: 100, // Đã hết lượt
};

const validationResult3 = validateDiscountCode(usedUpDiscount);
console.log("\nExample 3c - Used up discount code:");
console.log(validationResult3); // { valid: false, reason: "Mã giảm giá đã hết lượt sử dụng" }

// ============================================================================
// EXAMPLE 4: Tính tổng tiền đơn hàng
// ============================================================================

const subtotal3 = 130000; // 130.000đ
const shippingFee3 = 20000; // 20.000đ
const discountAmount3 = 26000; // 26.000đ

const total3 = calculateOrderTotal(subtotal3, shippingFee3, discountAmount3);
console.log("\nExample 4 - Order total:");
console.log(`Subtotal: ${formatCurrency(subtotal3)}`);
console.log(`Shipping Fee: ${formatCurrency(shippingFee3)}`);
console.log(`Discount Amount: -${formatCurrency(discountAmount3)}`);
console.log(`Total: ${formatCurrency(total3)}`); // 124.000đ

// ============================================================================
// EXAMPLE 5: Phân bổ discount cho multi-shop
// ============================================================================

// Giả sử cart có 2 shop
const shop1Subtotal = 100000; // Shop 1: 100.000đ
const shop2Subtotal = 30000; // Shop 2: 30.000đ
const totalSubtotal = shop1Subtotal + shop2Subtotal; // 130.000đ
const totalDiscountAmount = 26000; // Tổng giảm 26.000đ

const shop1Discount = allocateDiscountAmount(
  totalSubtotal,
  shop1Subtotal,
  totalDiscountAmount
);
const shop2Discount = allocateDiscountAmount(
  totalSubtotal,
  shop2Subtotal,
  totalDiscountAmount
);

console.log("\nExample 5 - Multi-shop discount allocation:");
console.log(`Total Subtotal: ${formatCurrency(totalSubtotal)}`);
console.log(`Total Discount: ${formatCurrency(totalDiscountAmount)}`);
console.log(`\nShop 1 (${shop1Subtotal}/${totalSubtotal}):`);
console.log(`  Subtotal: ${formatCurrency(shop1Subtotal)}`);
console.log(`  Discount: ${formatCurrency(shop1Discount)}`); // 20.000đ
console.log(`\nShop 2 (${shop2Subtotal}/${totalSubtotal}):`);
console.log(`  Subtotal: ${formatCurrency(shop2Subtotal)}`);
console.log(`  Discount: ${formatCurrency(shop2Discount)}`); // 6.000đ

// ============================================================================
// EXAMPLE 6: Flow đặt hàng hoàn chỉnh
// ============================================================================

console.log("\n" + "=".repeat(80));
console.log("EXAMPLE 6: FLOW ĐẶT HÀNG HOÀN CHỈNH");
console.log("=".repeat(80));

// Bước 1: User có cart items
const cartItems = [
  { skuId: 1, quantity: 2, price: 50000, shopId: 1 }, // Shop 1: 100.000đ
  { skuId: 2, quantity: 1, price: 30000, shopId: 2 }, // Shop 2: 30.000đ
];

// Bước 2: Tính subtotal
const totalSubtotal6 = cartItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);
console.log(`\n1. Tính subtotal: ${formatCurrency(totalSubtotal6)}`);

// Bước 3: User chọn shipping method
const shippingMethod = {
  id: 2,
  name: "Giao hàng nhanh",
  provider: "GHN",
  price: 20000,
};
const numberOfShops = new Set(cartItems.map((item) => item.shopId)).size;
const totalShippingFee = numberOfShops * shippingMethod.price;
console.log(
  `\n2. Chọn shipping method: ${shippingMethod.name} - ${shippingMethod.provider}`
);
console.log(`   Phí ship: ${formatCurrency(shippingMethod.price)} × ${numberOfShops} shop = ${formatCurrency(totalShippingFee)}`);

// Bước 4: User nhập mã giảm giá
const discountCode6 = percentageDiscount;
const validation6 = validateDiscountCode(discountCode6);
if (validation6.valid) {
  const totalDiscountAmount6 = calculateDiscountAmount(
    discountCode6,
    totalSubtotal6
  );
  console.log(`\n3. Áp dụng mã giảm giá: ${discountCode6.code}`);
  console.log(`   Giảm ${discountCode6.value}% = ${formatCurrency(totalDiscountAmount6)}`);

  // Bước 5: Tính total
  const total6 = calculateOrderTotal(
    totalSubtotal6,
    totalShippingFee,
    totalDiscountAmount6
  );
  console.log(`\n4. Tính tổng tiền:`);
  console.log(`   Subtotal: ${formatCurrency(totalSubtotal6)}`);
  console.log(`   Shipping: +${formatCurrency(totalShippingFee)}`);
  console.log(`   Discount: -${formatCurrency(totalDiscountAmount6)}`);
  console.log(`   ─────────────────────`);
  console.log(`   TOTAL: ${formatCurrency(total6)}`);

  // Bước 6: Phân bổ cho từng shop
  console.log(`\n5. Phân bổ cho từng shop:`);
  
  const shop1Items = cartItems.filter((item) => item.shopId === 1);
  const shop1Subtotal6 = shop1Items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shop1DiscountAmount = allocateDiscountAmount(
    totalSubtotal6,
    shop1Subtotal6,
    totalDiscountAmount6
  );
  const shop1Total = calculateOrderTotal(
    shop1Subtotal6,
    shippingMethod.price,
    shop1DiscountAmount
  );

  console.log(`\n   Shop 1:`);
  console.log(`   - Subtotal: ${formatCurrency(shop1Subtotal6)}`);
  console.log(`   - Shipping: ${formatCurrency(shippingMethod.price)}`);
  console.log(`   - Discount: -${formatCurrency(shop1DiscountAmount)}`);
  console.log(`   - Total: ${formatCurrency(shop1Total)}`);

  const shop2Items = cartItems.filter((item) => item.shopId === 2);
  const shop2Subtotal6 = shop2Items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shop2DiscountAmount = allocateDiscountAmount(
    totalSubtotal6,
    shop2Subtotal6,
    totalDiscountAmount6
  );
  const shop2Total = calculateOrderTotal(
    shop2Subtotal6,
    shippingMethod.price,
    shop2DiscountAmount
  );

  console.log(`\n   Shop 2:`);
  console.log(`   - Subtotal: ${formatCurrency(shop2Subtotal6)}`);
  console.log(`   - Shipping: ${formatCurrency(shippingMethod.price)}`);
  console.log(`   - Discount: -${formatCurrency(shop2DiscountAmount)}`);
  console.log(`   - Total: ${formatCurrency(shop2Total)}`);

  // Bước 7: Chuẩn bị payload
  console.log(`\n6. Chuẩn bị request payload:`);
  const orderPayload = [
    {
      shopId: 1,
      receiver: {
        name: "Nguyễn Văn A",
        phone: "0123456789",
        address: "123 Đường ABC, Quận 1, TP.HCM",
      },
      cartItemIds: shop1Items.map((_, index) => index + 1),
      subtotal: shop1Subtotal6,
      discountAmount: shop1DiscountAmount,
      total: shop1Total,
      discountCodeId: discountCode6.id,
      shippingMethodId: shippingMethod.id,
      paymentMethodId: 1,
    },
    {
      shopId: 2,
      receiver: {
        name: "Nguyễn Văn A",
        phone: "0123456789",
        address: "123 Đường ABC, Quận 1, TP.HCM",
      },
      cartItemIds: shop2Items.map((_, index) => index + 3),
      subtotal: shop2Subtotal6,
      discountAmount: shop2DiscountAmount,
      total: shop2Total,
      discountCodeId: discountCode6.id,
      shippingMethodId: shippingMethod.id,
      paymentMethodId: 1,
    },
  ];

  console.log(JSON.stringify(orderPayload, null, 2));
} else {
  console.log(`\n3. Mã giảm giá không hợp lệ: ${validation6.reason}`);
}

console.log("\n" + "=".repeat(80));

export {};
