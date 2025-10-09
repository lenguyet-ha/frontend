import { apiEndPoints } from "@/constant/apiEndpoints";
import axios from "@/helpers/axios";

export const list = async (query: any) => {
  try {
    const payload = {
      method: "GET",
      url: apiEndPoints.PRODUCTS,
      params: query,
      paramsSerializer: {
        indexes: null, // This will serialize arrays as categories=1&categories=2&categories=3
      },
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const detail = async (id: number) => {
  try {
    const payload = {
      method: "GET",
      url: `${apiEndPoints.PRODUCTS}/${id}`,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};
 