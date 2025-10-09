import { styled } from '@mui/material/styles';
import { Box, Paper, Card, Chip } from '@mui/material';

export const OrdersContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '1200px',
  margin: '0 auto',
  minHeight: '100vh',
  backgroundColor: theme.palette.grey[50],
}));

export const OrdersHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.common.white,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

export const StatusTabs = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(3),
  overflowX: 'auto',
  paddingBottom: theme.spacing(1),
  '&::-webkit-scrollbar': {
    height: 4,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.grey[200],
    borderRadius: 2,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[400],
    borderRadius: 2,
  },
}));

export const StatusTab = styled(Chip)<{ active?: boolean }>(({ theme, active }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1, 2),
  fontWeight: active ? 600 : 400,
  backgroundColor: active ? theme.palette.primary.main : theme.palette.grey[100],
  color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
  border: active ? `1px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.grey[300]}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minWidth: 120,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : theme.palette.grey[200],
  },
}));

export const OrderCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: 'box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

export const OrderHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const OrderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const ProductImage = styled('img')(({ theme }) => ({
  width: 80,
  height: 80,
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

export const ProductInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

export const OrderFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

export const PriceText = styled(Box)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
}));

export const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(8),
  backgroundColor: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));
