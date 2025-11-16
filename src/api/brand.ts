import axiosInstance from "@/helpers/axios";

export const getListAsync = async (params?: { limit?: number; offset?: number }) => {
  try {
    const response = await axiosInstance.get("/api/brand", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching brands:", error);
    return null;
  }
};

export const getDetailsAsync = async (brandId: number) => {
  try {
    const response = await axiosInstance.get(`/api/brand/${brandId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching brand details:", error);
    return null;
  }
};
