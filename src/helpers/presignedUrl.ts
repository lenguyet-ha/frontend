import axiosInstance from "@/helpers/axios";
import axiosOriginal from "axios"; // For S3 presigned URL upload

export interface PresignedUrlResponse {
  presignedUrl: string;
  url: string;
}

// Get presigned URL from backend
export const getPresignedUrl = async (
  filename: string
): Promise<PresignedUrlResponse | null> => {
  try {
    const response = await axiosInstance.post(
      "/api/media/images/upload/presigned-url",
      {
        filename,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting presigned URL:", error);
    return null;
  }
};

// Upload image to S3 using presigned URL
export const uploadImageToPresignedUrl = async (
  presignedUrl: string,
  file: File
): Promise<boolean> => {
  try {
    // Use original axios (not the helper) to upload directly to S3
    const response = await axiosOriginal.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    return response.status === 200 || response.status === 204;
  } catch (error) {
    console.error("Error uploading to presigned URL:", error);
    return false;
  }
};

// Complete upload workflow: get presigned URL, upload file, return final URL
export const uploadImageWithPresignedUrl = async (
  file: File
): Promise<string | null> => {
  try {
    // Step 1: Get presigned URL from backend
    const presignedData = await getPresignedUrl(file.name);
    if (!presignedData) {
      throw new Error("Failed to get presigned URL");
    }

    const { presignedUrl, url } = presignedData;

    // Step 2: Upload file to S3 using presigned URL
    const uploadSuccess = await uploadImageToPresignedUrl(presignedUrl, file);
    if (!uploadSuccess) {
      throw new Error("Failed to upload image to S3");
    }

    // Step 3: Return the final URL (AWS URL)
    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};
