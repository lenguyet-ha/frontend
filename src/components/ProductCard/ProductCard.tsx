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
import { useStyles } from "./ProductCard.styles";

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
    const classes = useStyles();

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
      <Card className={classes.card} onClick={handleCardClick}>
        <CardMedia component="img" height="200" image={image} alt={name} />
        <CardContent>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            className={classes.title}
          >
            {name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            className={classes.description}
          >
            {description}
          </Typography>
          <Box className={classes.priceContainer}>
            <Typography variant="body1" color="primary" className={classes.price}>
              {basePrice.toLocaleString()} VND
            </Typography>
            {basePrice !== virtualPrice && (
              <Typography
                variant="body2"
                color="text.secondary"
                className={classes.originalPrice}
              >
                {virtualPrice.toLocaleString()} VND
              </Typography>
            )}
          </Box>
          <Button
            size="small"
            variant="contained"
            fullWidth
            className={classes.button}
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
