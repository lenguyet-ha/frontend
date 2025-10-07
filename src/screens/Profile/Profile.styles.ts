import { styled } from '@mui/material/styles';
import { Box, Paper, Card, Avatar as MuiAvatar, Typography, Button, TextField, IconButton } from '@mui/material';

export const ProfileContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: '800px',
  margin: '0 auto',
}));

export const ProfileCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  boxShadow: theme.shadows[2],
}));

export const AvatarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

export const StyledAvatar = styled(MuiAvatar)(({ theme }) => ({
  width: 120,
  height: 120,
  marginBottom: theme.spacing(2),
}));

export const AvatarUploadInput = styled('input')({
  display: 'none',
});

export const AvatarUploadLabel = styled('label')({
  cursor: 'pointer',
});

export const AvatarUploadButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
})) as typeof IconButton;

export const AvatarHelperText = styled(Typography)(({ theme }) => ({
  variant: 'body2',
  color: theme.palette.text.secondary,
}));

export const FormContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const SaveButtonContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

export const SaveButton = styled(Button)(({ theme }) => ({
  size: 'large',
}));

export const PasswordSectionTitle = styled(Typography)(({ theme }) => ({
  variant: 'h6',
  gutterBottom: true,
}));

export const PasswordDivider = styled('hr')(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: 'none',
  borderTop: `1px solid ${theme.palette.divider}`,
}));

export const PasswordButtonContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

export const PasswordButton = styled(Button)(({ theme }) => ({
  size: 'large',
}));

export const TabPanelContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

export const TabsContainer = styled(Box)(({ theme }) => ({
  borderBottom: 1,
  borderColor: 'divider',
}));
