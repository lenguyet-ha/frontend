import { AlertProps, SnackbarOrigin } from "@mui/material";

export interface SafeAlertProps {
  color?: "error" | "info" | "success" | "warning" | "primary";
  variant?: "filled" | "outlined" | "standard";
}

export interface SnackbarProps {
  id: number;
  action: boolean;
  src: string;
  title: string;
  open: boolean;
  message: string;
  anchorOrigin: {
    vertical: "top" | "bottom";
    horizontal: "left" | "right" | "center";
  };
  variant: string;
  alert: SafeAlertProps;
  transition: string;
  close: boolean;
  actionButton: boolean;
  dense: boolean;
  maxStack: number;
  iconVariant: string;
  autoHideDuration: number;
}
