import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
} from "@mui/material";

interface CancelDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderId: number;
  cancelling: boolean;
}

const CancelDialog: React.FC<CancelDialogProps> = ({
  open,
  onClose,
  onConfirm,
  orderId,
  cancelling,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Xác nhận huỷ đơn hàng</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Bạn có chắc chắn muốn huỷ đơn hàng #{orderId}?
          <br />
          Thao tác này không thể hoàn tác.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={cancelling}
        >
          Không
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={cancelling}
          autoFocus
        >
          {cancelling ? 'Đang xử lý...' : 'Xác nhận huỷ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelDialog;
