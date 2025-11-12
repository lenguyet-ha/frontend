import { styled } from "@mui/material/styles";
import {
  Container,
  Paper,
  Box,
  Button,
  TextField,
  Card,
} from "@mui/material";

export const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  minHeight: "100vh",
  backgroundColor: "#f5f5f5",
}));

export const FormPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
}));

export const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,

  "&:last-child": {
    borderBottom: "none",
  },
}));

export const SectionTitle = styled("h3")(({ theme }) => ({
  margin: `${theme.spacing(0)} ${theme.spacing(0)} ${theme.spacing(2)} ${theme.spacing(0)}`,
  fontSize: "18px",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const FormField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const FileInputWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const FileInputLabel = styled("label")(({ theme }) => ({
  display: "block",
  marginBottom: theme.spacing(1),
  fontSize: "14px",
  fontWeight: 500,
  color: theme.palette.text.primary,

  "& span": {
    color: "red",
  },
}));

export const StyledFileInput = styled("input")({
  display: "none",
});

export const FileInputButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  textTransform: "none",
}));

export const FilePreview = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: "#f0f0f0",
  borderRadius: "4px",
  fontSize: "14px",
  color: theme.palette.text.secondary,
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5, 4),
  textTransform: "none",
  fontSize: "16px",
  fontWeight: 600,
}));

export const QrContainer = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: "center",
  borderRadius: "8px",
}));

export const QrImage = styled("img")({
  maxWidth: "300px",
  width: "100%",
  height: "auto",
  marginBottom: "16px",
});

export const AmountText = styled(Box)(({ theme }) => ({
  fontSize: "24px",
  fontWeight: 600,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

export const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "400px",
  gap: theme.spacing(2),
}));

export const SuccessContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: "center",
  backgroundColor: "#e8f5e9",
  borderRadius: "8px",
  border: `2px solid ${theme.palette.success.main}`,
}));

export const ErrorContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: "center",
  backgroundColor: "#ffebee",
  borderRadius: "8px",
  border: `2px solid ${theme.palette.error.main}`,
}));

export const StatusMessage = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontSize: "16px",
  fontWeight: 500,
}));

export const ActionButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  justifyContent: "center",
  marginTop: theme.spacing(3),
  flexWrap: "wrap",
}));
