import React, { useState } from "react";
import { useStyles } from "./LoginScreen.styles";
import {
  Box,
  Button,
  Checkbox,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Phone, Warning } from "@mui/icons-material";
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded";
import { useRouter } from "next/router";
import { dispatch } from "@/store";
import { setUserState } from "@/store/reducers/userState";
import {
  showErrorSnackBar,
  showSuccessSnackBar,
} from "@/store/reducers/snackbar";
import { lang } from "@/constant/lang";
import { loginUser, getUserInfo, register } from "@/api/auth";

const LoginScreen = React.memo(() => {
  const classes = useStyles();
  const router = useRouter();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCf, setPasswordCf] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [passwordCfError, setPasswordCfError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordCf, setShowPasswordCf] = useState(false);
  const [focusState, setFocusState] = useState({
    email: false,
    phoneNumber: false,
    password: false,
    passwordCf: false,
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);
  };

  const handleEmailBlur = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(!emailRegex.test(email));
    setFocusState((prev) => ({ ...prev, email: false }));
    return !emailRegex.test(email);
  };

  const handleEmailFocus = () => {
    setFocusState((prev) => ({ ...prev, email: true }));
  };

  const handlePhoneNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setPhoneNumber(value);
  };

  const handlePhoneNumberBlur = () => {
    const phoneRegex = /^\d{10}$/;
    setPhoneNumberError(!phoneRegex.test(phoneNumber));
    setFocusState((prev) => ({ ...prev, phoneNumber: false }));
    return !phoneRegex.test(phoneNumber);
  };

  const handlePhoneNumberFocus = () => {
    setFocusState((prev) => ({ ...prev, phoneNumber: true }));
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPassword(value);
  };

  const handlePasswordBlur = () => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    setPasswordError(!passwordRegex.test(password));
    setFocusState((prev) => ({ ...prev, password: false }));
    return !passwordRegex.test(password);
  };

  const handlePasswordFocus = () => {
    setFocusState((prev) => ({ ...prev, password: true }));
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handlePasswordCfChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setPasswordCf(value);
  };

  const handlePasswordCfBlur = () => {
    setPasswordCfError(passwordCf !== password);
    setFocusState((prev) => ({ ...prev, passwordCf: false }));
    return passwordCf !== password;
  };

  const handlePasswordCfFocus = () => {
    setFocusState((prev) => ({ ...prev, passwordCf: true }));
  };

  const handleClickShowPasswordCf = () => {
    setShowPasswordCf((prev) => !prev);
  };

  const handleRememberMeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRememberMe(event.target.checked);
  };

  const handleToggleRegister = () => {
    setIsRegister((prev) => !prev);
    // Reset form fields when toggling
    setEmail("");
    setPhoneNumber("");
    setPassword("");
    setPasswordCf("");
    setEmailError(false);
    setPhoneNumberError(false);
    setPasswordError(false);
    setPasswordCfError(false);
  };

  const handleSubmit = async () => {
    setLoadingBtn(true);

    try {
      if (isRegister) {
        if (password !== passwordCf) {
          setPasswordCfError(true);
          dispatch(showErrorSnackBar("Mật khẩu không khớp"));
          return;
        }
        if (handleEmailBlur()) {
          dispatch(showErrorSnackBar("Email không hợp lệ"));
          return;
        }
        if (handlePhoneNumberBlur()) {
          dispatch(showErrorSnackBar("Số điện thoại phải có 10 chữ số"));
          return;
        }
        if (handlePasswordBlur()) {
          dispatch(showErrorSnackBar("Mật khẩu không hợp lệ"));
          return;
        }

        const payload = {
          name: "Test User", // You might want to add a name field to the form
          email: email.trim().toLowerCase(),
          phoneNumber: phoneNumber.trim(),
          password: password.trim(),
          confirmPassword: passwordCf.trim(),
        };
        const response = await register(payload);
        dispatch(showSuccessSnackBar("Đăng ký thành công"));
      } else {
        if (handleEmailBlur()) {
          dispatch(showErrorSnackBar("Email không hợp lệ"));
          return;
        }
        if (handlePasswordBlur()) {
          dispatch(showErrorSnackBar("Mật khẩu không hợp lệ"));
          return;
        }
        const response = await loginUser(
          email.trim().toLowerCase(),
          password.trim()
        );

        if (response?.accessToken) {
          localStorage.setItem("accessToken", response?.accessToken);
          const userInfo = await getUserInfo();
          localStorage.setItem(
            "userInfo",
            JSON.stringify({
              id: userInfo?.id,
              userRole: userInfo?.role.name,
            })
          );
          dispatch(
            setUserState({
              userRole: userInfo?.role.name,
            })
          );
          dispatch(showSuccessSnackBar(response?.data?.message));
          return;
        }
      }
    } catch (error) {
      dispatch(showErrorSnackBar(error || lang.errorDetected));
    } finally {
      setLoadingBtn(false);
    }
  };

  return (
    <Box className={classes.container}>
      <Box className={classes.content}>
        <Box className={classes.content_right}>
          <h5 className="text-2xl font-semibold">ECOMMERCE</h5>

          <Box className={classes.content_right_item}>
            <Box className={classes.content_right_item_content}>
              <Typography className={classes.label_input}>{"Email"}</Typography>
              <TextField
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                onFocus={handleEmailFocus}
                error={emailError}
                fullWidth
                variant="outlined"
                sx={{ marginBottom: emailError ? "10px" : "0" }}
                className={`${classes.input} ${
                  focusState.email ? classes.inputFocused : ""
                }`}
                inputProps={{
                  pattern: "[^@\\s]+@[^@\\s]+\\.[^@\\s]+",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <img src="/images/svg/icons/email.svg" />
                    </InputAdornment>
                  ),
                  endAdornment: emailError && (
                    <InputAdornment position="end">
                      <Tooltip title="Email không hợp lệ">
                        <Warning color="error" className={classes.wanning} />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            {isRegister && (
              <Box className={classes.content_right_item_content}>
                <Typography className={classes.label_input}>
                  {"Số điện thoại"}
                </Typography>
                <TextField
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  onBlur={handlePhoneNumberBlur}
                  onFocus={handlePhoneNumberFocus}
                  error={phoneNumberError}
                  fullWidth
                  variant="outlined"
                  sx={{ marginBottom: phoneNumberError ? "10px" : "0" }}
                  className={`${classes.input} ${
                    focusState.phoneNumber ? classes.inputFocused : ""
                  }`}
                  inputProps={{
                    pattern: "\\d{10}",
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalPhoneRoundedIcon />
                      </InputAdornment>
                    ),
                    endAdornment: phoneNumberError && (
                      <InputAdornment position="end">
                        <Tooltip title="Số điện thoại phải có 10 chữ số">
                          <Warning color="error" className={classes.wanning} />
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}
            <Box className={classes.content_right_item_content}>
              <Typography className={classes.label_input}>
                {"Mật khẩu"}
              </Typography>
              <TextField
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                onFocus={handlePasswordFocus}
                error={passwordError}
                variant="outlined"
                type={showPassword ? "text" : "password"}
                className={`${classes.input} ${
                  focusState.password ? classes.inputFocused : ""
                }`}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <img src="/images/svg/icons/lock.svg" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {passwordError && (
                        <InputAdornment position="end">
                          <Tooltip title="Mật khẩu ít nhất 8 ký tự, gồm chữ hoa, số và ký tự đặc biệt">
                            <Warning
                              color="error"
                              className={classes.wanning}
                            />
                          </Tooltip>
                        </InputAdornment>
                      )}
                      <InputAdornment
                        position="end"
                        onClick={handleClickShowPassword}
                      >
                        {showPassword ? (
                          <img
                            src="/images/svg/icons/eye.svg"
                            style={{ cursor: "pointer" }}
                          />
                        ) : (
                          <img
                            src="/images/svg/icons/eye_lock.svg"
                            style={{ cursor: "pointer" }}
                          />
                        )}
                      </InputAdornment>
                    </>
                  ),
                }}
              />
            </Box>
            {isRegister && (
              <Box className={classes.content_right_item_content}>
                <Typography className={classes.label_input}>
                  {"Nhập lại mật khẩu"}
                </Typography>
                <TextField
                  value={passwordCf}
                  onChange={handlePasswordCfChange}
                  onBlur={handlePasswordCfBlur}
                  onFocus={handlePasswordCfFocus}
                  error={passwordCfError}
                  variant="outlined"
                  type={showPasswordCf ? "text" : "password"}
                  className={`${classes.input} ${
                    focusState.passwordCf ? classes.inputFocused : ""
                  }`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <img src="/images/svg/icons/lock.svg" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {passwordCfError && (
                          <InputAdornment position="end">
                            <Tooltip title="Mật khẩu không khớp">
                              <Warning
                                color="error"
                                className={classes.wanning}
                              />
                            </Tooltip>
                          </InputAdornment>
                        )}
                        <InputAdornment
                          position="end"
                          onClick={handleClickShowPasswordCf}
                        >
                          {showPasswordCf ? (
                            <img
                              src="/images/svg/icons/eye.svg"
                              style={{ cursor: "pointer" }}
                            />
                          ) : (
                            <img
                              src="/images/svg/icons/eye_lock.svg"
                              style={{ cursor: "pointer" }}
                            />
                          )}
                        </InputAdornment>
                      </>
                    ),
                  }}
                />
              </Box>
            )}
          </Box>
          <Box className={classes.content_right_item}>
            <Box className={classes.login_sp}>
              <Typography
                component="a"
                className={classes.note_login}
                onClick={handleToggleRegister}
                style={{ cursor: "pointer" }}
              >
                {isRegister ? "Đã có tài khoản" : "Chưa có tài khoản?"}
              </Typography>
            </Box>
            <Box className={classes.content_right_item_content}>
              <Button
                className={classes.btn_login}
                onClick={handleSubmit}
                disabled={loadingBtn}
              >
                {isRegister ? "Đăng ký" : "Đăng nhập"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

export { LoginScreen };
