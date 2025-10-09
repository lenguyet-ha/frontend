import { apiEndPoints } from "@/constant/apiEndpoints";
import { lang } from "@/constant/lang";
import axios from "@/helpers/axios";
import { dispatch } from "@/store";
import { showErrorSnackBar, showSuccessSnackBar } from "@/store/reducers/snackbar";
import { AxiosRequestConfig } from "axios";
import { getUserInfo } from "./auth";

/**
 * Get user profile information (reuse from auth.ts)
 * @returns user profile data
 */
export const getProfile = async () => {
  return await getUserInfo();
};

/**
 * Update user profile
 * @param data - profile data to update
 * @returns updated profile data
 */
export const updateProfile = async (data: {
  name?: string;
  phoneNumber?: string;
  avatar?: string;
  password?: string;
}) => {
  try {
    const payload: AxiosRequestConfig = {
      url: apiEndPoints.UPDATE_PROFILE,
      method: "put",
      data: data,
    };
    const response = await axios(payload);
    if (response.data) {
      dispatch(showSuccessSnackBar("Cập nhật thông tin thành công"));
      return response.data;
    } else {
      dispatch(showErrorSnackBar(response?.data?.message));
      return response.data;
    }
  } catch (error) {
    dispatch(showErrorSnackBar(error || lang.errorDetected));
  }
};

/**
 * Change user password
 * @param newPassword - new password
 * @param confirmNewPassword - confirm new password
 * @returns response data
 */
export const changePassword = async (newPassword: string, confirmNewPassword: string) => {
  try {
    if (newPassword !== confirmNewPassword) {
      dispatch(showErrorSnackBar("Mật khẩu xác nhận không khớp"));
      return;
    }

    const payload: AxiosRequestConfig = {
      url: apiEndPoints.CHANGE_PASSWORD,
      method: "put",
      data: {
        newPassword,
        confirmNewPassword,
      },
    };
    const response = await axios(payload);
    if (response.data) {
      dispatch(showSuccessSnackBar("Đổi mật khẩu thành công"));
      return response.data;
    } else {
      dispatch(showErrorSnackBar(response?.data?.message));
      return response.data;
    }
  } catch (error) {
    dispatch(showErrorSnackBar(error || lang.errorDetected));
  }
};
