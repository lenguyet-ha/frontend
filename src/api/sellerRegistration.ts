import { apiEndPoints } from "@/constant/apiEndpoints";
import axios from "@/helpers/axios";
import axiosOriginal from "axios"; // For S3 presigned URL upload

// ============ INTERFACES ============

export interface SellerRegistrationForm {
  citizenId: string;
  citizenIdFrontImage: File;
  citizenIdBackImage: File;
  address: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

export interface SellerRegistrationRequest {
  citizenId: string;
  citizenIdFrontImage: string; // S3 URL
  citizenIdBackImage: string; // S3 URL
  address: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

export interface SellerRegistrationResponse {
  id: number;
  userId: number;
  citizenId: string;
  address: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  registrationFee: number;
  status: "PENDING_PAYMENT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PAYMENT_FAILED" | "CANCELLED";
  paymentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  url: string;
}

export interface PaymentQrResponse {
  paymentId: number;
  amount: number;
  qrCode: string;
  description: string;
}

export interface SellerRegistrationStatusResponse {
  id: number;
  status: "PENDING_PAYMENT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PAYMENT_FAILED" | "CANCELLED";
  paymentId: number | null;
  message?: string;
}

// ============ PRESIGNED URL & FILE UPLOAD ============

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
    console.error("Error getting presigned URL:", error);
    return null;
  }
};

export const uploadImageToPresignedUrl = async (
  presignedUrl: string,
  file: File
): Promise<boolean> => {
  try {
    const response = await axiosOriginal.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    return response.status === 200 || response.status === 204;
  } catch (error) {
    console.error("Error uploading image to presigned URL:", error);
    return false;
  }
};

// ============ STEP 1 & 2: REGISTER SELLER ============

export const registerSeller = async (
  data: SellerRegistrationRequest
): Promise<SellerRegistrationResponse | null> => {
  try {
    const payload = {
      method: "POST",
      url: `${apiEndPoints.SELLER_REGISTRATION}/register`,
      data,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    console.error("Error registering seller:", error);
    return null;
  }
};

// ============ STEP 3: GET PAYMENT QR CODE ============

export const getPaymentQrCode = async (
  registrationId: number
): Promise<PaymentQrResponse | null> => {
  try {
    const payload = {
      method: "GET",
      url: `${apiEndPoints.SELLER_REGISTRATION}/${registrationId}/payment-qr`,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    console.error("Error getting payment QR code:", error);
    return null;
  }
};

// ============ STEP 4: CHECK REGISTRATION STATUS (POLLING) ============

export const getSellerRegistrationStatus = async (
  registrationId: number
): Promise<SellerRegistrationStatusResponse | null> => {
  try {
    const payload = {
      method: "GET",
      url: `${apiEndPoints.SELLER_REGISTRATION}/status`,
      params: {
        registrationId,
      },
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    console.error("Error getting seller registration status:", error);
    return null;
  }
};

// ============ CHANGE REGISTRATION STATUS ============

export const changeSellerRegistrationStatus = async (
  registrationId: number,
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PAYMENT_FAILED" | "CANCELLED"
): Promise<SellerRegistrationStatusResponse | null> => {
  try {
    const payload = {
      method: "POST",
      url: `${apiEndPoints.SELLER_REGISTRATION}/status`,
      params: {
        registrationId,
      },
      data: {
        status,
      },
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    console.error("Error changing seller registration status:", error);
    return null;
  }
};

// ============ GET MY REGISTRATION ============

export interface MyRegistrationResponse {
  id: number;
  userId: number;
  citizenId: string;
  citizenIdFrontImage: string;
  citizenIdBackImage: string;
  address: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  registrationFee: number;
  status: "PENDING_PAYMENT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PAYMENT_FAILED" | "CANCELLED";
  paymentId: number | null;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const getMyRegistration = async (): Promise<MyRegistrationResponse | null> => {
  try {
    const payload = {
      method: "GET",
      url: `${apiEndPoints.SELLER_REGISTRATION}/my-registration`,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error: any) {
    // Return null if 404 (no registration found)
    if (error.response?.status === 404) {
      return null;
    }
    console.error("Error getting my registration:", error);
    return null;
  }
};

// ============ UPDATE MY REGISTRATION ============

export interface UpdateRegistrationRequest {
  citizenId: string;
  citizenIdFrontImage: string; // S3 URL
  citizenIdBackImage: string; // S3 URL
  address: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

export const updateMyRegistration = async (
  registrationId: number,
  data: UpdateRegistrationRequest
): Promise<SellerRegistrationResponse | null> => {
  try {
    const payload = {
      method: "PATCH",
      url: `${apiEndPoints.SELLER_REGISTRATION}/${registrationId}`,
      data,
    };
    const response = await axios(payload);
    return response.data;
  } catch (error) {
    console.error("Error updating registration:", error);
    return null;
  }
};

// ============ HELPER FUNCTION: UPLOAD MULTIPLE IMAGES ============

export const uploadMultipleImagesToS3 = async (
  files: { frontImage: File; backImage: File }
): Promise<{ frontUrl: string; backUrl: string } | null> => {
  try {
    // Upload front image
    const frontPresigned = await getPresignedUrl(
      `citizen-id-front-${Date.now()}-${files.frontImage.name}`
    );
    if (!frontPresigned) throw new Error("Failed to get presigned URL for front image");

    const frontUploaded = await uploadImageToPresignedUrl(
      frontPresigned.presignedUrl,
      files.frontImage
    );
    if (!frontUploaded) throw new Error("Failed to upload front image");

    // Upload back image
    const backPresigned = await getPresignedUrl(
      `citizen-id-back-${Date.now()}-${files.backImage.name}`
    );
    if (!backPresigned) throw new Error("Failed to get presigned URL for back image");

    const backUploaded = await uploadImageToPresignedUrl(
      backPresigned.presignedUrl,
      files.backImage
    );
    if (!backUploaded) throw new Error("Failed to upload back image");

    return {
      frontUrl: frontPresigned.url,
      backUrl: backPresigned.url,
    };
  } catch (error) {
    console.error("Error uploading images to S3:", error);
    return null;
  }
};

// ============ HELPER FUNCTION: POLLING STATUS ============

export const pollSellerRegistrationStatus = async (
  registrationId: number,
  maxAttempts: number = 100, // ~5 minutes with 3 second interval
  intervalMs: number = 3000
): Promise<SellerRegistrationStatusResponse | null> => {
  return new Promise((resolve) => {
    let attempts = 0;

    const poll = async () => {
      attempts++;

      if (attempts > maxAttempts) {
        console.warn("Polling max attempts reached");
        resolve(null);
        return;
      }

      const status = await getSellerRegistrationStatus(registrationId);

      if (!status) {
        resolve(null);
        return;
      }

      // Stop polling if status is no longer PENDING_PAYMENT
      if (status.status !== "PENDING_PAYMENT") {
        resolve(status);
        return;
      }

      // Continue polling
      setTimeout(poll, intervalMs);
    };

    poll();
  });
};
