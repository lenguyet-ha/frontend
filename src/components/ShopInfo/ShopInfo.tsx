import React from 'react';
import { useRouter } from 'next/router';
import { Typography, Button } from '@mui/material';
import { Store, Message } from '@mui/icons-material';
import {
  ShopInfoCard,
  ShopInfoContainer,
  ShopAvatar,
  ShopContent,
  ShopActions,
} from './ShopInfo.styles';

interface ShopInfoProps {
  shopInfo: {
    id: number;
    name: string;
    avatar: string;
  };
  onViewShop?: () => void;
  onMessage?: () => void;
}

const ShopInfo: React.FC<ShopInfoProps> = ({ 
  shopInfo, 
  onViewShop, 
  onMessage 
}) => {
  const router = useRouter();

  const handleViewShop = () => {
    if (onViewShop) {
      onViewShop();
    } else {
      // Navigate to shop page
      router.push(`/shop/${shopInfo.id}`);
    }
  };

  const handleMessage = () => {
    if (onMessage) {
      onMessage();
    } else {
      // Default action - open chat
      console.log('Open chat with shop:', shopInfo.id);
    }
  };

  return (
    <ShopInfoCard>
      <ShopInfoContainer>
        <ShopAvatar
          src={shopInfo.avatar}
          alt={shopInfo.name}
        >
          <Store />
        </ShopAvatar>
        
        <ShopContent>
          <Typography variant="h6" component="div" fontWeight="bold">
            {shopInfo.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Shop bán hàng
          </Typography>
        </ShopContent>

        <ShopActions>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Store />}
            onClick={handleViewShop}
          >
            Xem Shop
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Message />}
            onClick={handleMessage}
          >
            Chat
          </Button>
        </ShopActions>
      </ShopInfoContainer>
    </ShopInfoCard>
  );
};

export default ShopInfo;
