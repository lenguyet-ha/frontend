import { SyntheticEvent } from "react";
import { useDispatch, useSelector } from "react-redux";

// MUI
import {
  Alert,
  Button,
  Fade,
  Grow,
  Slide,
  SlideProps,
  Snackbar as MuiSnackbar,
  IconButton,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import { closeSnackbar } from "@/store/reducers/snackbar";
import { RootState } from "@/store";

// App imports

// Transition functions
function TransitionSlideLeft(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}
function TransitionSlideUp(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}
function TransitionSlideRight(props: SlideProps) {
  return <Slide {...props} direction="right" />;
}
function TransitionSlideDown(props: SlideProps) {
  return <Slide {...props} direction="down" />;
}
function GrowTransition(props: SlideProps) {
  return <Grow {...props} />;
}

// Animation map

const animation: Record<string, React.ComponentType<any>> = {
  SlideLeft: TransitionSlideLeft,
  SlideUp: TransitionSlideUp,
  SlideRight: TransitionSlideRight,
  SlideDown: TransitionSlideDown,
  Grow: GrowTransition,
  Fade,
};

//
// ==============================|| STACKABLE SNACKBAR ||============================== //

const Snackbar = () => {
  const dispatch = useDispatch();
  const { snackbars, dense } = useSelector(
    (state: RootState) => state.snackbar
  );

  const handleClose =
    (id: number) => (event: SyntheticEvent | Event, reason?: string) => {
      if (reason === "clickaway") return;
      dispatch(closeSnackbar(id));
    };

  const baseOffset = 20;
  const verticalSpacing = dense ? 48 : 64;

  return (
    <>
      {snackbars.map((snack, index) => {
        const {
          id,
          open,
          variant,
          anchorOrigin,
          transition,
          autoHideDuration,
          message,
          title,
          alert,
          close,
          actionButton,
          src,
        } = snack;

        const verticalOffset = 80; // px giữa các snackbar

        const verticalStyle =
          anchorOrigin.vertical === "top"
            ? { top: baseOffset + index * verticalSpacing }
            : { bottom: baseOffset + index * verticalSpacing };

        const horizontalStyle =
          anchorOrigin.horizontal === "left"
            ? { left: baseOffset }
            : anchorOrigin.horizontal === "right"
            ? { right: baseOffset }
            : { left: "50%", transform: "translateX(-50%)" };

        const positionStyle =
          anchorOrigin.vertical === "top"
            ? { top: `${20 + index * verticalOffset}px` }
            : { bottom: `${20 + index * verticalOffset}px` };

        const TransitionComponent = animation[transition] || Fade;

        if (variant === "default") {
          return (
            <MuiSnackbar
              key={id}
              anchorOrigin={anchorOrigin}
              open={open}
              autoHideDuration={autoHideDuration}
              onClose={handleClose(id)}
              message={message}
              TransitionComponent={TransitionComponent}
              action={
                <>
                  <Button
                    color="secondary"
                    size="small"
                    onClick={handleClose(id)}
                  >
                    UNDO
                  </Button>
                  <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={handleClose(id)}
                    sx={{ mt: 0.25 }}
                  >
                    <CloseOutlined />
                  </IconButton>
                </>
              }
            />
          );
        }

        return (
          <MuiSnackbar
            key={id}
            anchorOrigin={anchorOrigin}
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={handleClose(id)}
            TransitionComponent={TransitionComponent}
            style={{
              position: "fixed",
              zIndex: 1400 + index,
              ...verticalStyle,
              ...horizontalStyle,
              ...positionStyle,
              transition: "top 0.3s ease, bottom 0.3s ease", // Smooth stack shift
            }}
          >
            <Alert
              variant={alert?.variant || "filled"}
              color={alert?.color || "info"}
              action={
                <>
                  {actionButton !== false && (
                    <Button
                      color={alert?.color}
                      size="small"
                      onClick={handleClose(id)}
                    >
                      UNDO
                    </Button>
                  )}
                  {close !== false && (
                    <IconButton
                      sx={{ mt: 0.25 }}
                      size="small"
                      aria-label="close"
                      color={alert?.color}
                      onClick={handleClose(id)}
                    >
                      <CloseOutlined />
                    </IconButton>
                  )}
                </>
              }
              sx={{
                ...(alert?.variant === "outlined" && {
                  bgcolor: "grey.0",
                }),
              }}
              icon={
                src && (
                  <img
                    src={src}
                    style={{ width: "30px", height: "30px", marginTop: "5px" }}
                    alt="icon"
                  />
                )
              }
            >
              <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{message}</div>
            </Alert>
          </MuiSnackbar>
        );
      })}
    </>
  );
};

export default Snackbar;
