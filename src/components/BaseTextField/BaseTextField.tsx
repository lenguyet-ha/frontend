import React from "react";
import { TextField, TextFieldProps, Typography, Box } from "@mui/material";

interface BaseTextFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  errorMessage?: string;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
}

const BaseTextField: React.FC<BaseTextFieldProps> = ({
  label,
  value,
  onChange,
  errorMessage,
  placeholder,
  type = "text",
  multiline = false,
  rows = 1,
  disabled = false,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        multiline={multiline}
        rows={rows}
        disabled={disabled}
        error={!!errorMessage}
        helperText={errorMessage}
      />
    </Box>
  );
};

export default BaseTextField;
