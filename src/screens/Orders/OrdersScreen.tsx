import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  Collapse,
  IconButton,
  Pagination,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  ShoppingBag,
  Star,
  Store,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import * as OrdersApi from "@/api/orders";
import ReviewForm from "@/components/ReviewForm";
import {
  OrdersContainer,
  OrdersHeader,
  StatusTabs,
  StatusTab,
  OrderCard,
  OrderHeader,
  OrderContent,
  ProductImage,
  ProductInfo,
  OrderFooter,
  PriceText,
  EmptyState,
} from "./Orders.styles";

// Order status mapping
const ORDER_STATUS = {
  PENDING: "pending",
  PICKUP: "pickup",
  SHIPPING: "shipping",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

const STATUS_TABS = [
  {
    key: ORDER_STATUS.PENDING,
    label: "Chờ xử lý",
    apiValues: ["PENDING_PAYMENT"],
  },
  {
    key: ORDER_STATUS.PICKUP,
    label: "Chờ lấy hàng",
    apiValues: ["PENDING_PICKUP"],
  },
  {
    key: ORDER_STATUS.SHIPPING,
    label: "Đang vận chuyển",
    apiValues: ["PENDING_DELIVERY"],
  },
  {
    key: ORDER_STATUS.DELIVERED,
    label: "Đã giao hàng",
    apiValues: ["DELIVERED"],
  },
  { key: ORDER_STATUS.CANCELLED, label: "Đã huỷ", apiValues: ["CANCELLED"] },
];

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

interface Order {
  shopName: any;
  id: number;
  userId: number;
  status: string;
  shopId: number;
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

interface OrdersResponse {
  data: Order[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

const OrdersScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(ORDER_STATUS.PENDING);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const currentTab = STATUS_TABS.find((tab) => tab.key === activeTab);
      const response: OrdersResponse = await OrdersApi.getOrders({
        page,
        limit: 10,
        // For API, we need to send specific status values
        // Since API doesn't support multiple status values in one call,
        // we'll fetch all and filter on frontend for now
      });

      if (response?.data) {
        // Filter orders based on current tab
        const filteredOrders = response.data.filter((order) => {
          if (currentTab) {
            return currentTab.apiValues.includes(order.status);
          }
          return true;
        });

        setOrders(filteredOrders);
        setTotalPages(response.totalPages);
      } else {
        setOrders([]);
      }
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleTabChange = useCallback((tabKey: string) => {
    setActiveTab(tabKey);
    setPage(1);
    setExpandedOrders(new Set());
  }, []);

  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, newPage: number) => {
      setPage(newPage);
    },
    []
  );

  const toggleOrderExpansion = useCallback((orderId: number) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  }, []);

  const calculateOrderTotal = useCallback((order: Order) => {
    // Use order.total if available (from API), otherwise calculate from items
    return order.total || order.items.reduce(
      (total, item) => total + item.skuPrice * item.quantity,
      0
    );
  }, []);

  const getShopName = useCallback((order: Order) => {
    // For now, using shopId as shop name
    // In real app, you might want to fetch shop info
    return `Shop ${order.shopName}`;
  }, []);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }, []);

  const handleProductClick = useCallback(
    (productId: number) => {
      router.push(`/products/${productId}`);
    },
    [router]
  );

  const renderOrderCard = (order: Order) => {
    const isExpanded = expandedOrders.has(order.id);
    const visibleItems = isExpanded ? order.items : order.items.slice(0, 1);
    const hasMoreItems = order.items.length > 1;
    const orderTotal = calculateOrderTotal(order);

    return (
      <OrderCard key={order.id}>
        <OrderHeader>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Đơn hàng #{order.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Store sx={{ fontSize: 16, mr: 0.5 }} />
              {getShopName(order)}
            </Typography>
          </Box>
          <Typography variant="body2" color="primary.main" fontWeight="medium">
            {
              STATUS_TABS.find((tab) => tab.apiValues.includes(order.status))
                ?.label
            }
          </Typography>
        </OrderHeader>

        {visibleItems.map((item, index) => (
          <OrderContent key={item.id}>
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
                sx={{ cursor: "pointer", "&:hover": { color: "primary.main" } }}
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
                Số lượng: {item.quantity}
              </Typography>
              <Typography
                variant="body2"
                color="primary.main"
                fontWeight="medium"
              >
                {formatPrice(item.skuPrice)}
              </Typography>
            </ProductInfo>
          </OrderContent>
        ))}

        {hasMoreItems && (
          <Box textAlign="center" mb={2}>
            <Button
              variant="text"
              onClick={() => toggleOrderExpansion(order.id)}
              endIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
            >
              {isExpanded
                ? "Thu gọn"
                : `Xem thêm ${order.items.length - 1} sản phẩm`}
            </Button>
          </Box>
        )}

        {/* Order Financial Summary */}
        <Box sx={{ px: 2, pb: 2, borderTop: '1px solid #e0e0e0', pt: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Tổng tiền hàng:
            </Typography>
            <Typography variant="body2">
              {formatPrice(order.subtotal || calculateOrderTotal(order))}
            </Typography>
          </Box>
          
          {order.shippingMethod && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Phí vận chuyển ({order.shippingMethod.name}):
              </Typography>
              <Typography variant="body2">
                {formatPrice(order.shippingMethod.price)}
              </Typography>
            </Box>
          )}
          
          {order.discountCode && order.discountAmount > 0 && (
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="success.main">
                Giảm giá ({order.discountCode.code}):
              </Typography>
              <Typography variant="body2" color="success.main">
                -{formatPrice(order.discountAmount)}
              </Typography>
            </Box>
          )}
        </Box>

        <OrderFooter>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Tổng thanh toán
            </Typography>
            <PriceText>{formatPrice(orderTotal)}</PriceText>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              Xem chi tiết
            </Button>
          </Box>
        </OrderFooter>
      </OrderCard>
    );
  };

  return (
    <OrdersContainer>
      <OrdersHeader>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Lịch sử đơn hàng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Theo dõi tất cả đơn hàng của bạn
        </Typography>
      </OrdersHeader>

      {/* Status Tabs */}
      <StatusTabs>
        {STATUS_TABS.map((tab) => (
          <StatusTab
            key={tab.key}
            label={tab.label}
            active={activeTab === tab.key}
            onClick={() => handleTabChange(tab.key)}
          />
        ))}
      </StatusTabs>

      {/* Orders List */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={60} />
        </Box>
      ) : orders.length > 0 ? (
        <>
          {orders.map(renderOrderCard)}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
        <EmptyState>
          <ShoppingBag sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chưa có đơn hàng nào
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {activeTab === ORDER_STATUS.PENDING &&
              "Bạn chưa có đơn hàng nào đang chờ xử lý"}
            {activeTab === ORDER_STATUS.SHIPPING &&
              "Bạn chưa có đơn hàng nào đang vận chuyển"}
            {activeTab === ORDER_STATUS.DELIVERED &&
              "Bạn chưa có đơn hàng nào đã giao"}
            {activeTab === ORDER_STATUS.CANCELLED &&
              "Bạn chưa có đơn hàng nào bị huỷ"}
          </Typography>
          <Button variant="contained" onClick={() => router.push("/products")}>
            Tiếp tục mua sắm
          </Button>
        </EmptyState>
      )}
    </OrdersContainer>
  );
};

export default OrdersScreen;
