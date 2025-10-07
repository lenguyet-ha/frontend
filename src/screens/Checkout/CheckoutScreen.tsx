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
} from "@mui/material";
import { useRouter } from "next/router";
import { useStyles } from "./Checkout.styles";
import { dispatch } from "@/store";
import { showErrorSnackBar, showSuccessSnackBar } from "@/store/reducers/snackbar";
import { createOrder } from "@/api/orders";

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

interface OrderData {
  shopId: number;
  receiver: ReceiverInfo;
  cartItemIds: number[];
}

const CheckoutScreen: React.FC = () => {
  const classes = useStyles();
  const router = useRouter();
  
  const [cartGroups, setCartGroups] = useState<CartGroup[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [receiver, setReceiver] = useState<ReceiverInfo>({
    name: "",
    phone: "",
    address: "",
  });
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [discountCode, setDiscountCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Fake data for shipping and discount
  const shippingFees = {
    standard: 30000,
    express: 50000,
    overnight: 80000,
  };

  const discountAmount = discountCode === "SAVE10" ? 50000 : 0;

  useEffect(() => {
    // Get data from router query (passed from Cart page)
    const { cartData, selectedItemIds } = router.query;
    if (cartData && selectedItemIds) {
      try {
        setCartGroups(JSON.parse(cartData as string));
        setSelectedItems(JSON.parse(selectedItemIds as string));
      } catch (error) {
        console.error("Error parsing cart data:", error);
        router.push("/cart");
      }
    } else {
      router.push("/cart");
    }
  }, [router.query]);

  const getSelectedItems = () => {
    return cartGroups.flatMap(group => 
      group.items.filter(item => selectedItems.includes(item.id))
    );
  };

  const calculateSubtotal = () => {
    return getSelectedItems().reduce(
      (total, item) => total + item.sku.price * item.quantity,
      0
    );
  };

  const calculateShippingFee = () => {
    // Calculate shipping fee based on number of shops
    const uniqueShops = new Set(cartGroups.map(group => group.shop.id));
    return uniqueShops.size * shippingFees[shippingMethod as keyof typeof shippingFees];
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShippingFee() - discountAmount;
  };

  const handleReceiverChange = (field: keyof ReceiverInfo, value: string) => {
    setReceiver(prev => ({
      ...prev,
      [field]: value,
    }));
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

    // If online payment is selected, show QR code first
    if (paymentMethod === "online" && !paymentCompleted) {
      setShowQRDialog(true);
      return;
    }

    setLoading(true);
    try {
      // Prepare order data
      const orderData: OrderData[] = cartGroups.map(group => ({
        shopId: group.shop.id,
        receiver,
        cartItemIds: group.items
          .filter(item => selectedItems.includes(item.id))
          .map(item => item.id),
      })).filter(order => order.cartItemIds.length > 0);

      // Call order API
      const response = await createOrder(orderData);

      if (response) {
        dispatch(showSuccessSnackBar("Đặt hàng thành công!"));
        router.push("/orders"); // Redirect to orders page
      } else {
        throw new Error("Failed to place order");
      }
    } catch (error) {
      dispatch(showErrorSnackBar("Đặt hàng thất bại. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    setPaymentCompleted(true);
    setShowQRDialog(false);
    // Auto proceed with order after payment
    setTimeout(() => {
      handlePlaceOrder();
    }, 500);
  };

  if (cartGroups.length === 0) {
    return (
      <Box className={classes.checkoutContainer}>
        <Typography variant="h6">Đang tải...</Typography>
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
                  onChange={(e) => handleReceiverChange("phone", e.target.value)}
                  required
                />
                <TextField
                  label="Địa chỉ nhận hàng"
                  fullWidth
                  multiline
                  rows={3}
                  value={receiver.address}
                  onChange={(e) => handleReceiverChange("address", e.target.value)}
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
              <FormControl component="fieldset">
                <RadioGroup
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className={classes.shippingMethods}
                >
                  <FormControlLabel
                    value="standard"
                    control={<Radio />}
                    label={`Giao hàng tiêu chuẩn (${shippingFees.standard.toLocaleString()} VND)`}
                  />
                  <FormControlLabel
                    value="express"
                    control={<Radio />}
                    label={`Giao hàng nhanh (${shippingFees.express.toLocaleString()} VND)`}
                  />
                  <FormControlLabel
                    value="overnight"
                    control={<Radio />}
                    label={`Giao hàng trong ngày (${shippingFees.overnight.toLocaleString()} VND)`}
                  />
                </RadioGroup>
              </FormControl>
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
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Nhập SAVE10 để giảm 50,000 VND"
                />
                <Button variant="outlined">
                  Áp dụng
                </Button>
              </Box>
              {discountAmount > 0 && (
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  Giảm giá: -{discountAmount.toLocaleString()} VND
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className={classes.section}>
            <CardContent>
              <Typography variant="h6" className={classes.sectionTitle}>
                Phương thức thanh toán
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={classes.paymentMethods}
                >
                  <FormControlLabel
                    value="cod"
                    control={<Radio />}
                    label="Thanh toán khi nhận hàng (COD)"
                  />
                  <FormControlLabel
                    value="online"
                    control={<Radio />}
                    label="Thanh toán online"
                  />
                </RadioGroup>
              </FormControl>
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
                <Typography>{calculateSubtotal().toLocaleString()} VND</Typography>
              </Box>
              
              <Box className={classes.priceRow}>
                <Typography>Phí vận chuyển:</Typography>
                <Typography>{calculateShippingFee().toLocaleString()} VND</Typography>
              </Box>
              
              {discountAmount > 0 && (
                <Box className={classes.priceRow}>
                  <Typography>Giảm giá:</Typography>
                  <Typography color="success.main">
                    -{discountAmount.toLocaleString()} VND
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
                {loading ? "Đang xử lý..." : paymentMethod === "online" && !paymentCompleted ? "Thanh toán" : "Đặt hàng"}
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
              }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY:${calculateTotal()}:VND`}
                alt="QR Code for payment"
                style={{ 
                  border: "2px solid #ddd", 
                  borderRadius: 8,
                  width: 200,
                  height: 200
                }}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã QR
            </Typography>
            
            <Typography variant="caption" color="text.secondary">
              Mã thanh toán: PAY{Date.now()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            onClick={() => setShowQRDialog(false)}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button
            onClick={handlePaymentComplete}
            variant="contained"
            color="success"
          >
            Đã thanh toán
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CheckoutScreen;
