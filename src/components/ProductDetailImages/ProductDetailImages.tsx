import React, { memo, useState } from "react";
import { Box, CardMedia } from "@mui/material";
import { useStyles } from "./ProductDetailImages.styles";

interface ProductDetailImagesProps {
  images: string[];
  productName: string;
}

const ProductDetailImages: React.FC<ProductDetailImagesProps> = memo(({
  images,
  productName,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const classes = useStyles();

  return (
    <Box>
      {/* Main Image */}
      <CardMedia
        component="img"
        image={images[selectedImage]}
        alt={productName}
        className={classes.mainImage}
      />

      {/* Thumbnail Images */}
      <Box className={classes.thumbnailContainer}>
        {images.map((image, index) => (
          <CardMedia
            key={index}
            component="img"
            image={image}
            alt={`${productName} ${index + 1}`}
            onClick={() => setSelectedImage(index)}
            className={`${classes.thumbnail} ${
              selectedImage === index ? classes.thumbnailSelected : classes.thumbnailUnselected
            }`}
          />
        ))}
      </Box>
    </Box>
  );
});

ProductDetailImages.displayName = "ProductDetailImages";

export default ProductDetailImages;
