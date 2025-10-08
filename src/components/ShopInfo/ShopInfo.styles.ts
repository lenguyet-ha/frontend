import { styled } from '@mui/material/styles';
import { Box, Card, Avatar } from '@mui/material';

export const ShopInfoCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

export const ShopInfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

export const ShopAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  border: `2px solid ${theme.palette.primary.main}`,
}));

export const ShopContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

export const ShopActions = styled(Box)(({ theme }) => ({
  marginLeft: 'auto',
  display: 'flex',
  gap: theme.spacing(1),
}));
