import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Badge,
  Container,
} from '@mui/material';
import { Search, ShoppingCart } from '@mui/icons-material';
import * as ProductApi from '@/api/product';
import * as CartApi from '@/api/cart';

const Header = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

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

    window.addEventListener('cart-updated', handleCartUpdate);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, [fetchCartCount]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    // Navigate immediately when user types (debounced)
    if (value.trim()) {
      router.push(`/products?name=${encodeURIComponent(value)}`);
    } else {
      // If empty, go back to products without search
      router.push('/products');
    }
  }, [router]);

  const handleCartClick = useCallback(() => {
    router.push('/cart');
  }, [router]);

  const handleLogoClick = useCallback(() => {
    router.push('/products');
  }, [router]);

  return (
    <AppBar position="sticky" elevation={2}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo/Brand */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 0,
              mr: 4,
              fontWeight: 'bold',
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
            onClick={handleLogoClick}
          >
            ECOMMERCE
          </Typography>

          {/* Search Box */}
          <Box sx={{ flexGrow: 1, maxWidth: 600 }}>
            <TextField
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
                sx: {
                  bgcolor: 'white',
                  borderRadius: 1,
                  '& fieldset': { border: 'none' },
                },
              }}
            />
          </Box>

          {/* Cart Icon */}
          <Box sx={{ ml: 2 }}>
            <IconButton
              color="inherit"
              onClick={handleCartClick}
              size="large"
            >
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
