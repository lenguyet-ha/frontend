import React, { memo } from "react";
import { Box, Typography, Chip } from "@mui/material";

interface Brand {
  id: number;
  name: string;
  logo: string;
}

interface Category {
  id: number;
  name: string;
  logo: string | null;
  parentCategoryId: number | null;
}

interface ProductDetailInfoProps {
  name: string;
  description: string;
  basePrice: number;
  virtualPrice: number;
  brand?: Brand;
  categories: Category[];
  publishedAt: string | null;
}

const ProductDetailInfo: React.FC<ProductDetailInfoProps> = memo(
  ({
    name,
    description,
    basePrice,
    virtualPrice,
    brand,
    categories,
    publishedAt,
  }) => {
    const discount =
      basePrice !== virtualPrice
        ? Math.round(((basePrice - virtualPrice) / virtualPrice) * 100)
        : 0;

    return (
      <Box>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          {name}
        </Typography>

        {brand && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Thương hiệu:
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {brand.name}
            </Typography>
          </Box>
        )}

        {/* Categories */}
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>

        {/* Price */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {basePrice.toLocaleString()} VND
            </Typography>
            {discount < 0 && (
              <Chip label={`${discount}%`} color="error" size="small" />
            )}
          </Box>
          {basePrice !== virtualPrice && (
            <Typography
              variant="body1"
              sx={{ textDecoration: "line-through" }}
              color="text.secondary"
            >
              {virtualPrice.toLocaleString()} VND
            </Typography>
          )}
        </Box>

        {publishedAt && (
          <Typography variant="body2" color="text.secondary">
            Ngày xuất bản: {new Date(publishedAt).toLocaleDateString("vi-VN")}
          </Typography>
        )}
      </Box>
    );
  }
);

ProductDetailInfo.displayName = "ProductDetailInfo";

export default ProductDetailInfo;
