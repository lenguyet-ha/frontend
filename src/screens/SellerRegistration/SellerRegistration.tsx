import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  Button,
  CircularProgress,
  Box,
  Typography,
  Card,
  Chip,
} from "@mui/material";
import { useDispatch } from "@/store/store";
import { openSnackbar } from "@/store/reducers/snackbar";
import * as SellerRegistrationApi from "@/api/sellerRegistration";
import {
  StyledContainer,
  FormPaper,
  FormSection,
  SectionTitle,
  FormField,
  FileInputWrapper,
  FileInputLabel,
  StyledFileInput,
  FileInputButton,
  FilePreview,
  SubmitButton,
  QrContainer,
  QrImage,
  AmountText,
  LoadingContainer,
  SuccessContainer,
  ErrorContainer,
  StatusMessage,
  ActionButtons,
} from "./SellerRegistration.styles";

type RegistrationStep = "form" | "qr" | "success" | "error" | "loading";
type RegistrationMode = "create" | "update";

interface FormData {
  citizenId: string;
  citizenIdFrontImage: File | null;
  citizenIdBackImage: File | null;
  address: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  // URLs for existing images (when editing)
  existingFrontImageUrl?: string;
  existingBackImageUrl?: string;
}

interface FormErrors {
  [key: string]: string;
}

const SellerRegistration = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    citizenId: "",
    citizenIdFrontImage: null,
    citizenIdBackImage: null,
    address: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [step, setStep] = useState<RegistrationStep>("loading");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<RegistrationMode>("create");
  const [existingRegistration, setExistingRegistration] = useState<SellerRegistrationApi.MyRegistrationResponse | null>(null);

  // Payment/QR state
  const [registrationId, setRegistrationId] = useState<number | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [pollingStatus, setPollingStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<
    "PENDING_PAYMENT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "PAYMENT_FAILED" | "CANCELLED" | null
  >(null);

  // Load existing registration on mount
  useEffect(() => {
    const loadExistingRegistration = async () => {
      setStep("loading");
      
      try {
        const registration = await SellerRegistrationApi.getMyRegistration();
        
        if (!registration) {
          // No existing registration - create mode
          setMode("create");
          setStep("form");
          return;
        }

        // Check if user can edit (only PENDING_PAYMENT or PENDING_REVIEW)
        if (registration.status === "PENDING_PAYMENT" || registration.status === "PENDING_REVIEW") {
          // Has registration and can edit - update mode
          setMode("update");
          setExistingRegistration(registration);
          setRegistrationId(registration.id);
          
          // Populate form with existing data
          setFormData({
            citizenId: registration.citizenId,
            citizenIdFrontImage: null, // User can upload new images
            citizenIdBackImage: null,
            address: registration.address,
            bankName: registration.bankName,
            bankAccountNumber: registration.bankAccountNumber,
            bankAccountName: registration.bankAccountName,
            existingFrontImageUrl: registration.citizenIdFrontImage,
            existingBackImageUrl: registration.citizenIdBackImage,
          });
          
          setStep("form");
          
          dispatch(
            openSnackbar({
              message: `Bạn đã có đơn đăng ký (${registration.status === "PENDING_PAYMENT" ? "Chờ thanh toán" : "Chờ duyệt"}). Bạn có thể sửa thông tin.`,
              type: "info",
            })
          );
        } else if (registration.status === "APPROVED") {
          // Already approved
          dispatch(
            openSnackbar({
              message: "Bạn đã là Seller!",
              type: "success",
            })
          );
          router.push("/profile");
        } else if (registration.status === "REJECTED") {
          // Rejected - can create new
          setMode("create");
          setStep("form");
          dispatch(
            openSnackbar({
              message: `Đơn trước đã bị từ chối${registration.rejectionReason ? `: ${registration.rejectionReason}` : ""}. Vui lòng đăng ký lại.`,
              type: "warning",
            })
          );
        } else {
          // Other statuses - show form
          setMode("create");
          setStep("form");
        }
      } catch (error) {
        console.error("Error loading registration:", error);
        setMode("create");
        setStep("form");
      }
    };

    loadExistingRegistration();
  }, [dispatch, router]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!formData.citizenId || formData.citizenId.length !== 12) {
      errors.citizenId = "CCCD phải đúng 12 ký tự";
    }

    // In update mode, images are optional (can keep existing)
    // In create mode, images are required
    if (mode === "create") {
      if (!formData.citizenIdFrontImage) {
        errors.citizenIdFrontImage = "Vui lòng tải ảnh mặt trước CCCD";
      } else if (formData.citizenIdFrontImage.size > 5 * 1024 * 1024) {
        errors.citizenIdFrontImage = "Ảnh không được vượt quá 5MB";
      }

      if (!formData.citizenIdBackImage) {
        errors.citizenIdBackImage = "Vui lòng tải ảnh mặt sau CCCD";
      } else if (formData.citizenIdBackImage.size > 5 * 1024 * 1024) {
        errors.citizenIdBackImage = "Ảnh không được vượt quá 5MB";
      }
    } else {
      // Update mode - only validate if new image is uploaded
      if (formData.citizenIdFrontImage && formData.citizenIdFrontImage.size > 5 * 1024 * 1024) {
        errors.citizenIdFrontImage = "Ảnh không được vượt quá 5MB";
      }

      if (formData.citizenIdBackImage && formData.citizenIdBackImage.size > 5 * 1024 * 1024) {
        errors.citizenIdBackImage = "Ảnh không được vượt quá 5MB";
      }
    }

    if (!formData.address || formData.address.length < 10) {
      errors.address = "Địa chỉ phải tối thiểu 10 ký tự";
    }

    if (!formData.bankName) {
      errors.bankName = "Vui lòng nhập tên ngân hàng";
    }

    if (!formData.bankAccountNumber) {
      errors.bankAccountNumber = "Vui lòng nhập số tài khoản";
    }

    if (!formData.bankAccountName) {
      errors.bankAccountName = "Vui lòng nhập tên chủ tài khoản";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, mode]);

  // Handle text input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // Clear error for this field
      if (formErrors[name]) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    },
    [formErrors]
  );

  // Handle file input change
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name } = e.target;
      const file = e.target.files?.[0] || null;

      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Clear error for this field
      if (formErrors[name]) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    },
    [formErrors]
  );

  // Handle file input click
  const handleFileInputClick = useCallback((inputName: string) => {
    const input = document.getElementById(inputName) as HTMLInputElement;
    input?.click();
  }, []);

  // Generate fake QR code (for demo/testing)
  const generateFakeQrCode = useCallback((): string => {
    // Create a simple QR-like pattern using SVG (more reliable than canvas)
    const size = 300;
    const cellSize = 10;
    const cells = 30;

    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${size}" height="${size}" fill="white"/>`;

    // Generate deterministic pattern
    for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
        const hash = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
        if (hash - Math.floor(hash) > 0.5) {
          const x = i * cellSize;
          const y = j * cellSize;
          svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
        }
      }
    }

    // Add position markers (top-left, top-right, bottom-left)
    const markerSize = 7 * cellSize;
    const positions = [
      { x: 0, y: 0 },
      { x: size - markerSize, y: 0 },
      { x: 0, y: size - markerSize },
    ];

    positions.forEach((pos) => {
      // Outer square
      svg += `<rect x="${pos.x}" y="${pos.y}" width="${markerSize}" height="${markerSize}" fill="none" stroke="black" stroke-width="1"/>`;
      // Middle square
      svg += `<rect x="${pos.x + 2 * cellSize}" y="${pos.y + 2 * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="none" stroke="black" stroke-width="1"/>`;
      // Center square
      svg += `<rect x="${pos.x + 3 * cellSize}" y="${pos.y + 3 * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
    });

    svg += `</svg>`;

    // Convert SVG to data URL
    const blob = new Blob([svg], { type: "image/svg+xml" });
    return URL.createObjectURL(blob);
  }, []);

  // Handle QR code click (simulate successful payment)
  const handleQrClick = useCallback(async () => {
    if (!registrationId) return;

    setPollingStatus("Đang xử lý thanh toán...");

    try {
      // Call API to change status to PENDING_REVIEW
      const statusResponse = await SellerRegistrationApi.changeSellerRegistrationStatus(
        registrationId,
        "PENDING_REVIEW"
      );

      if (!statusResponse) {
        throw new Error("Không thể cập nhật trạng thái");
      }

      setPollingStatus("✓ Thanh toán thành công!");

      dispatch(
        openSnackbar({
          message: "Thanh toán thành công!",
          type: "success",
        })
      );

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update status to PENDING_REVIEW
      setPaymentStatus("PENDING_REVIEW");
      setStep("success");

      dispatch(
        openSnackbar({
          message: "Đơn đăng ký đang chờ duyệt từ Admin",
          type: "info",
        })
      );

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/profile");
      }, 3000);
    } catch (error: any) {
      console.error("Error processing payment:", error);
      setErrorMessage(
        error.message || "Có lỗi xảy ra khi xử lý thanh toán"
      );
      setStep("error");
      dispatch(
        openSnackbar({
          message: "Lỗi khi xử lý thanh toán",
          type: "error",
        })
      );
    }
  }, [registrationId, dispatch, router]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        dispatch(
          openSnackbar({
            message: "Vui lòng kiểm tra lại thông tin",
            type: "error",
          })
        );
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        let frontImageUrl = formData.existingFrontImageUrl || "";
        let backImageUrl = formData.existingBackImageUrl || "";

        // Upload new images if provided
        if (formData.citizenIdFrontImage || formData.citizenIdBackImage) {
          dispatch(
            openSnackbar({
              message: "Đang tải ảnh lên...",
              type: "info",
            })
          );

          // Upload front image if new file provided
          if (formData.citizenIdFrontImage) {
            const frontPresigned = await SellerRegistrationApi.getPresignedUrl(
              `citizen-id-front-${Date.now()}-${formData.citizenIdFrontImage.name}`
            );
            if (!frontPresigned) throw new Error("Tải ảnh mặt trước thất bại");

            const frontUploaded = await SellerRegistrationApi.uploadImageToPresignedUrl(
              frontPresigned.presignedUrl,
              formData.citizenIdFrontImage
            );
            if (!frontUploaded) throw new Error("Tải ảnh mặt trước thất bại");

            frontImageUrl = frontPresigned.url;
          }

          // Upload back image if new file provided
          if (formData.citizenIdBackImage) {
            const backPresigned = await SellerRegistrationApi.getPresignedUrl(
              `citizen-id-back-${Date.now()}-${formData.citizenIdBackImage.name}`
            );
            if (!backPresigned) throw new Error("Tải ảnh mặt sau thất bại");

            const backUploaded = await SellerRegistrationApi.uploadImageToPresignedUrl(
              backPresigned.presignedUrl,
              formData.citizenIdBackImage
            );
            if (!backUploaded) throw new Error("Tải ảnh mặt sau thất bại");

            backImageUrl = backPresigned.url;
          }
        }

        const requestData = {
          citizenId: formData.citizenId,
          citizenIdFrontImage: frontImageUrl,
          citizenIdBackImage: backImageUrl,
          address: formData.address,
          bankName: formData.bankName,
          bankAccountNumber: formData.bankAccountNumber,
          bankAccountName: formData.bankAccountName,
        };

        if (mode === "update" && registrationId) {
          // Update existing registration
          dispatch(
            openSnackbar({
              message: "Đang cập nhật đơn đăng ký...",
              type: "info",
            })
          );

          const updateResponse = await SellerRegistrationApi.updateMyRegistration(
            registrationId,
            requestData
          );

          if (!updateResponse) {
            throw new Error("Cập nhật đơn đăng ký thất bại");
          }

          dispatch(
            openSnackbar({
              message: "Cập nhật thành công!",
              type: "success",
            })
          );

          // If status is PENDING_REVIEW, just show success and redirect
          if (existingRegistration?.status === "PENDING_REVIEW") {
            setStep("success");
            setTimeout(() => {
              router.push("/profile");
            }, 2000);
            return;
          }

          // If status is PENDING_PAYMENT, proceed to QR payment
          if (existingRegistration?.paymentId) {
            // Already has payment, show QR
            const paymentResponse = await SellerRegistrationApi.getPaymentQrCode(registrationId);
            
            if (paymentResponse) {
              const fakeQrImageUrl = generateFakeQrCode();
              setQrCode(fakeQrImageUrl);
              setAmount(paymentResponse.amount);
              setStep("qr");
              
              dispatch(
                openSnackbar({
                  message: "Vui lòng quét mã QR hoặc click vào mã QR để thanh toán",
                  type: "info",
                })
              );
            } else {
              setStep("success");
              setTimeout(() => {
                router.push("/profile");
              }, 2000);
            }
          }
        } else {
          // Create new registration
          dispatch(
            openSnackbar({
              message: "Đang gửi đơn đăng ký...",
              type: "info",
            })
          );

          const registrationResponse = await SellerRegistrationApi.registerSeller(requestData);

          if (!registrationResponse) {
            throw new Error("Đăng ký thất bại");
          }

          setRegistrationId(registrationResponse.id);

          // Create payment and get QR code
          dispatch(
            openSnackbar({
              message: "Đang tạo thanh toán...",
              type: "info",
            })
          );

          const paymentResponse = await SellerRegistrationApi.getPaymentQrCode(
            registrationResponse.id
          );

          if (!paymentResponse) {
            throw new Error("Không thể tạo thanh toán");
          }

          // Generate fake QR code
          const fakeQrImageUrl = generateFakeQrCode();

          setQrCode(fakeQrImageUrl);
          setAmount(paymentResponse.amount);
          setStep("qr");

          dispatch(
            openSnackbar({
              message: "Vui lòng quét mã QR hoặc click vào mã QR để thanh toán",
              type: "info",
            })
          );
        }
      } catch (error: any) {
        console.error("Registration error:", error);
        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Có lỗi xảy ra, vui lòng thử lại"
        );
        setStep("error");
        dispatch(
          openSnackbar({
            message: "Có lỗi xảy ra",
            type: "error",
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validateForm, dispatch, generateFakeQrCode, mode, registrationId, existingRegistration, router]
  );

  // Start polling for payment status
  const startPolling = useCallback((regId: number) => {
    const pollInterval = setInterval(async () => {
      const status = await SellerRegistrationApi.getSellerRegistrationStatus(
        regId
      );

      if (!status) {
        clearInterval(pollInterval);
        return;
      }

      setPaymentStatus(status.status);

      switch (status.status) {
        case "PENDING_PAYMENT":
          setPollingStatus("Chờ thanh toán...");
          break;

        case "PENDING_REVIEW":
          setPollingStatus("Thanh toán thành công! Chờ Admin duyệt");
          clearInterval(pollInterval);
          dispatch(
            openSnackbar({
              message: "Thanh toán thành công! Đơn đăng ký đang chờ duyệt từ Admin",
              type: "success",
            })
          );
          setStep("success");
          setTimeout(() => {
            router.push("/profile");
          }, 3000);
          break;

        case "APPROVED":
          setPollingStatus("Bạn đã trở thành Seller!");
          clearInterval(pollInterval);
          dispatch(
            openSnackbar({
              message: "Đơn đăng ký được duyệt! Bạn đã trở thành Seller",
              type: "success",
            })
          );
          setStep("success");
          setTimeout(() => {
            router.push("/profile");
          }, 3000);
          break;

        case "REJECTED":
          setErrorMessage(
            status.message || "Đơn đăng ký bị từ chối"
          );
          clearInterval(pollInterval);
          setStep("error");
          dispatch(
            openSnackbar({
              message: "Đơn đăng ký bị từ chối",
              type: "error",
            })
          );
          break;

        case "PAYMENT_FAILED":
          setErrorMessage(
            status.message || "Thanh toán thất bại"
          );
          clearInterval(pollInterval);
          setStep("error");
          dispatch(
            openSnackbar({
              message: "Thanh toán thất bại",
              type: "error",
            })
          );
          break;

        case "CANCELLED":
          setErrorMessage("Đơn đăng ký đã bị hủy");
          clearInterval(pollInterval);
          setStep("error");
          dispatch(
            openSnackbar({
              message: "Đơn đăng ký đã bị hủy",
              type: "error",
            })
          );
          break;

        default:
          break;
      }
    }, 3000);
  }, [dispatch, router]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setStep("form");
    setFormData({
      citizenId: "",
      citizenIdFrontImage: null,
      citizenIdBackImage: null,
      address: "",
      bankName: "",
      bankAccountNumber: "",
      bankAccountName: "",
    });
    setFormErrors({});
    setErrorMessage("");
    setPaymentStatus(null);
  }, []);

  // Handle back
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <StyledContainer maxWidth="sm">
      {step === "loading" && (
        <LoadingContainer>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Đang tải thông tin...
          </Typography>
        </LoadingContainer>
      )}

      {step === "form" && (
        <form onSubmit={handleSubmit}>
          <FormPaper>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {mode === "update" ? "Sửa Đơn Đăng Ký Seller" : "Đăng Ký Trở Thành Seller"}
              </Typography>
              {mode === "update" && existingRegistration && (
                <Chip
                  label={
                    existingRegistration.status === "PENDING_PAYMENT"
                      ? "Chờ thanh toán"
                      : existingRegistration.status === "PENDING_REVIEW"
                      ? "Chờ duyệt"
                      : existingRegistration.status
                  }
                  color={
                    existingRegistration.status === "PENDING_REVIEW"
                      ? "info"
                      : existingRegistration.status === "PENDING_PAYMENT"
                      ? "warning"
                      : "default"
                  }
                  size="small"
                />
              )}
            </Box>

            {mode === "update" && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Bạn đang sửa đơn đăng ký hiện có. {formData.existingFrontImageUrl && "Bạn có thể giữ ảnh cũ hoặc tải ảnh mới lên."}
              </Alert>
            )}

          {/* CCCD Information */}
          <FormSection>
            <SectionTitle>Thông Tin CCCD/CMND</SectionTitle>

            <FormField
              fullWidth
              label="Số CCCD/CMND (12 ký tự)"
              name="citizenId"
              value={formData.citizenId}
              onChange={handleInputChange}
              error={!!formErrors.citizenId}
              helperText={formErrors.citizenId}
              placeholder="Ví dụ: 123456789012"
            />

            <FileInputWrapper>
              <FileInputLabel>
                Ảnh mặt trước CCCD <span>*</span>
              </FileInputLabel>
              <StyledFileInput
                id="citizenIdFrontImage"
                type="file"
                name="citizenIdFrontImage"
                onChange={handleFileChange}
                accept="image/*"
              />
              <FileInputButton
                variant="outlined"
                onClick={() => handleFileInputClick("citizenIdFrontImage")}
              >
                {formData.existingFrontImageUrl ? "Chọn ảnh mới" : "Chọn ảnh"}
              </FileInputButton>
              {formData.citizenIdFrontImage && (
                <FilePreview>
                  ✓ {formData.citizenIdFrontImage.name}
                </FilePreview>
              )}
              {!formData.citizenIdFrontImage && formData.existingFrontImageUrl && (
                <Box sx={{ mt: 2 }}>
                  <FilePreview>
                    ✓ Đã có ảnh (giữ ảnh cũ)
                  </FilePreview>
                  <Box
                    component="img"
                    src={formData.existingFrontImageUrl}
                    alt="CCCD mặt trước"
                    sx={{
                      width: "100%",
                      maxWidth: 400,
                      height: "auto",
                      mt: 1,
                      borderRadius: 1,
                      border: "1px solid #ddd",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              )}
              {formErrors.citizenIdFrontImage && (
                <Alert severity="error" sx={{ marginTop: 1 }}>
                  {formErrors.citizenIdFrontImage}
                </Alert>
              )}
            </FileInputWrapper>

            <FileInputWrapper>
              <FileInputLabel>
                Ảnh mặt sau CCCD <span>*</span>
              </FileInputLabel>
              <StyledFileInput
                id="citizenIdBackImage"
                type="file"
                name="citizenIdBackImage"
                onChange={handleFileChange}
                accept="image/*"
              />
              <FileInputButton
                variant="outlined"
                onClick={() => handleFileInputClick("citizenIdBackImage")}
              >
                {formData.existingBackImageUrl ? "Chọn ảnh mới" : "Chọn ảnh"}
              </FileInputButton>
              {formData.citizenIdBackImage && (
                <FilePreview>
                  ✓ {formData.citizenIdBackImage.name}
                </FilePreview>
              )}
              {!formData.citizenIdBackImage && formData.existingBackImageUrl && (
                <Box sx={{ mt: 2 }}>
                  <FilePreview>
                    ✓ Đã có ảnh (giữ ảnh cũ)
                  </FilePreview>
                  <Box
                    component="img"
                    src={formData.existingBackImageUrl}
                    alt="CCCD mặt sau"
                    sx={{
                      width: "100%",
                      maxWidth: 400,
                      height: "auto",
                      mt: 1,
                      borderRadius: 1,
                      border: "1px solid #ddd",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              )}
              {formErrors.citizenIdBackImage && (
                <Alert severity="error" sx={{ marginTop: 1 }}>
                  {formErrors.citizenIdBackImage}
                </Alert>
              )}
            </FileInputWrapper>
          </FormSection>

          {/* Address Information */}
          <FormSection>
            <SectionTitle>Thông Tin Địa Chỉ</SectionTitle>

            <FormField
              fullWidth
              label="Địa chỉ thường trú"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              error={!!formErrors.address}
              helperText={formErrors.address}
              placeholder="Ví dụ: 123 Đường ABC, Quận 1, TP.HCM"
              multiline
              rows={3}
            />
          </FormSection>

          {/* Bank Information */}
          <FormSection>
            <SectionTitle>Thông Tin Ngân Hàng</SectionTitle>

            <FormField
              fullWidth
              label="Tên ngân hàng"
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
              error={!!formErrors.bankName}
              helperText={formErrors.bankName}
              placeholder="Ví dụ: Vietcombank, Techcombank"
            />

            <FormField
              fullWidth
              label="Số tài khoản"
              name="bankAccountNumber"
              value={formData.bankAccountNumber}
              onChange={handleInputChange}
              error={!!formErrors.bankAccountNumber}
              helperText={formErrors.bankAccountNumber}
              placeholder="Ví dụ: 1234567890"
            />

            <FormField
              fullWidth
              label="Tên chủ tài khoản"
              name="bankAccountName"
              value={formData.bankAccountName}
              onChange={handleInputChange}
              error={!!formErrors.bankAccountName}
              helperText={formErrors.bankAccountName}
              placeholder="Ví dụ: Nguyễn Văn A"
            />
          </FormSection>

          {/* Submit Buttons */}
          <ActionButtons>
            <Button variant="outlined" onClick={handleBack}>
              Quay lại
            </Button>
            <SubmitButton
              variant="contained"
              color="primary"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ marginRight: 1 }} />
                  Đang xử lý...
                </>
              ) : mode === "update" ? (
                "Cập Nhật Đơn Đăng Ký"
              ) : (
                "Đăng Ký Làm Seller"
              )}
            </SubmitButton>
          </ActionButtons>
          </FormPaper>
        </form>
      )}

      {step === "qr" && (
        <QrContainer>
          <Typography variant="h5" sx={{ marginBottom: 3, fontWeight: 600 }}>
            Thanh Toán Phí Đăng Ký
          </Typography>

          {qrCode && (
            <>
              <Box
                onClick={handleQrClick}
                sx={{
                  cursor: "pointer",
                  transition: "transform 0.2s, boxShadow 0.2s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                  },
                  padding: 2,
                  borderRadius: 1,
                  display: "inline-block",
                }}
              >
                <QrImage src={qrCode} alt="QR Code" />
              </Box>
              <AmountText>
                Phí đăng ký: {(amount / 1000).toLocaleString()} VND
              </AmountText>
            </>
          )}

          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            Vui lòng quét mã QR hoặc <strong>click vào mã QR để thanh toán</strong>:
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            • Momo<br />
            • VNPay<br />
            • Ứng dụng ngân hàng của bạn
          </Typography>

          {pollingStatus && (
            <StatusMessage sx={{ marginTop: 3, color: "primary.main" }}>
              ⏳ {pollingStatus}
            </StatusMessage>
          )}

          <LoadingContainer>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Đang chờ xác nhận thanh toán...
            </Typography>
          </LoadingContainer>
        </QrContainer>
      )}

      {step === "success" && (
        <SuccessContainer>
          <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: 600 }}>
            ✓ Đơn đăng ký thành công!
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 2, color: "black" }}>
            {paymentStatus === "APPROVED"
              ? "Bạn đã trở thành Seller. Chuyển hướng tới trang cá nhân..."
              : "Thanh toán thành công! Đơn đăng ký đang chờ duyệt từ Admin. Chuyển hướng tới trang cá nhân..."}
          </Typography>
          <CircularProgress />
        </SuccessContainer>
      )}

      {step === "error" && (
        <ErrorContainer>
          <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: 600 }}>
            ✗ Lỗi
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 3, color: "error.main" }}>
            {errorMessage}
          </Typography>
          <ActionButtons>
            <Button variant="outlined" onClick={handleBack}>
              Quay lại
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRetry}
            >
              Thử lại
            </Button>
          </ActionButtons>
        </ErrorContainer>
      )}
    </StyledContainer>
  );
};

export default SellerRegistration;
