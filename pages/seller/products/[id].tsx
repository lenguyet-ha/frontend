import React, { useRef, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from "@mui/icons-material";
import SellerLayout from "@/components/SellerLayout";
import {
  ProductManageForm,
  ProductManageFormRef,
} from "@/components/ProductManageForm";
import { ROW_ACTION_TYPE } from "@/constants";

const SellerProductForm = () => {
  const router = useRouter();
  const { id } = router.query;
  const formRef = useRef<ProductManageFormRef>(null);

  const isAddMode = id === "new";
  const actionType = isAddMode ? ROW_ACTION_TYPE.ADD : ROW_ACTION_TYPE.EDIT;

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

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.handleSubmit(handleClose, handleRefresh);
    }
  };

  const handleClose = () => {
    router.push("/seller/products");
  };

  const handleRefresh = () => {
    // Could refresh data here if needed
    router.push("/seller/products");
  };

  const handleBack = () => {
    if (formRef.current) {
      formRef.current.handleClose(handleClose);
    } else {
      handleClose();
    }
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4">
              {isAddMode ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Lưu
          </Button>
        </Box>

        <Paper sx={{ p: 3 }}>
          <ProductManageForm
            ref={formRef}
            id={isAddMode ? null : (id as string)}
            actionType={actionType}
          />
        </Paper>
      </Box>
    </SellerLayout>
  );
};

export default SellerProductForm;
