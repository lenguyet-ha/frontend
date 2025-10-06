import { apiEndPoints } from "@/constant/apiEndpoints";
import axios from "@/helpers/axious";

export const addToCart = async (data: { quantity: number; skuId: number }) => {
  try {
    const payload = {
      method: "POST",
      url: apiEndPoints.CART,
      data,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getCart = async () => {
  try {
    const payload = {
      method: "GET",
      url: apiEndPoints.CART,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const updateCartItem = async (id: number, data: { quantity: number }) => {
  try {
    const payload = {
      method: "PUT",
      url: `${apiEndPoints.CART}/${id}`,
      data,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const removeCartItem = async (id: number) => {
  try {
    const payload = {
      method: "DELETE",
      url: `${apiEndPoints.CART}/${id}`,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};
