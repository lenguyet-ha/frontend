import React, { memo } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Typography,
} from "@mui/material";

interface ProductFiltersProps {
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  orderBy: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onOrderByChange: (value: string) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = memo(({
  minPrice,
  maxPrice,
  sortBy,
  orderBy,
  onMinPriceChange,
  onMaxPriceChange,
  onSortByChange,
  onOrderByChange,
}) => {
  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" gutterBottom>
        Bộ lọc
      </Typography>
      <TextField
        label="Giá tối thiểu"
        type="number"
        value={minPrice}
        onChange={(e) => onMinPriceChange(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Giá tối đa"
        type="number"
        value={maxPrice}
        onChange={(e) => onMaxPriceChange(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Sắp xếp theo</InputLabel>
        <Select value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
          <MenuItem value="createdAt">Ngày tạo</MenuItem>
          <MenuItem value="price">Giá</MenuItem>
          <MenuItem value="sale">Khuyến mãi</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Thứ tự</InputLabel>
        <Select value={orderBy} onChange={(e) => onOrderByChange(e.target.value)}>
          <MenuItem value="asc">Tăng dần</MenuItem>
          <MenuItem value="desc">Giảm dần</MenuItem>
        </Select>
      </FormControl>
    </>
  );
});

ProductFilters.displayName = "ProductFilters";

export default ProductFilters;
