import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/router";
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import {
  ArrowBack,
  LocalShipping,
  Person,
  Phone,
  LocationOn,
  CalendarToday,
  Receipt,
  Store,
} from "@mui/icons-material";
import * as OrdersApi from "@/api/orders";
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

  const totalAmount = calculateTotal(order.items);

  return (
    <OrderDetailContainer>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
        >
          Quay lại
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Chi tiết đơn hàng
        </Typography>
      </Box>

      {/* Order Status Card */}
      <OrderDetailCard>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Đơn hàng #{order.id}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Đặt ngày: {formatDate(order.createdAt)}
              </Typography>
            </Box>
          </Box>
          <StatusBadge status={order.status}>
            {STATUS_MAP[order.status] || order.status}
          </StatusBadge>
        </Box>

        <InfoRow>
          <InfoLabel>
            <Receipt sx={{ mr: 1, verticalAlign: "middle" }} />
            Mã đơn hàng
          </InfoLabel>
          <InfoValue>#{order.id}</InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>
            <Store sx={{ mr: 1, verticalAlign: "middle" }} />
            Shop
          </InfoLabel>
          <InfoValue>{order.shopName}</InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>
            <LocalShipping sx={{ mr: 1, verticalAlign: "middle" }} />
            Trạng thái
          </InfoLabel>
          <InfoValue>
            <StatusBadge status={order.status}>
              {STATUS_MAP[order.status] || order.status}
            </StatusBadge>
          </InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>
            <CalendarToday sx={{ mr: 1, verticalAlign: "middle" }} />
            Ngày đặt
          </InfoLabel>
          <InfoValue>{formatDate(order.createdAt)}</InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>
            <CalendarToday sx={{ mr: 1, verticalAlign: "middle" }} />
            Cập nhật lần cuối
          </InfoLabel>
          <InfoValue>{formatDate(order.updatedAt)}</InfoValue>
        </InfoRow>
      </OrderDetailCard>

      {/* Receiver Information */}
      <OrderDetailCard>
        <SectionTitle>
          <Person sx={{ mr: 1, verticalAlign: "middle" }} />
          Thông tin người nhận
        </SectionTitle>

        <InfoRow>
          <InfoLabel>
            <Person sx={{ mr: 1, verticalAlign: "middle" }} />
            Tên người nhận
          </InfoLabel>
          <InfoValue>{order.receiver.name}</InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>
            <Phone sx={{ mr: 1, verticalAlign: "middle" }} />
            Số điện thoại
          </InfoLabel>
          <InfoValue>{order.receiver.phone}</InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>
            <LocationOn sx={{ mr: 1, verticalAlign: "middle" }} />
            Địa chỉ
          </InfoLabel>
          <InfoValue>{order.receiver.address}</InfoValue>
        </InfoRow>
      </OrderDetailCard>

      {/* Products List */}
      <OrderDetailCard>
        <SectionTitle>
          <Receipt sx={{ mr: 1, verticalAlign: "middle" }} />
          Sản phẩm ({order.items.length})
        </SectionTitle>

        {order.items.map((item) => (
          <ProductItem key={item.id}>
            <ProductImage
              src={item.image}
              alt={item.productName}
              onClick={() => handleProductClick(item.productId)}
              style={{ cursor: "pointer" }}
            />
            <ProductInfo>
              <Typography
                variant="subtitle1"
                fontWeight="medium"
                sx={{
                  cursor: "pointer",
                  "&:hover": { color: "primary.main" },
                }}
                onClick={() => handleProductClick(item.productId)}
              >
                {item.productTranslations.length > 0
                  ? item.productTranslations[0].name
                  : item.productName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phân loại: {item.skuValue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Số lượng: x{item.quantity}
              </Typography>
            </ProductInfo>
            <PriceInfo>
              <Typography
                variant="body1"
                color="primary.main"
                fontWeight="medium"
              >
                {formatPrice(item.skuPrice)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng: {formatPrice(item.skuPrice * item.quantity)}
              </Typography>
            </PriceInfo>
          </ProductItem>
        ))}

        {/* Total */}
        <TotalSection>
          <TotalRow>
            <TotalLabel>Tổng số lượng:</TotalLabel>
            <Typography variant="body1" fontWeight="medium">
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} sản
              phẩm
            </Typography>
          </TotalRow>
          <TotalRow>
            <TotalLabel>Tổng tiền hàng:</TotalLabel>
            <TotalValue>{formatPrice(totalAmount)}</TotalValue>
          </TotalRow>
          <Divider sx={{ my: 2 }} />
          <TotalRow>
            <Typography variant="h6" fontWeight="bold">
              Tổng thanh toán:
            </Typography>
            <TotalValue>{formatPrice(totalAmount)}</TotalValue>
          </TotalRow>
        </TotalSection>
      </OrderDetailCard>

      {/* Action Buttons */}
      <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
        {order.status === "DELIVERED" && (
          <Button variant="outlined" size="large">
            Đánh giá
          </Button>
        )}
        {(order.status === "PENDING_PAYMENT" ||
          order.status === "PENDING_PICKUP") && (
          <Button 
            variant="outlined" 
            color="error" 
            size="large"
            onClick={handleCancelClick}
            disabled={cancelling}
          >
            {cancelling ? 'Đang huỷ...' : 'Huỷ đơn'}
          </Button>
        )}
        <Button variant="contained" size="large" onClick={handleGoBack}>
          Quay lại danh sách
        </Button>
      </Box>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={showCancelDialog}
        onClose={handleCloseCancelDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận huỷ đơn hàng</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn huỷ đơn hàng #{order.id}?
            <br />
            Thao tác này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseCancelDialog}
            disabled={cancelling}
          >
            Không
          </Button>
          <Button 
            onClick={handleConfirmCancel} 
            color="error" 
            variant="contained"
            disabled={cancelling}
            autoFocus
          >
            {cancelling ? 'Đang xử lý...' : 'Xác nhận huỷ'}
          </Button>
        </DialogActions>
      </Dialog>
    </OrderDetailContainer>
  );
};

export default OrderDetailScreen;
