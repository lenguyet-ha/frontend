import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Toolbar,
  InputAdornment,
  IconButton,
  Badge,
  Container,
  MenuItem,
  Box,
} from "@mui/material";
import { Search, ShoppingCart, Person } from "@mui/icons-material";
import * as ProductApi from "@/api/product";
import * as CartApi from "@/api/cart";
import {
  StyledAppBar,
  LogoTypography,
  SearchBox,
  SearchTextField,
  CartBox,
  AvatarBox,
  AvatarIconButton,
  StyledAvatar,
  StyledMenu,
} from "./Header.styles";
import { display } from "@mui/system";

const Header = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Get user info from localStorage
  useEffect(() => {
    const loadUserInfo = () => {
      const storedUserInfo = localStorage.getItem("userInfo");
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      } else {
        setUserInfo(null);
      }
    };

    loadUserInfo();

    // Listen for user updates
    const handleUserUpdate = () => {
      loadUserInfo();
    };

    window.addEventListener("user-updated", handleUserUpdate);

    return () => {
      window.removeEventListener("user-updated", handleUserUpdate);
    };
  }, []);

  const fetchCartCount = useCallback(async () => {
    const response = await CartApi.getCart();
    if (response?.data && response.data.length > 0) {
      // Get total items from the first cart object
      const totalItems = response.data[0].totalItems || 0;
      setCartCount(totalItems);
    } else {
      setCartCount(0);
    }
  }, []);

  // Fetch cart count on mount and listen for updates
  useEffect(() => {
    fetchCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cart-updated", handleCartUpdate);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, [fetchCartCount]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchQuery(value);

      // Navigate immediately when user types (debounced)
      if (value.trim()) {
        router.push(`/products?name=${encodeURIComponent(value)}`);
      } else {
        // If empty, go back to products without search
        router.push("/products");
      }
    },
    [router]
  );

  const handleCartClick = useCallback(() => {
    router.push("/cart");
  }, [router]);

  const handleLogoClick = useCallback(() => {
    router.push("/products");
  }, [router]);

  const handleAvatarClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleProfileClick = useCallback(() => {
    router.push("/profile");
    handleCloseMenu();
  }, [router]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    setUserInfo(null);
    router.push("/login");
    handleCloseMenu();
  }, [router]);

  return (
    <StyledAppBar>
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ display: "flex", justifyContent: "center" }}
        >
          {/* Logo/Brand */}
          <LogoTypography
            variant="h6"
            component="div"
            onClick={handleLogoClick}
          >
            ECOMMERCE
          </LogoTypography>

          {/* Search Box */}
          <SearchBox>
            <SearchTextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </SearchBox>

          <Box sx={{ display: "flex" }}>
            <CartBox>
              <IconButton
                color="inherit"
                onClick={handleCartClick}
                size="large"
              >
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>
            </CartBox>

            {/* User Avatar */}
            {userInfo && (
              <AvatarBox>
                <AvatarIconButton onClick={handleAvatarClick} size="small">
                  <StyledAvatar
                    alt={userInfo.name || "User"}
                    src={userInfo.avatar}
                  >
                    {userInfo.avatar ? undefined : <Person />}
                  </StyledAvatar>
                </AvatarIconButton>
                <StyledMenu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  onClick={handleCloseMenu}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem onClick={handleProfileClick}>
                    Thông tin cá nhân
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                </StyledMenu>
              </AvatarBox>
            )}
          </Box>
          {/* Cart Icon */}
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Header;
