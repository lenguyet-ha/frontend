import { styled } from '@mui/material/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  IconButton,
  Avatar,
  Menu,
} from '@mui/material';

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  position: 'sticky',
  elevation: 2,
}));

export const StyledContainer = styled(Box)(({ theme }) => ({
  maxWidth: 'xl',
  margin: '0 auto',
  padding: theme.spacing(0, 2),
}));

export const LogoTypography = styled(Typography)(({ theme }) => ({
  flexGrow: 0,
  marginRight: theme.spacing(4),
  fontWeight: 'bold',
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.8,
  },
})) as typeof Typography;

export const SearchBox = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  maxWidth: 600,
}));

export const SearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: 'white',
    borderRadius: theme.shape.borderRadius,
    '& fieldset': {
      border: 'none',
    },
  },
}));

export const CartBox = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

export const AvatarBox = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

export const AvatarIconButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

export const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
}));

export const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    overflow: 'visible',
    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
    marginTop: theme.spacing(1.5),
    '& .MuiAvatar-root': {
      width: 32,
      height: 32,
      marginLeft: theme.spacing(-0.5),
      marginRight: theme.spacing(1),
    },
    '&:before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: 0,
      right: 14,
      width: 10,
      height: 10,
      backgroundColor: theme.palette.background.paper,
      transform: 'translateY(-50%) rotate(45deg)',
      zIndex: 0,
    },
  },
}));
