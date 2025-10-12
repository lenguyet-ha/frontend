import React from "react";
import { Box, Button } from "@mui/material";

interface OrderActionsProps {
  orderStatus: string;
  orderReviews: any[] | null;
  cancelling: boolean;
  onReviewClick: () => void;
  onCancelClick: () => void;
  onGoBack: () => void;
}

const OrderActions: React.FC<OrderActionsProps> = ({
  orderStatus,
  orderReviews,
  cancelling,
  onReviewClick,
  onCancelClick,
  onGoBack,
}) => {
  return (
    <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
      {orderStatus === "DELIVERED" && !orderReviews?.length && (
        <Button variant="outlined" size="large" onClick={onReviewClick}>
          Đánh giá
        </Button>
      )}
      {(orderStatus === "PENDING_PAYMENT" ||
        orderStatus === "PENDING_PICKUP") && (
        <Button
          variant="outlined"
          color="error"
          size="large"
          onClick={onCancelClick}
          disabled={cancelling}
        >
          {cancelling ? 'Đang huỷ...' : 'Huỷ đơn'}
        </Button>
      )}
      <Button variant="contained" size="large" onClick={onGoBack}>
        Quay lại danh sách
      </Button>
    </Box>
  );
};

export default OrderActions;
