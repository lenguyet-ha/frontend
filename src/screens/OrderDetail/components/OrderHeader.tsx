import React from "react";
import { Typography, Box, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

interface OrderHeaderProps {
  onGoBack: () => void;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ onGoBack }) => {
  return (
    <Box display="flex" alignItems="center" gap={2} mb={3}>
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={onGoBack}
      >
        Quay lại
      </Button>
      <Typography variant="h4" fontWeight="bold">
        Chi tiết đơn hàng
      </Typography>
    </Box>
  );
};

export default OrderHeader;
