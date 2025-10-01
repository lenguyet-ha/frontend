import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
} from "@mui/material";
import { Category } from "@mui/icons-material";
import * as Product from "@/api/product";

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
  variants: any;
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

// Fake data for categories
const fakeCategories = [
  { id: 1, name: "Áo thun", logo: null, parentCategoryId: null },
  { id: 2, name: "Quần jean", logo: null, parentCategoryId: null },
  { id: 3, name: "Giày dép", logo: null, parentCategoryId: null },
  { id: 4, name: "Phụ kiện", logo: null, parentCategoryId: null },
];

const ProductList = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories] = useState(fakeCategories);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [orderBy, setOrderBy] = useState("desc");

  const fetchProduct = async () => {
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
  };
  // Fake API call
  useEffect(() => {
    // In real app, call API with params
    fetchProduct();
  }, [page, selectedCategories, minPrice, maxPrice, sortBy, orderBy]);

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar for categories */}
      <Box sx={{ width: 250, p: 2, borderRight: 1, borderColor: "divider" }}>
        <Typography variant="h6" gutterBottom>
          Danh mục sản phẩm
        </Typography>
        <List>
          {categories.map((category) => (
            <ListItem key={category.id}>
              <ListItemButton
                onClick={() => handleCategoryClick(category.id)}
                selected={selectedCategories.includes(category.id)}
              >
                <ListItemIcon>
                  <Category />
                </ListItemIcon>
                <ListItemText primary={category.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Bộ lọc
        </Typography>
        <TextField
          label="Giá tối thiểu"
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Giá tối đa"
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Sắp xếp theo</InputLabel>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="createdAt">Ngày tạo</MenuItem>
            <MenuItem value="price">Giá</MenuItem>
            <MenuItem value="sale">Khuyến mãi</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Thứ tự</InputLabel>
          <Select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
            <MenuItem value="asc">Tăng dần</MenuItem>
            <MenuItem value="desc">Giảm dần</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Danh sách sản phẩm
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {products.slice((page - 1) * limit, page * limit).map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={product.id}>
              <Card sx={{ maxWidth: 300, height: "100%" }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.images[0]}
                  alt={product.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.description}
                  </Typography>
                  <Typography variant="body1" color="primary">
                    {product.virtualPrice.toLocaleString()} VND
                  </Typography>
                  {product.basePrice !== product.virtualPrice && (
                    <Typography
                      variant="body2"
                      sx={{ textDecoration: "line-through" }}
                    >
                      {product.basePrice.toLocaleString()} VND
                    </Typography>
                  )}
                  <Button size="small" variant="contained" sx={{ mt: 1 }}>
                    Thêm vào giỏ
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={Math.ceil(products.length / limit)}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      </Box>
    </Box>
  );
};

export { ProductList };
