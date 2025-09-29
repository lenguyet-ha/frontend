// src/helpers/axios.ts
import Axios from "axios";
import getConfig from "next/config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { dispatch } from "../store";
import { showErrorSnackBar } from "../store/reducers/snackbar";

const axios = Axios.create({});

// Add a request interceptor to include the accessToken in headers
axios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken"); // Replace 'accessToken' with your actual accessToken key
    if (accessToken) {
      // config.headers["x-access-accessToken"] = `${accessToken}`;
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If there's a response error
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        // Display toast notification
        toast.error("Unauthorized! Redirecting to login...", {
          autoClose: 3000,
        });
        // Remove the accessToken and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userInfo");
        window.location.href = "/login"; // Use window.location.href to redirect
        dispatch(showErrorSnackBar(error.response.data.message));
      } else if (error.response.status === 500) {
        // Display toast notification for server error
        toast.error("Internal server error. Please try again later.", {
          autoClose: 3000,
        });
        dispatch(showErrorSnackBar(error.response.data.message));
      } else if (error.response.status === 404) {
        // Display toast for not found
        toast.error("Resource not found. Please check the URL.", {
          autoClose: 3000,
        });
        dispatch(showErrorSnackBar(error.response.data.message));
      } else {
        // General error message for other status codes
        toast.error(
          `${error.response.data.message || "Something went wrong."}`,
          {
            autoClose: 3000,
          }
        );
        if (error.response) {
          dispatch(showErrorSnackBar(error.response.data.message));
        }
      }
    } else {
      // If there's no response from the server
      toast.error("Network error. Please check your connection.", {
        autoClose: 3000,
      });

      if (error.response) {
        dispatch(showErrorSnackBar(error.response.data.message));
      }
    }

    return Promise.reject(error?.response?.data?.message); // Delegate error handling to where axios is called
  }
);

export const handleAxiosError = (error: any, dispatch: any) => {
  if (error.response) {
    if (error.response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");
      window.location.href = "/login";
    }
  }
};

export default axios;
