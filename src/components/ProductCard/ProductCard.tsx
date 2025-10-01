import React, { memo, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
} from "@mui/material";

interface ProductCardProps {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  virtualPrice: number;
  image: string;
  onAddToCart?: (productId: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = memo(
  ({ id, name, description, basePrice, virtualPrice, image, onAddToCart }) => {
    const router = useRouter();

    const handleAddToCart = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onAddToCart) {
          onAddToCart(id);
        }
      },
      [id, onAddToCart]
    );

    const handleCardClick = useCallback(() => {
      router.push(`/products/${id}`);
    }, [id, router]);

    return (
      <Card
        sx={{
          maxWidth: 300,
          height: "100%",
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 4,
          },
        }}
        onClick={handleCardClick}
      >
        <CardMedia component="img" height="200" image={image} alt={name} />
        <CardContent>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              mb: 2,
            }}
          >
            {description}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="body1" color="primary" fontWeight="bold">
              {virtualPrice.toLocaleString()} VND
            </Typography>
            {basePrice !== virtualPrice && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                {basePrice.toLocaleString()} VND
              </Typography>
            )}
          </Box>
          <Button
            size="small"
            variant="contained"
            fullWidth
            sx={{ mt: 1 }}
            onClick={handleAddToCart}
          >
            Thêm vào giỏ
          </Button>
        </CardContent>
      </Card>
    );
  }
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
