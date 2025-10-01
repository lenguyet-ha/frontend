import React, { memo } from "react";
import { Grid, Box, Typography, Pagination } from "@mui/material";
import { ProductCard } from "../ProductCard";

interface ProductType {
  id: number;
  publishedAt: string | null;
  name: string;
  description: string;
  basePrice: number;
  virtualPrice: number;
  brandId: number;
  images: string[];
  variants: Record<string, string[]>;
  categories: Array<{
    id: number;
    name: string;
    logo: string | null;
    parentCategoryId: number | null;
  }>;
  skus: Array<{
    id: number;
    value: string;
    price: number;
    stock: number;
    image: string;
  }>;
}

interface ProductGridProps {
  products: ProductType[];
  page: number;
  limit: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  onAddToCart?: (productId: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = memo(({
  products,
  page,
  limit,
  onPageChange,
  onAddToCart,
}) => {
  return (
    <Box sx={{ flex: 1, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Danh sách sản phẩm
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {products.slice((page - 1) * limit, page * limit).map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={product.id}>
            <ProductCard
              id={product.id}
              name={product.name}
              description={product.description}
              basePrice={product.basePrice}
              virtualPrice={product.virtualPrice}
              image={product.images[0]}
              onAddToCart={onAddToCart}
            />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Pagination
          count={Math.ceil(products.length / limit)}
          page={page}
          onChange={onPageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
});

ProductGrid.displayName = "ProductGrid";

export default ProductGrid;
