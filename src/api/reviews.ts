import { apiEndPoints } from "@/constant/apiEndpoints";
import axios from "@/helpers/axios";
import axiosOriginal from "axios"; // For S3 presigned URL upload

export interface CreateReviewItem {
  productId: number;
  content: string;
  rating: number;
  mediaUrls?: string[];
}

export interface CreateReviewBody {
  orderId: number;
  reviews: CreateReviewItem[];
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  url: string;
}

// Original presigned URL approach (keep for reference)
export const getPresignedUrl = async (
  filename: string
): Promise<PresignedUrlResponse | null> => {
  try {
    const payload = {
      method: "POST",
      url: `${apiEndPoints.MEDIA}/images/upload/presigned-url`,
      data: { filename },
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const uploadImageToPresignedUrl = async (
  presignedUrl: string,
  file: File
): Promise<boolean> => {
  try {
    // Use original axios (not the helper) to upload directly to S3
    // This matches your working code example
    const response = await axiosOriginal.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    return response.status === 200 || response.status === 204;
  } catch (error) {
    return false;
  }
};

export const createReview = async (data: CreateReviewBody) => {
  try {
    const payload = {
      method: "POST",
      url: apiEndPoints.REVIEWS,
      data,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    return null;
  }
};

export interface ReviewMedia {
  id: number;
  url: string;
  type: string;
  reviewId: number;
  createdAt: string;
}

export interface ReviewUser {
  id: number;
  name: string;
  avatar: string | null;
}

export interface Review {
  id: number;
  content: string;
  rating: number;
  orderId: number;
  productId: number;
  userId: number;
  updateCount: number;
  createdAt: string;
  updatedAt: string;
  medias: ReviewMedia[];
  user: ReviewUser;
}

export interface ReviewsResponse {
  data: Review[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
  averageRating: number;
  ratingDistribution: Record<string, number>;
}

export const getReviewsByProduct = async (params: {
  productId: number;
  page?: number;
  limit?: number;
  rating?: number;
}): Promise<ReviewsResponse | null> => {
  try {
    const payload = {
      method: "GET",
      url: apiEndPoints.REVIEWS,
      params,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    console.error("Error getting reviews:", error);
    return null;
  }
};

export const getReviewsByOrder = async (orderId: number): Promise<Review[] | null> => {
  try {
    const payload = {
      method: "GET",
      url: `${apiEndPoints.REVIEWS}/order/${orderId}`,
    };
    const response = await axios(payload);
    return response.data.data;
  } catch (error) {
    console.error("Error getting order reviews:", error);
    return null;
  }
};
