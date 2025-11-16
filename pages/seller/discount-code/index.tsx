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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import SellerLayout from "@/components/SellerLayout";
import * as discountApi from "@/api/discount";
import { toast } from "react-toastify";

const DiscountCodeManager = () => {
  const router = useRouter();
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({
    code: "",
    type: "PERCENTAGE",
    value: 0,
    usageLimit: undefined,
    validFrom: "",
    validTo: "",
    isActive: true,
  });

  // Check seller access
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

  const fetchDiscounts = useCallback(async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem("userInfo");
      const currentUser = stored ? JSON.parse(stored) : null;
      const shopId = currentUser?.id;
      
      const res = await discountApi.getDiscountCodes({ 
        limit: 100, 
        page: 1,
        shopId: shopId
      });
      if (res && res.data) setDiscounts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const openCreate = () => {
    setSelectedId(null);
    setForm({
      code: "",
      type: "PERCENTAGE",
      value: 0,
      usageLimit: undefined,
      validFrom: "",
      validTo: "",
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEdit = async (id: number) => {
    try {
      const res = await discountApi.getDiscountCodeById(id);
      if (res) {
        setSelectedId(id);
        setForm({
          code: res.code || "",
          type: res.type || "PERCENTAGE",
          value: res.value ?? 0,
          usageLimit: res.usageLimit ?? undefined,
          validFrom: res.validFrom ? res.validFrom.split("T")[0] : "",
          validTo: res.validTo ? res.validTo.split("T")[0] : "",
          isActive: res.isActive ?? true,
        });
        setDialogOpen(true);
      } else {
        toast.error("Không tìm thấy mã giảm giá");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải mã giảm giá");
    }
  };

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedId) return;
    try {
      await discountApi.deleteDiscountCode(selectedId);
      toast.success("Xóa mã giảm giá thành công");
      fetchDiscounts();
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa mã giảm giá");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedId(null);
    }
  };

  const validateForm = () => {
    if (!form.code || form.code.trim() === "") {
      toast.error("Vui lòng nhập mã");
      return false;
    }
    if (form.code.length > 100) {
      toast.error("Mã không được vượt quá 100 ký tự");
      return false;
    }
    if (form.value == null || Number(form.value) < 0) {
      toast.error("Giá trị phải lớn hơn hoặc bằng 0");
      return false;
    }
    if (form.type === "PERCENTAGE" && Number(form.value) > 100) {
      toast.error("Giá trị phần trăm không được lớn hơn 100");
      return false;
    }
    if (form.validFrom && form.validTo) {
      const from = new Date(form.validFrom);
      const to = new Date(form.validTo);
      if (from >= to) {
        toast.error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const stored = localStorage.getItem("userInfo");
      const currentUser = stored ? JSON.parse(stored) : null;
      const shopId = currentUser?.id;
      
      const payload: any = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        bearer: "SHOP",
        shopId: shopId,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
        validTo: form.validTo ? new Date(form.validTo).toISOString() : undefined,
        isActive: !!form.isActive,
      };

      if (selectedId) {
        await discountApi.updateDiscountCode(selectedId, payload);
        toast.success("Cập nhật mã giảm giá thành công");
      } else {
        await discountApi.createDiscountCode(payload);
        toast.success("Tạo mã giảm giá thành công");
      }
      setDialogOpen(false);
      fetchDiscounts();
    } catch (err) {
      console.error(err);
      toast.error("Lưu mã giảm giá thất bại");
    }
  };

  return (
    <SellerLayout>
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4">Quản lý mã giảm giá</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Tạo mã mới
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell align="right">Giá trị</TableCell>
                <TableCell>Usage</TableCell>
                <TableCell>Hiệu lực</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">Đang tải...</TableCell>
                </TableRow>
              ) : discounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">Chưa có mã giảm giá</TableCell>
                </TableRow>
              ) : (
                discounts.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.code}</TableCell>
                    <TableCell>{d.type}</TableCell>
                    <TableCell align="right">{d.value}</TableCell>
                    <TableCell>{d.usedCount ?? 0}/{d.usageLimit ?? "-"}</TableCell>
                    <TableCell>{d.validFrom ? d.validFrom.split("T")[0] : "-"} - {d.validTo ? d.validTo.split("T")[0] : "-"}</TableCell>
                    <TableCell>{d.isActive ? "Hoạt động" : "Không hoạt động"}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="info" onClick={() => openEdit(d.id)} title="Sửa"><EditIcon /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteClick(d.id)} title="Xóa"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Create / Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{selectedId ? "Sửa mã giảm giá" : "Tạo mã giảm giá"}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
              <TextField label="Mã" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} fullWidth />

              <TextField select label="Loại" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <MenuItem value="PERCENTAGE">PERCENTAGE</MenuItem>
                <MenuItem value="FIXED">FIXED</MenuItem>
              </TextField>

              <TextField label="Giá trị" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />

              <TextField label="Usage limit" type="number" value={form.usageLimit ?? ""} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} />

              <TextField label="Valid From" type="date" InputLabelProps={{ shrink: true }} value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
              <TextField label="Valid To" type="date" InputLabelProps={{ shrink: true }} value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} />

              <FormControlLabel control={<Switch checked={!!form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />} label="Hoạt động" />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={handleSubmit}>{selectedId ? "Lưu" : "Tạo"}</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogContent>Bạn có chắc chắn muốn xóa mã giảm giá này không?</DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">Xóa</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default DiscountCodeManager;
