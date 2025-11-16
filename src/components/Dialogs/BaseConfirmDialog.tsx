import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface BaseConfirmDialogProps {
  open: boolean;
  title: string;
  content: string;
  onYes: () => void;
  onNo: () => void;
}

export const BaseConfirmDialog: React.FC<BaseConfirmDialogProps> = ({
  open,
  title,
  content,
  onYes,
  onNo,
}) => {
  return (
    <Dialog open={open} onClose={onNo}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onNo} color="primary">
          Không
        </Button>
        <Button onClick={onYes} color="primary" variant="contained" autoFocus>
          Có
        </Button>
      </DialogActions>
    </Dialog>
  );
};
