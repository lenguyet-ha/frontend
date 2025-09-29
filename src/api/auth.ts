import { apiEndPoints } from "@/constant/apiEndpoints";
import { lang } from "@/constant/lang";
import axios from "@/helpers/axious";
import { dispatch } from "@/store";
import { showErrorSnackBar } from "@/store/reducers/snackbar";
import { AxiosRequestConfig } from "axios";


/**
 *
 * @param userName
 * @param password
 * @returns
 */
export const loginUser = async (userName?: string, password?: string) => {
  try {
    const payload: AxiosRequestConfig = {
      url: apiEndPoints.LOGIN_USER,
      method: "post",
      data: {
        email: userName,
        password: password,
      },
    };
    const response = await axios(payload);
    if (response.data) {
    } else {
      dispatch(showErrorSnackBar(response?.data?.message));
    }
    return response.data;
  } catch (error) {
    dispatch(showErrorSnackBar(error || lang.errorDetected));
  }
};
/**
 *
 * @returns
 */
export const getUserInfo = async () => {
  try {
    const payload: AxiosRequestConfig = {
      url: apiEndPoints.GET_USER_INFO,
      method: "get",
    };
    const response = await axios(payload);
    if (response.data) {
      return response.data;
    } else {
      dispatch(showErrorSnackBar(response?.data?.message));
      return response.data;
    }
  } catch (error) {
    dispatch(showErrorSnackBar(error || lang.errorDetected));
  }
};


export const register = async (data: any) => {
  try {
    const payload: AxiosRequestConfig = {
      url: apiEndPoints.REGISTER_USER,
      method: "post",
      data: data,
    };
    const response = await axios(payload);
    if (response.data) {
      return response.data;
    } else {
      dispatch(showErrorSnackBar(response?.data?.message));
      return response.data;
    }
  } catch (error) {
    dispatch(showErrorSnackBar(error || lang.errorDetected));
  }
}