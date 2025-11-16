import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import SellerLayout from "@/components/SellerLayout";
import * as sellerProductsApi from "@/api/sellerProducts";
import { toast } from "react-toastify";

interface Product {
  id: number;
  name: string;
  basePrice: number;
  virtualPrice: number;
  status: string;
  images: string[];
  skus: any[];
  createdAt: string;
}

const SellerProducts = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Check if user is seller
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (user.role.name !== "SELLER") {
        router.push("/products");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem("userInfo");
      const currentUser = stored ? JSON.parse(stored) : null;
      const response = await sellerProductsApi.getListAsync({ createdById: currentUser?.id });
      if (response?.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = () => {
    router.push("/seller/products/new");
  };

  const handleEditProduct = (productId: number) => {
    router.push(`/seller/products/${productId}`);
  };

  const handleViewProduct = (productId: number) => {
    router.push(`/products/${productId}`);
  };

  const handleDeleteClick = (productId: number) => {
    setSelectedProductId(productId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProductId) return;

    try {
      await sellerProductsApi.deleteAsync(selectedProductId);
      toast.success("Xóa sản phẩm thành công");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Không thể xóa sản phẩm");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedProductId(null);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Chip label="Hoạt động" color="success" size="small" />;
      case "INACTIVE":
        return <Chip label="Không hoạt động" color="default" size="small" />;
      case "WAITING_ACTIVE":
        return <Chip label="Chờ kích hoạt" color="warning" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getTotalStock = (skus: any[]) => {
    return skus.reduce((total, sku) => total + (sku.stock || 0), 0);
  };

  return (
    <SellerLayout>
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4">Quản lý sản phẩm</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
          >
            Thêm sản phẩm
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Hình ảnh</TableCell>
                <TableCell>Tên sản phẩm</TableCell>
                <TableCell align="right">Giá gốc</TableCell>
                <TableCell align="right">Giá bán</TableCell>
                <TableCell align="center">Tồn kho</TableCell>
                <TableCell align="center">Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Chưa có sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Avatar
                        src={product.images[0]}
                        alt={product.name}
                        variant="rounded"
                        sx={{ width: 60, height: 60 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {product.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {product.basePrice.toLocaleString()} đ
                    </TableCell>
                    <TableCell align="right">
                      {product.virtualPrice.toLocaleString()} đ
                    </TableCell>
                    <TableCell align="center">
                      {getTotalStock(product.skus)}
                    </TableCell>
                    <TableCell align="center">
                      {getStatusLabel(product.status)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewProduct(product.id)}
                        title="Xem"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleEditProduct(product.id)}
                        title="Sửa"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(product.id)}
                        title="Xóa"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>
            Bạn có chắc chắn muốn xóa sản phẩm này không?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerProducts;
