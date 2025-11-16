import React, { useState, KeyboardEvent } from "react";
import { Box, TextField, Chip, Typography } from "@mui/material";

interface BaseEnterTextProps {
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
}

const BaseEnterText: React.FC<BaseEnterTextProps> = ({
  value,
  onChange,
  placeholder,
  label,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && inputValue.trim()) {
      event.preventDefault();
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue("");
    }
  };

  const handleDelete = (itemToDelete: string) => {
    onChange(value.filter((item) => item !== itemToDelete));
  };

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <TextField
        fullWidth
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        sx={{ mb: 1 }}
      />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {value.map((item, index) => (
          <Chip
            key={index}
            label={item}
            onDelete={() => handleDelete(item)}
            color="primary"
            variant="outlined"
          />
        ))}
      </Box>
    </Box>
  );
};

export default BaseEnterText;
