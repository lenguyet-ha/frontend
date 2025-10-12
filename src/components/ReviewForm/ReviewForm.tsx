import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Rating,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Close, AddPhotoAlternate, Delete } from "@mui/icons-material";
import * as ReviewsApi from "@/api/reviews";

interface ProductItem {
  id: number;
  productId: number;
  productName: string;
  productTranslations: Array<{
    id: number;
    name: string;
    description: string;
    languageId: string;
  }>;
  skuPrice: number;
  image: string;
  skuValue: string;
  skuId: number;
  orderId: number;
  quantity: number;
  createdAt: string;
}

interface ReviewItem {
  productId: number;
  content: string;
  rating: number;
  mediaUrls: string[];
}

interface ReviewFormProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  items: ProductItem[];
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  open,
  onClose,
  orderId,
  items,
  onSuccess,
}) => {
  const [reviews, setReviews] = useState<ReviewItem[]>(
    items.map((item) => ({
      productId: item.productId,
      content: "",
      rating: 5,
      mediaUrls: [],
    }))
  );
  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleContentChange = useCallback((productId: number, content: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.productId === productId ? { ...review, content } : review
      )
    );
  }, []);

  const handleRatingChange = useCallback((productId: number, rating: number | null) => {
    if (rating) {
      setReviews((prev) =>
        prev.map((review) =>
          review.productId === productId ? { ...review, rating } : review
        )
      );
    }
  }, []);

  const handleImageUpload = useCallback(async (productId: number, files: FileList) => {
    const file = files[0];
    if (!file) return;

    const uploadKey = `${productId}-${Date.now()}`;
    setUploadingImages((prev) => ({ ...prev, [uploadKey]: true }));

    try {
      // Get presigned URL
      const presignedResponse = await ReviewsApi.getPresignedUrl(file.name);
      if (!presignedResponse) {
        alert("Không thể tải lên ảnh. Vui lòng thử lại.");
        return;
      }

      // Upload image to S3 using presigned URL
      const uploadSuccess = await ReviewsApi.uploadImageToPresignedUrl(
        presignedResponse.presignedUrl,
        file
      );

      if (uploadSuccess) {
        // Add image URL to review
        setReviews((prev) =>
          prev.map((review) =>
            review.productId === productId
              ? { ...review, mediaUrls: [...review.mediaUrls, presignedResponse.url] }
              : review
          )
        );
      } else {
        alert("Không thể tải lên ảnh. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Đã có lỗi xảy ra khi tải lên ảnh.");
    } finally {
      setUploadingImages((prev) => ({ ...prev, [uploadKey]: false }));
    }
  }, []);

  const handleRemoveImage = useCallback((productId: number, imageUrl: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.productId === productId
          ? { ...review, mediaUrls: review.mediaUrls.filter((url) => url !== imageUrl) }
          : review
      )
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validate reviews
    const invalidReviews = reviews.filter(
      (review) => !review.content.trim() || review.rating < 1 || review.rating > 5
    );

    if (invalidReviews.length > 0) {
      alert("Vui lòng điền đầy đủ nội dung đánh giá và chọn số sao cho tất cả sản phẩm.");
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        orderId,
        reviews: reviews.map(({ productId, content, rating, mediaUrls }) => ({
          productId,
          content: content.trim(),
          rating,
          mediaUrls,
        })),
      };

      const response = await ReviewsApi.createReview(reviewData);
      if (response) {
        alert("Đánh giá đã được gửi thành công!");
        onSuccess?.();
        onClose();
      } else {
        alert("Không thể gửi đánh giá. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Đã có lỗi xảy ra khi gửi đánh giá.");
    } finally {
      setSubmitting(false);
    }
  }, [reviews, orderId, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    if (!submitting) {
      setReviews(
        items.map((item) => ({
          productId: item.productId,
          content: "",
          rating: 5,
          mediaUrls: [],
        }))
      );
      onClose();
    }
  }, [submitting, items, onClose]);

  console.log('ReviewForm render:', { open, itemsCount: items.length });

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={submitting}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Đánh giá sản phẩm</Typography>
          <IconButton onClick={handleClose} disabled={submitting}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box>
          {items.map((item, index) => {
            const review = reviews.find((r) => r.productId === item.productId);
            if (!review) return null;

            return (
              <Card key={item.productId} sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <CardMedia
                        component="img"
                        image={item.image}
                        alt={item.productName}
                        sx={{ height: 120, objectFit: "cover", borderRadius: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={9}>
                      <Typography variant="h6" gutterBottom>
                        {item.productTranslations.length > 0
                          ? item.productTranslations[0].name
                          : item.productName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Phân loại: {item.skuValue}
                      </Typography>

                      <Box mt={2}>
                        <Typography variant="body2" gutterBottom>
                          Đánh giá:
                        </Typography>
                        <Rating
                          value={review.rating}
                          onChange={(_, value) => handleRatingChange(item.productId, value)}
                          size="large"
                          disabled={submitting}
                        />
                      </Box>

                      <Box mt={2}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này..."
                          value={review.content}
                          onChange={(e) => handleContentChange(item.productId, e.target.value)}
                          disabled={submitting}
                          inputProps={{ maxLength: 5000 }}
                          helperText={`${review.content.length}/5000 ký tự`}
                        />
                      </Box>

                      <Box mt={2}>
                        <Typography variant="body2" gutterBottom>
                          Hình ảnh (tối đa 10 ảnh):
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {review.mediaUrls.map((url, imgIndex) => (
                            <Box key={imgIndex} position="relative">
                              <CardMedia
                                component="img"
                                image={url}
                                sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1 }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveImage(item.productId, url)}
                                disabled={submitting}
                                sx={{
                                  position: "absolute",
                                  top: -8,
                                  right: -8,
                                  bgcolor: "rgba(255, 255, 255, 0.8)",
                                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Box>
                          ))}
                          {review.mediaUrls.length < 10 && (
                            <Box>
                              <input
                                accept="image/*"
                                style={{ display: "none" }}
                                id={`image-upload-${item.productId}`}
                                type="file"
                                onChange={(e) => {
                                  if (e.target.files) {
                                    handleImageUpload(item.productId, e.target.files);
                                  }
                                  e.target.value = "";
                                }}
                                disabled={submitting || Object.values(uploadingImages).some(Boolean)}
                              />
                              <label htmlFor={`image-upload-${item.productId}`}>
                                <IconButton
                                  component="span"
                                  disabled={submitting || Object.values(uploadingImages).some(Boolean)}
                                  sx={{
                                    width: 80,
                                    height: 80,
                                    border: "2px dashed",
                                    borderColor: "grey.300",
                                    borderRadius: 1,
                                    "&:hover": {
                                      borderColor: "primary.main",
                                    },
                                  }}
                                >
                                  {Object.values(uploadingImages).some(Boolean) ? (
                                    <CircularProgress size={24} />
                                  ) : (
                                    <AddPhotoAlternate />
                                  )}
                                </IconButton>
                              </label>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        >
          {submitting ? "Đang gửi..." : "Gửi đánh giá"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewForm;
