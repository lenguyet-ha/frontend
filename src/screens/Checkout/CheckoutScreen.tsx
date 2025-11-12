import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Grid,
  Paper,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useRouter } from "next/router";
import { useStyles } from "./Checkout.styles";
import { dispatch } from "@/store";
import {
  showErrorSnackBar,
  showSuccessSnackBar,
} from "@/store/reducers/snackbar";
import { createOrder, OrderItem, updateOrderStatus } from "@/api/orders";
import {
  getDiscountCodes,
  DiscountCode,
  isDiscountCodeValid,
  calculateDiscountAmount,
} from "@/api/discount";
import { getShippingMethods, ShippingMethod } from "@/api/shipping";
import { getPaymentMethods, PaymentMethod } from "@/api/payment";

// Types
interface CartItem {
  id: number;
  userId: number;
  skuId: number;
  quantity: number;
  sku: {
    id: number;
    value: string;
    price: number;
    stock: number;
    image: string;
    productId: number;
    product: {
      id: number;
      name: string;
      basePrice: number;
      virtualPrice: number;
      brandId: number;
      images: string[];
      variants: any;
      description: string;
      createdBy: {
        id: number;
        name: string;
        avatar: string | null;
      };
    };
  };
}

interface CartGroup {
  shop: {
    id: number;
    name: string;
    avatar: string | null;
  };
  items: CartItem[];
  totalItems: number;
  totalPrice: number | null;
}

interface ReceiverInfo {
  name: string;
  phone: string;
  address: string;
}

const CheckoutScreen: React.FC = () => {
  const classes = useStyles();
  const router = useRouter();

  // Cart data
  const [cartGroups, setCartGroups] = useState<CartGroup[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Receiver info
  const [receiver, setReceiver] = useState<ReceiverInfo>({
    name: "",
    phone: "",
    address: "",
  });

  // Shipping, Payment, Discount
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState<ShippingMethod | null>(null);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);

  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedDiscountCode, setAppliedDiscountCode] =
    useState<DiscountCode | null>(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Fetch initial data (shipping methods, payment methods, discount codes)
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingData(true);
      try {
        // Fetch shipping methods
        const shippingResponse = await getShippingMethods({ isActive: true });
        if (shippingResponse && shippingResponse.data.length > 0) {
          setShippingMethods(shippingResponse.data);
          setSelectedShippingMethod(shippingResponse.data[0]); // Select first by default
        }

        // Fetch payment methods
        const paymentResponse = await getPaymentMethods({ isActive: true });
        if (paymentResponse && paymentResponse.data.length > 0) {
          setPaymentMethods(paymentResponse.data);
          setSelectedPaymentMethod(paymentResponse.data[0]); // Select first by default
        }

        // Fetch discount codes
        const discountResponse = await getDiscountCodes({
          isActive: true,
          page: 1,
          limit: 100,
        });
        if (discountResponse && discountResponse.data.length > 0) {
          setDiscountCodes(discountResponse.data);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    // Get data from router query (passed from Cart page)
    const { cartData, selectedItemIds } = router.query;
    if (cartData && selectedItemIds) {
      try {
        setCartGroups(JSON.parse(cartData as string));
        setSelectedItems(JSON.parse(selectedItemIds as string));
      } catch (error) {
        router.push("/cart");
      }
    } else {
      router.push("/cart");
    }
  }, [router.query]);

  const getSelectedItems = () => {
    return cartGroups.flatMap((group) =>
      group.items.filter((item) => selectedItems.includes(item.id))
    );
  };

  // BƯỚC 1: Tính subtotal (tổng tiền hàng)
  const calculateSubtotal = () => {
    return getSelectedItems().reduce(
      (total, item) => total + item.sku.price * item.quantity,
      0
    );
  };

  // BƯỚC 2: Tính discount amount (số tiền giảm)
  const getDiscountAmount = () => {
    if (!appliedDiscountCode) return 0;
    return calculateDiscountAmount(appliedDiscountCode, calculateSubtotal());
  };

  // BƯỚC 3: Lấy phí ship
  const getShippingFee = () => {
    if (!selectedShippingMethod) return 0;
    // Tính phí ship theo số lượng shop
    const uniqueShops = new Set(
      getSelectedItems().map((item) => item.sku.product.createdBy.id)
    );
    return uniqueShops.size * selectedShippingMethod.price;
  };

  // BƯỚC 4: Tính total (tổng tiền cuối)
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingFee = getShippingFee();
    const discountAmount = getDiscountAmount();
    const total = subtotal + shippingFee - discountAmount;
    return Math.max(0, total); // Không được âm
  };

  const handleReceiverChange = (field: keyof ReceiverInfo, value: string) => {
    setReceiver((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyDiscountCode = () => {
    if (!discountCodeInput.trim()) {
      dispatch(showErrorSnackBar("Vui lòng nhập mã giảm giá"));
      return;
    }

    // Tìm mã giảm giá trong danh sách
    const foundCode = discountCodes.find(
      (code) => code.code.toUpperCase() === discountCodeInput.toUpperCase()
    );

    if (!foundCode) {
      dispatch(showErrorSnackBar("Mã giảm giá không tồn tại"));
      return;
    }

    // Kiểm tra mã có hợp lệ không
    const validation = isDiscountCodeValid(foundCode);
    if (!validation.valid) {
      dispatch(
        showErrorSnackBar(validation.reason || "Mã giảm giá không hợp lệ")
      );
      return;
    }

    // Áp dụng mã giảm giá
    setAppliedDiscountCode(foundCode);
    dispatch(
      showSuccessSnackBar(`Áp dụng mã giảm giá thành công: ${foundCode.code}`)
    );
  };

  const handleRemoveDiscountCode = () => {
    setAppliedDiscountCode(null);
    setDiscountCodeInput("");
    dispatch(showSuccessSnackBar("Đã xóa mã giảm giá"));
  };

  const validateForm = () => {
    if (!receiver.name.trim()) {
      dispatch(showErrorSnackBar("Vui lòng nhập tên người nhận"));
      return false;
    }
    if (!receiver.phone.trim()) {
      dispatch(showErrorSnackBar("Vui lòng nhập số điện thoại"));
      return false;
    }
    if (!receiver.address.trim()) {
      dispatch(showErrorSnackBar("Vui lòng nhập địa chỉ"));
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    // If online payment is selected, show QR code first (chưa tạo đơn hàng)
    // Check if payment method is NOT COD (cash on delivery)
    if (selectedPaymentMethod?.key !== "cod" && !paymentCompleted) {
      setShowQRDialog(true);
      return;
    }

    setLoading(true);
    try {
      // Tính toán các giá trị tài chính
      const subtotal = calculateSubtotal();
      const discountAmount = getDiscountAmount();
      const total = calculateTotal();

      // Prepare order data theo từng shop
      const orderData: OrderItem[] = cartGroups
        .map((group) => {
          const groupItems = group.items.filter((item) =>
            selectedItems.includes(item.id)
          );

          // Tính subtotal cho từng shop
          const shopSubtotal = groupItems.reduce(
            (sum, item) => sum + item.sku.price * item.quantity,
            0
          );

          // Tính discount amount cho từng shop (phân bổ theo tỷ lệ)
          const shopDiscountAmount =
            subtotal > 0
              ? Math.floor((shopSubtotal / subtotal) * discountAmount)
              : 0;

          // Tính shipping fee cho shop
          const shopShippingFee = selectedShippingMethod
            ? selectedShippingMethod.price
            : 0;

          // Tính total cho shop
          const shopTotal = shopSubtotal + shopShippingFee - shopDiscountAmount;

          return {
            shopId: group.shop.id,
            receiver,
            cartItemIds: groupItems.map((item) => item.id),
            // Tính toán tài chính (BẮT BUỘC)
            subtotal: shopSubtotal,
            discountAmount: shopDiscountAmount,
            total: Math.max(0, shopTotal),
            // Các trường tùy chọn
            discountCodeId: appliedDiscountCode?.id,
            shippingMethodId: selectedShippingMethod?.id,
            paymentMethodId: selectedPaymentMethod?.id,
          };
        })
        .filter((order) => order.cartItemIds.length > 0);

      if (orderData.length === 0) {
        dispatch(showErrorSnackBar("Không có sản phẩm nào được chọn"));
        return;
      }

      // Call order API
      const response = await createOrder(orderData);

      if (response ) {
        dispatch(showSuccessSnackBar("Đặt hàng thành công!"));

        // Dispatch cart-updated event to update cart badge in Header
        window.dispatchEvent(new Event("cart-updated"));

        router.push("/orders"); // Redirect to orders page
      } else {
        throw new Error("Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      dispatch(showErrorSnackBar("Đặt hàng thất bại. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi click vào QR code - TẠO đơn hàng VÀ cập nhật trạng thái
  const handleQRCodeClick = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Tính toán các giá trị tài chính
      const subtotal = calculateSubtotal();
      const discountAmount = getDiscountAmount();

      // Prepare order data theo từng shop
      const orderData: OrderItem[] = cartGroups
        .map((group) => {
          const groupItems = group.items.filter((item) =>
            selectedItems.includes(item.id)
          );

          // Tính subtotal cho từng shop
          const shopSubtotal = groupItems.reduce(
            (sum, item) => sum + item.sku.price * item.quantity,
            0
          );

          // Tính discount amount cho từng shop (phân bổ theo tỷ lệ)
          const shopDiscountAmount =
            subtotal > 0
              ? Math.floor((shopSubtotal / subtotal) * discountAmount)
              : 0;

          // Tính shipping fee cho shop
          const shopShippingFee = selectedShippingMethod
            ? selectedShippingMethod.price
            : 0;

          // Tính total cho shop
          const shopTotal = shopSubtotal + shopShippingFee - shopDiscountAmount;

          return {
            shopId: group.shop.id,
            receiver,
            cartItemIds: groupItems.map((item) => item.id),
            // Tính toán tài chính (BẮT BUỘC)
            subtotal: shopSubtotal,
            discountAmount: shopDiscountAmount,
            total: Math.max(0, shopTotal),
            // Các trường tùy chọn
            discountCodeId: appliedDiscountCode?.id,
            shippingMethodId: selectedShippingMethod?.id,
            paymentMethodId: selectedPaymentMethod?.id,
          };
        })
        .filter((order) => order.cartItemIds.length > 0);

      if (orderData.length === 0) {
        dispatch(showErrorSnackBar("Không có sản phẩm nào được chọn"));
        setLoading(false);
        return;
      }

      // BƯỚC 1: Tạo đơn hàng
      const response = await createOrder(orderData);

      if (!response || !response.orders) {
        throw new Error("Failed to create order");
      }

      // BƯỚC 2: Cập nhật trạng thái tất cả đơn hàng thành PENDING_PICKUP
      const orderIds = response.orders.map((order) => order.id);
      const updatePromises = orderIds.map((orderId) =>
        updateOrderStatus(orderId, "PENDING_PICKUP")
      );
      
      await Promise.all(updatePromises);
      
      setPaymentCompleted(true);
      setShowQRDialog(false);
      
      dispatch(showSuccessSnackBar("Thanh toán thành công!"));
      
      // Dispatch cart-updated event to update cart badge in Header
      window.dispatchEvent(new Event("cart-updated"));
      
      // Redirect to orders page
      router.push("/orders");
    } catch (error) {
      console.error("Error processing payment:", error);
      dispatch(showErrorSnackBar("Thanh toán thất bại. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  if (cartGroups.length === 0 || loadingData) {
    return (
      <Box
        className={classes.checkoutContainer}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className={classes.checkoutContainer}>
      <Typography variant="h4" gutterBottom>
        Thanh toán
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Receiver Information */}
          <Card className={classes.section}>
            <CardContent>
              <Typography variant="h6" className={classes.sectionTitle}>
                Thông tin người nhận
              </Typography>
              <Box className={classes.receiverForm}>
                <TextField
                  label="Họ và tên"
                  fullWidth
                  value={receiver.name}
                  onChange={(e) => handleReceiverChange("name", e.target.value)}
                  required
                />
                <TextField
                  label="Số điện thoại"
                  fullWidth
                  value={receiver.phone}
                  onChange={(e) =>
                    handleReceiverChange("phone", e.target.value)
                  }
                  required
                />
                <TextField
                  label="Địa chỉ nhận hàng"
                  fullWidth
                  multiline
                  rows={3}
                  value={receiver.address}
                  onChange={(e) =>
                    handleReceiverChange("address", e.target.value)
                  }
                  required
                />
              </Box>
            </CardContent>
          </Card>

          {/* Shipping Method */}
          <Card className={classes.section}>
            <CardContent>
              <Typography variant="h6" className={classes.sectionTitle}>
                Phương thức vận chuyển
              </Typography>
              {shippingMethods.length > 0 ? (
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={selectedShippingMethod?.id.toString() || ""}
                    onChange={(e) => {
                      const method = shippingMethods.find(
                        (m) => m.id === Number(e.target.value)
                      );
                      setSelectedShippingMethod(method || null);
                    }}
                    className={classes.shippingMethods}
                  >
                    {shippingMethods.map((method) => (
                      <FormControlLabel
                        key={method.id}
                        value={method.id.toString()}
                        control={<Radio />}
                        label={`${method.name} - ${method.provider} (${method.price.toLocaleString()} VND)`}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có phương thức vận chuyển khả dụng
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Discount Code */}
          <Card className={classes.section}>
            <CardContent>
              <Typography variant="h6" className={classes.sectionTitle}>
                Mã giảm giá
              </Typography>
              <Box className={classes.discountSection}>
                <TextField
                  label="Nhập mã giảm giá"
                  value={discountCodeInput}
                  onChange={(e) =>
                    setDiscountCodeInput(e.target.value.toUpperCase())
                  }
                  placeholder="Ví dụ: SALE20"
                  disabled={!!appliedDiscountCode}
                />
                {appliedDiscountCode ? (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleRemoveDiscountCode}
                  >
                    Xóa
                  </Button>
                ) : (
                  <Button variant="outlined" onClick={handleApplyDiscountCode}>
                    Áp dụng
                  </Button>
                )}
              </Box>
              {appliedDiscountCode && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Mã giảm giá: <strong>{appliedDiscountCode.code}</strong>
                  </Typography>
                  <Typography variant="body2">
                    {appliedDiscountCode.type === "PERCENTAGE"
                      ? `Giảm ${appliedDiscountCode.value}%`
                      : `Giảm ${appliedDiscountCode.value.toLocaleString()} VND`}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Tiết kiệm: -{getDiscountAmount().toLocaleString()} VND
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className={classes.section}>
            <CardContent>
              <Typography variant="h6" className={classes.sectionTitle}>
                Phương thức thanh toán
              </Typography>
              {paymentMethods.length > 0 ? (
                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    value={selectedPaymentMethod?.id.toString() || ""}
                    onChange={(e) => {
                      const method = paymentMethods.find(
                        (m) => m.id === Number(e.target.value)
                      );
                      setSelectedPaymentMethod(method || null);
                      // Reset payment completed status when changing method
                      setPaymentCompleted(false);
                    }}
                    className={classes.paymentMethods}
                  >
                    {paymentMethods.map((method) => (
                      <FormControlLabel
                        key={method.id}
                        value={method.id.toString()}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body1">
                              {method.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {method.description}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có phương thức thanh toán khả dụng
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Order Summary */}
          <Card className={classes.section + " " + classes.orderSummary}>
            <CardContent>
              <Typography variant="h6" className={classes.sectionTitle}>
                Đơn hàng của bạn
              </Typography>

              {/* Items */}
              {getSelectedItems().map((item) => (
                <Box key={item.id} className={classes.orderItem}>
                  <img
                    src={item.sku.image || item.sku.product.images[0]}
                    alt={item.sku.product.name}
                    className={classes.itemImage}
                  />
                  <Box className={classes.itemInfo}>
                    <Typography variant="body2" fontWeight="bold">
                      {item.sku.product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.sku.value}
                    </Typography>
                    <Typography variant="body2">
                      {item.quantity} x {item.sku.price.toLocaleString()} VND
                    </Typography>
                  </Box>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              {/* Price breakdown */}
              <Box className={classes.priceRow}>
                <Typography>Tạm tính:</Typography>
                <Typography>
                  {calculateSubtotal().toLocaleString()} VND
                </Typography>
              </Box>

              <Box className={classes.priceRow}>
                <Typography>Phí vận chuyển:</Typography>
                <Typography>{getShippingFee().toLocaleString()} VND</Typography>
              </Box>

              {getDiscountAmount() > 0 && (
                <Box className={classes.priceRow}>
                  <Typography>Giảm giá:</Typography>
                  <Typography color="success.main">
                    -{getDiscountAmount().toLocaleString()} VND
                  </Typography>
                </Box>
              )}

              <Box className={classes.totalRow}>
                <Typography>Tổng thanh toán:</Typography>
                <Typography>{calculateTotal().toLocaleString()} VND</Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                className={classes.checkoutButton}
                onClick={handlePlaceOrder}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading
                  ? "Đang xử lý..."
                  : selectedPaymentMethod?.key === "vnpay" && !paymentCompleted
                    ? "Thanh toán"
                    : "Đặt hàng"}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* QR Code Payment Dialog */}
      <Dialog
        open={showQRDialog}
        onClose={() => setShowQRDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" textAlign="center">
            Thanh toán QR Code
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box textAlign="center" py={2}>
            <Typography variant="body1" gutterBottom>
              Quét mã QR để thanh toán
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              Số tiền: {calculateTotal().toLocaleString()} VND
            </Typography>

            {/* QR Code - Using a placeholder image service */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                my: 3,
                cursor: "pointer",
              }}
              onClick={handleQRCodeClick}
              title="Click vào mã QR để xác nhận thanh toán"
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY:${calculateTotal()}:VND`}
                alt="QR Code for payment"
                style={{
                  border: "2px solid #ddd",
                  borderRadius: 8,
                  width: 200,
                  height: 200,
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã QR
            </Typography>
            <Typography variant="body2" color="primary" gutterBottom>
              👆 Click vào mã QR để xác nhận đã thanh toán
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Mã thanh toán: PAY{Date.now()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button onClick={() => setShowQRDialog(false)} variant="outlined" disabled={loading}>
            Hủy
          </Button>
          <Button
            onClick={handleQRCodeClick}
            variant="contained"
            color="success"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đã thanh toán"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CheckoutScreen;
