import React from "react";
import { Typography, Box } from "@mui/material";
import { CalendarToday, Receipt, Store, LocalShipping } from "@mui/icons-material";
import {
  OrderDetailCard,
  InfoRow,
  InfoLabel,
  InfoValue,
  StatusBadge,
} from "../OrderDetail.styles";

interface OrderStatusCardProps {
  order: {
    id: number;
    status: string;
    shopName: React.ReactNode;
    createdAt: string;
    updatedAt: string;
  };
  formatDate: (dateString: string) => string;
  STATUS_MAP: Record<string, string>;
}

const OrderStatusCard: React.FC<OrderStatusCardProps> = ({
  order,
  formatDate,
  STATUS_MAP,
}) => {
  return (
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
  );
};

export default OrderStatusCard;
