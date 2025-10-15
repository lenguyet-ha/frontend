import { styled } from '@mui/material/styles';
import { 
  Box, 
  Paper, 
  IconButton, 
  Typography,
  TextField,
} from '@mui/material';

export const ChatContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 500,
  height: 600,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[8],
}));

export const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const ChatAvatar = styled('div')({
  width: 40,
  height: 40,
  border: '2px solid #fff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
});

export const ChatHeaderTitleStyled = styled(Typography)({
  fontWeight: 700,
  fontSize: 18,
  letterSpacing: 0.5,
  flex: 1,
});

export const ChatCloseButton = styled(IconButton)({
  transition: '0.2s',
  '&:hover': {
    color: 'red',
    transform: 'scale(1.1)',
  },
});

export const MessageBubbleContainer = styled('div')({
  display: 'flex',
  alignItems: 'flex-end',
  marginBottom: 2,
});

export const MessageBubbleContent = styled('div')({
  flex: 1,
});

export const MessageBubbleStyled = styled('div')<{ isOwn: boolean }>(({ isOwn }) => ({
  background: isOwn
    ? 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)'
    : '#f4f6fb',
  color: isOwn ? '#fff' : undefined,
  boxShadow: isOwn ? '0 2px 8px 0 rgba(25, 118, 210, 0.08)' : '0 1px 4px 0 rgba(0,0,0,0.04)',
  borderTopRightRadius: isOwn ? 8 : 20,
  borderTopLeftRadius: isOwn ? 20 : 8,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  marginLeft: isOwn ? 'auto' : 0,
  marginRight: isOwn ? 0 : 8,
  minWidth: 40,
  padding: '8px 14px',
  fontSize: 15,
  position: 'relative',
  transition: 'background 0.2s',
}));

export const MessageAvatar = styled('div')({
  width: 28,
  height: 28,
  marginRight: 8,
  fontSize: 14,
});

export const ReadStatus = styled('span')({
  marginLeft: 8,
  fontSize: '0.8rem',
  color: '#b3e5fc',
  verticalAlign: 'middle',
});

export const SendButtonStyled = styled(IconButton)<{ sending?: boolean }>(({ theme, sending }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  transition: '0.2s',
  boxShadow: sending ? '0 0 0 2px #90caf9' : '0 2px 8px rgba(25, 118, 210, 0.3)',
  transform: sending ? 'scale(1.1)' : 'scale(1)',
  borderRadius: '50%',
  width: 48,
  height: 48,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
  },
  '&:disabled': {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[500],
  },
}));

export const ChatHeaderTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  flex: 1,
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
}));

export const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.grey[200],
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[400],
    borderRadius: 3,
  },
}));

export const MessageBubble = styled(Box)<{
  isOwn?: boolean;
}>(({ theme, isOwn }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1, 1.5),
  borderRadius: theme.spacing(2),
  alignSelf: isOwn ? 'flex-end' : 'flex-start',
  backgroundColor: isOwn ? theme.palette.primary.main : theme.palette.grey[200],
  color: isOwn ? theme.palette.primary.contrastText : theme.palette.text.primary,
  marginBottom: theme.spacing(0.5),
  wordBreak: 'break-word',
}));

export const MessageTime = styled(Typography)<{
  isOwn?: boolean;
}>(({ theme, isOwn }) => ({
  fontSize: '0.75rem',
  opacity: 0.7,
  textAlign: isOwn ? 'right' : 'left',
  marginTop: theme.spacing(0.5),
  color: isOwn ? theme.palette.primary.contrastText : theme.palette.text.secondary,
}));

export const MessageInputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'flex-end',
}));

export const MessageInput = styled(TextField)(({ theme }) => ({
  flex: 1,
  background: '#f8fafc',
  borderRadius: 3,
  fontSize: 15,
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)',
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    maxHeight: 120,
    overflowY: 'auto',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#1976d2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
      borderWidth: 2,
    },
    '&::-webkit-scrollbar': {
      width: 4,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: theme.palette.grey[200],
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.grey[400],
      borderRadius: 2,
    },
  },
}));

export const SendButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&:disabled': {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[500],
  },
}));

export const TypingIndicator = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  fontStyle: 'italic',
}));

export const EmptyState = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
  gap: theme.spacing(1),
}));

export const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(2),
}));