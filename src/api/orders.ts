import { apiEndPoints } from "@/constant/apiEndpoints";
import axios from "@/helpers/axios";

interface Receiver {
  name: string;
  phone: string;
  address: string;
}

interface OrderItem {
  shopId: number;
  receiver: Receiver;
  cartItemIds: number[];
}

export const createOrder = async (data: OrderItem[]) => {
  try {
    const payload = {
      method: "POST",
      url: apiEndPoints.ORDER,
      data,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getOrders = async () => {
  try {
    const payload = {
      method: "GET",
      url: apiEndPoints.ORDER,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const getOrder = async (id: string) => {
  try {
    const payload = {
      method: "GET",
      url: `${apiEndPoints.ORDER}/${id}`,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const updateOrder = async (id: string, data: any) => {
  try {
    const payload = {
      method: "PUT",
      url: `${apiEndPoints.ORDER}/${id}`,
      data,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const cancelOrder = async (id: string) => {
  try {
    const payload = {
      method: "DELETE",
      url: `${apiEndPoints.ORDER}/${id}`,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};
