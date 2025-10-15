import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const ChatWrapper = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  right: 20,
  zIndex: 1000,
}));