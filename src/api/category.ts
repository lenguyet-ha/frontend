import { apiEndPoints } from "@/constant/apiEndpoints";
import axios from "@/helpers/axios";

export const list = async (query: any) => {
  try {
    const payload = {
      method: "GET",
      url: apiEndPoints.CATEGORIES,
      params: query,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};
