import { createStyles, makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import { flexRender } from "material-react-table";
import { COLORS } from "@/constant/colors";

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      position: "relative",
      backgroundColor: "#F7F8F9",
    },
    image_login: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      filter: "brightness(0.8)",
    },
    content: {
      width: "-webkit-fill-available",
      height: "-webkit-fill-available",
      padding: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
      position: "absolute",
      top: 0,
      left: 0,
      "@media (max-width: 900px)": {
        padding: "20px",
        flexDirection: "column",
        justifyContent: "unset",
      },
      "@media (max-width: 600px)": {
        padding: "0px",
      },
    },
    content_left: {
      width: "50%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      justifyContent: "space-between",
      "@media (max-width: 900px)": {
        width: "95%",
        height: "30%",
        justifyContent: "unset",
        gap: "10px",
      },
      "@media (max-width: 600px)": {
        display: "none",
      },
    },
    content_left_logo: {
      width: "146px",
      height: "46px",
    },
    content_left_bottom: {
      display: "flex",
      flexDirection: "column",
      gap: "17px",
      "@media (max-width: 900px)": {
        gap: "8px",
      },
    },
    content_left_bottom_title: {
      fontSize: "40px",
      lineHeight: "48px",
      fontWeight: "500",
      color: COLORS.white[100],
      "@media (max-width: 900px)": {
        fontSize: "30px",
        lineHeight: "30px",
      },
    },
    content_left_bottom_note: {
      fontSize: "16px",
      lineHeight: "25.6px",
      fontWeight: "400",
      color: COLORS.white[100],
      "@media (max-width: 900px)": {
        fontSize: "14px",
        lineHeight: "18.6px",
      },
    },
    content_right: {
      width: "400px",
      height: "auto",
      borderRadius: "20px",
      backgroundColor: COLORS.white[100],
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "24px",
      padding: "40px",
      "@media (max-height: 800px)": {
        padding: "35px 25px",
        gap: "12px",
      },
      "@media (max-width: 600px)": {
        height: "100%",
        width: "-webkit-fill-available",
        padding: "20px 15px",
        borderRadius: "0px",
      },
    },
    content_right_item: {
      width: "100%",
      height: "auto",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "12px",
    },
    content_right_item_title: {
      fontSize: "40px",
      lineHeight: "48px",
      fontWeight: "500",
      color: "#0D0D12",
      textAlign: "center",
    },
    content_right_item_desc: {
      fontSize: "16px",
      lineHeight: "25.6px",
      fontWeight: "400",
      color: "#666D80",
      textAlign: "center",
    },
    content_right_item_content: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label_input: {
      fontSize: "14px",
      lineHeight: "21.7px",
      fontWeight: "500",
      color: "#0D0D12",
    },
    input: {
      backgroundColor: COLORS.white[100],
      borderRadius: "100px",
      width: "100%",
      height: "48px",
      border: "1px solid #DFE1E7",
      "& .MuiOutlinedInput-root": {
        padding: "12px",
        "& input": {
          padding: 0,
        },
        "& fieldset": {
          border: "unset",
        },
        "&.Mui-focused fieldset": {
          border: "none",
        },
      },
      "& .MuiFormHelperText-root": {
        marginTop: "-4px",
      },
      "@media (max-height: 800px)": {
        height: "46px",
      },
    },
    inputFocused: {
      border: "1px solid #FD9D68 !important",
    },
    btn_login: {
      width: "100%",
      height: "48px",
      fontSize: "16px",
      fontWeight: "500",
      lineHeight: "24.8px",
      color: COLORS.white[100],
      backgroundColor: "#2E68B1",
      textTransform: "none",
      borderRadius: "100px",
      "&:hover": {
        backgroundColor: "#0e54ad",
      },
      "@media (max-height: 800px)": {
        height: "46px",
      },
    },
    btn_back: {
      width: "100%",
      height: "48px",
      fontSize: "16px",
      fontWeight: "500",
      lineHeight: "24.8px",
      color: "#2E68B1",
      backgroundColor: "#dcdcdc",
      textTransform: "none",
      borderRadius: "100px",
      "&:hover": {
        backgroundColor: "#ababab",
      },
      "@media (max-height: 800px)": {
        height: "46px",
      },
    },
    login_sp: {
      display: "flex",
      justifyContent: "flex-start",
      width: "100%",
      alignItems: "center",
      gap: "16px",
      "@media (max-height: 800px)": {
        gap: "16px",
      },
    },
    login_checkbox: {
      display: "flex",
      alignItems: "center",
      paddingLeft: "4px",
      "& .MuiCheckbox-root": {
        width: "20px",
        height: "20px",
        borderRadius: "6px",
        padding: "0 8px 0 0",
      },
      "& .MuiSvgIcon-root": {
        fill: "#2E68B1",
      },
    },
    note_login: {
      fontSize: "14px",
      lineHeight: "21.7px",
      fontWeight: "400",
      color: "#6C7A93",
      whiteSpace: "nowrap",
    },
    forgot_password: {
      fontSize: "14px",
      lineHeight: "21.7px",
      fontWeight: "500",
      color: "#2E68B1",
      cursor: "pointer",
    },
    login_option: {
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "16px",
      "@media (max-width: 1600px)": {
        gap: "12px",
      },
    },
    line: {
      width: "100%",
      border: "1px solid #DDE0E5",
    },
    content_right_social: {
      width: "100%",
      height: "48px",
      backgroundColor: COLORS.white[100],
      borderRadius: "100px",
      border: "1px solid #DDE0E5",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "16px",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: COLORS.white[100],
      },
      "@media (max-height: 800px)": {
        gap: "12px",
        height: "46px",
      },
    },
    social_name: {
      fontSize: "16px",
      lineHeight: "24.8px",
      fontWeight: "400",
      color: "#0D0D12",
    },
    register_now: {
      fontSize: "16px",
      lineHeight: "24.8px",
      fontWeight: "500",
      color: "#2E68B1",
      cursor: "pointer",
      marginTop: "-1px",
    },
    wanning: {
      fontSize: "16px",
      cursor: "pointer",
    },
    otpInput: {
      textAlign: "center",
      fontSize: "16px",
      color: "#0D0D12",
      width: "50px",
      height: "38px",
      padding: "0",
    },
    otpTextField: {
      width: "50px",
      height: "38px",
      borderRadius: "100px",
      backgroundColor: COLORS.white[100],
      "& .MuiOutlinedInput-root": {
        width: "50px",
        height: "38px",
      },
      "& fieldset": {
        border: "none",
      },
    },
  })
);
