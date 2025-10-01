import React, { useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import * as Product from "@/api/product";
import * as CategoryApi from "@/api/category";
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
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [orderBy, setOrderBy] = useState("desc");

  const fetchProduct = useCallback(async () => {
    const query = {
      page,
      limit,
      categories: selectedCategories,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy,
      orderBy,
      isPublished: true,
    };
    const response = await Product.list(query);
    if (response?.data) {
      setProducts(response.data);
    }
  }, [page, limit, selectedCategories, minPrice, maxPrice, sortBy, orderBy]);

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

  const handleAddToCart = useCallback((productId: number) => {
    console.log("Add to cart:", productId);
    // Implement add to cart logic here
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
    </Box>
  );
};

export { ProductList };
