import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  LinearProgress,
  Grid,
  Pagination,
  CircularProgress,
  Chip,
  ImageList,
  ImageListItem,
} from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material";
import * as ReviewsApi from "@/api/reviews";

interface ProductReviewsProps {
  productId: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<ReviewsApi.ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterRating, setFilterRating] = useState<number | undefined>(undefined);
  const limit = 5;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ReviewsApi.getReviewsByProduct({
        productId,
        page,
        limit,
        rating: filterRating,
      });
      if (response) {
        setReviews(response);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [productId, page, filterRating]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleFilterRating = useCallback((rating: number | undefined) => {
    setFilterRating(rating);
    setPage(1);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  if (loading && !reviews) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!reviews || reviews.totalItems === 0) {
    return (
      <Box py={4}>
        <Typography variant="h6" gutterBottom>
          Đánh giá sản phẩm
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Chưa có đánh giá nào cho sản phẩm này.
        </Typography>
      </Box>
    );
  }

  const { averageRating, ratingDistribution, totalItems, data: reviewList } = reviews;

  return (
    <Box py={4}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Đánh giá sản phẩm
      </Typography>

      {/* Rating Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* Average Rating */}
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h2" fontWeight="bold" color="primary">
                  {averageRating.toFixed(1)}
                </Typography>
                <Rating
                  value={averageRating}
                  precision={0.1}
                  readOnly
                  size="large"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {totalItems} đánh giá
                </Typography>
              </Box>
            </Grid>

            {/* Rating Distribution */}
            <Grid item xs={12} md={8}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star.toString()] || 0;
                const percentage = totalItems > 0 ? (count / totalItems) * 100 : 0;

                return (
                  <Box
                    key={star}
                    display="flex"
                    alignItems="center"
                    gap={2}
                    mb={1}
                    sx={{ cursor: "pointer" }}
                    onClick={() => handleFilterRating(filterRating === star ? undefined : star)}
                  >
                    <Box display="flex" alignItems="center" minWidth={80}>
                      <Typography variant="body2">{star}</Typography>
                      <Star fontSize="small" sx={{ ml: 0.5, color: "#FFB400" }} />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#E0E0E0",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#FFB400",
                        },
                      }}
                    />
                    <Typography variant="body2" minWidth={50} textAlign="right">
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </Grid>
          </Grid>

          {/* Filter Chips */}
          <Box mt={2} display="flex" gap={1} flexWrap="wrap">
            <Chip
              label="Tất cả"
              onClick={() => handleFilterRating(undefined)}
              color={filterRating === undefined ? "primary" : "default"}
              variant={filterRating === undefined ? "filled" : "outlined"}
            />
            {[5, 4, 3, 2, 1].map((star) => (
              <Chip
                key={star}
                label={`${star} sao`}
                onClick={() => handleFilterRating(star)}
                color={filterRating === star ? "primary" : "default"}
                variant={filterRating === star ? "filled" : "outlined"}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {reviewList.map((review) => (
            <Card key={review.id} sx={{ mb: 2 }}>
              <CardContent>
                {/* User Info */}
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    src={review.user.avatar || undefined}
                    alt={review.user.name}
                    sx={{ width: 48, height: 48, mr: 2 }}
                  >
                    {review.user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {review.user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(review.createdAt)}
                    </Typography>
                  </Box>
                  {review.updateCount > 0 && (
                    <Chip label="Đã chỉnh sửa" size="small" variant="outlined" />
                  )}
                </Box>

                {/* Rating */}
                <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />

                {/* Content */}
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {review.content}
                </Typography>

                {/* Images */}
                {review.medias.length > 0 && (
                  <ImageList cols={4} gap={8} sx={{ maxWidth: 600 }}>
                    {review.medias.map((media) => (
                      <ImageListItem key={media.id}>
                        <img
                          src={media.url}
                          alt="Review"
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 8,
                            cursor: "pointer",
                          }}
                          onClick={() => window.open(media.url, "_blank")}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {reviews.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={reviews.totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ProductReviews;
