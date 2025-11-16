import axiosInstance from "@/helpers/axios";

export interface ProductVariant {
  value: string;
  options: string[];
}

export interface ProductSKU {
  value: string;
  price: number;
  stock: number;
  image: string;
}

export interface ProductCreate {
  publishedAt: string | null;
  name: string;
  basePrice: number;
  virtualPrice: number;
  brandId: number;
  images: string[];
  variants: ProductVariant[];
  categories: number[];
  skus: ProductSKU[];
  status: string;
}

export interface ProductUpdate extends ProductCreate {
  productId: number;
}

export interface Product extends ProductCreate {
  id: number;
  shopId: number;
  createdAt: string;
  updatedAt: string;
}

// Get list of seller's products
export const getListAsync = async (params?: {
  limit?: number;
  offset?: number;
  search?: string;
  createdById?: number;
}) => {
  try {
    const response = await axiosInstance.get("/api/products", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching seller products:", error);
    throw error;
  }
};

// Get product details
export const getDetailsAsync = async (productId: number) => {
  try {
    const response = await axiosInstance.get(`/api/manage-product/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;
  }
};

// Create new product
export const postAsync = async (data: ProductCreate) => {
  try {
    const response = await axiosInstance.post("/api/manage-product/products", data);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Update product
export const updateAsync = async (data: ProductUpdate) => {
  try {
    const { productId, ...updateData } = data;
    const response = await axiosInstance.put(
      `/api/manage-product/products/${productId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete product
export const deleteAsync = async (productId: number) => {
  try {
    const response = await axiosInstance.delete(`/api/manage-product/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};
