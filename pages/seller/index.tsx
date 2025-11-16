import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  ShoppingCart as OrderIcon,
  AttachMoney as RevenueIcon,
} from "@mui/icons-material";
import SellerLayout from "@/components/SellerLayout";
import { useRouter } from "next/router";

const SellerDashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  // Check if user is seller
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (user.role.name !== "SELLER") {
        router.push("/products");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  // TODO: Fetch dashboard stats from API
  useEffect(() => {
    // This is placeholder data
    setStats({
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
    });
  }, []);

  const statCards = [
    {
      title: "Tổng sản phẩm",
      value: stats.totalProducts,
      icon: <InventoryIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
      color: "#e3f2fd",
    },
    {
      title: "Đơn hàng",
      value: stats.totalOrders,
      icon: <OrderIcon sx={{ fontSize: 40, color: "#2e7d32" }} />,
      color: "#e8f5e9",
    },
    {
      title: "Doanh thu",
      value: `${stats.totalRevenue.toLocaleString()} đ`,
      icon: <RevenueIcon sx={{ fontSize: 40, color: "#ed6c02" }} />,
      color: "#fff3e0",
    },
  ];

  return (
    <SellerLayout>
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Chào mừng đến với trang quản lý người bán
        </Typography>

        <Grid container spacing={3}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  backgroundColor: card.color,
                }}
              >
                {card.icon}
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {card.value}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hoạt động gần đây
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chưa có hoạt động nào
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </SellerLayout>
  );
};

export default SellerDashboard;
