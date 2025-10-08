import React, { memo, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  Paper,
} from "@mui/material";

interface Variant {
  value: string;
  options: string[];
}

interface SKU {
  id: number;
  value: string;
  price: number;
  stock: number;
  image: string;
  productId: number;
}

interface ProductVariantsProps {
  variants: Variant[];
  skus: SKU[];
  onAddToCart: (sku: SKU, quantity: number) => void;
}

const ProductVariants: React.FC<ProductVariantsProps> = memo(({
  variants,
  skus,
  onAddToCart,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const handleOptionSelect = useCallback((variantName: string, option: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [variantName]: option,
    }));
  }, []);

  const getSelectedSKU = useCallback(() => {
    const selectedValues = Object.values(selectedOptions).join("-");
    return skus.find((sku) => sku.value === selectedValues);
  }, [selectedOptions, skus]);

  const selectedSKU = getSelectedSKU();
  const isAllVariantsSelected = variants.length === Object.keys(selectedOptions).length;

  const handleAddToCart = useCallback(() => {
    if (selectedSKU) {
      onAddToCart(selectedSKU, quantity);
    }
  }, [selectedSKU, quantity, onAddToCart]);

  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + delta;
      if (selectedSKU) {
        return Math.max(1, Math.min(newQuantity, selectedSKU.stock));
      }
      return Math.max(1, newQuantity);
    });
  }, [selectedSKU]);

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      {/* Variants Selection */}
      {variants.map((variant) => (
        <Box key={variant.value} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            {variant.value}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {Array.isArray(variant?.options) && variant.options.map((option) => (
              <Button
                key={option}
                variant={selectedOptions[variant.value] === option ? "contained" : "outlined"}
                onClick={() => handleOptionSelect(variant.value, option)}
                size="medium"
              >
                {option}
              </Button>
            ))}
          </Box>
        </Box>
      ))}

      {/* SKU Information */}
      {selectedSKU && (
        <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body1">
              <strong>SKU:</strong> {selectedSKU.value}
            </Typography>
            <Typography variant="body1" color={selectedSKU.stock > 0 ? "success.main" : "error.main"}>
              <strong>Kho:</strong> {selectedSKU.stock}
            </Typography>
          </Box>
          <Typography variant="h6" color="primary" fontWeight="bold">
            {selectedSKU.price.toLocaleString()} VND
          </Typography>
        </Box>
      )}

      {/* Quantity Selector */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Số lượng
        </Typography>
        <ButtonGroup variant="outlined">
          <Button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
            -
          </Button>
          <Button disabled sx={{ minWidth: 60 }}>
            {quantity}
          </Button>
          <Button
            onClick={() => handleQuantityChange(1)}
            disabled={selectedSKU ? quantity >= selectedSKU.stock : false}
          >
            +
          </Button>
        </ButtonGroup>
      </Box>

      {/* Add to Cart Button */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleAddToCart}
        disabled={!isAllVariantsSelected || !selectedSKU || selectedSKU.stock === 0}
        sx={{ py: 1.5 }}
      >
        {!isAllVariantsSelected
          ? "Vui lòng chọn đầy đủ thuộc tính"
          : selectedSKU?.stock === 0
          ? "Hết hàng"
          : "Thêm vào giỏ hàng"}
      </Button>

      {selectedSKU && selectedSKU.stock > 0 && selectedSKU.stock < 10 && (
        <Typography variant="body2" color="warning.main" sx={{ mt: 1, textAlign: "center" }}>
          Chỉ còn {selectedSKU.stock} sản phẩm
        </Typography>
      )}
    </Paper>
  );
});

ProductVariants.displayName = "ProductVariants";

export default ProductVariants;
