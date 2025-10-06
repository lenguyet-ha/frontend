import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Grid,
  CircularProgress,
  Typography,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import * as ProductApi from "@/api/product";
import * as CartApi from "@/api/cart";
import { ProductDetailImages } from "@/components/ProductDetailImages";
import { ProductDetailInfo } from "@/components/ProductDetailInfo";
import { ProductVariants } from "@/components/ProductVariants";

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

interface ProductDetail {
  id: number;
  publishedAt: string | null;
  name: string;
  basePrice: number;
  virtualPrice: number;
  brandId: number;
  images: string[];
  variants: Record<string, string[]>; // Changed from Variant[] to object
  description: string;
  createdById: number;
  skus: SKU[];
  brand?: Brand;
  categories: Category[];
}

const ProductDetailScreen: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchProductDetail = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ProductApi.detail(Number(id));
      if (response) {
        setProduct(response);
      } else {
        setError("Không tìm thấy sản phẩm");
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra khi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail]);

  const handleAddToCart = useCallback(
    async (sku: SKU, quantity: number) => {
      try {
        const response = await CartApi.addToCart({
          quantity,
          skuId: sku.id,
        });

        if (response) {
          setSnackbar({
            open: true,
            message: 'Đã thêm sản phẩm vào giỏ hàng',
            severity: 'success',
          });
          // Trigger cart count refresh
          window.dispatchEvent(new CustomEvent('cart-updated'));
        } else {
          setSnackbar({
            open: true,
            message: 'Không thể thêm sản phẩm vào giỏ hàng',
            severity: 'error',
          });
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Đã có lỗi xảy ra',
          severity: 'error',
        });
      }
    },
    []
  );

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" color="error" textAlign="center">
          {error || "Không tìm thấy sản phẩm"}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleGoBack}
            startIcon={<ArrowBack />}
          >
            Quay lại
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={handleGoBack} sx={{ mb: 3 }}>
        Quay lại danh sách sản phẩm
      </Button>

      <Grid container spacing={4}>
        {/* Left: Images */}
        <Grid item xs={12} md={6}>
          <ProductDetailImages
            images={product.images}
            productName={product.name}
          />
        </Grid>

        {/* Right: Product Info */}
        <Grid item xs={12} md={6}>
          <ProductDetailInfo
            name={product.name}
            description={product.description}
            basePrice={product.basePrice}
            virtualPrice={product.virtualPrice}
            brand={product.brand}
            categories={product.categories}
            publishedAt={product.publishedAt}
          />

          {/* Variants and Add to Cart */}
          {product.variants && Object.keys(product.variants).length > 0 && (
            <ProductVariants
              variants={Object.entries(product.variants).map(
                ([key, values]) => ({
                  value: key,
                  options: values,
                })
              )}
              skus={product.skus}
              onAddToCart={handleAddToCart}
            />
          )}
        </Grid>
       
      </Grid>
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Mô tả sản phẩm
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {product.description}
        </Typography>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetailScreen;
