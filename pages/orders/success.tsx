import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { useRouter } from "next/router";

const OrderSuccessPage: React.FC = () => {
  const router = useRouter();

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Card sx={{ maxWidth: 600, margin: "0 auto", p: 4 }}>
        <CardContent>
          <Typography variant="h4" color="success.main" gutterBottom>
            🎉 Đặt hàng thành công!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Cảm ơn bạn đã mua hàng!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Đơn hàng của bạn đã được xác nhận và đang được xử lý. Chúng tôi sẽ
            thông báo cho bạn khi đơn hàng được giao.
          </Typography>
          <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push("/products")}
            >
              Tiếp tục mua sắm
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push("/orders")}
            >
              Xem đơn hàng
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderSuccessPage;
