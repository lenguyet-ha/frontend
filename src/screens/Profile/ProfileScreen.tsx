import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  Tabs,
  Tab,
  Grid,
  IconButton,
  Divider,
} from "@mui/material";
import { PhotoCamera, Save, Lock } from "@mui/icons-material";
import * as ProfileApi from "@/api/profile";
import {
  ProfileContainer,
  ProfileCard,
  AvatarContainer,
  StyledAvatar,
  AvatarUploadInput,
  AvatarUploadLabel,
  AvatarUploadButton,
  AvatarHelperText,
  FormContainer,
  SaveButtonContainer,
  SaveButton,
  PasswordSectionTitle,
  PasswordDivider,
  PasswordButtonContainer,
  PasswordButton,
  TabPanelContainer,
  TabsContainer,
} from "./Profile.styles";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <TabPanelContainer>{children}</TabPanelContainer>}
    </div>
  );
}

const ProfileScreen = () => {
  const [tabValue, setTabValue] = useState(0);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    avatar: "",
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load user info from localStorage
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      const parsed = JSON.parse(storedUserInfo);
      setUserInfo({
        name: parsed.name || "",
        email: parsed.email || "",
        phoneNumber: parsed.phoneNumber || "",
        avatar: parsed.avatar || "",
      });
    }

    // Also fetch fresh data from API
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await ProfileApi.getProfile();

      if (response?.data) {
        const userData = response.data;
        setUserInfo({
          name: userData.name || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || userData.phone || "",
          avatar: userData.avatar || "",
        });
        // Update localStorage
        localStorage.setItem("userInfo", JSON.stringify(userData));
      } else if (response) {
        // If response structure is different, try using response directly
        setUserInfo({
          name: response.name || "",
          email: response.email || "",
          phoneNumber: response.phoneNumber || response.phone || "",
          avatar: response.avatar || "",
        });
        localStorage.setItem("userInfo", JSON.stringify(response));
      }
    } catch (error) {
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUserInfoChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setUserInfo((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handlePasswordChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const updateData = {
        name: userInfo.name,
        phoneNumber: userInfo.phoneNumber,
        avatar: userInfo.avatar,
      };

      const response = await ProfileApi.updateProfile(updateData);
      if (response?.data) {
        // Update localStorage
        const updatedUserInfo = { ...userInfo, ...response.data };
        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
        setUserInfo(updatedUserInfo);

        // Dispatch event to update header
        window.dispatchEvent(new Event("user-updated"));
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmNewPassword) {
      return;
    }

    setLoading(true);
    try {
      await ProfileApi.changePassword(
        passwordData.newPassword,
        passwordData.confirmNewPassword
      );
      setPasswordData({
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserInfo((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ProfileContainer>
      <Typography variant="h4" gutterBottom>
        Thông tin cá nhân
      </Typography>

      <ProfileCard>
        <TabsContainer>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Thông tin cá nhân" />
            <Tab label="Đổi mật khẩu" />
          </Tabs>
        </TabsContainer>

        <TabPanel value={tabValue} index={0}>
          <AvatarContainer>
            <StyledAvatar src={userInfo.avatar}>
              {userInfo.name?.charAt(0)?.toUpperCase()}
            </StyledAvatar>
            <AvatarUploadInput
              accept="image/*"
              id="avatar-upload"
              type="file"
              onChange={handleAvatarChange}
            />
            <AvatarUploadLabel htmlFor="avatar-upload">
              <AvatarUploadButton color="primary" component="span">
                <PhotoCamera />
              </AvatarUploadButton>
            </AvatarUploadLabel>
            <AvatarHelperText>
              Nhấn vào biểu tượng camera để thay đổi ảnh đại diện
            </AvatarHelperText>
          </AvatarContainer>

          <FormContainer>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  value={userInfo.name}
                  onChange={handleUserInfoChange("name")}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={userInfo.email}
                  disabled
                  variant="outlined"
                  helperText="Email không thể thay đổi"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={userInfo.phoneNumber}
                  onChange={handleUserInfoChange("phoneNumber")}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            <SaveButtonContainer>
              <SaveButton
                variant="contained"
                startIcon={<Save />}
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
              </SaveButton>
            </SaveButtonContainer>
          </FormContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <FormContainer>
            <PasswordSectionTitle>
              Đổi mật khẩu
            </PasswordSectionTitle>
            <Divider />

            <TextField
              fullWidth
              type="password"
              label="Mật khẩu mới"
              value={passwordData.newPassword}
              onChange={handlePasswordChange("newPassword")}
              variant="outlined"
            />

            <TextField
              fullWidth
              type="password"
              label="Xác nhận mật khẩu mới"
              value={passwordData.confirmNewPassword}
              onChange={handlePasswordChange("confirmNewPassword")}
              variant="outlined"
              error={
                passwordData.confirmNewPassword !== "" &&
                passwordData.newPassword !== passwordData.confirmNewPassword
              }
              helperText={
                passwordData.confirmNewPassword !== "" &&
                passwordData.newPassword !== passwordData.confirmNewPassword
                  ? "Mật khẩu xác nhận không khớp"
                  : ""
              }
            />

            <PasswordButtonContainer>
              <PasswordButton
                variant="contained"
                startIcon={<Lock />}
                onClick={handleChangePassword}
                disabled={
                  loading ||
                  !passwordData.newPassword ||
                  passwordData.newPassword !== passwordData.confirmNewPassword
                }
              >
                {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
              </PasswordButton>
            </PasswordButtonContainer>
          </FormContainer>
        </TabPanel>
      </ProfileCard>
    </ProfileContainer>
  );
};

export default ProfileScreen;
