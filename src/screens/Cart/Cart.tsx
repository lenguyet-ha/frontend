import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Divider,
  Grid,
  Paper,
  Avatar,
  Checkbox,
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useRouter } from "next/router";
import { getCart, updateCartItem, removeCartItem } from "@/api/cart";
import {
  showErrorSnackBar,
  showSuccessSnackBar,
} from "@/store/reducers/snackbar";
import { dispatch } from "@/store";
import { useStyles } from "./Cart.styles";

// Types
interface CartItem {
  id: number;
  userId: number;
  skuId: number;
  quantity: number;
  sku: {
    id: number;
    value: string;
    price: number;
    stock: number;
    image: string;
    productId: number;
    product: {
      id: number;
      name: string;
      basePrice: number;
      virtualPrice: number;
      brandId: number;
      images: string[];
      variants: any;
      description: string;
      createdBy: {
        id: number;
        name: string;
        avatar: string | null;
      };
    };
  };
}

interface CartGroup {
  shop: {
    id: number;
    name: string;
    avatar: string | null;
  };
  items: CartItem[];
  totalItems: number;
  totalPrice: number | null;
}

const Cart: React.FC = () => {
  const classes = useStyles();
  const router = useRouter();
  const [cartGroups, setCartGroups] = useState<CartGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await getCart();
      if (
        response?.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const groups: CartGroup[] = response.data.map((group: CartGroup) => ({
          shop: {
            id: group.shop.id,
            name: group.shop.name,
            avatar: group.shop.avatar,
          },
          items: group.items,
          totalItems: group.totalItems,
          totalPrice: group.totalPrice,
        }));
        setCartGroups(groups);
        setSelectedItems(groups.flatMap(group => group.items.map(item => item.id)));
      }
    } catch (error) {
      dispatch(showErrorSnackBar("Không thể tải giỏ hàng"));
    }
  };

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await updateCartItem(item.id, {
        quantity: newQuantity,
        skuId: item.skuId,
      });
      fetchCart();
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      dispatch(showErrorSnackBar("Không thể cập nhật số lượng"));
    }
  };

  const handleRemoveItems = async (cartItemIds: number[]) => {
    try {
      await removeCartItem({ cartItemIds });
      fetchCart();
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      dispatch(showErrorSnackBar("Không thể xóa sản phẩm"));
    }
  };

  const calculateTotal = (items: CartItem[]) => {
    return items.reduce(
      (total, item) => total + item.sku.price * item.quantity,
      0
    );
  };

  const handleToggleItem = (itemId: number) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleCheckout = (shopId?: number) => {
    const selectedItemsForShop = shopId 
      ? cartGroups.find(group => group.shop.id === shopId)?.items
          .filter(item => selectedItems.includes(item.id))
          .map(item => item.id) || []
      : selectedItems;

    if (selectedItemsForShop.length === 0) {
      dispatch(showErrorSnackBar("Vui lòng chọn ít nhất một sản phẩm"));
      return;
    }

    const checkoutData = shopId 
      ? cartGroups.filter(group => group.shop.id === shopId)
      : cartGroups;

    router.push({
      pathname: "/checkout",
      query: {
        cartData: JSON.stringify(checkoutData),
        selectedItemIds: JSON.stringify(selectedItemsForShop),
      },
    });
  };

  if (cartGroups.length === 0) {
    return (
      <Box className={classes.emptyCart}>
        <Typography variant="h6">Giỏ hàng trống</Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.mainContainer}>
      <Typography variant="h4" gutterBottom>
        Giỏ hàng
      </Typography>

      {cartGroups.map((group) => (
        <Paper key={group.shop.id} className={classes.shopPaper}>
          <Box className={classes.shopHeader}>
            <Avatar
              src={group.shop.avatar || undefined}
              alt={group.shop.name}
              className={classes.shopAvatar}
            >
              {group.shop.name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" className={classes.shopName}>
              {group.shop.name}
            </Typography>
          </Box>

          {group.items.map((item) => (
            <Card key={item.id} className={classes.itemCard}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={1}>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleToggleItem(item.id)}
                    />
                  </Grid>
                  <Grid item xs={11} sm={2}>
                    <CardMedia
                      component="img"
                      image={item.sku.image || item.sku.product.images[0]}
                      alt={item.sku.product.name}
                      className={classes.itemMedia}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6">
                      {item.sku.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.sku.value}
                    </Typography>
                    <Typography variant="body1" color="primary">
                      {item.sku.price.toLocaleString()} VND
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <Box className={classes.quantityBox}>
                      <IconButton
                        onClick={() =>
                          handleUpdateQuantity(item, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Remove />
                      </IconButton>
                      <Typography className={classes.quantityText}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        onClick={() =>
                          handleUpdateQuantity(item, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.sku.stock}
                      >
                        <Add />
                      </IconButton>
                      <IconButton
                        onClick={() => handleRemoveItems([item.id])}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Divider sx={{ my: 2 }} />
          <Box className={classes.totalBox}>
            <Typography variant="h6">
              Tổng tiền: {calculateTotal(group.items.filter(item => selectedItems.includes(item.id))).toLocaleString()} VND
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => handleCheckout(group.shop.id)}
              disabled={group.items.filter(item => selectedItems.includes(item.id)).length === 0}
            >
              Đặt hàng
            </Button>
          </Box>
        </Paper>
      ))}

      <Divider sx={{ my: 2 }} />
      <Box className={classes.totalBox}>
        <Typography variant="h5">
          Tổng tiền tất cả: {cartGroups
            .flatMap(group => group.items.filter(item => selectedItems.includes(item.id)))
            .reduce((total, item) => total + item.sku.price * item.quantity, 0)
            .toLocaleString()} VND
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => handleCheckout()}
          disabled={selectedItems.length === 0}
        >
          Đặt hàng tất cả
        </Button>
      </Box>
    </Box>
  );
};

export default Cart;
