import { styled } from '@mui/material/styles';
import { Box, Paper, Card } from '@mui/material';

export const OrderDetailContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '1000px',
  margin: '0 auto',
  minHeight: '100vh',
  backgroundColor: theme.palette.grey[50],
}));

export const OrderDetailCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
}));

export const SectionTitle = styled(Box)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `2px solid ${theme.palette.primary.main}`,
  color: theme.palette.primary.main,
}));

export const InfoRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

export const InfoLabel = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: 500,
  minWidth: '150px',
}));

export const InfoValue = styled(Box)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 400,
  flex: 1,
  textAlign: 'right',
}));

export const ProductItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[50],
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

export const ProductImage = styled('img')(({ theme }) => ({
  width: 100,
  height: 100,
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

export const PriceInfo = styled(Box)(({ theme }) => ({
  minWidth: '120px',
  textAlign: 'right',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: theme.spacing(0.5),
}));

export const TotalSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  paddingTop: theme.spacing(2),
  borderTop: `2px solid ${theme.palette.divider}`,
}));

export const TotalRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 0),
}));

export const TotalLabel = styled(Box)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
}));

export const TotalValue = styled(Box)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
}));

export const StatusBadge = styled(Box)<{ status?: string }>(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'PENDING_PAYMENT':
      case 'PENDING_PICKUP':
      case 'PENDING_DELIVERY':
        return {
          background: theme.palette.warning.light,
          color: theme.palette.warning.dark,
        };
      case 'DELIVERED':
        return {
          background: theme.palette.success.light,
          color: theme.palette.success.dark,
        };
      case 'CANCELLED':
        return {
          background: theme.palette.error.main,
          color: theme.palette.common.white,
        };
      case 'RETURNED':
        return {
          background: theme.palette.error.light,
          color: theme.palette.error.dark,
        };
      default:
        return {
          background: theme.palette.grey[200],
          color: theme.palette.text.primary,
        };
    }
  };

  const colors = getStatusColor();

  return {
    display: 'inline-block',
    padding: theme.spacing(0.5, 2),
    borderRadius: theme.spacing(3),
    fontSize: '0.875rem',
    fontWeight: 600,
    ...colors,
  };
});
