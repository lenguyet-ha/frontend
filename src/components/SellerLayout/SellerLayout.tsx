import React from "react";
import { useRouter } from "next/router";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Container,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  LocalOffer as CouponIcon,
} from "@mui/icons-material";
import Header from "@/components/Header";

const DRAWER_WIDTH = 240;

interface SellerLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    path: "/seller",
  },
  {
    text: "Sản phẩm",
    icon: <InventoryIcon />,
    path: "/seller/products",
  },
  {
    text: "Mã giảm giá",
    icon: <CouponIcon />,
    path: "/seller/coupon",
  },
];

const SellerLayout: React.FC<SellerLayoutProps> = ({ children }) => {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <Box sx={{ display: "flex", flex: 1 }}>
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              marginTop: "64px", // Height of the header
              height: "calc(100vh - 64px)",
            },
          }}
        >
          <Box sx={{ overflow: "auto" }}>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    selected={router.pathname === item.path}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: `calc(100% - ${DRAWER_WIDTH}px)`,
            marginTop: "64px",
          }}
        >
          <Container maxWidth="xl">{children}</Container>
        </Box>
      </Box>
    </Box>
  );
};

export default SellerLayout;
