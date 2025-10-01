import React, { memo, useState } from "react";
import { Box, CardMedia } from "@mui/material";

interface ProductDetailImagesProps {
  images: string[];
  productName: string;
}

const ProductDetailImages: React.FC<ProductDetailImagesProps> = memo(({
  images,
  productName,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <Box>
      {/* Main Image */}
      <CardMedia
        component="img"
        image={images[selectedImage]}
        alt={productName}
        sx={{
          width: "100%",
          height: 500,
          objectFit: "cover",
          borderRadius: 2,
          mb: 2,
        }}
      />

      {/* Thumbnail Images */}
      <Box sx={{ display: "flex", gap: 1, overflowX: "auto" }}>
        {images.map((image, index) => (
          <CardMedia
            key={index}
            component="img"
            image={image}
            alt={`${productName} ${index + 1}`}
            onClick={() => setSelectedImage(index)}
            sx={{
              width: 80,
              height: 80,
              objectFit: "cover",
              borderRadius: 1,
              cursor: "pointer",
              border: selectedImage === index ? 3 : 1,
              borderColor: selectedImage === index ? "primary.main" : "grey.300",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "primary.main",
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
});

ProductDetailImages.displayName = "ProductDetailImages";

export default ProductDetailImages;
