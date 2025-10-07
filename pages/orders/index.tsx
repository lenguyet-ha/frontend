import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { useRouter } from "next/router";

const OrdersPage: React.FC = () => {
  const router = useRouter();

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Card sx={{ maxWidth: 600, margin: "0 auto", p: 4 }}>
        <CardContent>
          <Typography variant="h4" color="success.main" gutterBottom>
            🎉 Đặt hàng thành công!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Cảm ơn bạn đã mua hàng
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Đơn hàng của bạn đã được tiếp nhận và đang được xử lý. 
            Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng.
          </Typography>
          <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "center" }}>
            <Button 
              variant="contained" 
              onClick={() => router.push("/")}
            >
              Tiếp tục mua sắm
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => router.push("/cart")}
            >
              Quay lại giỏ hàng
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrdersPage;
