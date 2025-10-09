import { SnackbarProps } from "@/types/snackbar";
import { createSlice } from "@reduxjs/toolkit";

// Transition type map nếu bạn dùng chuyển động như "SlideRight"
export type SnackbarState = {
  snackbars: SnackbarProps[];
  maxStack?: number;
  dense: boolean;
};

const initialState: SnackbarState = {
  snackbars: [],
  // maxStack: 5,
  dense: false,
};

const snackbar = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    openSnackbar(state, action) {
      const id = new Date().getTime();

      const baseSnackbar: SnackbarProps = {
        action: false,
        src: "",
        title: "",
        open: true,
        message: "Note archived",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
        variant: "default",
        alert: {
          color: "primary",
          variant: "filled",
        },
        transition: "Fade",
        close: true,
        actionButton: false,
        autoHideDuration: 3000,
        iconVariant: "usedefault",
        ...action.payload,
      };

      const newSnackbar = {
        ...baseSnackbar,
        id,
      };

      state.snackbars.push(newSnackbar);
    },

    closeSnackbar(state, action) {
      const idToClose = action.payload;
      state.snackbars = state.snackbars.filter(
        (snack) => snack.id !== idToClose
      );
    },

    handlerIncrease(state, action) {
      const { maxStack } = action.payload;
      state.maxStack = maxStack;
    },

    handlerDense(state, action) {
      const { dense } = action.payload;
      state.dense = dense;
    },

    handlerIconVariants(state, action) {
      const { iconVariant } = action.payload;
      state.snackbars = state.snackbars.map((snack) => ({
        ...snack,
        iconVariant,
      }));
    },
  },
});

export default snackbar.reducer;

export const {
  closeSnackbar,
  openSnackbar,
  handlerIncrease,
  handlerDense,
  handlerIconVariants,
} = snackbar.actions;

// =====================|| Thunk helpers ||===================== //

export function showSuccessSnackBar(message: any, title?: string) {
  return async (dispatch: any) => {
    try {
      dispatch(
        openSnackbar({
          src: "/images/svg/icons/success_icon.svg",
          title: title || "Thành công!",
          message: message,
          variant: "alert",
          alert: {
            color: "primary",
            variant: "filled",
          },
          close: false,
          transition: "SlideRight",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 2000,
        })
      );
    } catch (err) {
    }
  };
}

export function showErrorSnackBar(message: any, title?: string) {
  return async (dispatch: any) => {
    try {
      dispatch(
        openSnackbar({
          src: "/images/svg/icons/warning.svg",
          title: title || "Có lỗi xảy ra!",
          message: message || "",
          variant: "alert",
          alert: {
            color: "error",
            variant: "filled",
          },
          close: false,
          transition: "SlideRight",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 2000,
        })
      );
    } catch (err) {
    }
  };
}
