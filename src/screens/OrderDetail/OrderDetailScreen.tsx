import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/router";
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Divider,
  Grid,
} from "@mui/material";
import {
  ArrowBack,
  CalendarToday,
  Receipt,
  Store,
  LocalShipping,
  Person,
  Phone,
  LocationOn,
} from "@mui/icons-material";
import * as OrdersApi from "@/api/orders";
import * as ReviewsApi from "@/api/reviews";
import ReviewForm from "@/components/ReviewForm";
import {
  OrderDetailContainer,
  OrderDetailCard,
  SectionTitle,
  InfoRow,
  InfoLabel,
  InfoValue,
  ProductItem,
  ProductImage,
  ProductInfo,
  PriceInfo,
  TotalSection,
  TotalRow,
  TotalLabel,
  TotalValue,
  StatusBadge,
} from "./OrderDetail.styles";
import {
  OrderHeader,
  OrderStatusCard,
  OrderReceiverCard,
  OrderProductsCard,
  OrderReviewsCard,
  OrderActions,
  CancelDialog,
} from "./components";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productTranslations: Array<{
    id: number;
    name: string;
    description: string;
    languageId: string;
  }>;
  skuPrice: number;
  image: string;
  skuValue: string;
  skuId: number;
  orderId: number;
  quantity: number;
  createdAt: string;
}

interface Receiver {
  name: string;
  phone: string;
  address: string;
}

interface OrderDetail {
  shopName: ReactNode;
  id: number;
  userId: number;
  status: string;
  receiver: Receiver;
  shopId: number;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  // Financial information
  subtotal: number;
  discountAmount: number;
  total: number;
  commissionRate: number;
  adminCommissionAmount: number;
  shopPayoutAmount: number;
  payoutStatus: string;
  // Payment & Shipping
  paymentMethodId?: number;
  paymentMethod?: {
    id: number;
    name: string;
    key: string;
    description: string;
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
}

const STATUS_MAP: Record<string, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PENDING_PICKUP: "Chờ lấy hàng",
  PENDING_DELIVERY: "Chờ giao hàng",
  DELIVERED: "Đã giao hàng",
  RETURNED: "Đã trả hàng",
  CANCELLED: "Đã huỷ",
};

const OrderDetailScreen = () => {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [orderReviews, setOrderReviews] = useState<ReviewsApi.Review[] | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await OrdersApi.getOrder(id as string);

        // Handle both { data: {...} } and direct {...} response
        const orderData = response?.data || response;

        if (orderData && orderData.id) {
          setOrder(orderData);
          
          // If order is delivered, check for existing reviews
          if (orderData.status === 'DELIVERED') {
            fetchOrderReviews(orderData.id);
          }
        } else {
          setError("Không tìm thấy đơn hàng");
        }
      } catch (err) {
        setError("Đã có lỗi xảy ra khi tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id]);

  const fetchOrderReviews = useCallback(async (orderId: number) => {
    setLoadingReviews(true);
    try {
      const reviews = await ReviewsApi.getReviewsByOrder(orderId);
      setOrderReviews(reviews);
    } catch (error) {
      console.error('Error fetching order reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const calculateTotal = useCallback((items: OrderItem[]) => {
    return items.reduce(
      (total, item) => total + item.skuPrice * item.quantity,
      0
    );
  }, []);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleProductClick = useCallback(
    (productId: number) => {
      router.push(`/products/${productId}`);
    },
    [router]
  );

  const handleCancelClick = useCallback(() => {
    setShowCancelDialog(true);
  }, []);

  const handleCloseCancelDialog = useCallback(() => {
    setShowCancelDialog(false);
  }, []);

  const handleReviewClick = useCallback(() => {
    console.log('Review button clicked');
    console.log('Order items:', order?.items);
    setShowReviewForm(true);
  }, [order]);

  const handleCloseReviewForm = useCallback(() => {
    setShowReviewForm(false);
  }, []);

  const handleReviewSuccess = useCallback(() => {
    // Refresh reviews after successful submission
    if (order) {
      fetchOrderReviews(order.id);
    }
  }, [order, fetchOrderReviews]);

  const handleConfirmCancel = useCallback(async () => {
    if (!order) return;

    setCancelling(true);
    try {
      const response = await OrdersApi.cancelOrder(order.id.toString());
      if (response) {
        // Update local state
        setOrder({ ...order, status: 'CANCELLED' });
        setShowCancelDialog(false);
        // Optionally show success message
        alert('Đơn hàng đã được huỷ thành công');
      } else {
        alert('Không thể huỷ đơn hàng. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Đã có lỗi xảy ra khi huỷ đơn hàng');
    } finally {
      setCancelling(false);
    }
  }, [order]);

  if (loading) {
    return (
      <OrderDetailContainer>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress size={60} />
        </Box>
      </OrderDetailContainer>
    );
  }

  if (error || !order) {
    return (
      <OrderDetailContainer>
        <OrderDetailCard>
          <Typography
            variant="h6"
            color="error"
            gutterBottom
            textAlign="center"
          >
            {error || "Không tìm thấy đơn hàng"}
          </Typography>
          <Box textAlign="center" mt={3}>
            <Button
              variant="contained"
              onClick={handleGoBack}
              startIcon={<ArrowBack />}
            >
              Quay lại
            </Button>
          </Box>
        </OrderDetailCard>
      </OrderDetailContainer>
    );
  }

  return (
    <OrderDetailContainer>
      <OrderHeader onGoBack={handleGoBack} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <OrderStatusCard
            order={order}
            formatDate={formatDate}
            STATUS_MAP={STATUS_MAP}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <OrderReceiverCard receiver={order.receiver} />
        </Grid>

        <Grid item xs={12} md={6}>
          <OrderProductsCard
            items={order.items}
            formatPrice={formatPrice}
            calculateTotal={calculateTotal}
            onProductClick={handleProductClick}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          {/* Order Financial Details Card */}
          <OrderDetailCard>
            <SectionTitle>
              <Receipt sx={{ mr: 1 }} />
              Thông tin thanh toán
            </SectionTitle>
            <Divider sx={{ mb: 2 }} />

            <Box>
              {/* Payment Method */}
              {order.paymentMethod && (
                <InfoRow>
                  <InfoLabel>Phương thức thanh toán:</InfoLabel>
                  <InfoValue>{order.paymentMethod.name}</InfoValue>
                </InfoRow>
              )}

              {/* Shipping Method */}
              {order.shippingMethod && (
                <>
                  <InfoRow>
                    <InfoLabel>Phương thức vận chuyển:</InfoLabel>
                    <InfoValue>
                      {order.shippingMethod.name} - {order.shippingMethod.provider}
                    </InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Phí vận chuyển:</InfoLabel>
                    <InfoValue>{formatPrice(order.shippingMethod.price)}</InfoValue>
                  </InfoRow>
                </>
              )}

              {/* Discount Code */}
              {order.discountCode && (
                <InfoRow>
                  <InfoLabel>Mã giảm giá:</InfoLabel>
                  <InfoValue>
                    {order.discountCode.code} 
                    {order.discountCode.type === 'PERCENTAGE' 
                      ? ` (${order.discountCode.value}%)` 
                      : ` (${formatPrice(order.discountCode.value)})`}
                  </InfoValue>
                </InfoRow>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Financial Breakdown */}
              <TotalSection>
                <TotalRow>
                  <Typography variant="body2" color="text.secondary">
                    Tổng tiền hàng:
                  </Typography>
                  <Typography variant="body2">
                    {formatPrice(order.subtotal)}
                  </Typography>
                </TotalRow>

                {order.shippingMethod && (
                  <TotalRow>
                    <Typography variant="body2" color="text.secondary">
                      Phí vận chuyển:
                    </Typography>
                    <Typography variant="body2">
                      {formatPrice(order.shippingMethod.price)}
                    </Typography>
                  </TotalRow>
                )}

                {order.discountAmount > 0 && (
                  <TotalRow>
                    <Typography variant="body2" color="success.main">
                      Giảm giá:
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      -{formatPrice(order.discountAmount)}
                    </Typography>
                  </TotalRow>
                )}

                <Divider sx={{ my: 1 }} />

                <TotalRow>
                  <Typography variant="h6" fontWeight="bold">
                    Tổng thanh toán:
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {formatPrice(order.total)}
                  </Typography>
                </TotalRow>
              </TotalSection>
            </Box>
          </OrderDetailCard>
        </Grid>

        <Grid item xs={12}>
          <OrderReviewsCard
            orderStatus={order.status}
            orderItems={order.items}
            orderReviews={orderReviews}
            loadingReviews={loadingReviews}
          />
        </Grid>
      </Grid>

      <OrderActions
        orderStatus={order.status}
        orderReviews={orderReviews}
        cancelling={cancelling}
        onReviewClick={handleReviewClick}
        onCancelClick={handleCancelClick}
        onGoBack={handleGoBack}
      />

      <CancelDialog
        open={showCancelDialog}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancel}
        orderId={order.id}
        cancelling={cancelling}
      />

      <ReviewForm
        open={showReviewForm}
        onClose={handleCloseReviewForm}
        orderId={order.id}
        items={order.items}
        onSuccess={handleReviewSuccess}
      />
    </OrderDetailContainer>
  );
};

export default OrderDetailScreen;
