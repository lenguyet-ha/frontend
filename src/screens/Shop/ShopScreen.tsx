import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Button,
  TextField,
  MenuItem,
  Chip,
  Divider,
  IconButton,
  Pagination,
} from "@mui/material";
import {
  Store,
  LocationOn,
  Star,
  Message,
  Share,
  ArrowBack,
  Search,
} from "@mui/icons-material";
import * as ProductApi from "@/api/product";
import { ProductCard } from "@/components/ProductCard";
import {
  ShopContainer,
  ShopBanner,
  ShopInfoCard,
  ShopAvatar,
  ShopStats,
  StatItem,
  ProductsSection,
  FilterBar,
} from "./Shop.styles";

interface ShopInfo {
  id: number;
  name: string;
  avatar: string | null;
}

interface Product {
  id: number;
  name: string;
  basePrice: number;
  virtualPrice: number;
  images: string[];
  publishedAt: string;
}

interface ShopData {
  shopInfo: ShopInfo;
  products: Product[];
  totalProducts: number;
  totalSold?: number;
  rating?: number;
  followers?: number;
}

// Sort options mapping
const SORT_OPTIONS = {
  newest: { sortBy: "createdAt", orderBy: "desc" },
  oldest: { sortBy: "createdAt", orderBy: "asc" },
  "price-asc": { sortBy: "price", orderBy: "asc" },
  "price-desc": { sortBy: "price", orderBy: "desc" },
  popular: { sortBy: "sale", orderBy: "desc" },
} as const;

const ShopScreen = () => {
  const router = useRouter();
  const { id } = router.query;

  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Prepare API params
  const apiParams = useMemo(() => {
    const sortOption =
      SORT_OPTIONS[sortBy as keyof typeof SORT_OPTIONS] || SORT_OPTIONS.newest;

    return {
      createdById: Number(id),
      page,
      limit: 20,
      isPublished: true,
      ...(debouncedSearchQuery && { name: debouncedSearchQuery }),
      sortBy: sortOption.sortBy,
      orderBy: sortOption.orderBy,
    };
  }, [id, page, debouncedSearchQuery, sortBy]);

  const fetchShopData = useCallback(async () => {
    if (!id) return;

    // Show main loading only on first load
    if (page === 1 && !debouncedSearchQuery && sortBy === "newest") {
      setLoading(true);
    } else {
      setProductsLoading(true);
    }
    setError(null);

    try {
      // Fetch products by shop ID with proper API params
      const response = await ProductApi.list(apiParams);
      console.log("Shop products response:", response);

      if (response?.data) {
        // Extract shop info from first product
        const shopInfo =
          response.data.length > 0
            ? {
                id: Number(id),
                name: response.data[0].shopInfo?.name || "Shop",
                avatar: response.data[0].shopInfo?.avatar || null,
              }
            : {
                id: Number(id),
                name: "Shop",
                avatar: null,
              };

        setShopData({
          shopInfo,
          products: response.data,
          totalProducts: response.pagination?.total || response.data.length,
          totalSold: Math.floor(Math.random() * 1000) + 100, // Mock data
          rating: Number((Math.random() * 2 + 3).toFixed(1)), // Mock rating 3-5
          followers: Math.floor(Math.random() * 5000) + 500, // Mock followers
        });
      } else {
        setError("Không thể tải thông tin shop");
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra khi tải thông tin shop");
    } finally {
      setLoading(false);
      setProductsLoading(false);
    }
  }, [id, apiParams, page, debouncedSearchQuery, sortBy]);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
      // debounced search will trigger API call
    },
    []
  );

  const handleSortChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSortBy(event.target.value);
      setPage(1); // Reset to first page when sorting changes
    },
    []
  );

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleContactShop = useCallback(() => {
    // Implement chat functionality
    console.log("Contact shop:", shopData?.shopInfo.id);
  }, [shopData]);

  const handleFollowShop = useCallback(() => {
    // Implement follow functionality
    console.log("Follow shop:", shopData?.shopInfo.id);
  }, [shopData]);

  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, newPage: number) => {
      setPage(newPage);
    },
    []
  );

  if (loading) {
    return (
      <ShopContainer>
        <Container>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress size={60} />
          </Box>
        </Container>
      </ShopContainer>
    );
  }

  if (error || !shopData) {
    return (
      <ShopContainer>
        <Container>
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="error" gutterBottom>
              {error || "Không tìm thấy shop"}
            </Typography>
            <Button
              variant="contained"
              onClick={handleGoBack}
              startIcon={<ArrowBack />}
            >
              Quay lại
            </Button>
          </Box>
        </Container>
      </ShopContainer>
    );
  }

  return (
    <ShopContainer>
      <Container>
        {/* Shop Info Card */}
        <ShopInfoCard>
          <ShopAvatar
            src={shopData.shopInfo.avatar || undefined}
            alt={shopData.shopInfo.name}
          >
            {!shopData.shopInfo.avatar && <Store sx={{ fontSize: 60 }} />}
          </ShopAvatar>

          <Box flex={1}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {shopData.shopInfo.name}
            </Typography>

            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <LocationOn color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Địa chỉ shop
              </Typography>
            </Box>

            <ShopStats>
              <StatItem>
                <div className="stat-number">{shopData.totalProducts}</div>
                <div className="stat-label">Sản phẩm</div>
              </StatItem>
              <StatItem>
                <div className="stat-number">{shopData.totalSold}</div>
                <div className="stat-label">Đã bán</div>
              </StatItem>
              <StatItem>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={0.5}
                >
                  <Star color="warning" fontSize="small" />
                  <span className="stat-number">{shopData.rating}</span>
                </Box>
                <div className="stat-label">Đánh giá</div>
              </StatItem>
              <StatItem>
                <div className="stat-number">{shopData.followers}</div>
                <div className="stat-label">Người theo dõi</div>
              </StatItem>
            </ShopStats>
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            <Button
              variant="contained"
              startIcon={<Message />}
              onClick={handleContactShop}
              fullWidth
            >
              Chat ngay
            </Button>
            <Button variant="outlined" onClick={handleFollowShop} fullWidth>
              Theo dõi
            </Button>
            <IconButton>
              <Share />
            </IconButton>
          </Box>
        </ShopInfoCard>

        {/* Products Section */}
        <ProductsSection>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Sản phẩm của shop
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Filter Bar */}
          <FilterBar>
            <Box display="flex" alignItems="center" gap={2}>
              <TextField
                size="small"
                placeholder="Tìm sản phẩm trong shop..."
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{ minWidth: 250 }}
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
              <TextField
                select
                size="small"
                value={sortBy}
                onChange={handleSortChange}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="newest">Mới nhất</MenuItem>
                <MenuItem value="oldest">Cũ nhất</MenuItem>
                <MenuItem value="price-asc">Giá thấp đến cao</MenuItem>
                <MenuItem value="price-desc">Giá cao đến thấp</MenuItem>
              </TextField>
            </Box>

            <Typography variant="body2" color="text.secondary">
              {shopData.totalProducts} sản phẩm
            </Typography>
          </FilterBar>

          {/* Products Grid */}
          {productsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : shopData.products.length > 0 ? (
            <>
              <Grid container spacing={2}>
                {shopData.products.map((product) => (
                  <Grid item xs={6} sm={4} md={3} lg={2.4} key={product.id}>
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      description=""
                      basePrice={product.basePrice}
                      virtualPrice={product.virtualPrice}
                      image={product.images[0] || ""}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {Math.ceil(shopData.totalProducts / 20) > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={Math.ceil(shopData.totalProducts / 20)}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          ) : (
            <Box textAlign="center" py={8}>
              <Store sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {debouncedSearchQuery
                  ? `Không tìm thấy sản phẩm nào với từ khóa "${debouncedSearchQuery}"`
                  : "Shop chưa có sản phẩm nào"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {debouncedSearchQuery
                  ? "Hãy thử từ khóa khác"
                  : "Hãy quay lại sau để xem các sản phẩm mới"}
              </Typography>
            </Box>
          )}
        </ProductsSection>
      </Container>
    </ShopContainer>
  );
};

export default ShopScreen;
