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
  Popover,
} from "@mui/material";
import { Search, ShoppingCart, Person, Message } from "@mui/icons-material";
import * as ProductApi from "@/api/product";
import * as CartApi from "@/api/cart";
import * as MessagesApi from "@/api/messages";
import ConversationsList from "@/components/ConversationsList";
import Chat from "@/components/Chat";
import WebSocketStatus from "@/components/WebSocketStatus";
import socketService from "@/services/socketService";
import type { User } from "@/api/messages";
import { useSelector, useDispatch } from "@/store/store";
import { openChat, closeChat } from "@/store/reducers/chat";
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
  const dispatch = useDispatch();
  const chat = useSelector((state) => state.chat);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showConversations, setShowConversations] = useState(false);
  const [conversationsAnchor, setConversationsAnchor] = useState<null | HTMLElement>(null);

  // Get user info from localStorage
  useEffect(() => {
    const loadUserInfo = () => {
      const storedUserInfo = localStorage.getItem("userInfo");
      if (storedUserInfo) {
        const user = JSON.parse(storedUserInfo);
        setUserInfo(user);
        
        // Connect to WebSocket if not already connected
        const token = localStorage.getItem('accessToken');
        if (token && !socketService.isConnected) {
          socketService.connect(token);
        }
      } else {
        setUserInfo(null);
        // Disconnect WebSocket if user logs out
        socketService.disconnect();
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

  // Fetch unread messages count
  const fetchUnreadCount = useCallback(async () => {
    if (!userInfo) {
      setUnreadCount(0);
      return;
    }
    
    try {
      const response = await MessagesApi.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [userInfo]);

  // Setup WebSocket listeners for real-time updates
  useEffect(() => {
    if (!userInfo) return;

    const handleNewMessage = () => {
      fetchUnreadCount();
    };

    const handleMessageRead = () => {
      fetchUnreadCount();
    };

    socketService.on('message_notification', handleNewMessage);
    socketService.on('messages_read', handleMessageRead);

    // Initial fetch
    fetchUnreadCount();

    return () => {
      socketService.off('message_notification');
      socketService.off('messages_read');
    };
  }, [userInfo, fetchUnreadCount]);

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

  const handleMessagesClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setConversationsAnchor(event.currentTarget);
      setShowConversations(true);
    },
    []
  );

  const handleCloseConversations = useCallback(() => {
    setShowConversations(false);
    setConversationsAnchor(null);
  }, []);

  const handleConversationSelect = useCallback((user: User) => {
    dispatch(closeChat());
    dispatch(openChat({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    }));
    setShowConversations(false);
    setConversationsAnchor(null);
  }, [dispatch]);

  const handleCloseChat = useCallback(() => {
    dispatch(closeChat());
  }, [dispatch]);

  const handleProfileClick = useCallback(() => {
    router.push("/profile");
    handleCloseMenu();
  }, [router]);

  const handleListOrdersClick = useCallback(() => {
    router.push("/orders");
    handleCloseMenu();
  }, [router]);

  const handleSellerRegistrationClick = useCallback(() => {
    router.push("/seller-registration");
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

            {/* Messages Icon */}
            {userInfo && (
              <CartBox>
                <IconButton
                  color="inherit"
                  onClick={handleMessagesClick}
                  size="large"
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <Message />
                  </Badge>
                </IconButton>
              </CartBox>
            )}

            {/* WebSocket Status */}
            {userInfo && <WebSocketStatus />}

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
                  <MenuItem onClick={handleListOrdersClick}>Đơn mua</MenuItem>
                  <MenuItem onClick={handleSellerRegistrationClick}>
                    Đăng ký bán hàng
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                </StyledMenu>
              </AvatarBox>
            )}
          </Box>
          {/* Cart Icon */}
        </Toolbar>
      </Container>

      {/* Conversations List Popover */}
      <Popover
        open={showConversations}
        anchorEl={conversationsAnchor}
        onClose={handleCloseConversations}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {userInfo && (
          <ConversationsList
            open={showConversations}
            onClose={handleCloseConversations}
            onConversationSelect={handleConversationSelect}
            currentUserId={userInfo.id}
          />
        )}
      </Popover>

      {/* Chat Modal */}
      {chat.isOpen && chat.currentUser && userInfo && (
        <Box
          position="fixed"
          bottom={16}
          right={16}
          zIndex={1400}
        >
          <Chat
            open={chat.isOpen}
            onClose={handleCloseChat}
            otherUser={chat.currentUser}
            currentUserId={userInfo.id}
          />
        </Box>
      )}
    </StyledAppBar>
  );
};

export default Header;
