import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Box, Snackbar, Alert } from "@mui/material";
import * as Product from "@/api/product";
import * as CategoryApi from "@/api/category";
import * as CartApi from "@/api/cart";
import { CategorySidebar } from "@/components/CategorySidebar";
import { ProductFilters } from "@/components/ProductFilters";
import { ProductGrid } from "@/components/ProductGrid";

// Define category type
interface CategoryType {
  id: number;
  name: string;
  logo: string | null;
  parentCategoryId: number | null;
}

// Define product type
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

const ProductList = () => {
  const router = useRouter();
  const { name } = router.query; // Get search query from URL
  
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [orderBy, setOrderBy] = useState("desc");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchProduct = useCallback(async () => {
    const query: any = {
      page,
      limit,
      categories: selectedCategories,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      orderBy,
      isPublished: true,
    };
    
    // Add name search if present in URL
    if (name && typeof name === 'string') {
      query.name = name;
    }
    
    const response = await Product.list(query);
    if (response?.data) {
      setProducts(response.data);
    }
  }, [page, limit, selectedCategories, minPrice, maxPrice, sortBy, orderBy, name]);

  const fetchCategories = useCallback(async () => {
    const response = await CategoryApi.list({});
    if (response?.data) {
      setCategories(response.data);
    }
  }, []);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryClick = useCallback((categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const handlePageChange = useCallback(
    (event: React.ChangeEvent<unknown>, value: number) => {
      setPage(value);
    },
    []
  );

  const handleAddToCart = useCallback(async (productId: number) => {
    // Find product to get first SKU
    const product = products.find(p => p.id === productId);
    if (!product || !product.skus || product.skus.length === 0) {
      setSnackbar({
        open: true,
        message: 'Sản phẩm không có SKU khả dụng',
        severity: 'error',
      });
      return;
    }

    // Use first SKU with stock available
    const availableSku = product.skus.find(sku => sku.stock > 0);
    if (!availableSku) {
      setSnackbar({
        open: true,
        message: 'Sản phẩm đã hết hàng',
        severity: 'error',
      });
      return;
    }

    try {
      const response = await CartApi.addToCart({
        quantity: 1,
        skuId: availableSku.id,
      });

      if (response) {
        setSnackbar({
          open: true,
          message: 'Đã thêm sản phẩm vào giỏ hàng',
          severity: 'success',
        });
        // Trigger cart count refresh by dispatching custom event
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
  }, [products]);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar for categories and filters */}
      <Box sx={{ width: 250, p: 2, borderRight: 1, borderColor: "divider" }}>
        <CategorySidebar
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryClick={handleCategoryClick}
        />
        <ProductFilters
          minPrice={minPrice}
          maxPrice={maxPrice}
          sortBy={sortBy}
          orderBy={orderBy}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onSortByChange={setSortBy}
          onOrderByChange={setOrderBy}
        />
      </Box>

      {/* Main content */}
      <ProductGrid
        products={products}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
        onAddToCart={handleAddToCart}
      />

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
    </Box>
  );
};

export { ProductList };
