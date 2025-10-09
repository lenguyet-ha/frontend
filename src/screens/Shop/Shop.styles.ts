import { styled } from '@mui/material/styles';
import { Box, Paper, Card, Avatar } from '@mui/material';

export const ShopContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.grey[50],
}));

export const ShopBanner = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  borderRadius: 0,
}));

export const ShopInfoCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
}));

export const ShopAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.common.white}`,
  boxShadow: theme.shadows[4],
}));

export const ShopStats = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(4),
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

export const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  '& .stat-number': {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  '& .stat-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
}));

export const ProductsSection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  minHeight: '400px',
}));

export const FilterBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
    alignItems: 'stretch',
  },
}));
